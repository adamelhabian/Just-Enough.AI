import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_password
from app.models.all_models import User
from app.models.canonical_models import Base as CanonicalBase

# Setup shared in-memory SQLite database for authorization testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
Base.metadata.create_all(bind=test_engine)
CanonicalBase.metadata.create_all(bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()
@pytest.fixture(autouse=True)
def setup_auth_db():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)

# Seed test users in the test database
with TestingSessionLocal() as db:
    test_users = [
        User(id="user_admin_1", email="admin@demo.com", hashed_password=hash_password("admin"), role="admin", tenant_id="tenant_1", is_active=True),
        User(id="user_emp_1", email="employee@demo.com", hashed_password=hash_password("employee"), role="employee", tenant_id="tenant_1", is_active=True),
        User(id="user_mgr_1", email="manager@justenough.ai", hashed_password=hash_password("ChangeMeBeforeProduction!"), role="manager", tenant_id="tenant_demo_1", is_active=True),
    ]
    for u in test_users:
        db.add(u)
    db.commit()

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
    assert data["role"] == "admin"

def test_login_success_employee():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "employee@demo.com", "password": "employee"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "employee"

def test_login_success_manager():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "manager@justenough.ai", "password": "ChangeMeBeforeProduction!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "manager"

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

def test_logout_endpoint():
    token = create_access_token(data={"sub": "user_test", "role": "manager", "tenant_id": "tenant_123"})
    response = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "logged_out"
