from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def set_tenant_context(session, tenant_id: str):
    session.execute(text("SELECT set_config('app.current_tenant', :tenant, false)"), {"tenant": str(tenant_id)})

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

