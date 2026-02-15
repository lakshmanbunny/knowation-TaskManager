from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.task import PriorityEnum, StatusEnum


# Task Creation
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.MEDIUM
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = []
    due_date: Optional[datetime] = None


# Task Update
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    status: Optional[StatusEnum] = None


# Task Response
class TaskResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str]
    priority: PriorityEnum
    status: StatusEnum
    category: Optional[str]
    tags: Optional[List[str]]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
