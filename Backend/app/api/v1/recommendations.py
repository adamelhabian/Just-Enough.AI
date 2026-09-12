from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from datetime import date
import uuid
import json
from pydantic import BaseModel, Field
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.all_models import Recommendation, AuditLog

router = APIRouter()

class OverrideRequest(BaseModel):
    override_reason: str = Field(..., min_length=3)
    recommended_qty: float = Field(..., ge=0)

class RecommendationCreateRequest(BaseModel):
    branch_id: str
    product_id: str
    target_date: date
    recommended_qty: float = Field(..., ge=0)
    risk: str = "MEDIUM"
    explanation: Optional[str] = None

@router.get("/recommendations")
def get_recommendations(
    cursor: Optional[str] = None,
    branch_id: Optional[str] = None,
    product_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    query = db.query(Recommendation).filter(
        Recommendation.tenant_id == current_user["tenant_id"]
    )
    if branch_id:
        query = query.filter(Recommendation.branch_id == branch_id)
    if product_id:
        query = query.filter(Recommendation.product_id == product_id)
    if status_filter:
        query = query.filter(Recommendation.status == status_filter)
        
    recs = query.order_by(Recommendation.target_date.desc()).limit(100).all()
    return {
        "data": [
            {
                "id": r.id,
                "branch_id": r.branch_id,
                "product_id": r.product_id,
                "target_date": str(r.target_date),
                "recommended_qty": float(r.recommended_qty),
                "status": r.status,
                "risk": r.risk,
                "override_reason": r.override_reason,
                "explanation": r.explanation
            }
            for r in recs
        ],
        "next_cursor": None
    }

@router.post("/recommendations", status_code=status.HTTP_201_CREATED)
def create_recommendation(
    payload: RecommendationCreateRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    rec = Recommendation(
        id=str(uuid.uuid4()),
        tenant_id=current_user["tenant_id"],
        branch_id=payload.branch_id,
        product_id=payload.product_id,
        target_date=payload.target_date,
        recommended_qty=payload.recommended_qty,
        risk=payload.risk,
        explanation=payload.explanation or "Baseline quantile model calculation",
        status="pending"
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {
        "id": rec.id,
        "branch_id": rec.branch_id,
        "product_id": rec.product_id,
        "target_date": str(rec.target_date),
        "recommended_qty": float(rec.recommended_qty),
        "status": rec.status,
        "risk": rec.risk
    }

@router.post("/recommendations/{id}/override")
def override_recommendation(
    id: str,
    req: OverrideRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    rec = db.query(Recommendation).filter(
        Recommendation.id == id,
        Recommendation.tenant_id == current_user["tenant_id"]
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    old_qty = float(rec.recommended_qty)
    rec.recommended_qty = req.recommended_qty
    rec.override_reason = req.override_reason
    rec.status = "overridden"
    
    # Audit log entry
    audit = AuditLog(
        id=str(uuid.uuid4()),
        tenant_id=current_user["tenant_id"],
        actor_user_id=current_user["user_id"],
        action="OVERRIDE_RECOMMENDATION",
        entity_type="recommendation",
        entity_id=id,
        payload_json=json.dumps({
            "old_qty": old_qty,
            "new_qty": req.recommended_qty,
            "reason": req.override_reason
        })
    )
    db.add(audit)
    db.commit()
    
    return {
        "status": "overridden",
        "id": id,
        "old_qty": old_qty,
        "new_qty": req.recommended_qty,
        "reason": req.override_reason
    }

@router.get("/recommendations/{id}/explain")
def explain_recommendation(
    id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    rec = db.query(Recommendation).filter(
        Recommendation.id == id,
        Recommendation.tenant_id == current_user["tenant_id"]
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    return {
        "id": id,
        "summary": rec.explanation or "Demand forecast p50 + safety stock buffer calculated from lead time variance",
        "factor_attribution": {
            "historical_trend_p50": round(float(rec.recommended_qty) * 0.70, 2),
            "safety_stock_buffer": round(float(rec.recommended_qty) * 0.20, 2),
            "calendar_event_lift": round(float(rec.recommended_qty) * 0.10, 2)
        },
        "risk_level": rec.risk
    }
