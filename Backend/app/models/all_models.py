from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Numeric, Date, DateTime, JSON, Text, text, CheckConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.declarative import declared_attr
from datetime import datetime
from app.core.database import Base

class AuditMixin:
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'), default=datetime.utcnow)
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'), default=datetime.utcnow, onupdate=datetime.utcnow)

class SoftDeleteMixin:
    deleted_at = Column(DateTime, nullable=True)

class TenantScoped:
    @declared_attr
    def tenant_id(cls):
        return Column(String(36), nullable=False, index=True)

class User(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150))
    role = Column(String(50), nullable=False)
    tenant_id = Column(String(36), nullable=False, index=True)
    is_active = Column(Boolean, default=True)

class Branch(Base, TenantScoped, AuditMixin):
    __tablename__ = "branches"
    id = Column(String(36), primary_key=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=True)
    city = Column(String(100), default="Cairo")
    is_active = Column(Boolean, default=True)

class Product(Base, TenantScoped, AuditMixin):
    __tablename__ = "products"
    id = Column(String(36), primary_key=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=True)
    category = Column(String(100), default="Main")
    unit = Column(String(30), default="portion")
    cost_price = Column(Numeric(12, 4), default=0.0)
    selling_price = Column(Numeric(12, 4), default=0.0)
    is_active = Column(Boolean, default=True)

class SalesRecord(Base, TenantScoped, AuditMixin):
    __tablename__ = "sales_records"
    id = Column(String(36), primary_key=True)
    branch_id = Column(String(36), ForeignKey("branches.id"), index=True)
    product_id = Column(String(36), ForeignKey("products.id"), index=True)
    sale_date = Column(Date, nullable=False, index=True)
    quantity = Column(Numeric(12, 4), CheckConstraint('quantity >= 0'), nullable=False)
    unit_price = Column(Numeric(12, 4), CheckConstraint('unit_price >= 0'), nullable=False)

class InventorySnapshot(Base, TenantScoped, AuditMixin):
    __tablename__ = "inventory_snapshots"
    id = Column(String(36), primary_key=True)
    branch_id = Column(String(36), ForeignKey("branches.id"), index=True)
    product_id = Column(String(36), ForeignKey("products.id"), index=True)
    snapshot_date = Column(Date, nullable=False, index=True)
    quantity = Column(Numeric(12, 4), CheckConstraint('quantity >= 0'), nullable=False)
    data_flag = Column(String(30), default='ACTUAL')

class IngestionBatch(Base, TenantScoped, AuditMixin):
    __tablename__ = "ingestion_batches"
    id = Column(String(36), primary_key=True)
    source = Column(String(50), nullable=False)
    filename = Column(String(255))
    status = Column(String(30), nullable=False, default="processing")
    total_rows = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    error_rows = Column(Integer, default=0)

class DeadLetterRecord(Base, TenantScoped, AuditMixin):
    __tablename__ = "dead_letter_records"
    id = Column(String(36), primary_key=True)
    batch_id = Column(String(36), ForeignKey("ingestion_batches.id"), index=True)
    row_number = Column(Integer)
    raw_data = Column(JSON)
    error_reason = Column(String(500))

class Forecast(Base, TenantScoped, AuditMixin):
    __tablename__ = "forecasts"
    id = Column(String(36), primary_key=True)
    branch_id = Column(String(36), ForeignKey("branches.id"), index=True)
    product_id = Column(String(36), ForeignKey("products.id"), index=True)
    business_date = Column(Date, nullable=False, index=True)
    p10 = Column(Numeric(12, 4), nullable=False)
    p50 = Column(Numeric(12, 4), nullable=False)
    p90 = Column(Numeric(12, 4), nullable=False)
    model_version = Column(String(100), default="v5.0-quantile")
    data_quality = Column(Numeric(4, 2), default=1.0)
    reasons_json = Column(Text, default="[]")

class Recommendation(Base, TenantScoped, AuditMixin):
    __tablename__ = "recommendations"
    id = Column(String(36), primary_key=True)
    branch_id = Column(String(36), ForeignKey("branches.id"), index=True)
    product_id = Column(String(36), ForeignKey("products.id"), index=True)
    target_date = Column(Date, index=True)
    recommended_qty = Column(Numeric(12, 4), nullable=False)
    status = Column(String(30), default="pending")
    override_reason = Column(String(255), nullable=True)
    risk = Column(String(30), default="MEDIUM")
    explanation = Column(Text, nullable=True)

class OperationalAlert(Base, TenantScoped, AuditMixin):
    __tablename__ = "operational_alerts"
    id = Column(String(36), primary_key=True)
    branch_id = Column(String(36), ForeignKey("branches.id"), index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True, index=True)
    alert_type = Column(String(50), nullable=False) # WASTE_RISK, STOCKOUT_RISK, DATA_GAP
    severity = Column(String(20), default="MEDIUM")
    message = Column(String(255), nullable=False)
    is_resolved = Column(Boolean, default=False)

class AuditLog(Base, TenantScoped):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True)
    actor_user_id = Column(String(36), index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(80), nullable=False)
    entity_id = Column(String(36), nullable=False)
    payload_json = Column(Text, default="{}")
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'), default=datetime.utcnow)

class WasteRecord(Base, TenantScoped, AuditMixin):
    __tablename__ = "waste_records"
    id = Column(String(36), primary_key=True)
    branch_id = Column(String(36), ForeignKey("branches.id"), index=True)
    product_id = Column(String(36), ForeignKey("products.id"), index=True)
    business_date = Column(Date, nullable=False, index=True)
    waste_qty = Column(Numeric(12, 4), nullable=False)
    waste_cost = Column(Numeric(12, 4), default=0.0)
    reason = Column(String(100), default="EXPIRED")

