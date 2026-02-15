from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


# User Registration
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# User Response
class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Update User Profile
class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
