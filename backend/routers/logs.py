from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, date
from typing import List, Optional
import logging

from database import get_db
from models import User, DailyLog
from schemas import DailyLogCreate, DailyLogResponse
from auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=DailyLogResponse)
async def create_daily_log(
    log: DailyLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if log already exists for this date
    existing_log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date == log.date.date()
    ).first()
    
    if existing_log:
        # Update existing log
        for field, value in log.dict().items():
            if field != "date":
                setattr(existing_log, field, value)
        db.commit()
        db.refresh(existing_log)
        return existing_log
    
    # Create new log
    db_log = DailyLog(**log.dict(), user_id=current_user.id)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return db_log

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
        query = query.filter(DailyLog.date >= start_date)
    if end_date:
        query = query.filter(DailyLog.date <= end_date)
    
    logs = query.order_by(desc(DailyLog.date)).offset(skip).limit(limit).all()
    return logs

@router.get("/latest", response_model=List[DailyLogResponse])
async def get_latest_logs(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id
    ).order_by(desc(DailyLog.date)).limit(days).all()
    
    return logs

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
    
    return log

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