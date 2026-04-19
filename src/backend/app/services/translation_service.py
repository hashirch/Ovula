"""
Translation service for converting English text to Urdu using Google Translate
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import translation dependencies
try:
    from deep_translator import GoogleTranslator
    TRANSLATION_AVAILABLE = True
    logger.info("Deep-translator (Google) available")
except ImportError:
    TRANSLATION_AVAILABLE = False
    logger.warning("Deep-translator not available. Install deep-translator>=1.11.4")

class TranslationService:
    def __init__(self):
        self.translator = None
        
        if TRANSLATION_AVAILABLE:
            self._initialize_translator()
    
    def _initialize_translator(self):
        """Initialize the Google Translator via deep-translator"""
        try:
            logger.info("Initializing Deep-translator")
            # We'll initialize the translator object when needed or keep a base settings one
            self.translator = GoogleTranslator(source='en', target='ur')
            logger.info("Deep-translator initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing translator: {e}")
            self.translator = None
    
    def translate_to_urdu(self, text: str) -> Optional[str]:
        """
        Translate English text to Urdu using Deep-translator (Google)
        Preserves only PCOS term in English, translates everything else
        
        Args:
            text: English text to translate
            
        Returns:
            Translated Urdu text or None if translation fails
        """
        if not TRANSLATION_AVAILABLE:
            logger.warning("Translation not available - deep-translator not installed")
            return None
        
        if not self.translator:
            logger.warning("Translator not initialized")
            return None
        
        if not text or not text.strip():
            return None
        
        try:
            # Only preserve PCOS as it's a specific medical acronym
            # Everything else should be translated to Urdu
            modified_text = text.replace('PCOS', '___PCOS___')
            
            # Translate to Urdu
            translated_text = self.translator.translate(modified_text)
            
            if translated_text:
                # Restore PCOS
                translated_text = translated_text.replace('___PCOS___', 'PCOS')
                
                # Clean up any remaining English words that Google left untranslated
                # by forcing retranslation of common words
                english_to_urdu_fixes = {
                    'Weight gain': 'وزن میں اضافہ',
                    'weight gain': 'وزن میں اضافہ',
                    'gain': 'اضافہ',
                    'hello': 'ہیلو',
                    'Hello': 'ہیلو',
                }
                
                for eng, urdu in english_to_urdu_fixes.items():
                    if eng in translated_text:
                        translated_text = translated_text.replace(eng, urdu)
                
                logger.info(f"Translation successful: {len(text)} chars -> {len(translated_text)} chars")
                return translated_text
            else:
                logger.warning("Translation returned empty result")
                return None
            
        except Exception as e:
            logger.error(f"Error during translation: {e}")
            return None
    
    def is_available(self) -> bool:
        """Check if translation service is available"""
        return TRANSLATION_AVAILABLE and self.translator is not None

# Global translation service instance
translation_service = TranslationService()
