from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MilestoneCreate(BaseModel):
    title: str
    due_date: Optional[datetime] = None
    status: str = "pending"  # pending | done
