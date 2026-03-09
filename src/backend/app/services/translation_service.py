"""
Translation service for converting English text to Urdu using Google Translate
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import translation dependencies
try:
    from googletrans import Translator
    TRANSLATION_AVAILABLE = True
    logger.info("Google Translate available")
except ImportError:
    TRANSLATION_AVAILABLE = False
    logger.warning("Google Translate not available. Install googletrans==4.0.0rc1")

class TranslationService:
    def __init__(self):
        self.translator = None
        
        if TRANSLATION_AVAILABLE:
            self._initialize_translator()
    
    def _initialize_translator(self):
        """Initialize the Google Translator"""
        try:
            logger.info("Initializing Google Translator")
            self.translator = Translator()
            logger.info("Google Translator initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing translator: {e}")
            self.translator = None
    
    def translate_to_urdu(self, text: str) -> Optional[str]:
        """
        Translate English text to Urdu using Google Translate
        Preserves only PCOS term in English, translates everything else
        
        Args:
            text: English text to translate
            
        Returns:
            Translated Urdu text or None if translation fails
        """
        if not TRANSLATION_AVAILABLE:
            logger.warning("Translation not available - googletrans not installed")
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
            
            # Translate to Urdu with explicit language codes
            result = self.translator.translate(modified_text, src='en', dest='ur')
            
            if result and result.text:
                translated_text = result.text
                
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
            # Reinitialize translator on error
            try:
                self.translator = Translator()
            except:
                pass
            return None
    
    def is_available(self) -> bool:
        """Check if translation service is available"""
        return TRANSLATION_AVAILABLE and self.translator is not None

# Global translation service instance
translation_service = TranslationService()
