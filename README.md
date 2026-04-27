# OfferPath - Job Application Tracker

<p align="center">
  <img src="https://via.placeholder.com/150x150/6366f1/ffffff?text=OP" alt="OfferPath Logo">
</p>

A modern job application tracking system to help you never lose track of your job search. Features a React web app, FastAPI backend, and Chrome browser extension.

---

## Features

### Web Application
- 📊 **Dashboard** - Stats cards, charts, and status tabs
- 📋 **Applications** - Filterable table with search
- 📝 **Application Details** - Pipeline, timeline, notes
- 📅 **Interviews** - Upcoming and past interviews
- 💼 **Offers** - Compare job offers side-by-side
- 📈 **Analytics** - Conversion funnel and metrics

### Browser Extension
- 🔍 **Auto-detect** - Detects job postings on LinkedIn, Indeed, etc.
- ⚡ **Quick Capture** - One-click application tracking
- 🔄 **Sync** - Automatically syncs with backend

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Animation | Framer Motion |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy |

---

## Project Structure

```
OfferPath/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── types/        # TypeScript types
│   │   └── data/         # Mock data
│   ├── browser-extension/ # Chrome extension
│   ├── .env             # Environment variables
│   └── package.json
│
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py      # FastAPI entry point
│   │   ├── database.py  # PostgreSQL connection
│   │   ├── models.py   # Data models
│   │   └── routes/     # API endpoints
│   ├── .env            # Environment variables
│   └── requirements.txt
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- PostgreSQL 14+

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/OfferPath.git
cd OfferPath
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

### 3. Backend Setup

```bash
# Navigate to backend
cd ../backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file (see .env.example)
# Update with your PostgreSQL credentials

# Start server
python run.py
```

Backend runs at: http://localhost:8000

---

## Environment Variables

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
VITE_DEV_MODE=true
```

### Backend (.env)

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=offerpath
DB_USER=postgres
DB_PASSWORD=your_password

# Server
HOST=127.0.0.1
PORT=8000
```

---

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List all applications |
| POST | `/api/applications` | Create new application |
| GET | `/api/applications/{id}` | Get single application |
| PUT | `/api/applications/{id}` | Update application |
| DELETE | `/api/applications/{id}` | Delete application |
| GET | `/api/applications/stats/summary` | Dashboard stats |

---

## Browser Extension

### Installation (Development)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `frontend/browser-extension`

### Updating API URL

Edit `frontend/browser-extension/background.js` to point to your backend:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

---

## Deployment

### Frontend (Vercel/Netlify)

1. Connect your repository to Vercel/Netlify
2. Set environment variables in the dashboard
3. Deploy automatically on push

### Backend (Railway/Render/Heroku)

1. Set up a PostgreSQL database
2. Configure environment variables
3. Deploy with Uvicorn

### Chrome Web Store

1. Create proper PNG icons (16x16, 48x48, 128x128)
2. Zip the extension folder
3. Upload to Chrome Web Store Developer Dashboard

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Linear](https://linear.app) - Design inspiration
- [Shadcn UI](https://ui.shadcn.com) - Component patterns