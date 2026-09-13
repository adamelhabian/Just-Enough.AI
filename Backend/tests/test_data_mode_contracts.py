import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_web_config_default_mode_is_live():
    web_config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "js", "config.js"))
    assert os.path.exists(web_config_path)
    with open(web_config_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "defaultMode: 'LIVE'" in content
    assert "defaultMode: 'DEMO'" not in content

def test_web_storage_defaults_to_live():
    storage_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "js", "storage.js"))
    with open(storage_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "return store.getItem(CONFIG.storageKeys.mode) || CONFIG.defaultMode;" in content

def test_web_api_prohibits_silent_demo_fallback():
    api_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "js", "api.js"))
    with open(api_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "class OfflineError extends Error" in content
    assert "class ServiceUnavailableError extends Error" in content
    assert "throw new ServiceUnavailableError" in content
    assert "Zero-fabrication law: synthetic demo data is NEVER automatically displayed." in content

def test_web_ui_renders_prominent_demo_synthetic_indicator():
    ui_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "js", "ui.js"))
    with open(ui_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "DEMO / SYNTHETIC" in content
    assert "renderErrorState" in content
    assert "CACHED REAL DATA" in content

def test_login_dropdown_defaults_to_live():
    login_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Web", "login.html"))
    with open(login_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert '<option value="LIVE" selected>' in content

def test_live_backend_enforces_auth_on_protected_endpoints():
    resp_sales = client.get("/api/v1/sales")
    assert resp_sales.status_code in [401, 403], f"Expected 401/403, got {resp_sales.status_code}"
    resp_inv = client.get("/api/v1/inventory/snapshots")
    assert resp_inv.status_code in [401, 403], f"Expected 401/403, got {resp_inv.status_code}"
