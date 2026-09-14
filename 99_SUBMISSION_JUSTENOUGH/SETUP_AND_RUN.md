# JustEnough.AI — Quickstart Setup & Run Guide

Follow these simple steps to run the complete JustEnough MVP on any machine with Python 3.11+ and Node 18+.

---

## Prerequisites
- **Python:** 3.11, 3.12, or 3.13 (`python --version`)
- **Node.js:** 18+ (`node --version`)
- **Zero External Database Setup:** The application operates in standalone embedded SQLite mode using a local file (`justenough_mvp.db`). No PostgreSQL, Docker, or Neon instances are required.

---

## Two-Terminal Quickstart

### Terminal 1: Backend Service
```bash
# Navigate to repository root
cd Just-Enough.AI

# Install python dependencies (if not already installed)
pip install fastapi uvicorn pydantic python-jose passlib[bcrypt] sqlalchemy lightgbm scikit-learn pandas numpy pytest

# Launch FastAPI on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir Backend
```
*Health Check:* Open `http://127.0.0.1:8000/api/v1/health` in your browser. Expected response: `{"status": "ok", "service": "JustEnough MVP Demand Engine", ...}`.

---

### Terminal 2: Web Frontend
```bash
# Navigate to Web folder
cd Just-Enough.AI/Web

# Install npm dependencies
npm install

# Start Vite dev server on port 3000
npm run dev -- --port 3000
# (or preview the production build: npx vite preview --port 3000)
```
*Frontend URL:* Open `http://127.0.0.1:3000` in your browser.

---

## Evaluator Credentials
- **Email:** `admin@justenough.local`
- **Password:** `AdminSecret123!`
- **Data Mode:** `MVP API / Sample Data` (Selected as LIVE in UI to connect frontend to real FastAPI backend rather than mocks)