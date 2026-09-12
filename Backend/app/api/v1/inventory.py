from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from datetime import date
import uuid
from pydantic import BaseModel, Field
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.all_models import InventorySnapshot

router = APIRouter()

class SnapshotCreateRequest(BaseModel):
    branch_id: str
    product_id: str
    snapshot_date: date
    quantity: float = Field(..., ge=0)
    data_flag: str = "ACTUAL"

@router.get("/inventory/snapshots")
def get_snapshots(
    branch_id: Optional[str] = None,
    product_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    query = db.query(InventorySnapshot).filter(
        InventorySnapshot.tenant_id == current_user["tenant_id"]
    )
    if branch_id:
        query = query.filter(InventorySnapshot.branch_id == branch_id)
    if product_id:
        query = query.filter(InventorySnapshot.product_id == product_id)
        
    snapshots = query.order_by(InventorySnapshot.snapshot_date.desc()).all()
    return {
        "data": [
            {
                "id": s.id,
                "branch_id": s.branch_id,
                "product_id": s.product_id,
                "snapshot_date": str(s.snapshot_date),
                "quantity": float(s.quantity),
                "data_flag": s.data_flag
            }
            for s in snapshots
        ]
    }

@router.post("/inventory/snapshots", status_code=status.HTTP_201_CREATED)
def create_snapshot(
    payload: SnapshotCreateRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    snap = InventorySnapshot(
        id=str(uuid.uuid4()),
        tenant_id=current_user["tenant_id"],
        branch_id=payload.branch_id,
        product_id=payload.product_id,
        snapshot_date=payload.snapshot_date,
        quantity=payload.quantity,
        data_flag=payload.data_flag
    )
    db.add(snap)
    db.commit()
    db.refresh(snap)
    return {
        "id": snap.id,
        "branch_id": snap.branch_id,
        "product_id": snap.product_id,
        "snapshot_date": str(snap.snapshot_date),
        "quantity": float(snap.quantity),
        "data_flag": snap.data_flag
    }

@router.get("/inventory/movements")
def get_movements(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    # Aggregated movement summary based on snapshots
    snapshots = db.query(InventorySnapshot).filter(
        InventorySnapshot.tenant_id == current_user["tenant_id"]
    ).order_by(InventorySnapshot.snapshot_date.desc()).limit(20).all()
    
    return {
        "data": [
            {
                "snapshot_id": s.id,
                "branch_id": s.branch_id,
                "product_id": s.product_id,
                "date": str(s.snapshot_date),
                "qty": float(s.quantity)
            }
            for s in snapshots
        ]
    }
