"""
Speech API Routes for TTS/STT
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io

from app.services.elevenlabs_service import ElevenLabsService
from auth import get_current_user
from models import User

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None

@router.post("/tts")
async def text_to_speech(
    request: TTSRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Convert text to speech using ElevenLabs
    """
    try:
        service = ElevenLabsService()
        audio_bytes = service.text_to_speech(request.text, request.voice_id)
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@router.get("/voices")
async def get_voices(current_user: User = Depends(get_current_user)):
    """
    Get available ElevenLabs voices. Returns empty list if voices cannot be fetched.
    """
    try:
        service = ElevenLabsService()
        voices = service.get_available_voices()
        return voices
    except Exception:
        # Return empty list gracefully — TTS may still work with default voice
        return []

