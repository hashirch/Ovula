from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=False)  # Email verification status
    is_verified = Column(Boolean, default=False)  # Email verified flag
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    logs = relationship("DailyLog", back_populates="user")
    chats = relationship("ChatMessage", back_populates="user")
    otps = relationship("OTPToken", back_populates="user", cascade="all, delete-orphan")

class DailyLog(Base):
    __tablename__ = "daily_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    
    # PCOS Tracking Fields
    period_status = Column(String(20), default="none")  # none, spotting, period
    mood = Column(Integer, default=3)  # 1-5 scale
    acne = Column(Integer, default=0)  # 0-5 scale
    hairfall = Column(Integer, default=0)  # 0-5 scale
    weight = Column(Float, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    cravings = Column(Integer, default=0)  # 0-5 scale
    pain_level = Column(Integer, default=0)  # 0-5 scale
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="logs")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    model_used = Column(String(50), nullable=True)
    response_time = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chats")

class CycleData(Base):
    __tablename__ = "cycle_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cycle_start = Column(DateTime, nullable=False)
    cycle_end = Column(DateTime, nullable=True)
    cycle_length = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OTPToken(Base):
    __tablename__ = "otp_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    otp_code = Column(String(6), nullable=False)
    otp_expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_used = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="otps")