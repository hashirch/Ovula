from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# OTP Schemas
class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str

class OTPResend(BaseModel):
    email: EmailStr

class OTPResponse(BaseModel):
    message: str
    email: str
    expires_in_minutes: Optional[int] = 5
class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str

class OTPResend(BaseModel):
    email: EmailStr

class OTPResponse(BaseModel):
    message: str
    email: Optional[str] = None

# Daily Log Schemas
class DailyLogBase(BaseModel):
    date: datetime
    period_status: str = "none"
    mood: int = 3
    acne: int = 0
    hairfall: int = 0
    weight: Optional[float] = None
    sleep_hours: Optional[float] = None
    cravings: int = 0
    pain_level: int = 0
    notes: Optional[str] = None

class DailyLogCreate(DailyLogBase):
    pass

class DailyLogResponse(DailyLogBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessageCreate(BaseModel):
    message: str
    model_type: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: int
    message: str
    response: str
    model_used: Optional[str] = None
    response_time: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Insights Schema
class InsightsResponse(BaseModel):
    total_logs: int
    avg_mood: float
    avg_sleep: float
    avg_pain: float
    period_frequency: int
    recommendations: List[str]

# Health Profile Schemas
class HealthProfileCreate(BaseModel):
    age_group: Optional[int] = None
    is_overweight: int = 0
    has_weight_fluctuation: int = 0
    has_irregular_periods: int = 0
    typical_period_length: Optional[int] = None
    typical_cycle_length: Optional[int] = None
    difficulty_conceiving: int = 0
    hair_chin: int = 0
    hair_cheeks: int = 0
    hair_breasts: int = 0
    hair_upper_lips: int = 0
    hair_arms: int = 0
    hair_thighs: int = 0
    has_acne: int = 0
    has_hair_loss: int = 0
    has_dark_patches: int = 0
    always_tired: int = 0
    frequent_mood_swings: int = 0
    exercise_per_week: int = 0
    eat_outside_per_week: int = 0
    consumes_canned_food: int = 0

class HealthProfileResponse(HealthProfileCreate):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionResponse(BaseModel):
    id: int
    prediction: str
    risk_score: float
    confidence: float
    recommendations: List[str]
    created_at: datetime

class PredictionHistoryResponse(BaseModel):
    id: int
    prediction: str
    risk_score: float
    confidence: float
    model_version: str
    created_at: datetime
    
    class Config:
        from_attributes = True