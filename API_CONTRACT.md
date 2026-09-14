# JustEnough AI — API Contract Specification

## Authentication
All operational endpoints require a Bearer JWT token in the `Authorization` header:
`Authorization: Bearer <token>`

---

## 1. System Health
- **Route**: `GET /api/v1/health`
- **Auth**: None required
- **Response**:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "JustEnough MVP Demand Engine",
  "database": "connected",
  "data_layer": "operational",
  "ml_engine": {
    "status": "ready",
    "mode": "TRAINED_MODEL",
    "model_name": "LightGBM",
    "features": 52,
    "forecast_horizon_days": 7
  },
  "timestamp": "2026-09-14T12:00:00Z"
}
```

---

## 2. Restaurant Morning Brief
- **Route**: `GET /api/v1/morning-brief?branch_id=branch-101`
- **Auth**: Required (Bearer JWT)
- **Response**:
```json
{
  "status": "success",
  "generated_at": "2026-09-14T12:00:00Z",
  "branch_id": "branch-101",
  "summary": {
    "predicted_demand": 140,
    "accuracy": "94.8%",
    "stock_coverage_days": 4.5,
    "waste_risk": "Low (4.2%)",
    "items_at_risk": 3
  },
  "prepare": [...],
  "order": [...],
  "monitor": [...],
  "alerts": [...],
  "ai_insights": [...]
}
```

---

## 3. Demand Forecasts
- **Route**: `POST /api/v1/forecasts/trigger-7day`
- **Auth**: Required (Bearer JWT)
- **Payload**:
```json
{
  "branch_id": "branch-101",
  "forecast_start": "2026-09-15"
}
```

---

## 4. Managerial Overrides & Audit Trail
- **Route**: `POST /api/v1/recommendations/{id}/override`
- **Auth**: Required (Bearer JWT)
- **Payload**:
```json
{
  "manager_id": "mgr-001",
  "original_qty": 120.0,
  "override_qty": 140.0,
  "reason_code": "PROMOTION_SPIKE",
  "notes": "Expected foot traffic surge"
}
```
- **Route**: `GET /api/v1/recommendations/overrides/audit`
- **Auth**: Required (Bearer JWT)
- **Response**: List of managerial overrides recorded in audit trail.
