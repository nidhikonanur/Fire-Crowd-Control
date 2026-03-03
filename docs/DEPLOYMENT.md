# Deployment Guide

## Production Target
This project is currently optimized for containerized deployment with:
- one backend container
- one frontend container
- one PostgreSQL container (or managed PostgreSQL)

## Option A: Single-Host Docker Deployment

### 1) Prepare host
- Install Docker and Docker Compose plugin.
- Open ports:
  - `80`/`443` (if reverse proxy/ingress in front)
  - app internal ports as needed (`5173`, `8000`, `5432` if externally exposed).

### 2) Pull source and model artifacts
```bash
git clone https://github.com/tjstark312-3000/Fire-Crowd-Control.git
cd Fire-Crowd-Control
git lfs install
git lfs pull
```

### 3) Configure environment
Create `.env` at repo root (used by compose variable expansion), for example:
```bash
DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/sfd_crowd
POSTGRES_DB=sfd_crowd
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
CORS_ORIGINS=https://your-frontend-domain
VITE_API_BASE=https://api.your-domain
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 4) Build and start
```bash
docker compose -f infra/docker-compose.yml up -d --build
```

### 5) Post-deploy verification
```bash
curl -sS http://localhost:8000/health
docker compose -f infra/docker-compose.yml logs backend --tail=200 | rg "engine_selected|startup_complete"
curl -sS http://localhost:8000/api/cameras | jq 'length'
```

## Option B: Managed PostgreSQL
Use a managed PostgreSQL instance and point `DATABASE_URL` to it.

Notes:
- Keep `ALLOW_SQLITE=false`.
- Run migrations before routing traffic:
```bash
docker compose -f infra/docker-compose.yml run --rm backend alembic upgrade head
```

## Migration Deployment Strategy
1. Deploy new backend image.
2. Run `alembic upgrade head`.
3. Start backend app containers.
4. Verify health and camera workers.

For this codebase, backend startup also attempts migration alignment automatically via `start_backend.sh`, but explicit migration in CI/CD is still recommended.

## CI/CD Minimum Pipeline
1. Backend compile check:
```bash
python -m compileall backend/app backend/alembic
```
2. Frontend build:
```bash
cd frontend && npm ci && npm run build
```
3. Migration check:
```bash
cd backend && alembic upgrade head
```
4. Image build:
```bash
docker compose -f infra/docker-compose.yml build
```

## Rollback Guidance
- App rollback:
  - redeploy previous backend/frontend images.
- DB rollback:
  - restore from Postgres backup.
  - or execute Alembic downgrade only when tested for that release.

## Security Baseline
1. Do not expose PostgreSQL publicly unless required.
2. Use strong DB credentials and secret management.
3. Terminate TLS at ingress/reverse proxy.
4. Restrict `CORS_ORIGINS` to known frontend domains.
5. Rotate Supabase keys and DB credentials periodically.
