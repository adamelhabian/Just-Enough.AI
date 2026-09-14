import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import (
    String, DateTime, Date, Float, ForeignKey, Text, UniqueConstraint, Index,
    Integer, Boolean, JSON
)

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TenantScoped:
    tenant_id: Mapped[str] = mapped_column(String(36), index=True)

# 1. Restaurant / Tenant
class Tenant(Base, TimestampMixin):
    __tablename__ = 'tenants'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(150))
    timezone: Mapped[str] = mapped_column(String(50), default="Africa/Cairo")
    currency: Mapped[str] = mapped_column(String(10), default="EGP")
    plan_tier: Mapped[str] = mapped_column(String(50), default="ENTERPRISE")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

# 2. Branches
class Branch(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'branches'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(50), index=True)
    name_ar: Mapped[str] = mapped_column(String(150))
    name_en: Mapped[str] = mapped_column(String(150))
    city: Mapped[str] = mapped_column(String(100), default="Cairo")
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    operating_hours_open: Mapped[str] = mapped_column(String(10), default="08:00")
    operating_hours_close: Mapped[str] = mapped_column(String(10), default="02:00")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (UniqueConstraint('tenant_id', 'code', name='uq_tenant_branch_code'),)

# 3. Products
class Product(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'products'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(50), index=True)
    name_ar: Mapped[str] = mapped_column(String(150))
    name_en: Mapped[str] = mapped_column(String(150))
    category: Mapped[str] = mapped_column(String(100), default="Main")
    unit: Mapped[str] = mapped_column(String(30), default="portion")
    shelf_life_hours: Mapped[int] = mapped_column(Integer, default=24)
    cost_price: Mapped[float] = mapped_column(Float, default=0.0)
    selling_price: Mapped[float] = mapped_column(Float, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (UniqueConstraint('tenant_id', 'code', name='uq_tenant_product_code'),)

# 4. Ingredients
class Ingredient(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'ingredients'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(50), index=True)
    name_ar: Mapped[str] = mapped_column(String(150))
    name_en: Mapped[str] = mapped_column(String(150))
    storage_type: Mapped[str] = mapped_column(String(50), default="Chilled")
    unit_of_measure: Mapped[str] = mapped_column(String(30), default="kg")
    shelf_life_days: Mapped[int] = mapped_column(Integer, default=3)
    standard_cost: Mapped[float] = mapped_column(Float, default=0.0)
    __table_args__ = (UniqueConstraint('tenant_id', 'code', name='uq_tenant_ingredient_code'),)

# 5. Recipes / BOM (Bill of Materials)
class RecipeItem(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'recipe_items'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str] = mapped_column(ForeignKey('products.id'), index=True)
    ingredient_id: Mapped[str] = mapped_column(ForeignKey('ingredients.id'), index=True)
    quantity_required: Mapped[float] = mapped_column(Float)
    yield_factor: Mapped[float] = mapped_column(Float, default=1.0)
    __table_args__ = (UniqueConstraint('tenant_id', 'product_id', 'ingredient_id', name='uq_recipe_product_ingredient'),)

# 6. Suppliers & Lead Times / MOQ
class Supplier(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'suppliers'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(50), index=True)
    name: Mapped[str] = mapped_column(String(150))
    contact_email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class SupplierProduct(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'supplier_products'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    supplier_id: Mapped[str] = mapped_column(ForeignKey('suppliers.id'), index=True)
    ingredient_id: Mapped[str] = mapped_column(ForeignKey('ingredients.id'), index=True)
    pack_size: Mapped[float] = mapped_column(Float, default=1.0)
    minimum_order_qty: Mapped[float] = mapped_column(Float, default=1.0)
    lead_time_days: Mapped[int] = mapped_column(Integer, default=1)
    unit_cost: Mapped[float] = mapped_column(Float, default=0.0)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True)

# 7. Historical Sales
class SalesRecord(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'sales_records'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(ForeignKey('branches.id'), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey('products.id'), index=True)
    business_date: Mapped[date] = mapped_column(Date, index=True)
    quantity_sold: Mapped[float] = mapped_column(Float)
    net_sales: Mapped[float] = mapped_column(Float, default=0.0)
    order_count: Mapped[int] = mapped_column(Integer, default=1)
    is_stockout_censored: Mapped[bool] = mapped_column(Boolean, default=False)
    source_channel: Mapped[str] = mapped_column(String(50), default="POS_FOODICS")
    __table_args__ = (UniqueConstraint('tenant_id', 'branch_id', 'product_id', 'business_date', name='uq_tenant_branch_product_sales_date'),)

# 8. Inventory Snapshots & Closing Stock
class InventorySnapshot(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'inventory_snapshots'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(String(36), index=True)
    product_id: Mapped[str] = mapped_column(String(36), index=True)
    snapshot_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    quantity: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    business_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    closing_qty: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    data_flag: Mapped[str] = mapped_column(String(30), default='ACTUAL')
    idempotency_key: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)

# 9. Waste Records
class WasteRecord(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'waste_records'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(ForeignKey('branches.id'), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey('products.id'), index=True)
    business_date: Mapped[date] = mapped_column(Date, index=True)
    waste_qty: Mapped[float] = mapped_column(Float)
    waste_cost: Mapped[float] = mapped_column(Float, default=0.0)
    reason: Mapped[str] = mapped_column(String(100), default="EXPIRED")

# 10. External Factors (Holidays, Weather, Promotions)
class ExternalFactor(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'external_factors'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(ForeignKey('branches.id'), index=True)
    business_date: Mapped[date] = mapped_column(Date, index=True)
    event_type: Mapped[str] = mapped_column(String(50)) # HOLIDAY, PROMOTION, WEATHER
    event_name: Mapped[str] = mapped_column(String(100))
    impact_multiplier: Mapped[float] = mapped_column(Float, default=1.0)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

# 11. Forecasts (Probabilistic Quantiles)
class Forecast(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'forecasts'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(String(36), index=True)
    product_id: Mapped[str] = mapped_column(String(36), index=True)
    business_date: Mapped[date] = mapped_column(Date, index=True)
    p10: Mapped[float] = mapped_column(Float)
    p50: Mapped[float] = mapped_column(Float)
    p90: Mapped[float] = mapped_column(Float)
    model_version: Mapped[Optional[str]] = mapped_column(String(100), default="v5.0-quantile")
    data_quality: Mapped[Optional[float]] = mapped_column(Float, default=1.0)
    reasons_json: Mapped[Optional[str]] = mapped_column(Text, default="[]")
    __table_args__ = (UniqueConstraint('tenant_id', 'branch_id', 'product_id', 'business_date', 'model_version', name='uq_forecast_version'),)

# 12. Recommendations Engine Output
class Recommendation(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'recommendations'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    forecast_id: Mapped[Optional[str]] = mapped_column(ForeignKey('forecasts.id'), nullable=True, index=True)
    branch_id: Mapped[str] = mapped_column(String(36), index=True)
    product_id: Mapped[str] = mapped_column(String(36), index=True)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    recommended_qty: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    override_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    business_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    recommended_prep: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk: Mapped[str] = mapped_column(String(30), default="MEDIUM", server_default="MEDIUM", nullable=True)
    policy_version: Mapped[Optional[str]] = mapped_column(String(40), default='mvp-v1', server_default='mvp-v1', nullable=True)

# 13. Overrides / Manager Decisions
class Override(Base, TenantScoped):
    __tablename__ = 'overrides'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recommendation_id: Mapped[str] = mapped_column(ForeignKey('recommendations.id'), index=True)
    user_id: Mapped[str] = mapped_column(String(36))
    old_value: Mapped[float] = mapped_column(Float)
    new_value: Mapped[float] = mapped_column(Float)
    reason_code: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

# 14. Operational Alerts & Stockout Events
class OperationalAlert(Base, TimestampMixin, TenantScoped):
    __tablename__ = 'operational_alerts'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(ForeignKey('branches.id'), index=True)
    product_id: Mapped[Optional[str]] = mapped_column(ForeignKey('products.id'), nullable=True)
    alert_type: Mapped[str] = mapped_column(String(50)) # WASTE_RISK, STOCKOUT_RISK, DATA_GAP
    severity: Mapped[str] = mapped_column(String(20), default="MEDIUM")
    message: Mapped[str] = mapped_column(String(255))
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)

# 15. Audit Logs
class AuditLog(Base, TenantScoped):
    __tablename__ = 'audit_logs'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_user_id: Mapped[str] = mapped_column(String(36))
    action: Mapped[str] = mapped_column(String(100))
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[str] = mapped_column(String(36))
    payload_json: Mapped[str] = mapped_column(Text, default='{}')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
