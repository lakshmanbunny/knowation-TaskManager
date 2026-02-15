# Task Manager - Full Stack Web Application

A modern task management application with gamification features built with React, FastAPI, and PostgreSQL.

## Features

### Core Functionality
- 🔐 User Authentication (Register, Login, JWT)
- ✉️ Email Verification & Password Reset
- 📝 Task CRUD Operations
- 🔍 Search & Filter Tasks
- 🏷️ Priority Levels (Low, Medium, High)
- 📅 Due Dates & Categories/Tags
- ✅ Mark Tasks as Completed

### Gamification System
- 🎮 **XP/Points System**: Earn XP for completing tasks
- 📊 **Level Progression**: Advance through levels
- 🔥 **Daily Streaks**: Track consecutive task completions
- 🏆 **Achievements**: Unlock badges for milestones
- 📈 **Analytics Dashboard**: View your progress

### UI Features
- 🌙 Dark Mode Toggle
- 📱 Responsive Design (Mobile-Friendly)
- 🎨 Material-UI Components
- ✨ Smooth Animations

## Tech Stack

### Frontend
- **React 18** with **Vite**
- **Material-UI (MUI) v5**
- **React Router v6**
- **Axios**

### Backend
- **FastAPI**
- **SQLAlchemy 2.0** (Async)
- **PostgreSQL** (Neon)
- **JWT Authentication**
- **Mailtrap** (Email Testing)

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (Neon account)
- Mailtrap account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (see `.env.example`)

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the server:
```bash
uvicorn app.main:app --reload
```

Backend will run on: http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (see `.env.example`)

4. Start development server:
```bash
npm run dev
```

Frontend will run on: http://localhost:5173

### Docker Setup (Easiest)

1. Make sure you have **Docker** and **Docker Compose** installed.
2. Run the following command from the root directory:
```bash
docker-compose up --build
```
The application will be available at:
- Frontend: http://localhost:80
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Deployment

### Docker Hub
The application is automatically built and pushed to Docker Hub on every push to `main`:
- Backend: `lakshmanbunny/task-manager-backend`
- Frontend: `lakshmanbunny/task-manager-frontend`

### Render (Cloud Deployment)
This project includes a `render.yaml` Blueprint for one-click deployment.

1. Connect your GitHub repository to [Render](https://dashboard.render.com/).
2. Select **Blueprint** and connect this repo.
3. Render will automatically provision:
   - **PostgreSQL Database** (Neon)
   - **FastAPI Web Service**
   - **Static Frontend Site**

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host/dbname
SECRET_KEY=your-secret-key
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
FROM_EMAIL=noreply@taskmanager.com
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

- **Users**: Authentication and profile information
- **Tasks**: Task details with priority, category, due dates
- **UserStats**: XP, levels, streaks tracking
- **Achievements**: Badge definitions
- **UserAchievements**: User's unlocked badges

## Gamification Details

### XP Rewards
- Base: 10 XP per task
- Priority Bonus: Low (+5), Medium (+10), High (+20)
- Streak Bonus: +5 XP per streak day (max +50)

### Level Formula
`Level = 1 + floor(sqrt(total_xp / 100))`

### Achievements
- First Steps (1 task)
- Getting Started (5 tasks)
- Productive (25 tasks)
- Task Master (100 tasks)
- Week Warrior (7-day streak)
- Marathon Runner (30-day streak)
- And more...

## Project Structure

```
TASK-MANAGER/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── models/   # Database models
│   │   ├── routes/   # API endpoints
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   └── core/     # Config, security, database
│   └── alembic/      # Migrations
│
├── frontend/         # React application
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Page components
│       ├── context/     # State management
│       └── services/    # API calls
│
└── README.md
```

## Development

- Backend runs on port 8000
- Frontend runs on port 5173
- PostgreSQL hosted on Neon (cloud)
- Emails tested with Mailtrap

## License

MIT
