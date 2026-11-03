# 🚀 Client Projects Management System

A full-stack **Client Projects Management System** that enables admins to manage clients and projects, while allowing clients to securely log in and view **only their assigned projects**, updates, and comments. Built with **FastAPI + MongoDB** on the backend and **Next.js (App Router) + Tailwind CSS** on the frontend.

---

## 🌐 Live Links

| Service | URL |
|------|-----|
| **Frontend (Vercel)** | https://client-projects-management-system.vercel.app |
| **Backend API (Render)** | https://client-projects-management-system.onrender.com |

---

## 🧱 Tech Stack

### Backend
- ⚡ FastAPI
- 🍃 MongoDB Atlas
- 🔐 JWT Authentication
- 🔑 Passlib (Password Hashing)
- 🐍 Python 3.9+

### Frontend
- ⚛️ Next.js 16 (App Router) + React 19
- 🧠 TypeScript
- 🎨 Tailwind CSS v4
- 🧩 Lucide Icons
- ☁️ Vercel Hosting

---

## 🔐 Authentication & Roles

The system uses **JWT-based authentication** with role-based access control.

### 👑 Admin
- Create clients
- Create & assign projects
- View all projects
- Comment on any project

### 👤 Client
- Secure login
- View **only own projects**
- View project details
- Add comments on assigned projects


---

## 📁 Project Structure

```
client-projects-management-system/
├── api/                    # FastAPI backend
│   ├── main.py             # App setup, CORS, routes
│   ├── auth_utils.py       # Password hashing & JWT helpers
│   ├── db.py               # MongoDB connection
│   ├── schemas/            # Pydantic request models
│   ├── requirements.txt
│   ├── render_start.sh     # Start command used on Render
│   └── .env.example        # Copy to .env and fill in
└── web/                    # Next.js frontend
    ├── app/                # Routes: /, /login, /projects, /projects/[id]
    ├── components/         # UI components (modals, cards, metrics)
    └── lib/api.ts          # API client
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.9+
- Node.js 20+
- A MongoDB Atlas cluster (or local MongoDB)

### 1. Backend (`api/`)

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in the values
uvicorn main:app --reload --port 8000
```

API runs at http://localhost:8000 — interactive docs at http://localhost:8000/docs.

#### Environment variables (`api/.env`)

| Variable | Description | Default |
|------|-----|-----|
| `MONGO_URI` | MongoDB connection string | — (required) |
| `JWT_SECRET` | Secret used to sign JWTs | `dev_secret` |
| `JWT_ALGO` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Token lifetime in minutes | `43200` (30 days) |

### 2. Frontend (`web/`)

```bash
cd web
npm install
echo "NEXT_PUBLIC_API_BASE=http://localhost:8000" > .env.local
npm run dev
```

App runs at http://localhost:3000. If `NEXT_PUBLIC_API_BASE` is not set, the frontend uses the deployed Render API.

### 🔑 Default Admin

On startup the backend seeds an admin account if one doesn't exist:

| Email | Password |
|------|-----|
| `admin@demo.com` | `Admin12345` |

Change this password before using the app in production.

---

## 📡 API Endpoints

All endpoints except `/health`, `/db-check` and `/auth/login` require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Access | Description |
|------|-----|-----|-----|
| GET | `/health` | Public | Health check |
| GET | `/db-check` | Public | List MongoDB collections |
| POST | `/auth/login` | Public | Log in, returns JWT |
| GET | `/me` | Authenticated | Current user profile |
| POST | `/users` | Admin | Create a client |
| GET | `/users?role=client` | Admin | List users (optional role filter) |
| POST | `/projects` | Admin | Create a project for a client |
| GET | `/projects` | Authenticated | Admin: all projects · Client: own projects |
| GET | `/projects/{id}` | Authenticated | Project details |
| PATCH | `/projects/{id}` | Admin | Update a project |
| POST | `/projects/{id}/comments` | Authenticated | Add a comment |
| GET | `/projects/{id}/comments` | Authenticated | List comments |
| POST | `/projects/{id}/milestones` | Admin | Add a milestone |
| GET | `/projects/{id}/milestones` | Authenticated | List milestones |

---

## 🚢 Deployment

- **Backend (Render):** root directory `api`, build command `pip install -r requirements.txt`, start command `bash render_start.sh`. Set the environment variables above in the Render dashboard.
- **Frontend (Vercel):** root directory `web`, set `NEXT_PUBLIC_API_BASE` to the Render URL.
- When adding a new frontend domain, add it to `allow_origins` in `api/main.py`.
