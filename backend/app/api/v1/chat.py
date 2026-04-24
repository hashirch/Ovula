from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import time
import json
import asyncio
import logging

from app.db.session import get_db
from app.models.user import User, ChatMessage
from app.schemas.chat import (
    ChatMessageCreate, 
    ChatMessageResponse, 
    ChatHistoryResponse,
    ModelStatusResponse
)
from app.core.security import get_current_user
from app.services.llm import llm_service
from app.services.translation import translation_service

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
            model_override=chat.model_type,
            translate_to_urdu=chat.translate_to_urdu or False,
            translate_to_pashto=chat.translate_to_pashto or False
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


@router.post("/stream")
async def stream_chat_message(
    chat: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stream chat response token-by-token via Server-Sent Events"""
    
    # Check off-topic before streaming
    is_off_topic, off_topic_response = llm_service.is_off_topic(chat.message)
    if is_off_topic:
        async def _send_off_topic():
            payload = json.dumps({"token": off_topic_response, "done": True, "full": off_topic_response})
            yield f"data: {payload}\n\n"
        return StreamingResponse(_send_off_topic(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    user_context = llm_service.get_user_context(current_user.id, db)
    
    # Choose correct system prompt and disclaimer based on language
    if chat.translate_to_pashto:
        system_prompt = llm_service.create_pashto_system_prompt(user_context)
        disclaimer = llm_service.create_pashto_medical_disclaimer()
    else:
        system_prompt = llm_service.create_system_prompt(user_context)
        disclaimer = llm_service.create_medical_disclaimer()
    
    # Build proper conversation message array with full history
    chat_messages = llm_service.build_chat_messages(system_prompt, current_user.id, db, chat.message)
        
    model_name = llm_service.config.OLLAMA_BASE_MODEL
    start_time = time.time()

    async def _event_stream():
        full_response = ""
        loop = asyncio.get_event_loop()

        # If translating to Urdu, generate fully first, then translate, then stream
        if chat.translate_to_urdu:
            def _generate_full():
                response = ""
                for token in llm_service.stream_ollama_tokens(chat_messages, model_name):
                    response += token
                return response
                
            english_response = await loop.run_in_executor(None, _generate_full)
            translated_response = translation_service.translate_to_urdu(english_response)
            
            if translated_response:
                full_response = translated_response
                disclaimer_urdu = llm_service.create_urdu_medical_disclaimer()
                
                # Stream the translated text in chunks to simulate streaming
                chunk_size = 5
                words = full_response.split(" ")
                for i in range(0, len(words), chunk_size):
                    chunk = " ".join(words[i:i+chunk_size]) + " "
                    payload = json.dumps({"token": chunk, "done": False})
                    yield f"data: {payload}\n\n"
                    await asyncio.sleep(0.05)
                    
                full_response += disclaimer_urdu
                payload = json.dumps({"token": disclaimer_urdu, "done": False})
                yield f"data: {payload}\n\n"
            else:
                # Fallback if translation fails
                full_response = english_response + disclaimer
                payload = json.dumps({"token": full_response, "done": False})
                yield f"data: {payload}\n\n"
        elif chat.translate_to_pashto:
            def _generate_full_pashto():
                response = ""
                for token in llm_service.stream_ollama_tokens(chat_messages, model_name):
                    response += token
                return response
                
            english_response = await loop.run_in_executor(None, _generate_full_pashto)
            translated_response = translation_service.translate_to_pashto(english_response)
            
            if translated_response:
                full_response = translated_response
                disclaimer_pashto = llm_service.create_pashto_medical_disclaimer()
                
                # Stream the translated text in chunks
                chunk_size = 5
                words = full_response.split(" ")
                for i in range(0, len(words), chunk_size):
                    chunk = " ".join(words[i:i+chunk_size]) + " "
                    payload = json.dumps({"token": chunk, "done": False})
                    yield f"data: {payload}\n\n"
                    await asyncio.sleep(0.05)
                    
                full_response += disclaimer_pashto
                payload = json.dumps({"token": disclaimer_pashto, "done": False})
                yield f"data: {payload}\n\n"
            else:
                full_response = english_response + disclaimer
                payload = json.dumps({"token": full_response, "done": False})
                yield f"data: {payload}\n\n"
        else:
            # Normal streaming (English)
            token_queue = asyncio.Queue()

            def _produce():
                try:
                    for token in llm_service.stream_ollama_tokens(chat_messages, model_name):
                        loop.call_soon_threadsafe(token_queue.put_nowait, token)
                finally:
                    loop.call_soon_threadsafe(token_queue.put_nowait, None)

            producer = loop.run_in_executor(None, _produce)

            while True:
                token = await token_queue.get()
                if token is None:
                    break
                full_response += token
                payload = json.dumps({"token": token, "done": False})
                yield f"data: {payload}\n\n"

            await producer
            
            full_response += disclaimer
            payload = json.dumps({"token": disclaimer, "done": False})
            yield f"data: {payload}\n\n"

        response_time = round(time.time() - start_time, 2)

        # Save to database
        try:
            db_chat = ChatMessage(
                user_id=current_user.id,
                message=chat.message,
                response=full_response
            )
            db.add(db_chat)
            db.commit()
            db.refresh(db_chat)
            done_payload = json.dumps({
                "token": "", "done": True,
                "id": db_chat.id,
                "response_time": response_time,
                "model_used": model_name
            })
        except Exception as e:
            logger.error(f"Failed to save streamed chat: {e}")
            done_payload = json.dumps({"token": "", "done": True, "response_time": response_time})

        yield f"data: {done_payload}\n\n"
        logger.info(f"Stream chat done for user {current_user.id} in {response_time}s")

    return StreamingResponse(
        _event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
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