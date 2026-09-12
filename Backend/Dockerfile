# Multi-stage hardened build for JustEnough Backend + ML Adapter
FROM python:3.13-slim as builder

WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY Backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.13-slim as runner

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl libpq5 libgomp1 && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -u 10001 -m justenough

COPY --from=builder /install /usr/local
COPY Backend/app ./app
COPY ML ./ML

ENV PYTHONPATH=/app/ML:/app

USER justenough

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
