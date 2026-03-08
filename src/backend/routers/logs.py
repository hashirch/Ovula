from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, date, timedelta
from typing import List, Optional
import logging

from database import get_db
from models import User, DailyLog
from schemas import DailyLogCreate, DailyLogResponse
from auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the user"""
    
    # Get total logs count
    total_logs = db.query(DailyLog).filter(DailyLog.user_id == current_user.id).count()
    
    # Get logs from last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.log_date >= thirty_days_ago
    ).all()
    
    # Calculate averages
    if recent_logs:
        avg_mood = sum(log.mood for log in recent_logs) / len(recent_logs)
        avg_pain = sum(log.pain_level for log in recent_logs) / len(recent_logs)
        avg_sleep = sum(log.sleep_hours for log in recent_logs if log.sleep_hours) / len([log for log in recent_logs if log.sleep_hours]) if any(log.sleep_hours for log in recent_logs) else 0
        
        # Count symptoms
        high_pain_days = sum(1 for log in recent_logs if log.pain_level >= 3)
        period_days = sum(1 for log in recent_logs if log.period_status == 'period')
    else:
        avg_mood = 0
        avg_pain = 0
        avg_sleep = 0
        high_pain_days = 0
        period_days = 0
    
    # Get latest log
    latest_log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id
    ).order_by(desc(DailyLog.log_date)).first()
    
    # Calculate cycle info
    period_logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.period_status == 'period'
    ).order_by(desc(DailyLog.log_date)).limit(2).all()
    
    days_since_period = None
    if period_logs:
        last_period = period_logs[0].log_date
        days_since_period = (datetime.now() - last_period).days
    
    return {
        "total_logs": total_logs,
        "logs_last_30_days": len(recent_logs),
        "avg_mood": round(avg_mood, 1),
        "avg_pain": round(avg_pain, 1),
        "avg_sleep": round(avg_sleep, 1),
        "high_pain_days": high_pain_days,
        "period_days": period_days,
        "days_since_period": days_since_period,
        "latest_log": {
            "date": latest_log.log_date.isoformat() if latest_log else None,
            "mood": latest_log.mood if latest_log else None,
            "pain_level": latest_log.pain_level if latest_log else None
        } if latest_log else None
    }


@router.post("/", response_model=DailyLogResponse)
async def create_daily_log(
    log: DailyLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if log already exists for this date
    log_date = log.date if isinstance(log.date, datetime) else datetime.combine(log.date, datetime.min.time())
    
    existing_log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        func.date(DailyLog.log_date) == log_date.date()
    ).first()
    
    if existing_log:
        # Update existing log
        existing_log.log_date = log_date
        existing_log.period_status = log.period_status
        existing_log.mood = log.mood
        existing_log.acne = log.acne
        existing_log.hairfall = log.hairfall
        existing_log.weight = log.weight
        existing_log.sleep_hours = log.sleep_hours
        existing_log.cravings = log.cravings
        existing_log.pain_level = log.pain_level
        existing_log.notes = log.notes
        db.commit()
        db.refresh(existing_log)
        return DailyLogResponse.from_orm(existing_log)
    
    # Create new log
    db_log = DailyLog(
        user_id=current_user.id,
        log_date=log_date,
        period_status=log.period_status,
        mood=log.mood,
        acne=log.acne,
        hairfall=log.hairfall,
        weight=log.weight,
        sleep_hours=log.sleep_hours,
        cravings=log.cravings,
        pain_level=log.pain_level,
        notes=log.notes
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return DailyLogResponse.from_orm(db_log)

@router.get("/", response_model=List[DailyLogResponse])
async def get_daily_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DailyLog).filter(DailyLog.user_id == current_user.id)
    
    if start_date:
        query = query.filter(DailyLog.log_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(DailyLog.log_date <= datetime.combine(end_date, datetime.max.time()))
    
    logs = query.order_by(desc(DailyLog.log_date)).offset(skip).limit(limit).all()
    return [DailyLogResponse.from_orm(log) for log in logs]

@router.get("/latest", response_model=List[DailyLogResponse])
async def get_latest_logs(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id
    ).order_by(desc(DailyLog.log_date)).limit(days).all()
    
    return [DailyLogResponse.from_orm(log) for log in logs]

@router.get("/{log_id}", response_model=DailyLogResponse)
async def get_daily_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.id == log_id,
        DailyLog.user_id == current_user.id
    ).first()
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log not found"
        )
    
    return DailyLogResponse.from_orm(log)

@router.delete("/{log_id}")
async def delete_daily_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.id == log_id,
        DailyLog.user_id == current_user.id
    ).first()
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log not found"
        )
    
    db.delete(log)
    db.commit()
    
    return {"message": "Log deleted successfully"}