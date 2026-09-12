from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0", "database": "connected", "timestamp": datetime.utcnow().isoformat()}
