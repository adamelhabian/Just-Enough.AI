import pytest
from fastapi.testclient import TestClient
from datetime import date, timedelta
from app.main import app
from app.core.database import SessionLocal, get_db
from app.core.security import hash_password
from app.models.all_models import User, Branch, Product, InventorySnapshot, Recommendation, OperationalAlert

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_real_db():
    app.dependency_overrides.pop(get_db, None)
    yield

def test_full_vertical_operational_e2e_loop():
    login_res = client.post(
        '/api/v1/auth/login',
        data={'username': 'manager@justenough.ai', 'password': 'ChangeMeBeforeProduction!'}
    )
    if login_res.status_code != 200:
        login_res = client.post(
            '/api/v1/auth/login',
            data={'username': 'admin@demo.com', 'password': 'admin'}
        )
    assert login_res.status_code == 200, f'Login failed: {login_res.text}'
    token_data = login_res.json()
    assert 'access_token' in token_data
    token = token_data['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Record inventory snapshot
    today_str = date.today().isoformat()
    snap_payload = {
        'branch_id': 'R01',
        'product_id': 'M01',
        'snapshot_date': today_str,
        'quantity': 185.5,
        'data_flag': 'ACTUAL'
    }
    snap_res = client.post('/api/v1/inventory/snapshots', json=snap_payload, headers=headers)
    assert snap_res.status_code == 201, f'Create snapshot failed: {snap_res.text}'
    snap_data = snap_res.json()
    assert snap_data['quantity'] == 185.5
    assert snap_data['data_flag'] == 'ACTUAL'

    # 3. Read back inventory snapshots
    list_snap_res = client.get('/api/v1/inventory/snapshots?branch_id=R01&product_id=M01', headers=headers)
    assert list_snap_res.status_code == 200
    snaps = list_snap_res.json()['data']
    assert len(snaps) >= 1
    assert any(s['quantity'] == 185.5 for s in snaps)

    # 4. Create recommendation and apply manager override
    rec_payload = {
        'branch_id': 'R01',
        'product_id': 'M01',
        'target_date': (date.today() + timedelta(days=1)).isoformat(),
        'recommended_qty': 60.0,
        'risk': 'LOW',
        'explanation': 'Calculated baseline recommendation'
    }
    rec_res = client.post('/api/v1/recommendations', json=rec_payload, headers=headers)
    assert rec_res.status_code == 201
    rec_id = rec_res.json()['id']

    override_payload = {
        'recommended_qty': 90.0,
        'override_reason': 'Anticipated local holiday surge'
    }
    override_res = client.post(f'/api/v1/recommendations/{rec_id}/override', json=override_payload, headers=headers)
    assert override_res.status_code == 200
    assert override_res.json()['status'] == 'overridden'
    assert override_res.json()['new_qty'] == 90.0

    # 5. Create and resolve operational alert
    alert_payload = {
        'branch_id': 'R01',
        'product_id': 'M01',
        'alert_type': 'STOCKOUT_RISK',
        'severity': 'HIGH',
        'message': 'Stock running low before weekend'
    }
    alert_res = client.post('/api/v1/alerts', json=alert_payload, headers=headers)
    assert alert_res.status_code == 201
    alert_id = alert_res.json()['id']

    resolve_res = client.post(f'/api/v1/alerts/{alert_id}/resolve', headers=headers)
    assert resolve_res.status_code == 200
    assert resolve_res.json()['status'] == 'resolved'

    # 6. Logout
    logout_res = client.post('/api/v1/auth/logout', headers=headers)
    assert logout_res.status_code == 200
    assert logout_res.json()['status'] == 'logged_out'