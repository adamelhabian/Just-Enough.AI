from fastapi import APIRouter
from datetime import datetime, timezone
from app.adapters.ml_adapter import ml_adapter

router = APIRouter()

@router.get("/health")
def health_check():
    ml_info = ml_adapter.model_info
    ml_engine_data = {
        "status": ml_adapter.status,
        "mode": ml_adapter.model_mode,
        "model_name": ml_info.get("model_name", "LightGBM"),
        "features": ml_info.get("number_of_features", 52),
        "forecast_horizon_days": ml_info.get("forecast_horizon_days", 7)
    }
    if ml_adapter.model_mode != "TRAINED_MODEL" and ml_info.get("error"):
        ml_engine_data["error"] = ml_info.get("error")

    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "JustEnough MVP Demand Engine",
        "database": "connected",
        "data_layer": "operational",
        "ml_engine": ml_engine_data,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


