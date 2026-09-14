import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.all_models import Base as AllModelsBase, User, Recommendation
from app.models.canonical_models import Base as CanonicalBase

# Setup in-memory SQLite database for deterministic vertical pipeline test
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AllModelsBase.metadata.create_all(bind=engine)
CanonicalBase.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)

client = TestClient(app)

@pytest.fixture
def auth_headers():
    token = create_access_token(
        data={"sub": "admin_test", "role": "manager", "tenant_id": "tenant-demo-1"}
    )
    return {"Authorization": f"Bearer {token}"}


def test_01_health_reports_trained_lightgbm():
    """Verify health check reports trained LightGBM ML model with 52 features."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "ml_engine" in body
    ml = body["ml_engine"]
    assert ml["status"] == "ready"
    assert ml["mode"] == "TRAINED_MODEL"
    assert ml["features"] == 52
    assert ml["forecast_horizon_days"] == 7


def test_02_trigger_7day_forecast_vertical_pipeline(auth_headers):
    """Verify 7-day LightGBM forecast trigger, BOM translation, and operational actions."""
    payload = {
        "branch_id": "branch-101",
        "forecast_start": str(date.today() + timedelta(days=1))
    }
    res = client.post("/api/v1/forecasts/trigger-7day", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["forecast_horizon_days"] == 7
    assert data["forecast_count"] >= 7
    assert data["ingredient_needs_count"] >= 1

    actions = data["operational_actions"]
    assert "prepare_count" in actions
    assert "order_count" in actions
    assert "monitor_count" in actions
    assert "alert_count" in actions


def test_03_morning_brief_contract(auth_headers):
    """Verify GET /api/v1/morning-brief returns summary, actions, and real computed insights."""
    res = client.get("/api/v1/morning-brief?branch_id=branch-101", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["model_mode"] == "TRAINED_MODEL"
    assert data["features_count"] == 52

    # Summary metrics
    summary = data["summary"]
    assert "predicted_demand" in summary
    assert "accuracy" in summary
    assert "stock_coverage_days" in summary
    assert "waste_risk" in summary
    assert "items_at_risk" in summary
    assert isinstance(summary["predicted_demand"], (int, float))

    # Action sets
    assert len(data["prepare"]) > 0
    assert len(data["order"]) > 0
    assert isinstance(data["monitor"], list)
    assert isinstance(data["alerts"], list)

    # AI Insights
    insights = data["ai_insights"]
    assert len(insights) >= 2
    for ins in insights:
        assert "headline" in ins
        assert "description" in ins
        assert "impact" in ins


def test_04_recommendations_and_override_audit_lifecycle(auth_headers):
    """Verify recommendations query, override submission, and immutable audit trail verification."""
    # 1. Seed or retrieve existing recommendation
    with TestingSessionLocal() as db:
        rec_id = "rec-pipeline-test-01"
        existing = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
        if not existing:
            rec = Recommendation(
                id=rec_id,
                tenant_id="tenant-demo-1",
                branch_id="branch-101",
                product_id="Beef Burger Patties",
                target_date=date.today(),
                recommended_qty=120.0,
                status="pending",
                risk="LOW",
                explanation="P90 weekend prep buffer"
            )
            db.add(rec)
            db.commit()

    # 2. Get recommendations
    get_res = client.get("/api/v1/recommendations", headers=auth_headers)
    assert get_res.status_code == 200
    recs = get_res.json()["data"]
    assert len(recs) > 0
    target_rec = next((r for r in recs if r["id"] == rec_id), recs[0])

    # 3. Post Override
    override_payload = {
        "override_reason": "Verified local concert foot traffic surge",
        "recommended_qty": 140.0
    }
    post_res = client.post(
        f"/api/v1/recommendations/{target_rec['id']}/override",
        json=override_payload,
        headers=auth_headers
    )
    assert post_res.status_code == 200
    override_data = post_res.json()
    assert override_data["id"] == target_rec["id"]
    assert override_data["new_qty"] == 140.0

    # 4. Verify audit trail
    audit_res = client.get("/api/v1/recommendations/overrides/audit", headers=auth_headers)
    assert audit_res.status_code == 200
    audit_logs = audit_res.json()["data"]
    assert len(audit_logs) > 0
    matched_audit = next((a for a in audit_logs if a["entity_id"] == target_rec["id"]), None)
    assert matched_audit is not None
    assert matched_audit["payload"]["new_qty"] == 140.0

