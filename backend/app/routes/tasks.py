from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import get_verified_user
from app.models.task import PriorityEnum, StatusEnum, Task
from app.models.user import User
from app.schemas.gamification import XPAwardResponse
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.gamification import award_xp

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new task
    
    - Requires verified email
    - Returns created task
    """
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        category=task_data.category,
        tags=task_data.tags or [],
        due_date=task_data.due_date,
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    return task


@router.get("", response_model=list[TaskResponse])
async def get_tasks(
    status_filter: StatusEnum | None = Query(None, alias="status"),
    priority_filter: PriorityEnum | None = Query(None, alias="priority"),
    category_filter: str | None = Query(None, alias="category"),
    search: str | None = Query(None),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all tasks for current user with optional filters
    
    - Filter by status, priority, category
    - Search in title and description
    """
    query = select(Task).where(Task.user_id == current_user.id)
    
    # Apply filters
    if status_filter:
        query = query.where(Task.status == status_filter)
    
    if priority_filter:
        query = query.where(Task.priority == priority_filter)
    
    if category_filter:
        query = query.where(Task.category == category_filter)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )
    
    # Order by created_at descending
    query = query.order_by(Task.created_at.desc())
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single task by ID
    
    - Returns task if user owns it
    """
    result = await db.execute(
        select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == current_user.id
            )
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a task
    
    - Updates only provided fields
    - Returns updated task
    """
    result = await db.execute(
        select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == current_user.id
            )
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(task)
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a task
    
    - Permanently deletes task
    """
    result = await db.execute(
        select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == current_user.id
            )
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    await db.delete(task)
    await db.commit()
    
    return None


@router.post("/{task_id}/complete", response_model=XPAwardResponse)
async def complete_task(
    task_id: str,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark task as completed
    
    - Awards XP and checks achievements
    - Updates streak
    - Returns gamification rewards
    """
    result = await db.execute(
        select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == current_user.id
            )
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.status == StatusEnum.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task already completed"
        )
    
    # Mark as completed
    task.status = StatusEnum.COMPLETED
    task.completed_at = datetime.utcnow()
    task.updated_at = datetime.utcnow()
    
    await db.flush()
    
    # Award XP and check achievements
    reward_data = await award_xp(str(current_user.id), task.priority, db)
    
    await db.commit()
    
    return XPAwardResponse(**reward_data)
