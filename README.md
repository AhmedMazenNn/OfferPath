---
title: OfferPath
emoji: 💼
colorFrom: blue
colorTo: indigo
sdk: docker
sdk_version: "3.0"
python_version: "3.11"
app_file: backend/run.py
pinned: false
---

# OfferPath - Job Application Tracker

<p align="center">
  <img src="https://via.placeholder.com/150x150/6366f1/ffffff?text=OP" alt="OfferPath Logo">
</p>

A modern job application tracking system to help you never lose track of your job search. Features a React web app, FastAPI backend, and Chrome browser extension.

---

## Features

- 📊 **Dashboard** - Stats cards, charts, and status tabs
- 📋 **Applications** - Filterable table with search
- 📝 **Application Details** - Pipeline, timeline, notes
- 📅 **Interviews** - Upcoming and past interviews
- 💼 **Offers** - Compare job offers side-by-side
- 📈 **Analytics** - Conversion funnel and metrics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |

## Deployment

### Backend (Hugging Face Spaces)

1. Go to huggingface.co/spaces
2. Create new Space with Docker SDK
3. Add env vars in Space settings:
   - `DATABASE_URL` - Neon connection string
   - `SECRET_KEY` - JWT secret
   - `CORS_ORIGINS` - Your frontend domain

### Frontend (Vercel)

1. Connect repo to Vercel
2. Set `VITE_API_URL` = your HF Space URL