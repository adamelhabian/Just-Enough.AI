import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

def test_login_success_admin():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@demo.com", "password": "admin"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_success_employee():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "employee@demo.com", "password": "employee"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_login_failure():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@demo.com", "password": "wrongpassword"}
    )
    assert response.status_code in (401, 403)


def test_protected_route_without_token():
    response = client.get("/api/v1/sales")
    assert response.status_code in (401, 403)

def test_protected_route_with_invalid_token():
    response = client.get(
        "/api/v1/sales",
        headers={"Authorization": "Bearer invalid_garbage_token"}
    )
    assert response.status_code in (401, 403)

def test_auth_me_endpoint():
    token = create_access_token(data={"sub": "user_test", "role": "manager", "tenant_id": "tenant_123"})
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user_test"
    assert data["role"] == "manager"
    assert data["tenant_id"] == "tenant_123"
