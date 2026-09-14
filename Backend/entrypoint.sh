#!/bin/bash
# ============================================================
# JustEnough MVP — Docker Entrypoint
# Runs Alembic migrations then starts the application
# ============================================================
set -e

echo "=== JustEnough Entrypoint ==="
echo "Running Alembic database migrations..."

# Wait for database readiness (handled by depends_on + healthcheck,
# but belt-and-suspenders for edge cases)
MAX_RETRIES=10
RETRY=0
until python -c "
from sqlalchemy import create_engine, text
import os
engine = create_engine(os.environ['DATABASE_URL'])
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
" 2>/dev/null; do
    RETRY=$((RETRY + 1))
    if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: Database not reachable after $MAX_RETRIES retries"
        exit 1
    fi
    echo "Waiting for database... (attempt $RETRY/$MAX_RETRIES)"
    sleep 2
done

echo "Database is ready."

# Run Alembic migrations
cd /app
if [ -d "migrations" ]; then
    echo "Running alembic upgrade head..."
    python -m alembic upgrade head
    echo "Migrations complete."
else
    echo "WARNING: No migrations directory found, skipping alembic."
fi

echo "Starting JustEnough API server..."
exec "$@"
