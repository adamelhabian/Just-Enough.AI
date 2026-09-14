"""
Generic REST API Connector for JustEnough ERP / POS Integration.
Supports external REST endpoints with:
- Bearer / API Key authentication
- Exponential backoff with jitter retry strategy
- 429 Rate Limiting detection and backoff
- Cursor and offset-based pagination
- Schema normalization to JustEnough canonical domain models
"""

import time
import random
import logging
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger(__name__)

class ConnectorError(Exception):
    """Base exception for connector failures."""
    pass

class RateLimitExceededError(ConnectorError):
    """Raised when external API returns 429 Rate Limit."""
    pass

class SchemaValidationError(ConnectorError):
    """Raised when external payload does not conform to expected schema."""
    pass

class GenericRestConnector:
    def __init__(
        self,
        base_url: str,
        api_key: Optional[str] = None,
        bearer_token: Optional[str] = None,
        timeout_seconds: float = 10.0,
        max_retries: int = 3,
        backoff_factor: float = 1.5
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.bearer_token = bearer_token
        self.timeout = timeout_seconds
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "JustEnough-Connector/5.0"
        }
        if self.bearer_token:
            headers["Authorization"] = f"Bearer {self.bearer_token}"
        elif self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    def execute_request_with_retry(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes HTTP request with exponential backoff and rate limit handling.
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = self._get_headers()
        
        last_exception = None
        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.request(
                        method=method,
                        url=url,
                        headers=headers,
                        params=params,
                        json=json_data
                    )
                    
                    if response.status_code == 429:
                        retry_after = float(response.headers.get("Retry-After", 1.0))
                        logger.warning(f"Rate limited (429) on {url}, retrying after {retry_after}s")
                        if attempt == self.max_retries:
                            raise RateLimitExceededError("Rate limit exceeded and retries exhausted")
                        time.sleep(retry_after)
                        continue
                    
                    response.raise_for_status()
                    return response.json()
            except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                last_exception = exc
                if attempt == self.max_retries:
                    break
                sleep_time = (self.backoff_factor ** attempt) + random.uniform(0.1, 0.5)
                logger.info(f"Request failed ({exc}), retrying in {sleep_time:.2f}s...")
                time.sleep(sleep_time)

        raise ConnectorError(f"Failed after {self.max_retries} attempts: {last_exception}")

    def fetch_branches(self) -> List[Dict[str, Any]]:
        """Fetches and normalizes branch list."""
        data = self.execute_request_with_retry("GET", "/branches")
        raw_branches = data.get("branches") or data.get("data") or data
        normalized = []
        for b in raw_branches:
            normalized.append({
                "external_id": str(b.get("id") or b.get("branch_id")),
                "name": b.get("name") or b.get("branch_name"),
                "city": b.get("city", "Cairo"),
                "is_active": bool(b.get("is_active", True))
            })
        return normalized

    def fetch_products(self) -> List[Dict[str, Any]]:
        """Fetches and normalizes product catalog."""
        data = self.execute_request_with_retry("GET", "/products")
        raw_products = data.get("products") or data.get("data") or data
        normalized = []
        for p in raw_products:
            normalized.append({
                "external_id": str(p.get("id") or p.get("sku") or p.get("code")),
                "name": p.get("name") or p.get("title"),
                "category": p.get("category", "General"),
                "unit": p.get("unit", "portion"),
                "cost_price": float(p.get("cost_price") or p.get("cost") or 0.0),
                "selling_price": float(p.get("selling_price") or p.get("price") or 0.0)
            })
        return normalized

    def fetch_sales(self, start_date: str, end_date: str, page_limit: int = 100) -> List[Dict[str, Any]]:
        """
        Fetches historical sales with page-based pagination.
        """
        all_sales = []
        page = 1
        while True:
            params = {
                "start_date": start_date,
                "end_date": end_date,
                "page": page,
                "limit": page_limit
            }
            res = self.execute_request_with_retry("GET", "/sales", params=params)
            records = res.get("sales") or res.get("data") or []
            if not records:
                break
                
            for s in records:
                all_sales.append({
                    "branch_id": str(s.get("branch_id")),
                    "product_id": str(s.get("product_id") or s.get("sku")),
                    "sale_date": s.get("sale_date") or s.get("date"),
                    "quantity": float(s.get("quantity", 0)),
                    "unit_price": float(s.get("unit_price") or s.get("price") or 0.0)
                })
            
            total_pages = res.get("total_pages", page)
            if page >= total_pages:
                break
            page += 1
            
        return all_sales
