from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
if str(db_url).startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def set_tenant_context(session, tenant_id: str):
    if not str(session.bind.url).startswith("sqlite"):
        session.execute(text("SELECT set_config('app.current_tenant', :tenant, false)"), {"tenant": str(tenant_id)})


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

