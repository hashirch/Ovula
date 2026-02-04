from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import os
import logging

from database import get_db
from models import User, OTPToken
from schemas import UserCreate, UserResponse, UserLogin, Token, OTPVerify, OTPResend, OTPResponse
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from otp_service import otp_service

router = APIRouter()
logger = logging.getLogger(__name__)

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

@router.post("/register", response_model=OTPResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        logger.warning(f"Registration attempt with existing email: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user (inactive until email verified)
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        is_active=False,
        is_verified=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate OTP
    otp_code = otp_service.generate_otp()
    otp_expires_at = otp_service.get_expiry_time(minutes=5)
    
    # Save OTP to database
    otp_token = OTPToken(
        user_id=db_user.id,
        otp_code=otp_code,
        otp_expires_at=otp_expires_at
    )
    db.add(otp_token)
    db.commit()
    
    # Send verification email
    email_sent = otp_service.send_verification_email(db_user.name, db_user.email, otp_code)
    
    logger.info(f"New user registered: {user.email}, OTP: {otp_code}")
    
    return OTPResponse(
        message="Registration successful! Please check your email for the verification code.",
        email=db_user.email
    )

@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        logger.warning(f"Failed login attempt for email: {user_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if email is verified
    if not user.is_active or not user.is_verified:
        logger.info(f"Unverified user login attempt: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="EMAIL_NOT_VERIFIED",  # Special code for frontend to handle
            headers={"X-User-Email": user.email}
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/verify-otp", response_model=OTPResponse)
async def verify_otp(otp_data: OTPVerify, db: Session = Depends(get_db)):
    """Verify OTP code and activate user account"""
    
    # Find user
    user = db.query(User).filter(User.email == otp_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get latest OTP for user
    otp_token = db.query(OTPToken).filter(
        OTPToken.user_id == user.id,
        OTPToken.is_used == False
    ).order_by(OTPToken.created_at.desc()).first()
    
    if not otp_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No OTP found. Please request a new one."
        )
    
    # Check if OTP matches
    if otp_token.otp_code.lower() != otp_data.otp_code.lower():
        logger.warning(f"Invalid OTP attempt for user: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # Check if OTP has expired
    if otp_service.is_otp_expired(otp_token.otp_expires_at):
        logger.warning(f"Expired OTP attempt for user: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Activate user account
    user.is_active = True
    user.is_verified = True
    otp_token.is_used = True
    
    db.commit()
    
    logger.info(f"User email verified: {user.email}")
    
    return OTPResponse(
        message="Email verified successfully! You can now log in.",
        email=user.email
    )

@router.post("/resend-otp", response_model=OTPResponse)
async def resend_otp(otp_data: OTPResend, db: Session = Depends(get_db)):
    """Resend OTP verification code"""
    
    # Find user
    user = db.query(User).filter(User.email == otp_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already verified
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new OTP
    otp_code = otp_service.generate_otp()
    otp_expires_at = otp_service.get_expiry_time(minutes=5)
    
    # Save new OTP to database
    otp_token = OTPToken(
        user_id=user.id,
        otp_code=otp_code,
        otp_expires_at=otp_expires_at
    )
    db.add(otp_token)
    db.commit()
    
    # Send email
    email_sent = otp_service.send_resend_email(user.name, user.email, otp_code)
    
    logger.info(f"OTP resent to user: {user.email}, OTP: {otp_code}")
    
    return OTPResponse(
        message="A new verification code has been sent to your email.",
        email=user.email
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user