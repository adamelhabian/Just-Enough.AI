from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import global_exception_handler, APIError
from app.core.middleware import RequestIDMiddleware, LoggingMiddleware, TenantContextMiddleware
from app.api.v1 import auth, health, sales, inventory, alerts, ingestion, forecasts, recommendations, morning_brief
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
            demo_email = settings.DEMO_ADMIN_EMAIL
            demo_pass = settings.DEMO_ADMIN_PASSWORD
            if not db.query(User).filter(User.email == demo_email).first():
                demo_user = User(
                    id="user-mvp-admin-01",
                    email=demo_email,
                    hashed_password=hash_password(demo_pass),
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
        import logging
        logging.getLogger("app.main").warning(f"Lifespan initialization warning: {e}")
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
app.include_router(morning_brief.router, prefix="/api/v1", tags=["morning-brief"])

# Serve React SPA production build
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

# Locate Web/dist directory
_repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_dist_dir = os.path.join(_repo_root, "Web", "dist")
if not os.path.exists(_dist_dir):
    _dist_dir = os.path.abspath(os.path.join(os.getcwd(), "Web", "dist"))

_assets_dir = os.path.join(_dist_dir, "assets")
if os.path.exists(_assets_dir):
    app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Missing API endpoints must remain API 404 (do not return index.html)
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail=f"API endpoint '/{full_path}' not found")
    
    # Check if a static file in dist root matches
    file_path = os.path.join(_dist_dir, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Serve index.html for all client-side SPA routes
    index_path = os.path.join(_dist_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"service": "JustEnough MVP Demand Engine", "status": "ok", "ui": "Web/dist not found"}

