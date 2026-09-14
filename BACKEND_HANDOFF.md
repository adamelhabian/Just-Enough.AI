# JustEnough AI — Backend & ML Teammate Handoff

> [!CAUTION]
> **CRITICAL ARCHITECTURE REQUIREMENT:**
> **DO NOT DEPLOY `Backend/` ALONE.**
> **DEPLOY FROM THE REPOSITORY ROOT OR INCLUDE BOTH `Backend/` AND `ML/`.**
>
> The FastAPI backend dynamically imports and executes the trained 52-feature LightGBM model from `ML/just_enough_ml`. If `Backend/` is deployed in isolation without `ML/`, the application will enter a degraded heuristic fallback mode instead of running the verified machine learning pipeline.

---

## 1. System Architecture & Component Mapping

```mermaid
graph TD
    UI[React 18 / Vite Frontend] -->|REST API + JWT| API[FastAPI Serverless / Backend]
    API -->|Feature Assembly & Horizon| ML[LightGBM 52-Feature Model (ML/)]
    ML -->|Quantile Demand Predictions| BOM[BOM Recipe Translation Engine]
    BOM -->|Ingredient Deficiencies & Safety Stock| ACT[Operational Action Engine]
    ACT -->|PREPARE / ORDER / MONITOR / ALERT| API
    API -->|Real-time JSON| UI
```

### Components:
1. **Frontend (`Web/`)**: React 18 single-page application built with Vite, Tailwind CSS, Lucide icons, and Recharts. All production API calls use `/api/v1/...` on the same domain.
2. **Backend (`Backend/app/`)**: FastAPI demand planning service with JWT authentication, tenant isolation, standalone SQLite database, and operational endpoints.
3. **ML Engine (`ML/just_enough_ml/`)**: 52-feature recursive quantile demand forecasting engine trained on restaurant sales time-series (`demand_model.joblib`).

---

## 2. Environment & Database Configuration

- **Zero External Database Setup Required**: The MVP runs in standalone embedded SQLite mode by default.
  - **Local Development**: `sqlite:///./justenough_mvp.db`
  - **Vercel Serverless**: `sqlite:////tmp/justenough_mvp.db` (ephemeral `/tmp` volume)
- **No PostgreSQL, Neon, Docker, or external migrations are needed.**
- Default demo credentials auto-seeded on startup:
  - **Email**: `admin@justenough.local`
  - **Password**: `AdminSecret123!`
  - **Tenant ID**: `tenant-demo-1`

---

## 3. How to Run Locally

### Option A: Unified Local Development (Vercel CLI)
```bash
# From repository root
npm run build --prefix Web
vercel dev
# Application available at http://localhost:3000
```

### Option B: Split Development Servers
```bash
# Terminal 1: Backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir Backend --reload

# Terminal 2: Frontend
cd Web
npm run dev
# Application available at http://localhost:5173
```

---

## 4. Operational API Contracts

- `GET /api/v1/health`: Reports system status and ML engine status (`mode: "TRAINED_MODEL"`, `features: 52`).
- `GET /api/v1/morning-brief`: Comprehensive restaurant daily operations summary with predicted demand, stock coverage, items at risk, prep tasks, order lists, and explainable AI insights.
- `POST /api/v1/forecasts/trigger-7day`: Triggers 7-day recursive LightGBM demand forecast, BOM translation, and operational action generation.
- `GET /api/v1/recommendations`: Lists pending operational recommendations.
- `POST /api/v1/recommendations/{id}/override`: Records manager overrides with justification.
- `GET /api/v1/recommendations/overrides/audit`: Audit trail of all managerial decisions.
