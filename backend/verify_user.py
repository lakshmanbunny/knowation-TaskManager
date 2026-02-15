import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.user import User


async def verify_user():
    async with AsyncSessionLocal() as db:
        # Get the first user
        result = await db.execute(select(User))
        user = result.scalars().first()
        
        if user:
            print(f"User: {user.username}")
            print(f"Email: {user.email}")
            print(f"Currently Verified: {user.is_verified}")
            
            # Mark as verified
            if not user.is_verified:
                user.is_verified = True
                user.verification_token = None
                await db.commit()
                print("✅ User has been verified!")
            else:
                print("User was already verified")
        else:
            print("No user found")

if __name__ == "__main__":
    asyncio.run(verify_user())
