from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import global_exception_handler, APIError
from app.core.middleware import RequestIDMiddleware, LoggingMiddleware, TenantContextMiddleware
from app.api.v1 import auth, health, sales, inventory, alerts, ingestion, forecasts, recommendations
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    yield
    # Shutdown logic

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(TenantContextMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

app.add_exception_handler(APIError, global_exception_handler)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(sales.router, prefix="/api/v1", tags=["sales"])
app.include_router(inventory.router, prefix="/api/v1", tags=["inventory"])
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])
app.include_router(ingestion.router, prefix="/api/v1", tags=["ingestion"])
app.include_router(forecasts.router, prefix="/api/v1", tags=["forecasts"])
app.include_router(recommendations.router, prefix="/api/v1", tags=["recommendations"])
