from pydantic import BaseModel
from typing import Optional

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "active"       # active | in_progress | done
    client_id: str               # Mongo user _id as string
