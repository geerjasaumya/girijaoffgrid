from pydantic import BaseModel, EmailStr
from typing import Optional


class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    invite_code: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: str | None = None

class InviteRequest(BaseModel):
    email: EmailStr
    role: str = 'viewer'