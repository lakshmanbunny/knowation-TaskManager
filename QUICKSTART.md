# Task Manager - Quick Start Guide

## 🚀 Getting Started

### Prerequisites Met
- ✅ Backend: FastAPI fully implemented
- ✅ Frontend: React + Material-UI created
- ✅ Database: Neon PostgreSQL configured

### Backend Setup

1. **Navigate to backend folder:**
```bash
cd backend
```

2. **Activate virtual environment:**
```bash
venv\Scripts\activate
```

3. **Install dependencies** (if not already installed):
```bash
pip install -r requirements.txt
```

4. **Create Mailtrap account:**
   - Go to https://mailtrap.io
   - Sign up for free
   - Navigate to: Email Testing → Inboxes → My Inbox
   - Copy SMTP credentials

5. **Update `.env` file with Mailtrap credentials:**
   - Open `backend/.env`
   - Replace `SMTP_USER` and `SMTP_PASSWORD` with your Mailtrap credentials

6. **Start the backend server:**
```bash
uvicorn app.main:app --reload
```

Backend will run on: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

### Frontend Setup

1. **Navigate to frontend folder:**
```bash
cd frontend
```

2. **Install dependencies** (if not already installed):
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 🎮 Using the Application

### First Steps:
1. Open http://localhost:5173
2. Click "Register here" to create an account
3. Fill in username, email, and password
4. Check Mailtrap inbox for verification email
5. Click verification link in email
6. Login with your credentials
7. Start creating tasks and earning XP!

### Features to Test:

**Authentication:**
- ✅ User registration with email verification
- ✅ Login/logout
- ✅ Protected routes

**Task Management:**
- ✅ Create tasks with priority levels
- ✅ Edit and delete tasks
- ✅ Mark tasks as completed
- ✅ Category and tags

**Gamification:**
- ✅ Earn XP on task completion
- ✅ Level progression system
- ✅ Daily streak tracking
- ✅ Achievements system
- ✅ Beautiful stats dashboard

## 🛠️ What's Implemented

### Backend (100% Complete)
- ✅ FastAPI with async PostgreSQL (Neon)
- ✅ JWT authentication
- ✅ Email verification with Mailtrap
- ✅ Password reset functionality
- ✅ Complete task CRUD
- ✅ Gamification system (XP, levels, streaks, achievements)
- ✅ Search and filter endpoints

### Frontend (95% Complete)
- ✅ React + Vite + Material-UI
- ✅ Login/Register pages
- ✅ Email verification handler
- ✅ Dashboard with gamification stats
- ✅ Full task management UI
- ✅ Dark/light mode toggle
- ✅ Protected routes
- ✅ Responsive design
- ⚠️ Enhanced features to add:
  - Achievement badges display page
  - Advanced task search/filter UI
  - Password reset flow (frontend)

## 📝 Next Steps

1. **Set up Mailtrap** (5 minutes)
   - Get SMTP credentials
   - Update backend/.env

2. **Start both servers** (2 minutes)
   - Backend: `uvicorn app.main:app --reload`
   - Frontend: `npm run dev`

3. **Test the application** (10 minutes)
   - Register account
   - Verify email
   - Create tasks
   - Complete tasks and watch XP grow!

## 🎨 Current Gamification Features

- **XP System**: Base 10 XP + priority bonus + streak bonus
- **Levels**: Formula-based (Level = 1 + floor(sqrt(total_xp / 100)))
- **Streaks**: Track consecutive daily completions
- **Achievements**: 8 predefined achievements ready to unlock
- **Dashboard**: Beautiful gradient cards showing stats

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 8000 is available
- Verify DATABASE_URL in .env is correct
- Make sure dependencies are installed

**Frontend won't start:**
- Run `npm install` to ensure all packages are installed
- Check if port 5173 is available
- Verify .env has VITE_API_URL set correctly

**Emails not working:**
- Verify Mailtrap SMTP credentials in backend/.env
- Check Mailtrap inbox (it's a sandbox, emails won't go to real email)

## 🚀 Ready to Go!

Everything is set up and ready. Just need to:
1. Add Mailtrap credentials
2. Start both servers
3. Create your account and start using the app!
