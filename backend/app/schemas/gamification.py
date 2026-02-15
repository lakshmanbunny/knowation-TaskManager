import uuid
from datetime import date, datetime

from pydantic import BaseModel


# User Stats Response
class UserStatsResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    total_xp: int
    level: int
    tasks_completed: int
    current_streak: int
    longest_streak: int
    last_completion_date: date | None
    
    class Config:
        from_attributes = True


# Achievement Response
class AchievementResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    badge_icon: str
    requirement_type: str
    requirement_value: int
    xp_reward: int
    unlocked: bool = False
    unlocked_at: datetime | None = None
    
    class Config:
        from_attributes = True


# XP Award Response
class XPAwardResponse(BaseModel):
    xp_earned: int
    total_xp: int
    level: int
    level_up: bool
    new_achievements: list[str] = []
