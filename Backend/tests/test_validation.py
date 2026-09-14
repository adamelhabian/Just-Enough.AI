import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture
def auth_headers():
    token = create_access_token(data={"sub": "u1", "role": "admin", "tenant_id": "tenant_val"})
    return {"Authorization": f"Bearer {token}"}

def test_sales_validation_negative_quantity(auth_headers):
    payload = {
        "branch_id": "b1",
        "product_id": "p1",
        "sale_date": "2026-09-01",
        "quantity": -10.0,
        "unit_price": 5.0
    }
    response = client.post("/api/v1/sales", json=payload, headers=auth_headers)
    assert response.status_code == 422

def test_sales_validation_negative_price(auth_headers):
    payload = {
        "branch_id": "b1",
        "product_id": "p1",
        "sale_date": "2026-09-01",
        "quantity": 10.0,
        "unit_price": -5.0
    }
    response = client.post("/api/v1/sales", json=payload, headers=auth_headers)
    assert response.status_code == 422

def test_sales_validation_invalid_date_format(auth_headers):
    payload = {
        "branch_id": "b1",
        "product_id": "p1",
        "sale_date": "not-a-date",
        "quantity": 10.0,
        "unit_price": 5.0
    }
    response = client.post("/api/v1/sales", json=payload, headers=auth_headers)
    assert response.status_code == 422

def test_forecast_monotonic_quantile_validation(auth_headers):
    # Violation: p10 > p50
    payload = {
        "branch_id": "b1",
        "product_id": "p1",
        "business_date": "2026-09-15",
        "p10": 100.0,
        "p50": 50.0,
        "p90": 120.0
    }
    response = client.post("/api/v1/forecasts", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "Monotonic quantile ordering violated" in response.json()["detail"]

def test_recommendation_override_validation(auth_headers):
    # Empty reason should be rejected
    payload = {
        "override_reason": "ab", # too short (<3)
        "recommended_qty": 50.0
    }
    response = client.post("/api/v1/recommendations/rec-123/override", json=payload, headers=auth_headers)
    assert response.status_code == 422
