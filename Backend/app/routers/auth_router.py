"""Authentication routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
import httpx
import os

from database import get_db, User
from services.auth_service import (
    authenticate_user, create_user, get_user_by_email, get_user_by_google_id,
    get_user_by_github_id, create_access_token, create_refresh_token,
    verify_token, get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from schemas import (
    UserCreate, UserLogin, UserResponse, Token, TokenRefresh,
    OAuthCallback, PasswordReset
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = create_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password"""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """Refresh access token"""
    payload = verify_token(token_data.refresh_token, "refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new tokens
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user


@router.get("/google")
async def google_login():
    """Initiate Google OAuth login"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured"
        )
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={FRONTEND_URL}/auth/google/callback&"
        f"scope=openid email profile&"
        f"response_type=code&"
        f"access_type=offline"
    )
    
    return {"auth_url": google_auth_url}


@router.post("/google/callback", response_model=Token)
async def google_callback(callback_data: OAuthCallback, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured"
        )
    
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": callback_data.code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{FRONTEND_URL}/auth/google/callback",
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange code for token"
            )
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        # Get user info from Google
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google"
            )
        
        user_info = user_response.json()
    
    # Check if user exists
    google_id = user_info.get("id")
    email = user_info.get("email")
    
    user = get_user_by_google_id(db, google_id)
    if not user:
        # Check if user exists with same email
        user = get_user_by_email(db, email)
        if user:
            # Link Google account to existing user
            user.google_id = google_id
            user.avatar_url = user_info.get("picture")
            db.commit()
        else:
            # Create new user
            user = create_user(
                db=db,
                email=email,
                full_name=user_info.get("name"),
                google_id=google_id,
                avatar_url=user_info.get("picture")
            )
    
    # Create JWT tokens
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/github")
async def github_login():
    """Initiate GitHub OAuth login"""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth not configured"
        )
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={GITHUB_CLIENT_ID}&"
        f"redirect_uri={FRONTEND_URL}/auth/github/callback&"
        f"scope=user:email"
    )
    
    return {"auth_url": github_auth_url}


@router.post("/github/callback", response_model=Token)
async def github_callback(callback_data: OAuthCallback, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback"""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth not configured"
        )
    
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": callback_data.code,
            },
            headers={"Accept": "application/json"}
        )
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange code for token"
            )
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        # Get user info from GitHub
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"}
        )
        
        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from GitHub"
            )
        
        user_info = user_response.json()
        
        # Get user email (might be private)
        email_response = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"token {access_token}"}
        )
        
        emails = email_response.json() if email_response.status_code == 200 else []
        primary_email = next((e["email"] for e in emails if e["primary"]), user_info.get("email"))
    
    # Check if user exists
    github_id = str(user_info.get("id"))
    email = primary_email
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to get email from GitHub account"
        )
    
    user = get_user_by_github_id(db, github_id)
    if not user:
        # Check if user exists with same email
        user = get_user_by_email(db, email)
        if user:
            # Link GitHub account to existing user
            user.github_id = github_id
            user.avatar_url = user_info.get("avatar_url")
            db.commit()
        else:
            # Create new user
            user = create_user(
                db=db,
                email=email,
                full_name=user_info.get("name"),
                github_id=github_id,
                avatar_url=user_info.get("avatar_url")
            )
    
    # Create JWT tokens
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout")
async def logout(current_user = Depends(get_current_active_user)):
    """Logout user (client should delete tokens)"""
    return {"message": "Successfully logged out"}


# ── Credit endpoints ──────────────────────────────────────────────────────────

@router.get("/credits")
async def get_credits(current_user: User = Depends(get_current_active_user)):
    """Get current user's credit balance"""
    return {"credits": current_user.credits}


@router.post("/credits/deduct")
async def deduct_credit(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deduct 1 credit for an AI operation"""
    if current_user.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits. Please purchase more credits to continue."
        )

    current_user.credits -= 1
    db.commit()
    db.refresh(current_user)

    return {"credits": current_user.credits, "deducted": 1}


@router.post("/credits/add")
async def add_credits(
    amount: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add credits to user account (for testing / future payment integration)"""
    if amount <= 0 or amount > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credit amount"
        )

    current_user.credits += amount
    db.commit()
    db.refresh(current_user)

    return {"credits": current_user.credits, "added": amount}
