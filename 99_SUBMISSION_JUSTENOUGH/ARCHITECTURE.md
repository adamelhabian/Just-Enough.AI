# JustEnough.AI — Architecture & Data Contracts Specification

## 1. High-Level Architecture

```
+-----------------------------------------------------------------------+
|                         React 18 SPA (Vite)                           |
|  - Management & Planning: Dashboard, Forecast, Production, Inventory  |
|  - Routing: React Router v6 | State: Zustand | Visualization: Recharts|
+-----------------------------------+-----------------------------------+
                                    | HTTP / JSON (REST + Bearer JWT)
                                    v
+-----------------------------------------------------------------------+
|                           FastAPI Backend                             |
|  - Security: JWT HS256, Bcrypt Auth, Multi-tenant Isolation Guard     |
|  - Endpoints: /auth, /health, /forecasts, /recommendations, /inventory|
|  - Middleware: CORS (Explicit origins), Request ID, Logging           |
+-------------------+-------------------------------+-------------------+
                    |                               |
                    v                               v
+-----------------------------------+   +-------------------------------+
|    Standalone Embedded SQLite     |   |      LightGBM ML Engine       |
|  - DB: justenough_mvp.db (Local)  |   |  - 52 Engineered Features     |
|  - Zero External Database Setup   |   |  - Monotonic Quantiles (P10,  |
|  - AuditLog & Inventory Snapshots |   |    P50, P90)                  |
+-----------------------------------+   +-------------------------------+
```

---

## 2. Standalone SQLite Mode Data Contracts

### A. Authentication Contract
- **POST `/api/v1/auth/login`**
  - Payload: `username=admin@justenough.local&password=AdminSecret123!`
  - Response (200): `{"access_token": "<JWT>", "token_type": "bearer", "role": "manager", "tenant_id": "tenant-demo-1"}`

### B. Recommendations Query Contract
- **GET `/api/v1/recommendations`**
  - Headers: `Authorization: Bearer <JWT>`
  - Response (200):
    ```json
    {
      "data": [
        {
          "id": "rec-1",
          "branch_id": "branch-main",
          "product_id": "Beef Burger Patties",
          "target_date": "2026-09-14",
          "recommended_qty": 135.0,
          "status": "pending",
          "risk": "MEDIUM",
          "override_reason": null,
          "explanation": "P90 peak lunch safety buffer"
        }
      ],
      "next_cursor": null
    }
    ```

### C. Manager Override Contract
- **POST `/api/v1/recommendations/{id}/override`**
  - Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`
  - Body: `{"recommended_qty": 160.0, "override_reason": "Verified peak service capacity adjustment for evening rush"}`
  - Response on Success (200):
    ```json
    {
      "status": "overridden",
      "id": "rec-1",
      "old_qty": 135.0,
      "new_qty": 160.0,
      "reason": "Verified peak service capacity adjustment for evening rush"
    }
    ```
  - Response on Non-Existent ID (404):
    ```json
    {
      "detail": "Recommendation 'non-existent-id-999' not found"
    }
    ```

### D. Audit Trail Contract
- **GET `/api/v1/recommendations/overrides/audit`**
  - Response (200):
    ```json
    {
      "data": [
        {
          "id": "uuid-v4",
          "actor_user_id": "user-mvp-admin-01",
          "action": "OVERRIDE_RECOMMENDATION",
          "entity_type": "recommendation",
          "entity_id": "rec-1",
          "payload": {"old_qty": 135.0, "new_qty": 160.0, "reason": "..."},
          "created_at": "2026-09-14 13:54:51.094717"
        }
      ]
    }
    ```