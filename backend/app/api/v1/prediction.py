"""
PCOS Prediction API Router
Uses the trained ML model to predict PCOS risk based on health profile
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import pickle
import os
import numpy as np
from datetime import datetime

from app.core.config import Config
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User, UserHealthProfile, PCOSPrediction
from app.schemas.base import (
    HealthProfileCreate, 
    HealthProfileResponse,
    PredictionResponse,
    PredictionHistoryResponse
)

router = APIRouter()

MODEL_PATH = Config.ML_MODEL_PATH


def load_model():
    """Load the trained PCOS prediction model"""
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Load model at startup
pcos_model = load_model()


@router.post("/health-profile", response_model=HealthProfileResponse)
async def create_or_update_health_profile(
    profile: HealthProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update user's health profile"""
    
    # Check if profile exists
    existing_profile = db.query(UserHealthProfile).filter(
        UserHealthProfile.user_id == current_user.id
    ).first()
    
    if existing_profile:
        # Update existing profile
        for key, value in profile.model_dump().items():
            setattr(existing_profile, key, value)
        existing_profile.updated_at = datetime.now()
        db.commit()
        db.refresh(existing_profile)
        return existing_profile
    else:
        # Create new profile
        db_profile = UserHealthProfile(
            user_id=current_user.id,
            **profile.model_dump()
        )
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile


@router.get("/health-profile", response_model=HealthProfileResponse)
async def get_health_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's health profile"""
    
    profile = db.query(UserHealthProfile).filter(
        UserHealthProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health profile not found. Please create one first."
        )
    
    return profile


@router.post("/predict", response_model=PredictionResponse)
async def predict_pcos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Predict PCOS risk based on user's health profile"""
    
    # Reload the model dynamically to pick up any newly trained model
    pcos_model = load_model()
    
    if not pcos_model:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction model not available"
        )
    
    # Get user's health profile
    profile = db.query(UserHealthProfile).filter(
        UserHealthProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health profile not found. Please create one first."
        )
    
    # Prepare features for prediction (21 features in order)
    features = [
        profile.typical_period_length or 5,
        profile.typical_cycle_length or 28,
        profile.age_group or 2,
        profile.is_overweight or 0,
        profile.has_weight_fluctuation or 0,
        profile.has_irregular_periods or 0,
        profile.difficulty_conceiving or 0,
        profile.hair_chin or 0,
        profile.hair_cheeks or 0,
        profile.hair_breasts or 0,
        profile.hair_upper_lips or 0,
        profile.hair_arms or 0,
        profile.hair_thighs or 0,
        profile.has_acne or 0,
        profile.has_hair_loss or 0,
        profile.has_dark_patches or 0,
        profile.always_tired or 0,
        profile.frequent_mood_swings or 0,
        profile.exercise_per_week or 0,
        profile.eat_outside_per_week or 0,
        profile.consumes_canned_food or 0
    ]
    
    # Make prediction
    try:
        prediction = pcos_model.predict([features])[0]
        prediction_proba = pcos_model.predict_proba([features])[0]
        
        # Get confidence and risk score
        confidence = float(max(prediction_proba))
        risk_score = float(prediction_proba[1])  # Probability of PCOS
        
        result = "PCOS" if prediction == 1 else "No PCOS"
        
        # Calculate Risk Level
        risk_percentage = risk_score * 100
        if risk_percentage < 20:
            risk_level = "Low"
            risk_color = "#10B981" # Emerald
        elif risk_percentage < 50:
            risk_level = "Moderate"
            risk_color = "#F59E0B" # Amber
        elif risk_percentage < 80:
            risk_level = "High"
            risk_color = "#EF4444" # Red
        else:
            risk_level = "Very High"
            risk_color = "#B91C1C" # Dark Red

        # Identify Top Contributing Factors
        contributing_factors = []
        if profile.has_irregular_periods: contributing_factors.append("Irregular menstrual cycles")
        if profile.is_overweight: contributing_factors.append("Higher Body Mass Index (BMI)")
        if profile.has_acne: contributing_factors.append("Adult acne issues")
        if profile.has_hair_loss: contributing_factors.append("Androgenic alopecia (hair thinning)")
        if profile.hair_chin or profile.hair_cheeks or profile.hair_upper_lips: contributing_factors.append("Hirsutism (excessive hair growth)")
        if profile.has_dark_patches: contributing_factors.append("Acanthosis nigricans (dark skin patches)")
        
        # Save prediction to database
        db_prediction = PCOSPrediction(
            user_id=current_user.id,
            prediction=result,
            risk_score=risk_score,
            confidence=confidence,
            model_version="v1.1",
            notes=f"Risk Level: {risk_level}. Top factors: {', '.join(contributing_factors[:3])}"
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        # Generate categorized recommendations
        recommendations = generate_recommendations(profile, result, risk_score)
        
        return {
            "id": db_prediction.id,
            "prediction": result,
            "risk_score": risk_percentage,
            "risk_level": risk_level,
            "risk_color": risk_color,
            "confidence": confidence * 100,
            "contributing_factors": contributing_factors,
            "recommendations": recommendations,
            "created_at": db_prediction.created_at
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/predictions/history", response_model=List[PredictionHistoryResponse])
async def get_prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's prediction history"""
    
    predictions = db.query(PCOSPrediction).filter(
        PCOSPrediction.user_id == current_user.id
    ).order_by(PCOSPrediction.created_at.desc()).all()
    
    return predictions


@router.get("/predictions/latest", response_model=dict)
async def get_latest_prediction(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's latest prediction"""
    
    prediction = db.query(PCOSPrediction).filter(
        PCOSPrediction.user_id == current_user.id
    ).order_by(PCOSPrediction.created_at.desc()).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No predictions found. Please run a prediction first."
        )
    
    # Get profile for recommendations
    profile = db.query(UserHealthProfile).filter(
        UserHealthProfile.user_id == current_user.id
    ).first()
    
    recommendations = generate_recommendations(profile, prediction.prediction, prediction.risk_score)
    
    # Calculate Risk Level
    risk_percentage = prediction.risk_score * 100
    if risk_percentage < 20:
        risk_level = "Low"
        risk_color = "#10B981"
    elif risk_percentage < 50:
        risk_level = "Moderate"
        risk_color = "#F59E0B"
    elif risk_percentage < 80:
        risk_level = "High"
        risk_color = "#EF4444"
    else:
        risk_level = "Very High"
        risk_color = "#B91C1C"

    contributing_factors = []
    if profile:
        if profile.has_irregular_periods: contributing_factors.append("Irregular menstrual cycles")
        if profile.is_overweight: contributing_factors.append("Higher Body Mass Index (BMI)")
        if profile.has_acne: contributing_factors.append("Adult acne issues")
        if profile.has_hair_loss: contributing_factors.append("Androgenic alopecia (hair thinning)")
        if profile.hair_chin or profile.hair_cheeks or profile.hair_upper_lips: contributing_factors.append("Hirsutism (excessive hair growth)")
        if profile.has_dark_patches: contributing_factors.append("Acanthosis nigricans (dark skin patches)")

    return {
        "id": prediction.id,
        "prediction": prediction.prediction,
        "risk_score": risk_percentage,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "confidence": prediction.confidence * 100,
        "contributing_factors": contributing_factors,
        "recommendations": recommendations,
        "created_at": prediction.created_at
    }


def generate_recommendations(profile: UserHealthProfile, prediction: str, risk_score: float) -> dict:
    """Generate categorized personalized recommendations based on health profile and prediction"""
    
    medical = []
    lifestyle = []
    dietary = []
    
    if prediction == "PCOS" or risk_score > 0.5:
        medical.append("⚕️ Consult with a gynecologist or endocrinologist for proper diagnosis and treatment plan")
        
        if profile.is_overweight:
            lifestyle.append("🏃 Focus on gradual weight loss through regular exercise (even 5-10% loss helps)")
        
        if profile.has_irregular_periods:
            lifestyle.append("📅 Track your menstrual cycles to help your doctor understand your pattern")
        
        if profile.hair_chin or profile.hair_cheeks or profile.hair_upper_lips:
            medical.append("💆 Discuss hirsutism treatment options (medications, laser therapy)")
        
        if profile.has_acne:
            medical.append("🧴 Consult a dermatologist - hormonal treatments may help with adult acne")
        
        if profile.exercise_per_week < 3:
            lifestyle.append("💪 Aim for 150+ minutes of moderate exercise per week to improve insulin sensitivity")
        
        if profile.eat_outside_per_week > 3:
            dietary.append("🥗 Focus on home-cooked meals with lean proteins and vegetables")
        
        if profile.always_tired:
            medical.append("😴 Check Vitamin D, B12, and Iron levels - deficiencies are common in PCOS")
        
        dietary.append("🍎 Follow a low-glycemic diet (low GI) to manage insulin resistance")
        dietary.append("💊 Ask your doctor about supplements like Inositol and Omega-3")
        
    else:
        medical.append("✅ Your risk appears low, continue maintaining healthy habits")
        lifestyle.append("📊 Keep tracking symptoms for early detection of any changes")
        
        if profile.exercise_per_week < 3:
            lifestyle.append("💪 Maintain regular physical activity for overall health")
        
        dietary.append("🥗 Focus on balanced nutrition with whole foods")
    
    return {
        "medical": medical[:4],
        "lifestyle": lifestyle[:4],
        "dietary": dietary[:4]
    }
