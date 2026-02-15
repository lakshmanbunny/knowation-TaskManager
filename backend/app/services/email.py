import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send an email using Mailtrap SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_content: HTML content of the email
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        message = MIMEMultipart("alternative")
        message["From"] = settings.FROM_EMAIL
        message["To"] = to_email
        message["Subject"] = subject
        
        # Attach HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email using Mailtrap SMTP
        async with aiosmtplib.SMTP(
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=False,  # Mailtrap sandbox doesn't use TLS
        ) as smtp:
            await smtp.send_message(message)
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


async def send_verification_email(to_email: str, username: str, verification_token: str) -> bool:
    """
    Send email verification link
    
    Args:
        to_email: User's email address
        username: User's username
        verification_token: Verification token
    
    Returns:
        True if email sent successfully
    """
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Welcome to Task Manager!</h1>
            </div>
            <div class="content">
                <p>Hi {username},</p>
                <p>Thanks for joining Task Manager! We're excited to help you boost your productivity with gamification.</p>
                <p>Please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="{verification_link}" class="button">Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">{verification_link}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <div class="footer">
                    <p>Task Manager - Gamify Your Productivity</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(to_email, "Verify Your Email - Task Manager", html_content)


async def send_password_reset_email(to_email: str, username: str, reset_token: str) -> bool:
    """
    Send password reset link
    
    Args:
        to_email: User's email address
        username: User's username
        reset_token: Password reset token
    
    Returns:
        True if email sent successfully
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; padding: 15px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hi {username},</p>
                <p>We received a request to reset your password for your Task Manager account.</p>
                <p>Click the button below to reset your password:</p>
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #f5576c;">{reset_link}</p>
                <p>This link will expire in 1 hour.</p>
                <p><strong>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</strong></p>
                <div class="footer">
                    <p>Task Manager - Gamify Your Productivity</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(to_email, "Reset Your Password - Task Manager", html_content)
