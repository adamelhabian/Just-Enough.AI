import pytest
import io
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models import all_models
from app.models.canonical_models import Base as CanonicalBase

# Setup shared in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)
CanonicalBase.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()
@pytest.fixture(autouse=True)
def setup_api_db():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)

client = TestClient(app)

@pytest.fixture
def auth_headers():
    token = create_access_token(data={"sub": "user_api_test", "role": "admin", "tenant_id": "tenant_api_1"})
    return {"Authorization": f"Bearer {token}"}

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_sales_lifecycle(auth_headers):
    # 1. Create sale
    payload = {
        "branch_id": "branch_cairo_1",
        "product_id": "prod_burger_1",
        "sale_date": "2026-09-10",
        "quantity": 25.0,
        "unit_price": 12.5
    }
    create_res = client.post("/api/v1/sales", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    sale_id = create_res.json()["id"]
    
    # 2. Query sales
    list_res = client.get("/api/v1/sales", headers=auth_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1
    
    # 3. Get sale by ID
    get_res = client.get(f"/api/v1/sales/{sale_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["quantity"] == 25.0

def test_inventory_lifecycle(auth_headers):
    # Create snapshot
    payload = {
        "branch_id": "branch_cairo_1",
        "product_id": "prod_burger_1",
        "snapshot_date": "2026-09-10",
        "quantity": 150.0,
        "data_flag": "ACTUAL"
    }
    res = client.post("/api/v1/inventory/snapshots", json=payload, headers=auth_headers)
    assert res.status_code == 201
    
    # Query snapshots
    list_res = client.get("/api/v1/inventory/snapshots", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 1

    # Movements
    mov_res = client.get("/api/v1/inventory/movements", headers=auth_headers)
    assert mov_res.status_code == 200

def test_recommendations_lifecycle(auth_headers):
    # Create recommendation
    rec_payload = {
        "branch_id": "b1",
        "product_id": "p1",
        "target_date": "2026-09-15",
        "recommended_qty": 75.0,
        "risk": "LOW",
        "explanation": "Calculated via p50 quantile"
    }
    create_res = client.post("/api/v1/recommendations", json=rec_payload, headers=auth_headers)
    assert create_res.status_code == 201
    rec_id = create_res.json()["id"]

    # Explain
    explain_res = client.get(f"/api/v1/recommendations/{rec_id}/explain", headers=auth_headers)
    assert explain_res.status_code == 200
    assert "factor_attribution" in explain_res.json()

    # Override
    override_payload = {
        "override_reason": "Expected local event surge",
        "recommended_qty": 110.0
    }
    ov_res = client.post(f"/api/v1/recommendations/{rec_id}/override", json=override_payload, headers=auth_headers)
    assert ov_res.status_code == 200
    assert ov_res.json()["status"] == "overridden"
    assert ov_res.json()["new_qty"] == 110.0

def test_alerts_lifecycle(auth_headers):
    # Create alert
    alert_payload = {
        "branch_id": "b1",
        "product_id": "p1",
        "alert_type": "STOCKOUT_RISK",
        "severity": "HIGH",
        "message": "Stock running critically low"
    }
    res = client.post("/api/v1/alerts", json=alert_payload, headers=auth_headers)
    assert res.status_code == 201
    alert_id = res.json()["id"]

    # Query alerts
    list_res = client.get("/api/v1/alerts", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 1

    # Resolve alert
    resolve_res = client.post(f"/api/v1/alerts/{alert_id}/resolve", headers=auth_headers)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"

def test_forecasts_lifecycle(auth_headers):
    payload = {
        "branch_id": "b1",
        "product_id": "p1",
        "business_date": "2026-09-15",
        "p10": 40.0,
        "p50": 60.0,
        "p90": 90.0,
        "model_version": "v5.0-lightgbm"
    }
    create_res = client.post("/api/v1/forecasts", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    
    list_res = client.get("/api/v1/forecasts", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) >= 1

def test_csv_ingest_lifecycle(auth_headers):
    csv_data = (
        "product_id,branch_id,sale_date,quantity,unit_price\n"
        "p_ingest_1,b_ingest_1,2026-09-01,10.0,15.0\n"
        "p_ingest_2,b_ingest_1,2026-09-01,-5.0,15.0\n" # negative qty -> dead letter
        "p_ingest_1,b_ingest_1,2026-09-01,10.0,15.0\n" # duplicate -> dead letter
    )
    files = {"file": ("test_sales.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    res = client.post("/api/v1/ingest/csv", files=files, headers=auth_headers)
    assert res.status_code == 200
    summary = res.json()["summary"]
    assert summary["total"] == 3
    assert summary["valid"] == 1
    assert summary["error"] == 2
    batch_id = res.json()["batch_id"]

    # Query batches
    batches_res = client.get("/api/v1/ingest/batches", headers=auth_headers)
    assert batches_res.status_code == 200

    # Query batch details with dead letter records
    detail_res = client.get(f"/api/v1/ingest/batches/{batch_id}", headers=auth_headers)
    assert detail_res.status_code == 200
    assert len(detail_res.json()["dead_letters"]) == 2
