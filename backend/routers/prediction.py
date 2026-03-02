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

from database import get_db
from auth import get_current_user
from models import User, UserHealthProfile, PCOSPrediction
from schemas import (
    HealthProfileCreate, 
    HealthProfileResponse,
    PredictionResponse,
    PredictionHistoryResponse
)

router = APIRouter()

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'ml-models', 'models', 'saved', 'pcos_model.pkl')

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
        for key, value in profile.dict().items():
            setattr(existing_profile, key, value)
        existing_profile.updated_at = datetime.now()
        db.commit()
        db.refresh(existing_profile)
        return existing_profile
    else:
        # Create new profile
        db_profile = UserHealthProfile(
            user_id=current_user.id,
            **profile.dict()
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
        
        # Save prediction to database
        db_prediction = PCOSPrediction(
            user_id=current_user.id,
            prediction=result,
            risk_score=risk_score,
            confidence=confidence,
            model_version="v1.0",
            notes="Prediction based on health profile"
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        # Generate recommendations based on risk factors
        recommendations = generate_recommendations(profile, result, risk_score)
        
        return {
            "id": db_prediction.id,
            "prediction": result,
            "risk_score": risk_score,
            "confidence": confidence,
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


@router.get("/predictions/latest", response_model=PredictionResponse)
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
    
    return {
        "id": prediction.id,
        "prediction": prediction.prediction,
        "risk_score": prediction.risk_score,
        "confidence": prediction.confidence,
        "recommendations": recommendations,
        "created_at": prediction.created_at
    }


def generate_recommendations(profile: UserHealthProfile, prediction: str, risk_score: float) -> List[str]:
    """Generate personalized recommendations based on health profile and prediction"""
    
    recommendations = []
    
    if prediction == "PCOS" or risk_score > 0.5:
        recommendations.append("⚕️ Consult with a gynecologist or endocrinologist for proper diagnosis and treatment plan")
        
        if profile.is_overweight:
            recommendations.append("🏃 Focus on gradual weight loss through balanced diet and regular exercise (even 5-10% weight loss can improve symptoms)")
        
        if profile.has_irregular_periods:
            recommendations.append("📅 Track your menstrual cycles to help your doctor understand your pattern")
        
        if profile.hair_chin or profile.hair_cheeks or profile.hair_upper_lips:
            recommendations.append("💆 Consider discussing hirsutism treatment options with your doctor (medications, laser therapy)")
        
        if profile.has_acne:
            recommendations.append("🧴 Consult a dermatologist for acne management - hormonal treatments may help")
        
        if profile.exercise_per_week < 3:
            recommendations.append("💪 Aim for at least 150 minutes of moderate exercise per week to improve insulin sensitivity")
        
        if profile.eat_outside_per_week > 3:
            recommendations.append("🥗 Reduce eating out and focus on home-cooked meals with whole foods, lean proteins, and vegetables")
        
        if profile.always_tired:
            recommendations.append("😴 Get your vitamin D, B12, and iron levels checked - deficiencies are common with PCOS")
        
        if profile.frequent_mood_swings:
            recommendations.append("🧘 Consider stress management techniques like yoga, meditation, or counseling")
        
        recommendations.append("🍎 Follow a low-glycemic diet to help manage insulin resistance")
        recommendations.append("💊 Ask your doctor about supplements like inositol, vitamin D, and omega-3")
        
    else:
        recommendations.append("✅ Your risk appears low, but continue maintaining healthy habits")
        recommendations.append("📊 Keep tracking your symptoms and cycles for early detection of any changes")
        
        if profile.exercise_per_week < 3:
            recommendations.append("💪 Maintain regular physical activity for overall health")
        
        if profile.eat_outside_per_week > 3:
            recommendations.append("🥗 Focus on balanced nutrition with whole foods")
        
        recommendations.append("🔄 Consider re-assessment if you notice changes in your symptoms")
    
    return recommendations[:8]  # Return top 8 recommendations
