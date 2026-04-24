"""
ElevenLabs Service for Urdu Text-to-Speech and Speech-to-Text
Gracefully handles missing elevenlabs package for deployment environments.
"""
import os
from typing import Optional, List, Any
from app.core.config import Config

try:
    from elevenlabs.client import ElevenLabs
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False
    ElevenLabs = None

class ElevenLabsService:
    """Service for ElevenLabs TTS and STT using official SDK"""
    
    def __init__(self):
        self.api_key = Config.ELEVENLABS_API_KEY
        self.voice_id = Config.ELEVENLABS_VOICE_ID
        self.model_id = Config.ELEVENLABS_MODEL_ID or "eleven_multilingual_v2"
        
        if ELEVENLABS_AVAILABLE and self.api_key:
            self.client = ElevenLabs(api_key=self.api_key)
        else:
            self.client = None
        
    def text_to_speech(self, text: str, voice_id: Optional[str] = None) -> bytes:
        """Convert text to speech using ElevenLabs SDK"""
        if not ELEVENLABS_AVAILABLE:
            raise ValueError("ElevenLabs package not installed")
        if not self.client:
            raise ValueError("ElevenLabs API key not configured")
            
        voice = voice_id or self.voice_id
        if not voice:
            raise ValueError("Voice ID not configured")
            
        audio_generator = self.client.text_to_speech.convert(
            text=text,
            voice_id=voice,
            model_id=self.model_id
        )
        return b"".join(chunk for chunk in audio_generator)
    
    def speech_to_text(self, audio_file_path: str) -> str:
        """Convert speech to text using ElevenLabs Scribe (STT)"""
        if not ELEVENLABS_AVAILABLE:
            raise ValueError("ElevenLabs package not installed")
        if not self.client:
            raise ValueError("ElevenLabs API key not configured")
            
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

        with open(audio_file_path, "rb") as audio_file:
            transcription = self.client.speech_to_text.convert(
                file=audio_file,
                model_id="scribe_v1",
                tag_audio_events=True
            )
        return transcription.text
    
    def get_available_voices(self) -> List[Any]:
        """Get list of available voices"""
        if not ELEVENLABS_AVAILABLE or not self.client:
            return []
        response = self.client.voices.get_all()
        return response.voices
