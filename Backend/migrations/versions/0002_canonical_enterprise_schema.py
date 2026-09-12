"""canonical_enterprise_schema

Revision ID: e3b2f91a0c44
Revises: f06f43a706f2
Create Date: 2026-09-11 19:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e3b2f91a0c44'
down_revision: Union[str, Sequence[str], None] = 'f06f43a706f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. tenants
    op.create_table(
        'tenants',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('timezone', sa.String(length=50), server_default='Africa/Cairo', nullable=False),
        sa.Column('currency', sa.String(length=10), server_default='EGP', nullable=False),
        sa.Column('plan_tier', sa.String(length=50), server_default='ENTERPRISE', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tenants_code'), 'tenants', ['code'], unique=True)

    # 2. branches
    op.create_table(
        'branches',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name_ar', sa.String(length=150), nullable=False),
        sa.Column('name_en', sa.String(length=150), nullable=False),
        sa.Column('city', sa.String(length=100), server_default='Cairo', nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('operating_hours_open', sa.String(length=10), server_default='08:00', nullable=False),
        sa.Column('operating_hours_close', sa.String(length=10), server_default='02:00', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'code', name='uq_tenant_branch_code')
    )
    op.create_index(op.f('ix_branches_tenant_id'), 'branches', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_branches_code'), 'branches', ['code'], unique=False)

    # 3. products
    op.create_table(
        'products',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name_ar', sa.String(length=150), nullable=False),
        sa.Column('name_en', sa.String(length=150), nullable=False),
        sa.Column('category', sa.String(length=100), server_default='Main', nullable=False),
        sa.Column('unit', sa.String(length=30), server_default='portion', nullable=False),
        sa.Column('shelf_life_hours', sa.Integer(), server_default='24', nullable=False),
        sa.Column('cost_price', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('selling_price', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'code', name='uq_tenant_product_code')
    )
    op.create_index(op.f('ix_products_tenant_id'), 'products', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_products_code'), 'products', ['code'], unique=False)

    # 4. ingredients
    op.create_table(
        'ingredients',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name_ar', sa.String(length=150), nullable=False),
        sa.Column('name_en', sa.String(length=150), nullable=False),
        sa.Column('storage_type', sa.String(length=50), server_default='Chilled', nullable=False),
        sa.Column('unit_of_measure', sa.String(length=30), server_default='kg', nullable=False),
        sa.Column('shelf_life_days', sa.Integer(), server_default='3', nullable=False),
        sa.Column('standard_cost', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'code', name='uq_tenant_ingredient_code')
    )
    op.create_index(op.f('ix_ingredients_tenant_id'), 'ingredients', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_ingredients_code'), 'ingredients', ['code'], unique=False)

    # 5. recipe_items (BOM)
    op.create_table(
        'recipe_items',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('product_id', sa.String(length=36), nullable=False),
        sa.Column('ingredient_id', sa.String(length=36), nullable=False),
        sa.Column('quantity_required', sa.Float(), nullable=False),
        sa.Column('yield_factor', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['ingredient_id'], ['ingredients.id']),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'product_id', 'ingredient_id', name='uq_recipe_product_ingredient')
    )
    op.create_index(op.f('ix_recipe_items_tenant_id'), 'recipe_items', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_recipe_items_product_id'), 'recipe_items', ['product_id'], unique=False)
    op.create_index(op.f('ix_recipe_items_ingredient_id'), 'recipe_items', ['ingredient_id'], unique=False)

    # 6. suppliers
    op.create_table(
        'suppliers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('contact_email', sa.String(length=100), nullable=True),
        sa.Column('contact_phone', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_suppliers_tenant_id'), 'suppliers', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_suppliers_code'), 'suppliers', ['code'], unique=False)

    # 7. supplier_products (Lead times, MOQ, costs)
    op.create_table(
        'supplier_products',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('supplier_id', sa.String(length=36), nullable=False),
        sa.Column('ingredient_id', sa.String(length=36), nullable=False),
        sa.Column('pack_size', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('minimum_order_qty', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('lead_time_days', sa.Integer(), server_default='1', nullable=False),
        sa.Column('unit_cost', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('is_primary', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['ingredient_id'], ['ingredients.id']),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_supplier_products_tenant_id'), 'supplier_products', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_supplier_products_supplier_id'), 'supplier_products', ['supplier_id'], unique=False)
    op.create_index(op.f('ix_supplier_products_ingredient_id'), 'supplier_products', ['ingredient_id'], unique=False)

    # 8. sales_records
    op.create_table(
        'sales_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('branch_id', sa.String(length=36), nullable=False),
        sa.Column('product_id', sa.String(length=36), nullable=False),
        sa.Column('business_date', sa.Date(), nullable=False),
        sa.Column('quantity_sold', sa.Float(), nullable=False),
        sa.Column('net_sales', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('order_count', sa.Integer(), server_default='1', nullable=False),
        sa.Column('is_stockout_censored', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('source_channel', sa.String(length=50), server_default='POS_FOODICS', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['branch_id'], ['branches.id']),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'branch_id', 'product_id', 'business_date', name='uq_tenant_branch_product_sales_date')
    )
    op.create_index(op.f('ix_sales_records_tenant_id'), 'sales_records', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_sales_records_branch_id'), 'sales_records', ['branch_id'], unique=False)
    op.create_index(op.f('ix_sales_records_product_id'), 'sales_records', ['product_id'], unique=False)
    op.create_index(op.f('ix_sales_records_business_date'), 'sales_records', ['business_date'], unique=False)

    # 9. waste_records
    op.create_table(
        'waste_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('branch_id', sa.String(length=36), nullable=False),
        sa.Column('product_id', sa.String(length=36), nullable=False),
        sa.Column('business_date', sa.Date(), nullable=False),
        sa.Column('waste_qty', sa.Float(), nullable=False),
        sa.Column('waste_cost', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('reason', sa.String(length=100), server_default='EXPIRED', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['branch_id'], ['branches.id']),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_waste_records_tenant_id'), 'waste_records', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_waste_records_branch_id'), 'waste_records', ['branch_id'], unique=False)
    op.create_index(op.f('ix_waste_records_product_id'), 'waste_records', ['product_id'], unique=False)
    op.create_index(op.f('ix_waste_records_business_date'), 'waste_records', ['business_date'], unique=False)

    # 10. external_factors
    op.create_table(
        'external_factors',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('branch_id', sa.String(length=36), nullable=False),
        sa.Column('business_date', sa.Date(), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('event_name', sa.String(length=100), nullable=False),
        sa.Column('impact_multiplier', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['branch_id'], ['branches.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_external_factors_tenant_id'), 'external_factors', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_external_factors_branch_id'), 'external_factors', ['branch_id'], unique=False)
    op.create_index(op.f('ix_external_factors_business_date'), 'external_factors', ['business_date'], unique=False)

    # 11. operational_alerts
    op.create_table(
        'operational_alerts',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=36), nullable=False),
        sa.Column('branch_id', sa.String(length=36), nullable=False),
        sa.Column('product_id', sa.String(length=36), nullable=True),
        sa.Column('alert_type', sa.String(length=50), nullable=False),
        sa.Column('severity', sa.String(length=20), server_default='MEDIUM', nullable=False),
        sa.Column('message', sa.String(length=255), nullable=False),
        sa.Column('is_resolved', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['branch_id'], ['branches.id']),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_operational_alerts_tenant_id'), 'operational_alerts', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_operational_alerts_branch_id'), 'operational_alerts', ['branch_id'], unique=False)

def downgrade() -> None:
    op.drop_table('operational_alerts')
    op.drop_table('external_factors')
    op.drop_table('waste_records')
    op.drop_table('sales_records')
    op.drop_table('supplier_products')
    op.drop_table('suppliers')
    op.drop_table('recipe_items')
    op.drop_table('ingredients')
    op.drop_table('products')
    op.drop_table('branches')
    op.drop_table('tenants')
