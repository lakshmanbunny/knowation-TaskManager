"""Google Calendar Integration Service"""
from datetime import datetime, timedelta
from typing import List, Optional
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from app.core.config import settings


SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


def get_oauth_flow() -> Flow:
    """Create OAuth2 flow for Google Calendar"""
    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    return flow


def get_auth_url() -> str:
    """Generate Google OAuth2 authorization URL"""

    
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise ValueError("Google Calendar credentials are not configured in .env file")
        
    flow = get_oauth_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )

    return auth_url


def exchange_code(code: str) -> dict:
    """Exchange authorization code for tokens"""
    flow = get_oauth_flow()

    try:
        flow.fetch_token(code=code)

        credentials = flow.credentials
        return {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_expiry": credentials.expiry,
        }
    except Exception as e:
        raise


def get_credentials(access_token: str, refresh_token: str, token_expiry: Optional[datetime] = None) -> Credentials:
    """Build Credentials object from stored tokens"""
    return Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        expiry=token_expiry,
    )


def sync_tasks_to_calendar(tasks: list, credentials: Credentials) -> dict:
    """
    Sync tasks to Google Calendar as events.
    
    Each task with a due_date becomes a calendar event.
    Returns count of created/updated events.
    """
    service = build("calendar", "v3", credentials=credentials)
    created = 0
    errors = 0

    for task in tasks:
        try:
            # Use due_date as event date; if no time, make it an all-day event
            due = task.due_date
            if not due:
                continue

            # Priority to color mapping (Google Calendar colorId)
            # 11 = Red (Tomato), 5 = Yellow (Banana), 9 = Blue (Blueberry)
            priority_color = {
                "high": "11",
                "medium": "5",
                "low": "9",
            }

            event_body = {
                "summary": f"[TaskMaster] {task.title}",
                "description": (
                    f"Priority: {task.priority.value if hasattr(task.priority, 'value') else task.priority}\n"
                    f"Category: {task.category or 'None'}\n"
                    f"Status: {task.status.value if hasattr(task.status, 'value') else task.status}\n"
                    f"\n---\nSynced from TaskMaster"
                ),
                "colorId": priority_color.get(
                    task.priority.value if hasattr(task.priority, "value") else task.priority,
                    "9"
                ),
            }


            # Check if due_date has time component
            if isinstance(due, datetime):
                # Google requires RFC3339. ISO format from naive datetime lacks offset.
                # Assuming Asia/Kolkata (IST) which is +05:30
                iso_due = due.isoformat()
                if "+" not in iso_due and "Z" not in iso_due:
                    iso_due += "+05:30"
                
                event_body["start"] = {
                    "dateTime": iso_due,
                    "timeZone": "Asia/Kolkata",
                }
                
                end_time = due + timedelta(hours=1)
                iso_end = end_time.isoformat()
                if "+" not in iso_end and "Z" not in iso_end:
                    iso_end += "+05:30"
                    
                event_body["end"] = {
                    "dateTime": iso_end,
                    "timeZone": "Asia/Kolkata",
                }
            else:
                # All-day event
                event_body["start"] = {"date": due.isoformat()}
                event_body["end"] = {"date": (due + timedelta(days=1)).isoformat()}

            if task.google_event_id:

                try:
                    service.events().update(
                        calendarId="primary",
                        eventId=task.google_event_id,
                        body=event_body,
                    ).execute()
                    created += 1
                except Exception as e:

                    # If event not found, fallback to creating new one
                    event = service.events().insert(
                        calendarId="primary",
                        body=event_body,
                    ).execute()
                    task.google_event_id = event["id"]
                    created += 1
            else:

                event = service.events().insert(
                    calendarId="primary",
                    body=event_body,
                ).execute()
                task.google_event_id = event["id"]
                created += 1

        except Exception as e:
            print(f"Error syncing task '{task.title}': {e}")

            errors += 1

    return {"created": created, "errors": errors}
