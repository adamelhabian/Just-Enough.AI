from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import Optional, List
from app.core.security import get_current_user
from app.core.database import get_db
import uuid
from app.services.ingestion import IngestionService
from app.models.all_models import IngestionBatch, DeadLetterRecord

router = APIRouter()

@router.post("/ingest/csv")
async def ingest_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    content = await file.read()
    batch_id = str(uuid.uuid4())
    svc = IngestionService(db, current_user["tenant_id"])
    summary = svc.process_csv(content.decode("utf-8", errors="replace"), batch_id, file.filename)
    return {"batch_id": batch_id, "summary": summary}

@router.get("/ingest/batches")
def get_batches(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    batches = db.query(IngestionBatch).filter(
        IngestionBatch.tenant_id == current_user["tenant_id"]
    ).order_by(IngestionBatch.created_at.desc()).all()
    
    return {
        "data": [
            {
                "id": b.id,
                "source": b.source,
                "filename": b.filename,
                "status": b.status,
                "total_rows": b.total_rows,
                "valid_rows": b.valid_rows,
                "error_rows": b.error_rows,
                "created_at": str(b.created_at) if b.created_at else None
            }
            for b in batches
        ]
    }

@router.get("/ingest/batches/{id}")
def get_batch(
    id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    batch = db.query(IngestionBatch).filter(
        IngestionBatch.id == id,
        IngestionBatch.tenant_id == current_user["tenant_id"]
    ).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    dlq_records = db.query(DeadLetterRecord).filter(
        DeadLetterRecord.batch_id == id,
        DeadLetterRecord.tenant_id == current_user["tenant_id"]
    ).order_by(DeadLetterRecord.row_number.asc()).all()
    
    return {
        "id": batch.id,
        "filename": batch.filename,
        "status": batch.status,
        "total_rows": batch.total_rows,
        "valid_rows": batch.valid_rows,
        "error_rows": batch.error_rows,
        "dead_letters": [
            {
                "id": d.id,
                "row_number": d.row_number,
                "raw_data": d.raw_data,
                "error_reason": d.error_reason
            }
            for d in dlq_records
        ]
    }
