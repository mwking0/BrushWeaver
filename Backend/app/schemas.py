"""Pydantic schemas for API requests/responses"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: Optional[str] = None
    username: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    avatar_url: Optional[str] = None
    credits: int = 0
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefresh(BaseModel):
    """Token refresh schema"""
    refresh_token: str


class OAuthCallback(BaseModel):
    """OAuth callback schema"""
    code: str
    state: Optional[str] = None


class PasswordReset(BaseModel):
    """Password reset schema"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema"""
    token: str
    new_password: str