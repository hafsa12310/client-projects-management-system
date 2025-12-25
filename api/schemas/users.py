from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str  # keep <= 72 chars
    role: str = "client"  # default client
