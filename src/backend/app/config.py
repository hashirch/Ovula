import os
from enum import Enum
from dotenv import load_dotenv

load_dotenv()

class ModelType(Enum):
    OLLAMA_BASE = "ollama_base"
    OLLAMA_FINETUNED = "ollama_finetuned"
    LORA_PIPELINE = "lora_pipeline"
    OLLAMA_GEMMA = "ollama_gemma"
    OLLAMA_MISTRAL = "ollama_mistral"
    OLLAMA_CODELLAMA = "ollama_codellama"
    OLLAMA_LLAMA2 = "ollama_llama2"
    HUGGINGFACE_API = "huggingface_api"
    OPENAI_API = "openai_api"

class Config:
    # Model configuration
    MODEL_TYPE = os.getenv("MODEL_TYPE", "ollama_base")  # ollama_base, ollama_finetuned, lora_pipeline, etc.
    
    # Ollama configuration
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_BASE_MODEL = os.getenv("OLLAMA_BASE_MODEL", "llama3")
    OLLAMA_FINETUNED_MODEL = os.getenv("OLLAMA_FINETUNED_MODEL", "pcos-llama3")
    
    # Alternative Ollama models
    OLLAMA_GEMMA_MODEL = os.getenv("OLLAMA_GEMMA_MODEL", "gemma2")
    OLLAMA_MISTRAL_MODEL = os.getenv("OLLAMA_MISTRAL_MODEL", "mistral")
    OLLAMA_CODELLAMA_MODEL = os.getenv("OLLAMA_CODELLAMA_MODEL", "codellama")
    OLLAMA_LLAMA2_MODEL = os.getenv("OLLAMA_LLAMA2_MODEL", "llama2")
    
    # LoRA configuration
    LORA_BASE_MODEL = os.getenv("LORA_BASE_MODEL", "meta-llama/Meta-Llama-3-8B-Instruct")
    LORA_ADAPTER_PATH = os.getenv("LORA_ADAPTER_PATH", "./models/pcos-llama3-lora")
    
    # API-based models
    HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")
    HUGGINGFACE_MODEL = os.getenv("HUGGINGFACE_MODEL", "microsoft/DialoGPT-medium")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
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
            "finetuned_model": cls.OLLAMA_FINETUNED_MODEL,
            "gemma_model": cls.OLLAMA_GEMMA_MODEL,
            "mistral_model": cls.OLLAMA_MISTRAL_MODEL,
            "codellama_model": cls.OLLAMA_CODELLAMA_MODEL,
            "llama2_model": cls.OLLAMA_LLAMA2_MODEL,
            "lora_base": cls.LORA_BASE_MODEL,
            "lora_adapter": cls.LORA_ADAPTER_PATH,
            "huggingface_model": cls.HUGGINGFACE_MODEL,
            "openai_model": cls.OPENAI_MODEL
        }