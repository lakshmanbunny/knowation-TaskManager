"""Google Calendar Integration Routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional, List
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.middleware.auth import get_verified_user
from app.models.user import User
from app.models.task import Task
from app.models.google_token import GoogleToken
from app.services.google_calendar import (
    get_auth_url,
    exchange_code,
    get_credentials,
    sync_tasks_to_calendar,
)

router = APIRouter(prefix="/calendar", tags=["Calendar"])


# --- Request/Response Schemas ---

class SyncRequest(BaseModel):
    task_ids: Optional[List[str]] = None  # If None, sync all tasks with due dates


class SyncResponse(BaseModel):
    created: int
    errors: int
    message: str


class CalendarStatusResponse(BaseModel):
    connected: bool


# --- Routes ---

@router.get("/auth-url")
async def get_google_auth_url(
    current_user: User = Depends(get_verified_user),
):
    """
    Get Google OAuth2 authorization URL.
    Frontend opens this URL for user to grant calendar access.
    """
    try:
        url = get_auth_url()
        return {"auth_url": url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate auth URL: {str(e)}",
        )


@router.get("/callback")
async def google_callback(
    code: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Handle Google OAuth2 callback.
    Just passes the authorization code to the frontend.
    The actual token exchange happens in the /connect endpoint.
    """
    try:
        # Don't exchange the code here! Just pass it to the frontend.
        # The /connect endpoint will do the actual exchange.
        frontend_url = settings.FRONTEND_URL
        redirect_url = f"{frontend_url}/calendar?google_connected=true&code={code}"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        frontend_url = settings.FRONTEND_URL
        return RedirectResponse(
            url=f"{frontend_url}/calendar?google_error={str(e)}"
        )


@router.post("/connect")
async def connect_google_calendar(
    code: str = Query(..., description="Authorization code from Google OAuth"),
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Connect Google Calendar by exchanging auth code for tokens.
    Called by frontend after OAuth redirect.
    """
    try:
        tokens = exchange_code(code)


        if not tokens.get("refresh_token"):

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No refresh token received. Please revoke access and try again.",
            )

        # Check if user already has a token
        result = await db.execute(
            select(GoogleToken).where(GoogleToken.user_id == current_user.id)
        )
        existing_token = result.scalar_one_or_none()


        if existing_token:
            existing_token.refresh_token = tokens["refresh_token"]
            existing_token.access_token = tokens.get("access_token")
            existing_token.token_expiry = tokens.get("token_expiry")
        else:
            google_token = GoogleToken(
                user_id=current_user.id,
                refresh_token=tokens["refresh_token"],
                access_token=tokens.get("access_token"),
                token_expiry=tokens.get("token_expiry"),
            )
            db.add(google_token)

        await db.commit()

        return {"message": "Google Calendar connected successfully"}

    except HTTPException:
        raise
    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect: {str(e)}",
        )


@router.get("/status", response_model=CalendarStatusResponse)
async def get_calendar_status(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if user has connected Google Calendar"""
    result = await db.execute(
        select(GoogleToken).where(GoogleToken.user_id == current_user.id)
    )
    token = result.scalar_one_or_none()
    return {"connected": token is not None}


@router.post("/sync", response_model=SyncResponse)
async def sync_to_google_calendar(
    sync_data: SyncRequest,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sync tasks to Google Calendar.
    If task_ids provided, syncs only those tasks.
    Otherwise, syncs all tasks with due dates.
    """
    # Get user's Google token
    result = await db.execute(
        select(GoogleToken).where(GoogleToken.user_id == current_user.id)
    )
    google_token = result.scalar_one_or_none()

    if not google_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Calendar not connected. Please connect first.",
        )

    # Build task query
    query = select(Task).where(
        and_(
            Task.user_id == current_user.id,
            Task.due_date.isnot(None),
        )
    )

    if sync_data.task_ids:
        query = query.where(Task.id.in_(sync_data.task_ids))

    result = await db.execute(query)
    tasks = result.scalars().all()


    # Build credentials and sync
    credentials = get_credentials(
        access_token=google_token.access_token or "",
        refresh_token=google_token.refresh_token,
        token_expiry=google_token.token_expiry,
    )


    sync_result = sync_tasks_to_calendar(tasks, credentials)


    # Commit changes (including updated google_event_ids and potentially refreshed tokens)
    if credentials.token != google_token.access_token:
        google_token.access_token = credentials.token
        google_token.token_expiry = credentials.expiry
    
    await db.commit()


    return SyncResponse(
        created=sync_result["created"],
        errors=sync_result["errors"],
        message=f"Synced {sync_result['created']} tasks to Google Calendar",
    )


@router.delete("/disconnect")
async def disconnect_google_calendar(
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect Google Calendar by removing stored tokens"""
    result = await db.execute(
        select(GoogleToken).where(GoogleToken.user_id == current_user.id)
    )
    token = result.scalar_one_or_none()

    if token:
        await db.delete(token)
        await db.commit()

    return {"message": "Google Calendar disconnected"}
