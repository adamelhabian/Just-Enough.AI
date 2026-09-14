# Just-Enough.AI

> **An AI-powered restaurant demand engine for smarter prep scheduling, inventory procurement, and waste prevention.**

---

## What JustEnough Solves

Restaurant managers ask every morning: **"What should this restaurant prepare, order, and monitor next?"**

JustEnough answers this operational question deterministically:
1. **Sales History & Future Context** (60-day POS sales + calendar, promotions, weather)
2. **Machine Learning Demand Model** (Trained 52-feature recursive LightGBM quantile regression)
3. **Recipe & Bill of Materials (BOM) Translation** (Translates menu item predictions into raw ingredient needs)
4. **Operational Action Engine**:
   - **PREPARE**: Kitchen batching quantities and schedule buffer for Day 1
   - **ORDER**: Supplier procurement recommendations based on net stock position and lead times
   - **MONITOR**: Items approaching safety stock reorder thresholds
   - **ALERT**: Critical stockout warnings before rush shifts occur
5. **Manager Override & Audit Trail**: Full managerial override flexibility with audit trail.

---

## Key Documentation & Handoff Guides

- **Backend & ML Handoff (`BACKEND_HANDOFF.md`)** — Architecture mapping, ML dependencies, and critical rule: *Do not deploy Backend/ alone — deploy from root with ML/*.
- **Vercel Deployment Guide (`VERCEL_BACKEND_HANDOFF.md`)** — Step-by-step $0 zero-card Vercel Hobby deployment under a single domain.
- **System Architecture (`ARCHITECTURE.md`)** — 52-feature model, BOM translation pipeline, and operational decision algorithms.
- **API Contract (`API_CONTRACT.md`)** — Complete endpoint schemas, authentication, and responses.
- **Deployment Checklist (`DEPLOYMENT_CHECKLIST.md`)** — Pre- and post-deployment validation steps.

---

## Architecture & Component Layout

```
[Sales History / POS Data] (60-day time series)
       │
       ▼
[ML Feature Engineering] (52 tabular features)
       │
       ▼
[LightGBM Quantile Regressor] (Recursive 7-day demand forecasting: P10, P50, P90)
       │
       ▼
[Recipe / BOM Translation Engine] (Converts menu-item demand into raw ingredient requirements)
       │
       ▼
[Operational Decision Engine] (PREPARE, ORDER, MONITOR, ALERT)
       │
       ▼
[FastAPI Endpoints] (/api/v1/morning-brief, /api/v1/forecasts, /api/v1/recommendations)
       │
       ▼
[React 18 Dashboard] (Interactive Morning Brief, Forecast explorer, Inventory intelligence)
```

---

## Zero-Database Local Quickstart

The MVP runs in **standalone embedded SQLite mode** by default. No Docker, PostgreSQL, Neon, or external database setup is required!

### Unified Local Server (Vercel CLI)
```bash
# Install frontend packages and build
npm run build --prefix Web

# Run full unified stack (Frontend + Serverless FastAPI Backend)
vercel dev
# Open http://localhost:3000
```

### Split-Server Development
```bash
# 1. Start FastAPI Backend (Terminal 1)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir Backend --reload

# 2. Start React Frontend (Terminal 2)
cd Web
npm run dev
# Open http://localhost:5173
```

---

## Default Evaluation Credentials

- **URL**: `http://localhost:3000` (or `http://localhost:5173`)
- **Email**: `admin@justenough.local`
- **Password**: `AdminSecret123!`
- **Role**: Restaurant General Manager (`tenant-demo-1`)

---

## Verification & Test Suite

```bash
# Backend test suite (including end-to-end vertical ML pipeline)
python -m pytest Backend/tests -v

# Upstream ML engine test suite
python -m pytest ML/tests -v

# Frontend production build
npm --prefix Web run build
```

---

## Public Single-URL Deployment (Vercel Hobby)

Deploy as a single project from the repository root:
1. Import repository into [Vercel](https://vercel.com) (Hobby tier is $0 / no credit card).
2. Keep root directory as `./` (Vercel detects `vercel.json`).
3. Set environment variable: `ENVIRONMENT=production`, `SECRET_KEY=<32-byte-hex>`.
4. Deploy! Both React UI and FastAPI API will be served from the same domain.

