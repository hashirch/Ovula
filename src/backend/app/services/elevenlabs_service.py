"""
ElevenLabs Service for Urdu Text-to-Speech and Speech-to-Text
"""
import os
import requests
from typing import Optional
from app.config import Config

class ElevenLabsService:
    """Service for ElevenLabs TTS and STT"""
    
    def __init__(self):
        self.api_key = Config.ELEVENLABS_API_KEY
        self.voice_id = Config.ELEVENLABS_VOICE_ID
        self.model_id = Config.ELEVENLABS_MODEL_ID
        self.base_url = "https://api.elevenlabs.io/v1"
        
    def text_to_speech(self, text: str, voice_id: Optional[str] = None) -> bytes:
        """
        Convert text to speech using ElevenLabs
        
        Args:
            text: Text to convert to speech
            voice_id: Optional voice ID (uses default if not provided)
            
        Returns:
            Audio bytes
        """
        if not self.api_key:
            raise ValueError("ElevenLabs API key not configured")
            
        voice = voice_id or self.voice_id
        if not voice:
            raise ValueError("Voice ID not configured")
            
        url = f"{self.base_url}/text-to-speech/{voice}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        
        data = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            return response.content
        else:
            raise Exception(f"ElevenLabs TTS failed: {response.text}")
    
    def speech_to_text(self, audio_file) -> str:
        """
        Convert speech to text using ElevenLabs
        Note: ElevenLabs primarily focuses on TTS. For STT, you might want to use
        other services like Google Speech-to-Text, Azure Speech, or Whisper API
        
        Args:
            audio_file: Audio file to transcribe
            
        Returns:
            Transcribed text
        """
        # ElevenLabs doesn't have STT API yet
        # You would need to use another service like:
        # - OpenAI Whisper API
        # - Google Cloud Speech-to-Text
        # - Azure Speech Services
        raise NotImplementedError("ElevenLabs STT not available. Use Whisper API or Google STT instead.")
    
    def get_available_voices(self):
        """Get list of available voices"""
        if not self.api_key:
            raise ValueError("ElevenLabs API key not configured")
            
        url = f"{self.base_url}/voices"
        headers = {"xi-api-key": self.api_key}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to fetch voices: {response.text}")
