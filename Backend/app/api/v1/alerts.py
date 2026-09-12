from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
import uuid
from pydantic import BaseModel
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.all_models import OperationalAlert

router = APIRouter()

class AlertCreateRequest(BaseModel):
    branch_id: str
    product_id: Optional[str] = None
    alert_type: str
    severity: str = "MEDIUM"
    message: str

@router.get("/alerts")
def get_alerts(
    unresolved_only: bool = True,
    branch_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    query = db.query(OperationalAlert).filter(
        OperationalAlert.tenant_id == current_user["tenant_id"]
    )
    if unresolved_only:
        query = query.filter(OperationalAlert.is_resolved == False)
    if branch_id:
        query = query.filter(OperationalAlert.branch_id == branch_id)
        
    alerts = query.order_by(OperationalAlert.created_at.desc()).all()
    return {
        "data": [
            {
                "id": a.id,
                "branch_id": a.branch_id,
                "product_id": a.product_id,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "is_resolved": a.is_resolved,
                "created_at": str(a.created_at) if a.created_at else None
            }
            for a in alerts
        ]
    }

@router.post("/alerts", status_code=status.HTTP_201_CREATED)
def create_alert(
    payload: AlertCreateRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    alert = OperationalAlert(
        id=str(uuid.uuid4()),
        tenant_id=current_user["tenant_id"],
        branch_id=payload.branch_id,
        product_id=payload.product_id,
        alert_type=payload.alert_type,
        severity=payload.severity,
        message=payload.message,
        is_resolved=False
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {
        "id": alert.id,
        "alert_type": alert.alert_type,
        "severity": alert.severity,
        "message": alert.message,
        "is_resolved": alert.is_resolved
    }

@router.post("/alerts/{id}/resolve")
def resolve_alert(
    id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    alert = db.query(OperationalAlert).filter(
        OperationalAlert.id == id,
        OperationalAlert.tenant_id == current_user["tenant_id"]
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.is_resolved = True
    db.commit()
    return {"status": "resolved", "id": id}
