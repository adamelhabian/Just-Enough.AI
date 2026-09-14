import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_web_config_default_mode_is_live():
    web_config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "src", "api", "config.js"))
    assert os.path.exists(web_config_path)
    with open(web_config_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "defaultMode: 'LIVE'" in content
    assert "defaultMode: 'DEMO'" not in content

def test_web_storage_defaults_to_live():
    config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "src", "api", "config.js"))
    with open(config_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "return localStorage.getItem(CONFIG.storageKeys.mode) || CONFIG.defaultMode;" in content

def test_web_api_prohibits_silent_demo_fallback():
    client_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "src", "api", "client.js"))
    with open(client_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "class OfflineError extends Error" in content or "OfflineError" in content
    assert "class ServiceUnavailableError extends Error" in content or "ServiceUnavailableError" in content
    assert "throw new ServiceUnavailableError" in content
    assert "Zero-fabrication law: synthetic demo data is NEVER automatically displayed." in content

def test_web_ui_renders_prominent_demo_synthetic_indicator():
    dash_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "src", "features", "dashboard", "presentation", "DashboardPage.jsx"))
    with open(dash_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "DEMO / SYNTHETIC" in content
    assert "LIVE API ACTIVE" in content

def test_login_dropdown_defaults_to_live():
    login_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "src", "pages", "Login", "LoginPage.jsx"))
    with open(login_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert '<option value="LIVE" selected>' in content


def test_live_backend_enforces_auth_on_protected_endpoints():
    resp_sales = client.get("/api/v1/sales")
    assert resp_sales.status_code in [401, 403], f"Expected 401/403, got {resp_sales.status_code}"
    resp_inv = client.get("/api/v1/inventory/snapshots")
    assert resp_inv.status_code in [401, 403], f"Expected 401/403, got {resp_inv.status_code}"
