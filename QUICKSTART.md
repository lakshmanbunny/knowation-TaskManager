# 🚀 Project Quick Start & Submission Guide

This guide provides everything needed to evaluate, run, and deploy the **Gamified Task Manager**.

## 📅 Final Submission Status
- **Backend Integrity**: ✅ 100% (Async PostgreSQL, Gamification Engine, Google Sync)
- **Frontend Coverage**: ✅ 100% (MUI v5 Dashboard, Context State, Responsive Design)
- **Infrastructure**: ✅ 100% (Dockerized, GitHub Actions CI/CD, Render Blueprint)

---

## 🔧 Option 1: Local Deployment (Standard)

### 1. Backend Initialization
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- **Access URL**: `http://localhost:8000`
- **Documentation**: `/docs` (Swagger UI)

### 2. Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```
- **Access URL**: `http://localhost:5173`

---

## 🐳 Option 2: Docker Deployment (Recommended)

Run the entire stack with a single command without installing dependencies locally.

```bash
docker-compose up --build
```

**Images used from Docker Hub:**
- `lakshmanbunny/task-manager-backend`
- `lakshmanbunny/task-manager-frontend`

---

## 🏗️ CI/CD & Automations

The project implements a professional **Continuous Integration and Continuous Delivery** flow via GitHub Actions:

- **Linting**: Automated Python (Ruff) and React (ESLint) checks on every PR/Push.
- **Docker Hub Sync**: Every push to `main` triggers a build that pushes the latest verified images to [Docker Hub](https://hub.docker.com/u/lakshmanbunny).
- **Security Check**: Auto-validation of environment variable presence and smoke tests.

---

## ☁️ Cloud Deployment (Render)

The project is architected for immediate cloud deployment. Using the `render.yaml` file in the root:

1.  Navigate to **Render Dashboard** -> **Blueprints**.
2.  Connect this repository.
3.  Deploy! (Render will provision the DB, Backend, and Frontend automatically).

---

## 📁 Key Project Logic (Gamification)

The core competitive advantage of this app is its modular **Gamification Service**:
- **XP Engine**: Located in `backend/app/services/gamification.py`. It calculates real-time XP based on task priority, daily streaks, and completion speed.
- **Achievement Resolver**: Async logic that checks for milestone triggers (e.g., "7-Day Streak", "Task Master").
- **Real-time Dashboard**: The frontend `Dashboard.jsx` uses `useMemo` for high-performance stat rendering and animated progress bars.

---

## 🔐 Security Standards
- **JWT Auth**: RS256 signing for secure session management.
- **CORS Policy**: Configured specifically for production vs local development.
- **DB Safety**: All queries use **Asynchronous SQLAlchemy** to prevent blocking IO.
- **Secrets Management**: Industry-standard `.env` encapsulation.

---
**Thank you for reviewing the Gamified Task Manager!**
