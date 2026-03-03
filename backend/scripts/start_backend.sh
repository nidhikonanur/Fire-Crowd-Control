#!/usr/bin/env sh
set -eu

if command -v alembic >/dev/null 2>&1; then
  migration_state=0
  python -m app.db.migration_state || migration_state=$?

  if [ "$migration_state" -eq 2 ]; then
    alembic stamp head
  elif [ "$migration_state" -ne 0 ]; then
    echo "Failed to inspect migration state." >&2
    exit "$migration_state"
  fi

  alembic upgrade head
else
  python -m app.db.bootstrap
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
