from datetime import datetime
import os

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from bson import ObjectId

from db import db
from auth_utils import verify_password, create_access_token, hash_password
from schemas.auth import LoginRequest
from schemas.users import UserCreate
from schemas.projects import ProjectCreate
from schemas.project_update import ProjectUpdate
from schemas.comments import CommentCreate
from schemas.milestones import MilestoneCreate




# ---------------- APP SETUP ----------------

app = FastAPI(title="Client Project Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
  "http://localhost:3000",
  "https://client-projects-management-system.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret")
JWT_ALGO = os.getenv("JWT_ALGO", "HS256")

# ---------------- AUTH HELPERS ----------------

def require_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload  # user_id, role, email


def require_admin(authorization: str = Header(None)):
    payload = require_user(authorization)
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return payload


# ---------------- SEED ADMIN ----------------

def seed_admin_if_missing():
    email = "admin@demo.com"
    password = "Admin12345"

    if not db.users.find_one({"email": email}):
        db.users.insert_one({
            "email": email,
            "name": "Admin",
            "role": "admin",
            "password_hash": hash_password(password),
        })

seed_admin_if_missing()

# ---------------- BASIC ----------------

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/db-check")
def db_check():
    return {"collections": db.list_collection_names()}

# ---------------- AUTH ----------------

@app.post("/auth/login")
def login(body: LoginRequest):
    user = db.users.find_one({"email": body.email.strip().lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "user_id": str(user["_id"]),
        "role": user["role"],
        "email": user["email"],
    })

    return {"access_token": token, "token_type": "bearer"}


@app.get("/me")
def me(authorization: str = Header(None)):
    payload = require_user(authorization)
    user = db.users.find_one({"_id": ObjectId(payload["user_id"])})
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name"),
        "role": user["role"],
    }

# ---------------- USERS ----------------

@app.post("/users")
def create_user(body: UserCreate, authorization: str = Header(None)):
    require_admin(authorization)

    email = body.email.strip().lower()
    if db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="User already exists")

    res = db.users.insert_one({
        "name": body.name,
        "email": email,
        "role": "client",
        "password_hash": hash_password(body.password),
    })

    return {
        "id": str(res.inserted_id),
        "email": email,
        "role": "client",
    }

# ---------------- PROJECTS ----------------

@app.post("/projects")
def create_project(body: ProjectCreate, authorization: str = Header(None)):
    require_admin(authorization)

    # validate client
    try:
        client_id = ObjectId(body.client_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid client_id")

    if not db.users.find_one({"_id": client_id, "role": "client"}):
        raise HTTPException(status_code=404, detail="Client not found")

    project = {
        "title": body.title,
        "description": body.description,
        "status": body.status,
        "owner_id": str(client_id),   # 🔥 IMPORTANT
        "created_at": datetime.utcnow(),
    }

    res = db.projects.insert_one(project)
    return {"id": str(res.inserted_id), **project}


@app.get("/projects")
def list_projects(authorization: str = Header(None)):
    payload = require_user(authorization)

    if payload["role"] == "admin":
        query = {}
    else:
        query = {"owner_id": payload["user_id"]}

    return [
        {
            "id": str(p["_id"]),
            "title": p["title"],
            "description": p.get("description"),
            "status": p["status"],
            "owner_id": p["owner_id"],
            "created_at": p["created_at"],
        }
        for p in db.projects.find(query)
    ]

@app.get("/projects/{project_id}")
def get_project(project_id: str, authorization: str = Header(None)):
    payload = require_user(authorization)

    # validate project id
    try:
        proj_obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id")

    project = db.projects.find_one({"_id": proj_obj_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # access control: client can only access own project
    if payload["role"] != "admin":
        if project.get("owner_id") != payload["user_id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

    return {
        "id": str(project["_id"]),
        "title": project["title"],
        "description": project.get("description"),
        "status": project["status"],
        "owner_id": project["owner_id"],
        "created_at": project["created_at"],
    }

@app.patch("/projects/{project_id}")
def update_project(
    project_id: str,
    body: ProjectUpdate,
    authorization: str = Header(None)
):
    require_admin(authorization)

    try:
        proj_obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id")

    update_data = {k: v for k, v in body.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nothing to update")

    res = db.projects.update_one(
        {"_id": proj_obj_id},
        {"$set": update_data}
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    project = db.projects.find_one({"_id": proj_obj_id})

    return {
        "id": str(project["_id"]),
        "title": project["title"],
        "description": project.get("description"),
        "status": project["status"],
        "owner_id": project["owner_id"],
        "created_at": project["created_at"],
    }

# ---------------- COMMENTS ----------------

@app.post("/projects/{project_id}/comments")
def add_comment(
    project_id: str,
    body: CommentCreate,
    authorization: str = Header(None)
):
    payload = require_user(authorization)

    try:
        proj_obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id")

    project = db.projects.find_one({"_id": proj_obj_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # access control: client can comment only on own project
    if payload["role"] != "admin":
        if project["owner_id"] != payload["user_id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

    comment = {
        "project_id": str(proj_obj_id),
        "author_id": payload["user_id"],
        "author_role": payload["role"],
        "message": body.message.strip(),
        "created_at": datetime.utcnow(),
    }

    res = db.comments.insert_one(comment)

    return {
    "id": str(res.inserted_id),
    "project_id": str(comment["project_id"]),
    "author_id": str(comment["author_id"]),
    "author_role": comment["author_role"],
    "message": comment["message"],
    "created_at": comment["created_at"],
}

@app.get("/projects/{project_id}/comments")
def list_comments(project_id: str, authorization: str = Header(None)):
    payload = require_user(authorization)

    try:
        proj_obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id")

    project = db.projects.find_one({"_id": proj_obj_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # access control: client can see only own project
    if payload["role"] != "admin":
        if project.get("owner_id") != payload["user_id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

    docs = list(
        db.comments.find({"project_id": str(proj_obj_id)}).sort("created_at", -1)
    )

    # ✅ convert Mongo _id to string and ensure created_at is JSON-safe
    out = []
    for d in docs:
        out.append({
            "id": str(d["_id"]),
            "project_id": d.get("project_id"),
            "author_id": d.get("author_id"),
            "author_role": d.get("author_role"),
            "message": d.get("message"),
            "created_at": d.get("created_at").isoformat() if d.get("created_at") else None,
        })

    return out


@app.post("/projects/{project_id}/milestones")
def add_milestone(project_id: str, body: MilestoneCreate, authorization: str = Header(None)):
    require_admin(authorization)

    try:
        proj_obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id")

    if not db.projects.find_one({"_id": proj_obj_id}):
        raise HTTPException(status_code=404, detail="Project not found")

    milestone = {
        "project_id": project_id,          # keep string
        "title": body.title.strip(),
        "status": body.status,
        "due_date": body.due_date,
        "created_at": datetime.utcnow(),
    }

    res = db.milestones.insert_one(milestone)

    return {
        "id": str(res.inserted_id),
        "project_id": milestone["project_id"],
        "title": milestone["title"],
        "status": milestone["status"],
        "due_date": milestone["due_date"],
        "created_at": milestone["created_at"],
    }


@app.get("/projects/{project_id}/milestones")
def list_milestones(project_id: str, authorization: str = Header(None)):
    payload = require_user(authorization)

    try:
        proj_obj_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id")

    project = db.projects.find_one({"_id": proj_obj_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload["role"] != "admin":
        if project["owner_id"] != payload["user_id"]:
            raise HTTPException(status_code=403, detail="Forbidden")

    milestones = []
    for m in db.milestones.find({"project_id": project_id}).sort("created_at", 1):
        milestones.append({
            "id": str(m["_id"]),
            "project_id": m["project_id"],
            "title": m["title"],
            "status": m["status"],
            "due_date": m.get("due_date"),
            "created_at": m["created_at"],
        })

    return milestones




