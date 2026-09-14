import csv
import io
import uuid
import datetime
from typing import Dict, Any, List
from app.models.all_models import IngestionBatch, DeadLetterRecord, SalesRecord

class IngestionService:
    def __init__(self, db, tenant_id: str):
        self.db = db
        self.tenant_id = tenant_id

    def process_csv(self, csv_content: str, batch_id: str, filename: str) -> Dict[str, Any]:
        batch = IngestionBatch(
            id=batch_id,
            tenant_id=self.tenant_id,
            source="csv",
            filename=filename,
            status="processing"
        )
        self.db.add(batch)
        self.db.commit()

        reader = csv.DictReader(io.StringIO(csv_content))
        total, valid, error = 0, 0, 0
        row_num = 1
        seen = set()
        sales_to_insert: List[SalesRecord] = []
        errors_summary: List[str] = []

        for row in reader:
            row_num += 1
            total += 1
            try:
                prod_id = (row.get("product_id") or "").strip()
                branch_id = (row.get("branch_id") or "").strip()
                sale_date_raw = (row.get("sale_date") or "").strip()
                
                if not prod_id or not branch_id or not sale_date_raw:
                    raise ValueError("Missing required fields: product_id, branch_id, or sale_date")
                
                # Deduplication check
                dedup_key = (prod_id, branch_id, sale_date_raw)
                if dedup_key in seen:
                    raise ValueError(f"Duplicate record in file for product {prod_id} at branch {branch_id} on {sale_date_raw}")
                seen.add(dedup_key)
                
                # Quantity validation
                try:
                    qty = float(row.get("quantity", 0))
                except (ValueError, TypeError):
                    raise ValueError("Quantity must be a valid number")
                if qty < 0:
                    raise ValueError("Negative quantity not allowed")
                
                # Unit price validation
                price_raw = row.get("unit_price") or row.get("price") or 0.0
                try:
                    price = float(price_raw)
                except (ValueError, TypeError):
                    raise ValueError("Unit price must be a valid number")
                if price < 0:
                    raise ValueError("Negative unit price not allowed")
                
                # Date validation
                try:
                    sale_date = datetime.datetime.strptime(sale_date_raw, "%Y-%m-%d").date()
                except ValueError:
                    raise ValueError("Invalid sale_date format, expected YYYY-MM-DD")
                
                if sale_date > datetime.date.today():
                    raise ValueError("Future dates not allowed in sales records")

                sales_rec = SalesRecord(
                    id=str(uuid.uuid4()),
                    tenant_id=self.tenant_id,
                    branch_id=branch_id,
                    product_id=prod_id,
                    sale_date=sale_date,
                    quantity=qty,
                    unit_price=price
                )
                sales_to_insert.append(sales_rec)
                valid += 1
            except Exception as e:
                error += 1
                reason = str(e)
                errors_summary.append(f"Row {row_num}: {reason}")
                dlq = DeadLetterRecord(
                    id=str(uuid.uuid4()),
                    tenant_id=self.tenant_id,
                    batch_id=batch_id,
                    row_number=row_num,
                    raw_data=row,
                    error_reason=reason
                )
                self.db.add(dlq)

        # Batch insert valid sales records
        if sales_to_insert:
            for s in sales_to_insert:
                self.db.add(s)

        batch.total_rows = total
        batch.valid_rows = valid
        batch.error_rows = error
        batch.status = "completed" if error == 0 else ("failed" if valid == 0 else "partial")
        self.db.commit()
        
        return {
            "batch_id": batch_id,
            "total": total,
            "valid": valid,
            "error": error,
            "status": batch.status,
            "sample_errors": errors_summary[:5]
        }

