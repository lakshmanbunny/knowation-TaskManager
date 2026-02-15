import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Enum, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class PriorityEnum(str, enum.Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class StatusEnum(str, enum.Enum):
    """Task status"""
    PENDING = "pending"
    COMPLETED = "completed"


class Task(Base):
    """Task model with all properties"""
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Task details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.MEDIUM, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.PENDING, nullable=False)
    category = Column(String(50), nullable=True)
    tags = Column(ARRAY(String), nullable=True, default=[])
    google_event_id = Column(String(255), nullable=True)
    
    # Dates
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task {self.title} ({self.status.value})>"
