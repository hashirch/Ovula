from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import time
import logging

from database import get_db
from models import User, ChatMessage
from app.models.chat import (
    ChatMessageCreate, 
    ChatMessageResponse, 
    ChatHistoryResponse,
    ModelStatusResponse
)
from auth import get_current_user
from app.services.llm_service import llm_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ChatMessageResponse)
async def send_chat_message(
    chat: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the AI assistant"""
    start_time = time.time()
    
    try:
        # Generate AI response
        ai_response = await llm_service.generate_response(
            user_message=chat.message,
            user_id=current_user.id,
            db=db,
            model_override=chat.model_type
        )
        
        response_time = time.time() - start_time
        
        # Determine which model was actually used
        model_used = chat.model_type or llm_service.model_type
        
        # Save chat to database
        db_chat = ChatMessage(
            user_id=current_user.id,
            message=chat.message,
            response=ai_response
        )
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        
        # Create response with additional metadata
        response = ChatMessageResponse(
            id=db_chat.id,
            message=db_chat.message,
            response=db_chat.response,
            model_used=model_used,
            response_time=round(response_time, 2),
            created_at=db_chat.created_at
        )
        
        logger.info(f"Chat response generated for user {current_user.id} in {response_time:.2f}s using {model_used}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response: {str(e)}"
        )

@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for the current user"""
    try:
        # Get total count
        total_count = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id
        ).count()
        
        # Get paginated messages
        messages = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id
        ).order_by(desc(ChatMessage.created_at)).offset(offset).limit(limit).all()
        
        # Convert to response format
        message_responses = [
            ChatMessageResponse(
                id=msg.id,
                message=msg.message,
                response=msg.response,
                created_at=msg.created_at
            ) for msg in messages
        ]
        
        # Get model status
        model_status = llm_service.get_model_status()
        
        return ChatHistoryResponse(
            messages=message_responses,
            total_count=total_count,
            model_status=model_status
        )
        
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat history"
        )

@router.delete("/history")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all chat history for the current user"""
    try:
        deleted_count = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleared {deleted_count} chat messages for user {current_user.id}")
        
        return {
            "message": f"Successfully cleared {deleted_count} chat messages",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error clearing chat history: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear chat history"
        )

@router.get("/models", response_model=ModelStatusResponse)
async def get_model_status(
    current_user: User = Depends(get_current_user)
):
    """Get available models and current configuration"""
    try:
        status = llm_service.get_model_status()
        
        return ModelStatusResponse(
            current_model=status["current_model"],
            available_models=status["available_models"],
            lora_loaded=status["lora_loaded"],
            config=status["config"]
        )
        
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get model status"
        )

@router.post("/test-model")
async def test_model(
    model_type: str,
    test_message: str = "What is PCOS?",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test a specific model with a sample message"""
    try:
        start_time = time.time()
        
        response = await llm_service.generate_response(
            user_message=test_message,
            user_id=current_user.id,
            db=db,
            model_override=model_type
        )
        
        response_time = time.time() - start_time
        
        return {
            "model_type": model_type,
            "test_message": test_message,
            "response": response,
            "response_time": round(response_time, 2),
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error testing model {model_type}: {e}")
        return {
            "model_type": model_type,
            "test_message": test_message,
            "response": f"Error: {str(e)}",
            "response_time": 0,
            "success": False
        }