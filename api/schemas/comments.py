from pydantic import BaseModel

class CommentCreate(BaseModel):
    message: str
