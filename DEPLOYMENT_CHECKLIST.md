# JustEnough AI — Deployment & Evaluation Checklist

## Pre-Deployment Verification
- [x] Backend tests pass: `pytest Backend/tests`
- [x] ML inference tests pass: `pytest ML/tests`
- [x] Frontend build succeeds without errors: `npm run build --prefix Web`
- [x] Zero external database required: Standalone embedded SQLite mode active
- [x] Single-origin routing verified: `vercel.json` rewrites `/api/(.*)` to `/api`

## Deployment Steps
1. Deploy from root directory containing `Web/`, `Backend/`, and `ML/`.
2. Ensure root `requirements.txt` and `vercel.json` are present.
3. Configure `ENVIRONMENT=production` and `SECRET_KEY` in deployment environment.

## Post-Deployment Verification
- [ ] `GET /api/v1/health` returns `200 OK` with `TRAINED_MODEL`.
- [ ] `GET /` serves React application.
- [ ] Morning Brief displays live LightGBM demand figures.
- [ ] Override lifecycle produces verified audit log entry.
