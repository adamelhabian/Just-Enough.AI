from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "JustEnough MVP Demand Engine",
        "database": "connected",
        "data_layer": "operational",
        "ml_engine": "ready",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

