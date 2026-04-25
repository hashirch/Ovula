import os
from enum import Enum
from dotenv import load_dotenv

load_dotenv()

class ModelType(Enum):
    OLLAMA_BASE = "ollama_base"

class Config:
    # Model configuration
    MODEL_TYPE = os.getenv("MODEL_TYPE", "ollama_base")

    # Ollama configuration
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_BASE_MODEL = os.getenv("OLLAMA_BASE_MODEL", "llama3.2:latest")

    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pcos_tracker.db")

    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # Chat configuration
    MAX_CHAT_HISTORY = int(os.getenv("MAX_CHAT_HISTORY", "10"))
    MAX_RESPONSE_LENGTH = int(os.getenv("MAX_RESPONSE_LENGTH", "512"))

    @classmethod
    def get_model_config(cls):
        """Get current model configuration"""
        return {
            "type": cls.MODEL_TYPE,
            "ollama_base_url": cls.OLLAMA_BASE_URL,
            "base_model": cls.OLLAMA_BASE_MODEL,
        }