import pytest
import uuid
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, set_tenant_context
from app.models.all_models import (
    Branch, Product, SalesRecord, InventorySnapshot, Recommendation,
    OperationalAlert, IngestionBatch, DeadLetterRecord
)

# Use in-memory SQLite for test isolation
@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_tenant_isolation_sales(db_session):
    tenant_a = "tenant_alpha"
    tenant_b = "tenant_beta"
    
    # Create branches and products
    b_a = Branch(id=str(uuid.uuid4()), tenant_id=tenant_a, name="Branch Alpha")
    b_b = Branch(id=str(uuid.uuid4()), tenant_id=tenant_b, name="Branch Beta")
    p_a = Product(id=str(uuid.uuid4()), tenant_id=tenant_a, name="Burger Alpha")
    p_b = Product(id=str(uuid.uuid4()), tenant_id=tenant_b, name="Pizza Beta")
    db_session.add_all([b_a, b_b, p_a, p_b])
    db_session.commit()
    
    # Create sales for both
    sale_a = SalesRecord(
        id=str(uuid.uuid4()),
        tenant_id=tenant_a,
        branch_id=b_a.id,
        product_id=p_a.id,
        sale_date=datetime.date(2026, 9, 1),
        quantity=50.0,
        unit_price=10.0
    )
    sale_b = SalesRecord(
        id=str(uuid.uuid4()),
        tenant_id=tenant_b,
        branch_id=b_b.id,
        product_id=p_b.id,
        sale_date=datetime.date(2026, 9, 1),
        quantity=200.0,
        unit_price=15.0
    )
    db_session.add_all([sale_a, sale_b])
    db_session.commit()
    
    # Query scoped to Tenant A
    records_a = db_session.query(SalesRecord).filter(SalesRecord.tenant_id == tenant_a).all()
    assert len(records_a) == 1
    assert records_a[0].id == sale_a.id
    assert float(records_a[0].quantity) == 50.0
    
    # Verify Tenant B sale is strictly excluded
    for r in records_a:
        assert r.tenant_id != tenant_b
        assert r.id != sale_b.id

def test_tenant_isolation_recommendations_and_alerts(db_session):
    tenant_a = "tenant_alpha"
    tenant_b = "tenant_beta"
    
    rec_a = Recommendation(
        id=str(uuid.uuid4()),
        tenant_id=tenant_a,
        branch_id="b1",
        product_id="p1",
        target_date=datetime.date(2026, 9, 15),
        recommended_qty=100.0,
        status="pending"
    )
    rec_b = Recommendation(
        id=str(uuid.uuid4()),
        tenant_id=tenant_b,
        branch_id="b2",
        product_id="p2",
        target_date=datetime.date(2026, 9, 15),
        recommended_qty=500.0,
        status="pending"
    )
    alert_a = OperationalAlert(
        id=str(uuid.uuid4()),
        tenant_id=tenant_a,
        branch_id="b1",
        alert_type="STOCKOUT_RISK",
        message="Stock low in Alpha",
        is_resolved=False
    )
    alert_b = OperationalAlert(
        id=str(uuid.uuid4()),
        tenant_id=tenant_b,
        branch_id="b2",
        alert_type="WASTE_RISK",
        message="Excess stock in Beta",
        is_resolved=False
    )
    db_session.add_all([rec_a, rec_b, alert_a, alert_b])
    db_session.commit()
    
    # Tenant A views
    tenant_a_recs = db_session.query(Recommendation).filter(Recommendation.tenant_id == tenant_a).all()
    tenant_a_alerts = db_session.query(OperationalAlert).filter(OperationalAlert.tenant_id == tenant_a).all()
    
    assert len(tenant_a_recs) == 1
    assert tenant_a_recs[0].id == rec_a.id
    assert len(tenant_a_alerts) == 1
    assert tenant_a_alerts[0].id == alert_a.id

def test_tenant_isolation_dead_letters(db_session):
    tenant_a = "tenant_alpha"
    tenant_b = "tenant_beta"
    
    batch_a = IngestionBatch(id="b_alpha", tenant_id=tenant_a, source="csv", status="partial")
    batch_b = IngestionBatch(id="b_beta", tenant_id=tenant_b, source="csv", status="partial")
    dlq_a = DeadLetterRecord(id="dlq_a", tenant_id=tenant_a, batch_id="b_alpha", row_number=2, error_reason="bad qty")
    dlq_b = DeadLetterRecord(id="dlq_b", tenant_id=tenant_b, batch_id="b_beta", row_number=5, error_reason="bad date")
    
    db_session.add_all([batch_a, batch_b, dlq_a, dlq_b])
    db_session.commit()
    
    dlq_query_a = db_session.query(DeadLetterRecord).filter(DeadLetterRecord.tenant_id == tenant_a).all()
    assert len(dlq_query_a) == 1
    assert dlq_query_a[0].id == "dlq_a"
    assert dlq_query_a[0].tenant_id == tenant_a
