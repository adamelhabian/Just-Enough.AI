from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import global_exception_handler, APIError
from app.core.middleware import RequestIDMiddleware, LoggingMiddleware, TenantContextMiddleware
from app.api.v1 import auth, health, sales, inventory, alerts, ingestion, forecasts, recommendations
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Standalone MVP zero-database bootstrap: auto-initialize tables and seed demo user
    try:
        from app.core.database import engine, SessionLocal
        from app.models.all_models import Base as ModelsBase, User
        from app.models.canonical_models import Base as CanonicalBase
        from app.core.security import hash_password
        
        ModelsBase.metadata.create_all(bind=engine)
        CanonicalBase.metadata.create_all(bind=engine)
        
        with SessionLocal() as db:
            if not db.query(User).filter(User.email == "admin@justenough.local").first():
                demo_user = User(
                    id="user-mvp-admin-01",
                    email="admin@justenough.local",
                    hashed_password=hash_password("AdminSecret123!"),
                    role="manager",
                    tenant_id="tenant-demo-1",
                    full_name="Restaurant General Manager",
                    is_active=True
                )
                db.add(demo_user)
                db.commit()

            from app.models.all_models import Recommendation
            from datetime import date
            if db.query(Recommendation).filter(Recommendation.tenant_id == "tenant-demo-1").count() == 0:
                demo_recs = [
                    Recommendation(
                        id="rec-beef-burger-2026-09-14",
                        tenant_id="tenant-demo-1",
                        branch_id="branch-main",
                        product_id="Beef Burger Patties",
                        target_date=date.today(),
                        recommended_qty=135.0,
                        status="pending",
                        risk="MEDIUM",
                        explanation="P90 peak lunch safety buffer calculated from 7-day quantile forecast"
                    ),
                    Recommendation(
                        id="rec-tomato-sauce-2026-09-14",
                        tenant_id="tenant-demo-1",
                        branch_id="branch-main",
                        product_id="Tomato Sauce Base",
                        target_date=date.today(),
                        recommended_qty=20.0,
                        status="pending",
                        risk="LOW",
                        explanation="Batch cooking baseline demand with lead time buffer"
                    ),
                    Recommendation(
                        id="rec-fresh-salad-2026-09-14",
                        tenant_id="tenant-demo-1",
                        branch_id="branch-main",
                        product_id="Fresh Salad Mix",
                        target_date=date.today(),
                        recommended_qty=85.0,
                        status="pending",
                        risk="HIGH",
                        explanation="24h holding limit to prevent spoilage"
                    )
                ]
                db.add_all(demo_recs)
                db.commit()
    except Exception as e:
        pass
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(RequestIDMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(TenantContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_exception_handler(APIError, global_exception_handler)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(sales.router, prefix="/api/v1", tags=["sales"])
app.include_router(inventory.router, prefix="/api/v1", tags=["inventory"])
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])
app.include_router(ingestion.router, prefix="/api/v1", tags=["ingestion"])
app.include_router(forecasts.router, prefix="/api/v1", tags=["forecasts"])
app.include_router(recommendations.router, prefix="/api/v1", tags=["recommendations"])
