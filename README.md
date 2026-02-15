# 🎯 Gamified Task Manager (Enterprise Edition)

[![CI](https://github.com/lakshmanbunny/knowation-TaskManager/actions/workflows/ci.yml/badge.svg)](https://github.com/lakshmanbunny/knowation-TaskManager/actions/workflows/ci.yml)
[![Docker Backend](https://img.shields.io/badge/Docker-Backend-blue?logo=docker)](https://hub.docker.com/r/lakshmanbunny/task-manager-backend)
[![Docker Frontend](https://img.shields.io/badge/Docker-Frontend-blue?logo=docker)](https://hub.docker.com/r/lakshmanbunny/task-manager-frontend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A state-of-the-art, full-stack task management ecosystem designed for productivity and engagement. Built with a high-performance **FastAPI** backend and an immersive **React** frontend, this project integrates advanced gamification mechanics, robust security, and a professional-grade DevOps pipeline.

---

## 🏗️ System Architecture & Infrastructure

This project follows a modern, distributed architecture designed for scalability and reliability.

### 🧩 Core Components
- **Backend (API)**: High-concurrency ASGI server built with FastAPI, leveraging asynchronous SQLAlchemy and Pydantic validation.
- **Frontend (UI)**: Responsive Single Page Application (SPA) built with React 18, Vite, and Material UI v5, optimized for zero-latency user experiences.
- **Database**: Production-grade PostgreSQL (Neon Cloud) with Alembic migration management.
- **Infrastructure**: Fully containerized with Docker and Docker Compose.

### 🚀 CI/CD Pipeline
We utilize a comprehensive **GitHub Actions** workflow that ensures code quality and automated delivery:
1.  **Code Validation**: Parallel jobs for Python (Ruff) and JavaScript (ESLint).
2.  **Smoke Testing**: Automated import and connectivity checks.
3.  **Automated Build & Push**: On successful merge to `main`, Docker images are automatically built and pushed to **Docker Hub**.
4.  **Continuous Deployment**: Automated triggering for cloud-native deployment.

---

## 🐳 Quick Execution (Docker)

The fastest way to run the entire stack locally is via Docker. We provide pre-built, industry-optimized images on Docker Hub.

```bash
# Pull and run the entire ecosystem
docker-compose up --build
```

**What this does:**
- Provisions an **Nginx** reverse proxy for the frontend.
- Boots the **FastAPI** backend in a production-ready container.
- Establishes a secure bridge to your **PostgreSQL** instance.

---

## ☁️ Cloud Deployment (Render)

This repository is "Render-Ready" with a pre-configured `render.yaml` Blueprint.

1.  **Connect Repo**: Link your GitHub repository to Render.
2.  **Launch Blueprint**: Render will automatically detect the blueprint and provision:
    - ✅ **Alembic-managed database**
    - ✅ **Auto-scaling Backend Web Service**
    - ✅ **Global CDN-backed Static Frontend**
3.  **Configuration**: Use the provided environment variable templates for production secrets.

### 🔗 Public Registries
- **Backend Image**: `lakshmanbunny/task-manager-backend:latest`
- **Frontend Image**: `lakshmanbunny/task-manager-frontend:latest`

---

## 🛠️ Tech Stack & Compliance

| Layer | Technology |
| :--- | :--- |
| **Language** | Python 3.12, JavaScript (ES6+) |
| **Frameworks** | FastAPI, React 18, Vite |
| **Styling** | Material-UI v5 (MUI) |
| **Persistence** | PostgreSQL, SQLAlchemy (Async), Alembic |
| **Authentication** | JWT (OAuth2 logic), Argon2 Password Hashing |
| **Infrastructure** | Docker, Nginx, GitHub Actions |
| **Monitoring** | Render Health Checks, Ruff/ESLint Linting |

---

## 📁 Project Structure

```
.
├── .github/workflows/    # CI/CD Pipeline definitions
├── backend/              # FastAPI Logic
│   ├── app/
│   │   ├── core/         # Config, Database, Security
│   │   ├── models/       # SQL Models
│   │   ├── routes/       # API Controllers
│   │   └── services/     # Business Logic (Gamification, Google Sync)
│   └── alembic/          # Version-controlled DB migrations
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/   # Reusable Atomic UI
│   │   ├── pages/        # Route-level views
│   │   └── services/     # Axios API integrations
├── docker-compose.yml    # Local orchestration
└── render.yaml           # Infrastructure-as-Code (Blueprint)
```

---

## ⚖️ License & Credits

Distributed under the **MIT License**. Created by [Lakshman](https://github.com/lakshmanbunny).

---
*Built with ❤️ for High Performance & Productive Gamification.*
