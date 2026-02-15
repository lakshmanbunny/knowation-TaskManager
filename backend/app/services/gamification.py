import math
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gamification import Achievement, UserAchievement, UserStats
from app.models.task import PriorityEnum

# XP Calculation Constants
BASE_XP = 10
PRIORITY_BONUS = {
    PriorityEnum.LOW: 5,
    PriorityEnum.MEDIUM: 10,
    PriorityEnum.HIGH: 20,
}
STREAK_XP_MULTIPLIER = 5
MAX_STREAK_BONUS = 50


def calculate_xp_reward(priority: PriorityEnum, current_streak: int) -> int:
    """
    Calculate XP reward for completing a task
    
    Args:
        priority: Task priority
        current_streak: User's current streak
    
    Returns:
        Total XP to award
    """
    xp = BASE_XP
    xp += PRIORITY_BONUS.get(priority, 0)
    
    # Streak bonus (capped at MAX_STREAK_BONUS)
    streak_bonus = min(current_streak * STREAK_XP_MULTIPLIER, MAX_STREAK_BONUS)
    xp += streak_bonus
    
    return xp


def calculate_level(total_xp: int) -> int:
    """
    Calculate level from total XP
    Formula: Level = 1 + floor(sqrt(total_xp / 100))
    
    Args:
        total_xp: User's total XP
    
    Returns:
        Current level
    """
    return 1 + math.floor(math.sqrt(total_xp / 100))


async def update_streak(stats: UserStats, db: AsyncSession) -> None:
    """
    Update user's streak based on current date
    
    Args:
        stats: User stats object
        db: Database session
    """
    today = date.today()
    
    if stats.last_completion_date is None:
        # First task ever
        stats.current_streak = 1
        stats.longest_streak = 1
    elif stats.last_completion_date == today:
        # Already completed a task today, no change
        pass
    elif (today - stats.last_completion_date).days == 1:
        # Consecutive day
        stats.current_streak += 1
        stats.longest_streak = max(stats.longest_streak, stats.current_streak)
    else:
        # Streak broken
        stats.current_streak = 1
    
    stats.last_completion_date = today


async def award_xp(
    user_id: str,
    priority: PriorityEnum,
    db: AsyncSession
) -> dict:
    """
    Award XP to user for completing a task
    
    Args:
        user_id: User's ID
        priority: Task priority
        db: Database session
    
    Returns:
        Dictionary with XP details and level up status
    """
    # Get or create user stats
    result = await db.execute(
        select(UserStats).where(UserStats.user_id == user_id)
    )
    stats = result.scalar_one_or_none()
    
    if not stats:
        # Create stats if not exists
        stats = UserStats(user_id=user_id)
        db.add(stats)
        await db.flush()
    
    # Update streak
    await update_streak(stats, db)
    
    # Calculate XP
    xp_earned = calculate_xp_reward(priority, stats.current_streak)
    old_level = stats.level
    
    # Update stats
    stats.total_xp += xp_earned
    stats.tasks_completed += 1
    stats.level = calculate_level(stats.total_xp)
    
    level_up = stats.level > old_level
    
    # Check for new achievements
    new_achievements = await check_achievements(user_id, stats, db)
    
    await db.commit()
    
    return {
        "xp_earned": xp_earned,
        "total_xp": stats.total_xp,
        "level": stats.level,
        "level_up": level_up,
        "new_achievements": new_achievements,
    }


async def check_achievements(
    user_id: str,
    stats: UserStats,
    db: AsyncSession
) -> list[str]:
    """
    Check and unlock achievements for user
    
    Args:
        user_id: User's ID
        stats: User stats
        db: Database session
    
    Returns:
        List of newly unlocked achievement names
    """
    # Get all achievements
    result = await db.execute(select(Achievement))
    all_achievements = result.scalars().all()
    
    # Get user's unlocked achievements
    result = await db.execute(
        select(UserAchievement.achievement_id).where(
            UserAchievement.user_id == user_id
        )
    )
    unlocked_ids = {row for row in result.scalars().all()}
    
    newly_unlocked = []
    
    for achievement in all_achievements:
        # Skip if already unlocked
        if achievement.id in unlocked_ids:
            continue
        
        # Check if requirement met
        unlocked = False
        if achievement.requirement_type == "tasks_count":
            unlocked = stats.tasks_completed >= achievement.requirement_value
        elif achievement.requirement_type == "streak":
            unlocked = stats.current_streak >= achievement.requirement_value
        elif achievement.requirement_type == "level":
            unlocked = stats.level >= achievement.requirement_value
        
        if unlocked:
            # Unlock achievement
            user_achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement.id
            )
            db.add(user_achievement)
            
            # Award XP bonus
            stats.total_xp += achievement.xp_reward
            stats.level = calculate_level(stats.total_xp)
            
            newly_unlocked.append(achievement.name)
    
    if newly_unlocked:
        await db.flush()
    
    return newly_unlocked


async def initialize_achievements(db: AsyncSession) -> None:
    """
    Initialize predefined achievements in database
    
    Args:
        db: Database session
    """
    predefined_achievements = [
        {
            "name": "First Steps",
            "description": "Complete your first task",
            "badge_icon": "🎯",
            "requirement_type": "tasks_count",
            "requirement_value": 1,
            "xp_reward": 10,
        },
        {
            "name": "Getting Started",
            "description": "Complete 5 tasks",
            "badge_icon": "⭐",
            "requirement_type": "tasks_count",
            "requirement_value": 5,
            "xp_reward": 20,
        },
        {
            "name": "Productive",
            "description": "Complete 25 tasks",
            "badge_icon": "💪",
            "requirement_type": "tasks_count",
            "requirement_value": 25,
            "xp_reward": 50,
        },
        {
            "name": "Task Master",
            "description": "Complete 100 tasks",
            "badge_icon": "👑",
            "requirement_type": "tasks_count",
            "requirement_value": 100,
            "xp_reward": 100,
        },
        {
            "name": "Week Warrior",
            "description": "Complete tasks for 7 consecutive days",
            "badge_icon": "🔥",
            "requirement_type": "streak",
            "requirement_value": 7,
            "xp_reward": 75,
        },
        {
            "name": "Marathon Runner",
            "description": "Complete tasks for 30 consecutive days",
            "badge_icon": "🏆",
            "requirement_type": "streak",
            "requirement_value": 30,
            "xp_reward": 200,
        },
        {
            "name": "Level 5 Champion",
            "description": "Reach Level 5",
            "badge_icon": "🎖️",
            "requirement_type": "level",
            "requirement_value": 5,
            "xp_reward": 50,
        },
        {
            "name": "Level 10 Legend",
            "description": "Reach Level 10",
            "badge_icon": "💎",
            "requirement_type": "level",
            "requirement_value": 10,
            "xp_reward": 150,
        },
    ]
    
    for ach_data in predefined_achievements:
        # Check if achievement already exists
        result = await db.execute(
            select(Achievement).where(Achievement.name == ach_data["name"])
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            achievement = Achievement(**ach_data)
            db.add(achievement)
    
    await db.commit()
