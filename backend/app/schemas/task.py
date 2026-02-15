import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.task import PriorityEnum, StatusEnum


# Task Creation
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    category: str | None = Field(None, max_length=50)
    tags: list[str] | None = []
    due_date: datetime | None = None


# Task Update
class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    priority: PriorityEnum | None = None
    category: str | None = Field(None, max_length=50)
    tags: list[str] | None = None
    due_date: datetime | None = None
    status: StatusEnum | None = None


# Task Response
class TaskResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None
    priority: PriorityEnum
    status: StatusEnum
    category: str | None
    tags: list[str] | None
    due_date: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
