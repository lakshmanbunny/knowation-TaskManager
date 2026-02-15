import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


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
    username: str | None = Field(None, min_length=3, max_length=50)
    email: EmailStr | None = None
