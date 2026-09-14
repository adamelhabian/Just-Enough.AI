# Multi-stage Dockerfile for JustEnough.AI Unified Public Service
# Stage 1: Build React SPA Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/Web
COPY Web/package*.json ./
RUN npm ci
COPY Web ./
RUN npm run build

# Stage 2: Python Backend + ML + Embedded SQLite Runtime
FROM python:3.13-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends     curl build-essential gcc libgomp1 &&     rm -rf /var/lib/apt/lists/* &&     useradd -u 10001 -m justenough

COPY Backend/requirements.txt ./Backend/
RUN pip install --no-cache-dir -r ./Backend/requirements.txt

COPY Backend ./Backend
COPY ML ./ML

# Copy built frontend assets from frontend stage
COPY --from=frontend-builder /app/Web/dist ./Web/dist

ENV PYTHONPATH=/app/ML:/app/Backend:/app
ENV PORT=8000

# Give permissions for SQLite file creation to justenough user
RUN chown -R justenough:justenough /app

USER justenough

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3   CMD curl -f http://localhost:${PORT:-8000}/api/v1/health || exit 1

CMD ["sh", "-c", "python -m uvicorn app.main:app --app-dir Backend --host 0.0.0.0 --port ${PORT:-8000}"]
