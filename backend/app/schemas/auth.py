from pydantic import BaseModel


# Token Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Password Reset Request
class PasswordResetRequest(BaseModel):
    email: str


# Password Reset Confirm
class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
