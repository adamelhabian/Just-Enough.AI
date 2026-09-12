from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List, Dict, Any
from datetime import date, timedelta
import uuid
import json
from pydantic import BaseModel, Field
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.all_models import (
    Forecast, Recommendation, OperationalAlert, Product,
    SalesRecord, InventorySnapshot
)
from app.models.canonical_models import RecipeItem, Ingredient, SupplierProduct
from app.adapters.ml_adapter import ml_adapter

router = APIRouter()


class ForecastCreateRequest(BaseModel):
    branch_id: str
    product_id: str
    business_date: date
    p10: float = Field(..., ge=0)
    p50: float = Field(..., ge=0)
    p90: float = Field(..., ge=0)
    model_version: str = "v5.0-quantile"
    data_quality: float = 1.0


class TriggerForecastRequest(BaseModel):
    branch_id: str
    forecast_start: Optional[date] = None
    future_context: Optional[List[Dict[str, Any]]] = None


@router.get("/forecasts")
def get_forecasts(
    branch_id: Optional[str] = None,
    product_id: Optional[str] = None,
    business_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    query = db.query(Forecast).filter(
        Forecast.tenant_id == current_user["tenant_id"]
    )
    if branch_id:
        query = query.filter(Forecast.branch_id == branch_id)
    if product_id:
        query = query.filter(Forecast.product_id == product_id)
    if business_date:
        query = query.filter(Forecast.business_date == business_date)
        
    records = query.order_by(Forecast.business_date.desc()).all()
    return {
        "data": [
            {
                "id": f.id,
                "branch_id": f.branch_id,
                "product_id": f.product_id,
                "business_date": str(f.business_date),
                "p10": float(f.p10),
                "p50": float(f.p50),
                "p90": float(f.p90),
                "model_version": f.model_version,
                "data_quality": float(f.data_quality)
            }
            for f in records
        ]
    }


@router.post("/forecasts", status_code=status.HTTP_201_CREATED)
def create_forecast(
    payload: ForecastCreateRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    if not (payload.p10 <= payload.p50 <= payload.p90):
        raise HTTPException(
            status_code=400,
            detail="Monotonic quantile ordering violated: requirement p10 <= p50 <= p90"
        )
        
    f = Forecast(
        id=str(uuid.uuid4()),
        tenant_id=current_user["tenant_id"],
        branch_id=payload.branch_id,
        product_id=payload.product_id,
        business_date=payload.business_date,
        p10=payload.p10,
        p50=payload.p50,
        p90=payload.p90,
        model_version=payload.model_version,
        data_quality=payload.data_quality
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return {
        "id": f.id,
        "branch_id": f.branch_id,
        "product_id": f.product_id,
        "business_date": str(f.business_date),
        "p10": float(f.p10),
        "p50": float(f.p50),
        "p90": float(f.p90),
        "model_version": f.model_version
    }


@router.post("/forecasts/trigger-7day", status_code=status.HTTP_200_OK)
def trigger_7day_forecast(
    payload: TriggerForecastRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Trigger end-to-end 7-day LightGBM demand forecast for a branch,
    translate demand to ingredient BOM requirements, and refresh operational recommendations.
    """
    tenant_id = current_user["tenant_id"]
    branch_id = payload.branch_id

    # 1. Fetch products map
    products = db.query(Product).filter(Product.tenant_id == tenant_id).all()
    product_map = {p.id: p.name for p in products}

    # 2. Fetch sales records
    sales_rows = db.query(SalesRecord).filter(
        SalesRecord.tenant_id == tenant_id,
        SalesRecord.branch_id == branch_id
    ).all()

    sales_data = []
    for s in sales_rows:
        sales_data.append({
            "date": str(s.sale_date),
            "restaurant_id": branch_id,
            "menu_item_id": s.product_id,
            "menu_item_name": product_map.get(s.product_id, s.product_id),
            "quantity": float(s.quantity),
            "unit_price": float(s.unit_price)
        })

    # If sales history is empty in dev, construct bootstrap baseline
    if not sales_data:
        start = date.today() - timedelta(days=60)
        for d_offset in range(60):
            d = start + timedelta(days=d_offset)
            for p in products:
                sales_data.append({
                    "date": str(d),
                    "restaurant_id": branch_id,
                    "menu_item_id": p.id,
                    "menu_item_name": p.name,
                    "quantity": 25.0 + (5.0 if d.weekday() >= 5 else 0.0),
                    "unit_price": float(p.selling_price) if p.selling_price else 10.0
                })

    forecast_start = payload.forecast_start or (date.today() + timedelta(days=1))

    # 3. Execute 7-day forecast via ML Adapter
    forecast_results = ml_adapter.run_7day_forecast(
        sales_records=sales_data,
        restaurant_id=branch_id,
        forecast_start=forecast_start,
        future_context=payload.future_context
    )

    # 4. Persist forecasts to DB
    for res in forecast_results:
        f_date = date.fromisoformat(res["date"])
        p_id = res["menu_item_id"]
        qty = res["recommended_quantity"]

        existing_f = db.query(Forecast).filter(
            Forecast.tenant_id == tenant_id,
            Forecast.branch_id == branch_id,
            Forecast.product_id == p_id,
            Forecast.business_date == f_date
        ).first()

        if existing_f:
            existing_f.p50 = qty
            existing_f.p10 = round(qty * 0.85, 2)
            existing_f.p90 = round(qty * 1.20, 2)
            existing_f.model_version = "LightGBM-52feat-v6.1"
        else:
            new_f = Forecast(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                branch_id=branch_id,
                product_id=p_id,
                business_date=f_date,
                p10=round(qty * 0.85, 2),
                p50=qty,
                p90=round(qty * 1.20, 2),
                model_version="LightGBM-52feat-v6.1",
                data_quality=1.0
            )
            db.add(new_f)

    # 5. Recipe / BOM Translation
    recipes = db.query(RecipeItem).filter(RecipeItem.tenant_id == tenant_id).all()
    ingredients = db.query(Ingredient).filter(Ingredient.tenant_id == tenant_id).all()
    ing_map = {i.id: i.name_en for i in ingredients}
    
    recipe_dicts = []
    for r in recipes:
        recipe_dicts.append({
            "product_id": r.product_id,
            "ingredient_id": r.ingredient_id,
            "ingredient_name": ing_map.get(r.ingredient_id, r.ingredient_id),
            "quantity_required": float(r.quantity_required),
            "yield_factor": float(r.yield_factor)
        })

    ingredient_needs = ml_adapter.translate_demand_to_bom(forecast_results, recipe_dicts)

    # 6. Operational Recommendations
    snapshots = db.query(InventorySnapshot).filter(
        InventorySnapshot.tenant_id == tenant_id,
        InventorySnapshot.branch_id == branch_id
    ).all()
    current_inv = {s.product_id: float(s.quantity) for s in snapshots}

    suppliers = db.query(SupplierProduct).filter(SupplierProduct.tenant_id == tenant_id).all()
    moq_map = {sp.ingredient_id: float(sp.minimum_order_qty) for sp in suppliers}
    lead_time_map = {sp.ingredient_id: int(sp.lead_time_days) for sp in suppliers}

    recommendations = ml_adapter.generate_operational_recommendations(
        forecast_results=forecast_results,
        ingredient_needs=ingredient_needs,
        current_inventory=current_inv,
        reorder_points={i.id: 15.0 for i in ingredients},
        moq_map=moq_map,
        lead_time_days=lead_time_map
    )

    # Persist PREPARE recommendations
    for prep in recommendations["PREPARE"]:
        rec = Recommendation(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            branch_id=branch_id,
            product_id=prep["item_id"],
            target_date=date.fromisoformat(prep["date"]),
            recommended_qty=prep["prep_quantity"],
            risk="LOW",
            explanation=prep["reason"],
            status="pending"
        )
        db.add(rec)

    # Persist ALERT recommendations
    for alert in recommendations["ALERT"]:
        op_alert = OperationalAlert(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            branch_id=branch_id,
            product_id=alert.get("ingredient_id"),
            alert_type="STOCKOUT_RISK",
            severity=alert.get("severity", "HIGH"),
            message=alert["message"],
            is_resolved=False
        )
        db.add(op_alert)

    db.commit()

    return {
        "status": "success",
        "branch_id": branch_id,
        "forecast_start": str(forecast_start),
        "forecast_horizon_days": 7,
        "model_version": "LightGBM-52feat-v6.1",
        "forecast_count": len(forecast_results),
        "ingredient_needs_count": len(ingredient_needs),
        "operational_actions": {
            "prepare_count": len(recommendations["PREPARE"]),
            "order_count": len(recommendations["ORDER"]),
            "monitor_count": len(recommendations["MONITOR"]),
            "alert_count": len(recommendations["ALERT"])
        },
        "forecasts": forecast_results[:14],  # Sample first 2 days
        "ingredient_requirements": ingredient_needs[:10],
        "recommendations": recommendations
    }
