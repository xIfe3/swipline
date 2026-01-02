from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os

from app import schemas, crud, models
from app.database import get_db

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = (
        db.query(models.User).filter(models.User.email == user.email).first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        password=get_password_hash(user.password),
        phone=user.phone,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    # Find user
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    # Verify password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": db_user.id, "email": db_user.email, "role": db_user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "role": db_user.role,
        },
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user(
    token: str = Depends(lambda: None),  # Simplified - in real app, use proper auth
    db: Session = Depends(get_db),
):
    """Get current user profile"""
    # Simplified - you should implement proper JWT authentication
    # This is just a placeholder

    # For now, return a dummy response or implement proper auth
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentication not implemented yet",
    )


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """Request password reset (simplified)"""
    # In production, send email with reset token
    return {
        "message": "If an account exists with this email, a reset link has been sent",
        "email": email,
    }


@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """Reset password with token"""
    # In production, verify token and update password
    return {"message": "Password reset successfully"}
