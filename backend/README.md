---
title: OfferPath Backend
emoji: 💼
colorFrom: blue
colorTo: indigo
sdk: docker
sdk_version: "3.0"
python_version: "3.11"
app_file: run.py
pinned: false
---

# OfferPath Backend API

FastAPI backend for job application tracking.

## Environment Variables

Set these in Space settings (Repo secrets):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `SECRET_KEY` | JWT secret key |
| `CORS_ORIGINS` | Allowed origins (comma-separated) |
| `DEBUG` | Set to `false` in production |

## API Endpoints

- `/` - Root
- `/health` - Health check
- `/api/auth/*` - Authentication
- `/api/applications/*` - Applications CRUD
- `/api/interviews/*` - Interviews CRUD
- `/api/offers/*` - Offers CRUD
- `/api/analytics/*` - Analytics
- `/api/admin/*` - Admin endpoints