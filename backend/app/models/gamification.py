import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Date, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserStats(Base):
    """User gamification statistics"""
    __tablename__ = "user_stats"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # XP and Level
    total_xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    
    # Task tracking
    tasks_completed = Column(Integer, default=0, nullable=False)
    
    # Streak tracking
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_completion_date = Column(Date, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="stats")
    
    def __repr__(self):
        return f"<UserStats Level {self.level}, XP {self.total_xp}>"


class Achievement(Base):
    """Achievement/Badge definitions"""
    __tablename__ = "achievements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    badge_icon = Column(String(50), nullable=False)  # Emoji or icon identifier
    
    # Requirements
    requirement_type = Column(String(50), nullable=False)  # 'tasks_count', 'streak', 'level'
    requirement_value = Column(Integer, nullable=False)
    
    # Rewards
    xp_reward = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")
    
    def __repr__(self):
        return f"<Achievement {self.name}>"


class UserAchievement(Base):
    """User's unlocked achievements"""
    __tablename__ = "user_achievements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    
    unlocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Ensure a user can only unlock each achievement once
    __table_args__ = (UniqueConstraint('user_id', 'achievement_id', name='unique_user_achievement'),)
    
    # Relationships
    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    def __repr__(self):
        return f"<UserAchievement user_id={self.user_id}>"
