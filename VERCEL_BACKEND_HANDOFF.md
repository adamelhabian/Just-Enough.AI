# JustEnough AI — Vercel Deployment Guide

## 1. Single-Project / Single-Origin Deployment Architecture

JustEnough is deployed as **one single Vercel project** serving both the React SPA and the FastAPI backend under the same origin (`https://<project-name>.vercel.app`):
- `/api/*` -> Routed to `api/index.py` (FastAPI Serverless Python runtime)
- `/*` -> Serves the prebuilt React static bundle from `Web/dist` with SPA client-side fallback

---

## 2. Repository Configuration Files

1. **`vercel.json`** (Root):
   - Configures build command: `npm --prefix Web ci && npm --prefix Web run build`
   - Sets output directory: `Web/dist`
   - Rewrites `/api/(.*)` to `/api` (handled by `api/index.py`)
2. **`api/index.py`**:
   - Entrypoint adding `Backend/` and `ML/` to `sys.path`
   - Exports `from app.main import app`
3. **`requirements.txt`** (Root):
   - Contains all dependencies for FastAPI and LightGBM inference
4. **`Web/src/api/config.js`**:
   - `apiBaseUrl: import.meta.env.VITE_API_BASE_URL || ''` (enables same-origin API calls)

---

## 3. Step-by-Step Vercel Deployment Instructions

### Deploying via Vercel Web Dashboard (Recommended for Teammates)
1. Fork or push the merged `main` branch to your GitHub repository.
2. Log into [vercel.com](https://vercel.com) (Hobby tier is $0 / no credit card required).
3. Click **Add New... -> Project** and import `Just-Enough.AI`.
4. Leave **Root Directory** as `./` (do not change to `Web` or `Backend`).
5. Vercel will automatically detect `vercel.json` and configure:
   - Build Command: `npm --prefix Web ci && npm --prefix Web run build`
   - Output Directory: `Web/dist`
6. Under **Environment Variables**, add:
   - `ENVIRONMENT`: `production`
   - `SECRET_KEY`: `<generate-a-32-byte-hex-key>` (e.g. `openssl rand -hex 32`)
7. Click **Deploy**.

---

## 4. Verification Checklist Post-Deployment

- [ ] `GET https://<your-url>.vercel.app/api/v1/health` returns `200 OK` with `"mode": "TRAINED_MODEL"`.
- [ ] `GET https://<your-url>.vercel.app/` loads the React Morning Brief screen without blank screens or 404s.
- [ ] Login using `admin@justenough.local` / `AdminSecret123!`.
- [ ] Toggle LIVE / DEMO data mode and verify live ML demand numbers render correctly.
- [ ] Verify Manager Override and Audit Trail flow.
