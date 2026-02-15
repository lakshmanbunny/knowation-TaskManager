# 🎯 Gamified Task Manager (Enterprise Edition)

[![CI](https://github.com/lakshmanbunny/knowation-TaskManager/actions/workflows/ci.yml/badge.svg)](https://github.com/lakshmanbunny/knowation-TaskManager/actions/workflows/ci.yml)
[![Docker Backend](https://img.shields.io/badge/Docker-Backend-blue?logo=docker)](https://hub.docker.com/r/lakshmanbunny/task-manager-backend)
[![Docker Frontend](https://img.shields.io/badge/Docker-Frontend-blue?logo=docker)](https://hub.docker.com/r/lakshmanbunny/task-manager-frontend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A state-of-the-art, full-stack task management ecosystem designed for maximal productivity and engagement. Built with a high-performance **FastAPI** backend and an immersive **React** frontend, this project integrates advanced gamification mechanics, robust security, and a professional-grade DevOps pipeline.

---

## 🚀 Live Production URL
- **Frontend Dashboard**: [https://task-manager-frontend-m24t.onrender.com](https://task-manager-frontend-m24t.onrender.com)
- **API Documentation**: [https://task-manager-backend-5dfy.onrender.com/docs](https://task-manager-backend-5dfy.onrender.com/docs)

---

## ✨ Implemented Features & Core Logic

### 1. 🎮 Advanced Gamification Engine
Our core engine is designed to turn productivity into an addictive, rewarding experience.
- **XP System**: Users earn Experience Points (XP) for completing tasks. Rewards are scaled based on task priority (Low: 10XP, Medium: 25XP, High: 50XP).
- **Dynamic Leveling**: A progressive leveling system ($Level = floor(XP / 100)$) with visual progress tracking.
- **Achievement System**: 15+ automated achievements (e.g., "First Steps", "Task Master", "Level 10 Legend") with unique icon badges and XP bonuses.
- **Streak Calculation**: Monitors consecutive days of activity. Maintaining a streak provides XP multipliers and unlocks special achievements.

### 2. 🗓️ Google Calendar Integration (OAuth2)
Seamlessly bridge your digital life with your productivity goals.
- **Full OAuth2 Flow**: Securely connect your Google account via a professional-grade OAuth2 handshake.
- **Bidirectional Sync**: Push tasks from the local dashboard directly to a "Task Manager" calendar in Google.
- **Real-time Status**: Tracking system that remembers which tasks have already been synced to prevent duplicates.

### 3. 📝 Comprehensive Task Management
A robust foundation for day-to-day organization.
- **Full CRUD**: Create, Read, Update, and Delete tasks with a modern UI.
- **Rich Task Data**: Support for Descriptions, Categories, Tags, Due Dates, and Priority levels.
- **Advanced Filtering**: Live search and status-based filtering (All, Pending, Completed).

### 4. 🛡️ Security & Integrity
Built with industry-standard security protocols.
- **JWT Authentication**: Stateless authentication using JSON Web Tokens for secure session management.
- **Argon2 Hashing**: Modern, memory-hard password hashing that protects user credentials against brute-force attacks.
- **Protected Routes**: Granular middleware that enforces authentication and authorizations across all sensitive API endpoints.
- **CORS Protection**: Hardened Cross-Origin Resource Sharing policy for production safety.

### 5. 📧 Email Service (Mailtrap/Gmail)
- **Email Verification**: Automated verification tokens sent upon registration to ensure valid user identities.
- **Password Recovery**: Secure, time-limited tokens for password resets via email.

---

## 🏗️ System Architecture & Infrastructure

### 🧩 Core Stack
- **Backend**: FastAPI (Python 3.12), SQLAlchemy (Async), Pydantic v2.
- **Frontend**: React 18, Vite, Material UI v5, Axios.
- **Database**: PostgreSQL with Alembic Migrations.
- **Nginx**: Production reverse proxy for the frontend container.

### 🚀 DevOps & CI/CD
- **GitHub Actions**: Fully automated linting (Ruff/ESLint) and image building.
- **Docker Hub**: Automated builds of production-ready images.
- **Render Blueprints**: Infrastructure-as-Code (`render.yaml`) for predictable, repeatable cloud deployments.

---

## 🐳 Running Privately (Docker)

```bash
# Clone and run
git clone https://github.com/lakshmanbunny/knowation-TaskManager.git
docker-compose up --build
```

---

## 📁 Project Structure

```
.
├── .github/workflows/    # CI/CD Pipeline
├── backend/              # FastAPI Logic
│   ├── app/
│   │   ├── core/         # Config & Security
│   │   ├── models/       # Database Schemas
│   │   ├── routes/       # API Controllers
│   │   └── services/     # Gamification & Calendar Engine
├── frontend/             # React Logic
│   ├── src/
│   │   ├── context/      # Global State Management
│   │   ├── services/     # Axios API Bridge
│   │   └── components/   # Atomic UI Elements
└── docker-compose.yml    # Local Orchestration
```

---

*Built with ❤️ by Lakshman - Final Submission Edition.*
