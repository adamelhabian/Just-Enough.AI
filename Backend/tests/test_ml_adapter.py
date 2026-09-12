import sys
from pathlib import Path
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.adapters.ml_adapter import ml_adapter
from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models import all_models
from app.models.canonical_models import Base as CanonicalBase, RecipeItem, Ingredient, SupplierProduct
from app.models.all_models import Product, Branch, SalesRecord
from sqlalchemy.pool import StaticPool

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)
CanonicalBase.metadata.create_all(bind=engine)


@pytest.fixture(scope="module")
def setup_db():
    db = TestingSessionLocal()

    
    # Create test branch & products
    branch = Branch(id="B01", tenant_id="tenant-1", name="Downtown Branch", code="DT01", city="Cairo")
    p1 = Product(id="P01", tenant_id="tenant-1", name="Cheeseburger", code="CB01", category="Main", selling_price=100.0)
    p2 = Product(id="P02", tenant_id="tenant-1", name="Fries", code="FR01", category="Sides", selling_price=40.0)
    db.add_all([branch, p1, p2])

    # Add ingredients
    ing1 = Ingredient(id="ING01", tenant_id="tenant-1", code="BEEF", name_ar="لحم", name_en="Beef Patty", unit_of_measure="kg")
    ing2 = Ingredient(id="ING02", tenant_id="tenant-1", code="POTATO", name_ar="بطاطس", name_en="Potatoes", unit_of_measure="kg")
    db.add_all([ing1, ing2])

    # Add recipe items
    r1 = RecipeItem(id="R01", tenant_id="tenant-1", product_id="P01", ingredient_id="ING01", quantity_required=0.2, yield_factor=0.95)
    r2 = RecipeItem(id="R02", tenant_id="tenant-1", product_id="P02", ingredient_id="ING02", quantity_required=0.25, yield_factor=0.90)
    db.add_all([r1, r2])

    # Add supplier products
    sp1 = SupplierProduct(id="SP01", tenant_id="tenant-1", supplier_id="SUP01", ingredient_id="ING01", minimum_order_qty=10.0, lead_time_days=2)
    sp2 = SupplierProduct(id="SP02", tenant_id="tenant-1", supplier_id="SUP01", ingredient_id="ING02", minimum_order_qty=20.0, lead_time_days=1)
    db.add_all([sp1, sp2])

    # Add 60 days of historical sales
    base_date = date.today() - timedelta(days=60)
    for i in range(60):
        s_date = base_date + timedelta(days=i)
        s1 = SalesRecord(id=f"S1_{i}", tenant_id="tenant-1", branch_id="B01", product_id="P01", sale_date=s_date, quantity=30.0, unit_price=100.0)
        s2 = SalesRecord(id=f"S2_{i}", tenant_id="tenant-1", branch_id="B01", product_id="P02", sale_date=s_date, quantity=50.0, unit_price=40.0)
        db.add_all([s1, s2])

    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_ml_adapter_metadata():
    """Verify ML adapter loads upstream LightGBM metadata."""
    info = ml_adapter.model_info
    assert info["number_of_features"] == 52
    assert info["forecast_horizon_days"] == 7


def test_ml_adapter_forecast_execution():
    """Verify ML adapter executes recursive 7-day forecast with synthetic history."""
    history = []
    base_date = date.today() - timedelta(days=60)
    for i in range(60):
        d = base_date + timedelta(days=i)
        history.append({
            "date": str(d),
            "restaurant_id": "R01",
            "menu_item_id": "M01",
            "menu_item_name": "Cheeseburger",
            "quantity": 30.0,
            "unit_price": 10.0
        })
    results = ml_adapter.run_7day_forecast(
        sales_records=history,
        restaurant_id="R01",
        forecast_start=date.today()
    )
    assert len(results) == 7
    for r in results:
        assert r["predicted_quantity"] >= 0
        assert r["recommended_quantity"] >= 0
        assert "menu_item_name" in r


def test_ml_adapter_bom_translation():
    """Verify translation of menu item demand into ingredient BOM requirements."""
    forecasts = [
        {"date": "2026-01-01", "menu_item_id": "P01", "recommended_quantity": 50},
        {"date": "2026-01-01", "menu_item_id": "P02", "recommended_quantity": 40}
    ]
    recipes = [
        {"product_id": "P01", "ingredient_id": "ING01", "ingredient_name": "Beef", "quantity_required": 0.2, "yield_factor": 1.0},
        {"product_id": "P02", "ingredient_id": "ING02", "ingredient_name": "Potato", "quantity_required": 0.25, "yield_factor": 1.0}
    ]
    bom_needs = ml_adapter.translate_demand_to_bom(forecasts, recipes)
    assert len(bom_needs) == 2
    # Beef: 50 * 0.2 = 10.0 kg
    beef_need = next(n for n in bom_needs if n["ingredient_id"] == "ING01")
    assert beef_need["required_quantity"] == 10.0
    # Potato: 40 * 0.25 = 10.0 kg
    potato_need = next(n for n in bom_needs if n["ingredient_id"] == "ING02")
    assert potato_need["required_quantity"] == 10.0


def test_ml_adapter_recommendation_logic():
    """Verify PREPARE, ORDER, MONITOR, and ALERT actions are generated properly."""
    forecasts = [
        {"date": "2026-01-01", "menu_item_id": "P01", "menu_item_name": "Cheeseburger", "recommended_quantity": 60}
    ]
    ingredient_needs = [
        {"date": "2026-01-01", "ingredient_id": "ING01", "required_quantity": 30.0}
    ]
    # Current inventory has only 5 kg (below requirement 30)
    current_inv = {"ING01": 5.0}
    reorder_pts = {"ING01": 15.0}
    moqs = {"ING01": 10.0}
    leads = {"ING01": 2}

    recs = ml_adapter.generate_operational_recommendations(
        forecast_results=forecasts,
        ingredient_needs=ingredient_needs,
        current_inventory=current_inv,
        reorder_points=reorder_pts,
        moq_map=moqs,
        lead_time_days=leads
    )

    assert len(recs["PREPARE"]) == 1
    assert recs["PREPARE"][0]["prep_quantity"] == 60
    assert len(recs["ORDER"]) == 1
    assert recs["ORDER"][0]["reorder_quantity"] >= 10.0


def test_api_trigger_7day_forecast(setup_db):
    """Verify HTTP POST /api/v1/forecasts/trigger-7day endpoint."""
    token = create_access_token(data={"sub": "testuser", "tenant_id": "tenant-1", "user_id": "U01", "role": "manager"})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/v1/forecasts/trigger-7day",
        json={"branch_id": "B01"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["branch_id"] == "B01"
    assert data["forecast_horizon_days"] == 7
    assert data["forecast_count"] > 0
    assert "operational_actions" in data
    assert data["operational_actions"]["prepare_count"] > 0
