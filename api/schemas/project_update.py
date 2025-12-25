from pydantic import BaseModel
from typing import Optional

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # active | in_progress | done
