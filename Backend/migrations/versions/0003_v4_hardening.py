from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0003_v4_hardening'
down_revision = 'e3b2f91a0c44'
branch_labels = None
depends_on = None

def upgrade():
    # Users table
    op.execute("CREATE TABLE IF NOT EXISTS users (id VARCHAR PRIMARY KEY, email VARCHAR UNIQUE NOT NULL, hashed_password VARCHAR NOT NULL, full_name VARCHAR, role VARCHAR NOT NULL, tenant_id VARCHAR NOT NULL, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, deleted_at TIMESTAMP);")
    # Missing tables
    op.execute("CREATE TABLE IF NOT EXISTS ingestion_batches (id VARCHAR PRIMARY KEY, tenant_id VARCHAR NOT NULL, source VARCHAR, filename VARCHAR, status VARCHAR, total_rows INTEGER, valid_rows INTEGER, error_rows INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);")
    op.execute("CREATE TABLE IF NOT EXISTS dead_letter_records (id VARCHAR PRIMARY KEY, batch_id VARCHAR REFERENCES ingestion_batches(id), row_number INTEGER, raw_data JSONB, error_reason VARCHAR, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);")
    # Constraints & Indexes
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_qty_sold_positive') THEN ALTER TABLE sales_records ADD CONSTRAINT check_qty_sold_positive CHECK (quantity_sold >= 0); END IF; END $$;")
    op.execute("CREATE INDEX IF NOT EXISTS idx_sales_tenant_branch_date ON sales_records (tenant_id, branch_id, business_date);")
    # RLS Policies
    op.execute("ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;")
    op.execute("DROP POLICY IF EXISTS tenant_isolation_sales ON sales_records;")
    op.execute("DROP POLICY IF EXISTS tenant_isolation_sales_records ON sales_records;")
    op.execute("CREATE POLICY tenant_isolation_sales_records ON sales_records USING ((tenant_id)::text = current_setting('app.tenant_id', true));")

def downgrade():
    op.execute("DROP POLICY IF EXISTS tenant_isolation_sales_records ON sales_records;")
    op.execute("DROP INDEX IF EXISTS idx_sales_tenant_branch_date;")
    op.execute("ALTER TABLE sales_records DROP CONSTRAINT IF EXISTS check_qty_sold_positive;")
    op.execute("DROP TABLE IF EXISTS dead_letter_records;")
    op.execute("DROP TABLE IF EXISTS ingestion_batches;")
    op.execute("DROP TABLE IF EXISTS users;")
