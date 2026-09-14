from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, List
from datetime import date
import uuid
from pydantic import BaseModel, Field
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.all_models import SalesRecord

router = APIRouter()

class SalesCreateRequest(BaseModel):
    branch_id: str
    product_id: str
    sale_date: date
    quantity: float = Field(..., ge=0)
    unit_price: float = Field(..., ge=0)

class SalesResponse(BaseModel):
    id: str
    branch_id: str
    product_id: str
    sale_date: date
    quantity: float
    unit_price: float

@router.get("/sales")
def get_sales(
    branch_id: Optional[str] = None,
    product_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    query = db.query(SalesRecord).filter(SalesRecord.tenant_id == current_user["tenant_id"])
    if branch_id:
        query = query.filter(SalesRecord.branch_id == branch_id)
    if product_id:
        query = query.filter(SalesRecord.product_id == product_id)
    if start_date:
        query = query.filter(SalesRecord.sale_date >= start_date)
    if end_date:
        query = query.filter(SalesRecord.sale_date <= end_date)
        
    total = query.count()
    records = query.order_by(SalesRecord.sale_date.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "data": [
            {
                "id": r.id,
                "branch_id": r.branch_id,
                "product_id": r.product_id,
                "sale_date": str(r.sale_date),
                "quantity": float(r.quantity),
                "unit_price": float(r.unit_price)
            }
            for r in records
        ],
        "page": page,
        "limit": limit,
        "total": total
    }

@router.post("/sales", status_code=status.HTTP_201_CREATED)
def create_sale(
    payload: SalesCreateRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    record = SalesRecord(
        id=str(uuid.uuid4()),
        tenant_id=current_user["tenant_id"],
        branch_id=payload.branch_id,
        product_id=payload.product_id,
        sale_date=payload.sale_date,
        quantity=payload.quantity,
        unit_price=payload.unit_price
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "id": record.id,
        "branch_id": record.branch_id,
        "product_id": record.product_id,
        "sale_date": str(record.sale_date),
        "quantity": float(record.quantity),
        "unit_price": float(record.unit_price)
    }

@router.get("/sales/{id}")
def get_sale(
    id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    record = db.query(SalesRecord).filter(
        SalesRecord.id == id,
        SalesRecord.tenant_id == current_user["tenant_id"]
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Sales record not found")
    return {
        "id": record.id,
        "branch_id": record.branch_id,
        "product_id": record.product_id,
        "sale_date": str(record.sale_date),
        "quantity": float(record.quantity),
        "unit_price": float(record.unit_price)
    }
