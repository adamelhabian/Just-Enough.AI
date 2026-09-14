import pytest
import respx
import httpx
from app.adapters.generic_rest import GenericRestConnector, RateLimitExceededError, ConnectorError

@respx.mock
def test_fetch_branches_success():
    respx.get("https://api.external-pos.com/branches").respond(
        status_code=200,
        json={"data": [{"id": "b_1", "name": "Branch 1", "city": "Cairo", "is_active": True}]}
    )
    connector = GenericRestConnector(base_url="https://api.external-pos.com", bearer_token="token_abc")
    branches = connector.fetch_branches()
    assert len(branches) == 1
    assert branches[0]["external_id"] == "b_1"
    assert branches[0]["name"] == "Branch 1"

@respx.mock
def test_fetch_products_success():
    respx.get("https://api.external-pos.com/products").respond(
        status_code=200,
        json={"products": [{"sku": "sku_burger", "title": "Gourmet Burger", "price": 120.0, "cost": 45.0}]}
    )
    connector = GenericRestConnector(base_url="https://api.external-pos.com", api_key="secret_key")
    products = connector.fetch_products()
    assert len(products) == 1
    assert products[0]["external_id"] == "sku_burger"
    assert products[0]["selling_price"] == 120.0

@respx.mock
def test_fetch_sales_pagination():
    respx.get("https://api.external-pos.com/sales").side_effect = [
        httpx.Response(200, json={
            "data": [{"branch_id": "b1", "sku": "p1", "sale_date": "2026-09-01", "quantity": 10, "price": 15}],
            "total_pages": 2
        }),
        httpx.Response(200, json={
            "data": [{"branch_id": "b1", "sku": "p2", "sale_date": "2026-09-01", "quantity": 5, "price": 20}],
            "total_pages": 2
        })
    ]
    connector = GenericRestConnector(base_url="https://api.external-pos.com", bearer_token="token_abc")
    sales = connector.fetch_sales(start_date="2026-09-01", end_date="2026-09-02", page_limit=1)
    assert len(sales) == 2
    assert sales[0]["product_id"] == "p1"
    assert sales[1]["product_id"] == "p2"

@respx.mock
def test_rate_limiting_retry_after():
    # Return 429 once with Retry-After header, then 200
    route = respx.get("https://api.external-pos.com/branches")
    route.side_effect = [
        httpx.Response(429, headers={"Retry-After": "0.1"}),
        httpx.Response(200, json={"data": [{"id": "b_retry", "name": "Retry Success"}]})
    ]
    connector = GenericRestConnector(
        base_url="https://api.external-pos.com",
        bearer_token="tok",
        timeout_seconds=2.0,
        max_retries=2,
        backoff_factor=1.0
    )
    branches = connector.fetch_branches()
    assert len(branches) == 1
    assert branches[0]["external_id"] == "b_retry"
