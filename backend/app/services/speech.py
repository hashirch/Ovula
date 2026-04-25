import edge_tts
import asyncio
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class SpeechService:
    def __init__(self):
        # Urdu voices: ur-PK-UzmaNeural (Female), ur-PK-AsadNeural (Male)
        self.urdu_voice = "ur-PK-UzmaNeural"
        self.english_voice = "en-US-AvaNeural"
        self.pashto_voice = "ps-AF-GulNawazNeural"

    async def text_to_speech(self, text: str, output_path: str, lang: str = "ur") -> bool:
        """
        Convert text to speech using edge-tts (Free Microsoft Edge TTS)
        """
        try:
            voice = self.urdu_voice
            if lang == "en":
                voice = self.english_voice
            elif lang == "ps":
                voice = self.pashto_voice
            
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(output_path)
            return True
        except Exception as e:
            logger.error(f"TTS Error: {e}")
            return False

speech_service = SpeechService()
