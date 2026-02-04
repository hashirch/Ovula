from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta
import logging

from database import get_db
from models import User, DailyLog
from schemas import InsightsResponse
from auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

def generate_recommendations(avg_mood: float, avg_sleep: float, avg_pain: float, period_irregularity: bool) -> List[str]:
    """Generate personalized recommendations based on user data"""
    recommendations = []
    
    # Mood recommendations
    if avg_mood < 3:
        recommendations.append("Consider stress management techniques like meditation or yoga to improve mood")
        recommendations.append("Regular exercise can help boost mood and manage PCOS symptoms")
    
    # Sleep recommendations
    if avg_sleep < 7:
        recommendations.append("Aim for 7-9 hours of sleep per night for better hormone regulation")
        recommendations.append("Create a consistent bedtime routine to improve sleep quality")
    elif avg_sleep > 9:
        recommendations.append("Excessive sleep might indicate other issues - consider consulting a healthcare provider")
    
    # Pain management
    if avg_pain > 3:
        recommendations.append("High pain levels may require medical attention - consult your healthcare provider")
        recommendations.append("Heat therapy and gentle exercise may help manage pain")
    
    # Period irregularity
    if period_irregularity:
        recommendations.append("Irregular periods are common with PCOS - track patterns and discuss with your doctor")
        recommendations.append("Maintaining a healthy weight can help regulate menstrual cycles")
    
    # General PCOS recommendations
    recommendations.extend([
        "Follow a balanced, low-glycemic diet to help manage insulin resistance",
        "Regular physical activity can improve PCOS symptoms and overall health",
        "Consider supplements like inositol or vitamin D (consult your doctor first)",
        "Stay hydrated and limit processed foods and added sugars"
    ])
    
    return recommendations[:6]  # Return top 6 recommendations

@router.get("/", response_model=InsightsResponse)
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's logs from last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date >= thirty_days_ago
    ).all()
    
    if not logs:
        return InsightsResponse(
            total_logs=0,
            avg_mood=0,
            avg_sleep=0,
            avg_pain=0,
            period_frequency=0,
            recommendations=["Start tracking your daily symptoms to get personalized insights"]
        )
    
    # Calculate averages
    total_logs = len(logs)
    avg_mood = sum(log.mood for log in logs) / total_logs
    
    sleep_logs = [log.sleep_hours for log in logs if log.sleep_hours is not None]
    avg_sleep = sum(sleep_logs) / len(sleep_logs) if sleep_logs else 0
    
    avg_pain = sum(log.pain_level for log in logs) / total_logs
    
    # Calculate period frequency (days with period status)
    period_days = len([log for log in logs if log.period_status == "period"])
    
    # Check for period irregularity (simplified logic)
    period_irregularity = period_days == 0 or period_days > 10
    
    # Generate recommendations
    recommendations = generate_recommendations(avg_mood, avg_sleep, avg_pain, period_irregularity)
    
    return InsightsResponse(
        total_logs=total_logs,
        avg_mood=round(avg_mood, 1),
        avg_sleep=round(avg_sleep, 1),
        avg_pain=round(avg_pain, 1),
        period_frequency=period_days,
        recommendations=recommendations
    )

@router.get("/summary")
async def get_summary_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get summary statistics for dashboard"""
    # Last 7 days
    seven_days_ago = datetime.now() - timedelta(days=7)
    recent_logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date >= seven_days_ago
    ).all()
    
    # Last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    monthly_logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date >= thirty_days_ago
    ).all()
    
    return {
        "logs_this_week": len(recent_logs),
        "logs_this_month": len(monthly_logs),
        "avg_mood_week": round(sum(log.mood for log in recent_logs) / len(recent_logs), 1) if recent_logs else 0,
        "avg_sleep_week": round(sum(log.sleep_hours for log in recent_logs if log.sleep_hours) / len([log for log in recent_logs if log.sleep_hours]), 1) if recent_logs else 0,
        "period_days_month": len([log for log in monthly_logs if log.period_status == "period"]),
        "last_log_date": recent_logs[0].date.strftime("%Y-%m-%d") if recent_logs else None
    }