import pytest
from app.services.ingestion import IngestionService
from unittest.mock import MagicMock

def test_valid_csv_ingestion():
    db_mock = MagicMock()
    svc = IngestionService(db_mock, "tenant_1")
    csv_data = "product_id,branch_id,sale_date,quantity\np1,b1,2023-01-01,10"
    res = svc.process_csv(csv_data, "batch_1", "test.csv")
    assert res['valid'] == 1
    assert res['error'] == 0

def test_invalid_csv_missing_fields():
    db_mock = MagicMock()
    svc = IngestionService(db_mock, "tenant_1")
    csv_data = "product_id,quantity\np1,10"
    res = svc.process_csv(csv_data, "batch_1", "test.csv")
    assert res['valid'] == 0
    assert res['error'] == 1

def test_invalid_csv_future_date():
    db_mock = MagicMock()
    svc = IngestionService(db_mock, "tenant_1")
    csv_data = "product_id,branch_id,sale_date,quantity\np1,b1,2099-01-01,10"
    res = svc.process_csv(csv_data, "batch_1", "test.csv")
    assert res['valid'] == 0
    assert res['error'] == 1

def test_invalid_csv_negative_qty():
    db_mock = MagicMock()
    svc = IngestionService(db_mock, "tenant_1")
    csv_data = "product_id,branch_id,sale_date,quantity\np1,b1,2023-01-01,-10"
    res = svc.process_csv(csv_data, "batch_1", "test.csv")
    assert res['valid'] == 0
    assert res['error'] == 1

def test_duplicate_row_csv():
    db_mock = MagicMock()
    svc = IngestionService(db_mock, "tenant_1")
    csv_data = "product_id,branch_id,sale_date,quantity\np1,b1,2023-01-01,10\np1,b1,2023-01-01,20"
    res = svc.process_csv(csv_data, "batch_1", "test.csv")
    assert res['valid'] == 1
    assert res['error'] == 1
