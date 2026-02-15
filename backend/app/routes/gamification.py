from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.gamification import UserStats, Achievement, UserAchievement
from app.schemas.gamification import UserStatsResponse, AchievementResponse

router = APIRouter(prefix="/gamification", tags=["Gamification"])


@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's gamification stats
    
    - Returns XP, level, streaks, tasks completed
    """
    result = await db.execute(
        select(UserStats).where(UserStats.user_id == current_user.id)
    )
    stats = result.scalar_one_or_none()
    
    if not stats:
        # Create stats if not exists
        stats = UserStats(user_id=current_user.id)
        db.add(stats)
        await db.commit()
        await db.refresh(stats)
    
    return stats


@router.get("/achievements", response_model=List[AchievementResponse])
async def get_achievements(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all achievements with unlock status
    
    - Returns all achievements
    - Indicates which are unlocked
    """
    # Get all achievements
    result = await db.execute(select(Achievement))
    all_achievements = result.scalars().all()
    
    # Get user's unlocked achievements
    result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == current_user.id)
    )
    user_achievements = result.scalars().all()
    
    # Create lookup dictionary
    unlocked_dict = {
        ua.achievement_id: ua.unlocked_at 
        for ua in user_achievements
    }
    
    # Build response
    achievements_response = []
    for achievement in all_achievements:
        is_unlocked = achievement.id in unlocked_dict
        achievements_response.append(
            AchievementResponse(
                id=achievement.id,
                name=achievement.name,
                description=achievement.description,
                badge_icon=achievement.badge_icon,
                requirement_type=achievement.requirement_type,
                requirement_value=achievement.requirement_value,
                xp_reward=achievement.xp_reward,
                unlocked=is_unlocked,
                unlocked_at=unlocked_dict.get(achievement.id),
            )
        )
    
    return achievements_response
