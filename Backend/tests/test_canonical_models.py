import pytest
import datetime
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.canonical_models import (
    Base, Tenant, Branch, Product, Ingredient, RecipeItem,
    Supplier, SupplierProduct, SalesRecord, InventorySnapshot,
    WasteRecord, ExternalFactor, Forecast, Recommendation, Override,
    OperationalAlert, AuditLog
)

@pytest.fixture
def canonical_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_canonical_schema_full_lifecycle(canonical_session):
    tenant_id = str(uuid.uuid4())
    
    # 1. Tenant
    tenant = Tenant(
        id=tenant_id,
        code="TENANT_CANONICAL",
        name="Canonical Restaurant Group",
        timezone="Africa/Cairo",
        currency="EGP",
        plan_tier="ENTERPRISE",
        is_active=True
    )
    canonical_session.add(tenant)
    canonical_session.commit()
    assert tenant.code == "TENANT_CANONICAL"

    # 2. Branch
    branch = Branch(
        tenant_id=tenant_id,
        code="BR_ZAMALEK",
        name_ar="فرع الزمالك",
        name_en="Zamalek Branch",
        city="Cairo",
        address="26th of July St",
        operating_hours_open="09:00",
        operating_hours_close="01:00",
        is_active=True
    )
    canonical_session.add(branch)

    # 3. Product
    product = Product(
        tenant_id=tenant_id,
        code="PRD_SHAWARMA",
        name_ar="شاورما لحم",
        name_en="Beef Shawarma",
        category="Main",
        unit="sandwich",
        shelf_life_hours=24,
        cost_price=45.0,
        selling_price=95.0,
        is_active=True
    )
    canonical_session.add(product)

    # 4. Ingredient
    ingredient = Ingredient(
        tenant_id=tenant_id,
        code="ING_BEEF",
        name_ar="لحم بقري متبل",
        name_en="Marinated Beef",
        storage_type="Chilled",
        unit_of_measure="kg",
        shelf_life_days=3,
        standard_cost=250.0
    )
    canonical_session.add(ingredient)
    canonical_session.commit()

    # 5. Recipe Item (BOM)
    recipe = RecipeItem(
        tenant_id=tenant_id,
        product_id=product.id,
        ingredient_id=ingredient.id,
        quantity_required=0.15,
        yield_factor=0.95
    )
    canonical_session.add(recipe)

    # 6. Supplier & Supplier Product
    supplier = Supplier(
        tenant_id=tenant_id,
        code="SUP_MEAT_CO",
        name="Cairo Prime Meats",
        contact_email="orders@cairoprimemeat.com",
        contact_phone="+201000000000",
        is_active=True
    )
    canonical_session.add(supplier)
    canonical_session.commit()

    sup_prod = SupplierProduct(
        tenant_id=tenant_id,
        supplier_id=supplier.id,
        ingredient_id=ingredient.id,
        pack_size=10.0,
        minimum_order_qty=20.0,
        lead_time_days=2,
        unit_cost=240.0,
        is_primary=True
    )
    canonical_session.add(sup_prod)

    # 7. Sales Record
    sale = SalesRecord(
        tenant_id=tenant_id,
        branch_id=branch.id,
        product_id=product.id,
        business_date=datetime.date(2026, 9, 10),
        quantity_sold=120.0,
        net_sales=11400.0,
        order_count=85,
        is_stockout_censored=False,
        source_channel="POS_FOODICS"
    )
    canonical_session.add(sale)

    # 8. Inventory Snapshot
    snap = InventorySnapshot(
        tenant_id=tenant_id,
        branch_id=branch.id,
        product_id=product.id,
        business_date=datetime.date(2026, 9, 10),
        closing_qty=35.0,
        data_flag="ACTUAL",
        idempotency_key=f"snap_{tenant_id}_{branch.id}_{product.id}_20260910"
    )
    canonical_session.add(snap)

    # 9. Waste Record
    waste = WasteRecord(
        tenant_id=tenant_id,
        branch_id=branch.id,
        product_id=product.id,
        business_date=datetime.date(2026, 9, 10),
        waste_qty=3.0,
        waste_cost=135.0,
        reason="EXPIRED"
    )
    canonical_session.add(waste)

    # 10. External Factor
    event = ExternalFactor(
        tenant_id=tenant_id,
        branch_id=branch.id,
        business_date=datetime.date(2026, 9, 10),
        event_type="PROMOTION",
        event_name="Weekend Flash Deal",
        impact_multiplier=1.25,
        notes="High promotional uplift"
    )
    canonical_session.add(event)

    # 11. Forecast
    forecast = Forecast(
        tenant_id=tenant_id,
        branch_id=branch.id,
        product_id=product.id,
        business_date=datetime.date(2026, 9, 11),
        p10=90.0,
        p50=130.0,
        p90=175.0,
        model_version="v5.0-lgbm-quantile",
        data_quality=0.98,
        reasons_json='["Promotion uplift +25%", "Weekend seasonality"]'
    )
    canonical_session.add(forecast)
    canonical_session.commit()

    # 12. Recommendation
    rec = Recommendation(
        tenant_id=tenant_id,
        forecast_id=forecast.id,
        branch_id=branch.id,
        product_id=product.id,
        business_date=datetime.date(2026, 9, 11),
        recommended_prep=135.0,
        risk="MEDIUM",
        policy_version="mvp-v1"
    )
    canonical_session.add(rec)
    canonical_session.commit()

    # 13. Override
    override = Override(
        tenant_id=tenant_id,
        recommendation_id=rec.id,
        user_id="manager_user_1",
        old_value=135.0,
        new_value=150.0,
        reason_code="LOCAL_CATERING_EVENT"
    )
    canonical_session.add(override)

    # 14. Operational Alert
    alert = OperationalAlert(
        tenant_id=tenant_id,
        branch_id=branch.id,
        product_id=product.id,
        alert_type="STOCKOUT_RISK",
        severity="HIGH",
        message="Stock level below safety threshold",
        is_resolved=False
    )
    canonical_session.add(alert)

    # 15. Audit Log
    audit = AuditLog(
        tenant_id=tenant_id,
        actor_user_id="manager_user_1",
        action="UPDATE_PREP",
        entity_type="Recommendation",
        entity_id=rec.id,
        payload_json='{"adjusted": 150.0}'
    )
    canonical_session.add(audit)
    canonical_session.commit()

    assert rec.id is not None
    assert forecast.p10 < forecast.p50 < forecast.p90
    assert snap.closing_qty == 35.0
