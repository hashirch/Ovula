import requests
import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

from app.config import Config, ModelType
from models import DailyLog

# Optional imports for LoRA support
try:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
    from peft import PeftModel
    LORA_AVAILABLE = True
except ImportError:
    LORA_AVAILABLE = False
    torch = None

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import PyTorch dependencies, fallback gracefully if not available
try:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
    from peft import PeftModel
    PYTORCH_AVAILABLE = True
    logger.info("PyTorch dependencies available - LoRA pipeline support enabled")
except ImportError as e:
    PYTORCH_AVAILABLE = False
    logger.info(f"PyTorch dependencies not available - LoRA pipeline disabled: {e}")
    torch = None

class LLMService:
    def __init__(self):
        self.config = Config()
        self.lora_model = None
        self.lora_tokenizer = None
        self.lora_pipeline = None
        self.model_type = self.config.MODEL_TYPE
        
        # Initialize LoRA model if needed
        if self.model_type == ModelType.LORA_PIPELINE.value:
            self._initialize_lora_model()
    
    def _initialize_lora_model(self):
        """Initialize LoRA model for pipeline inference"""
        if not LORA_AVAILABLE:
            logger.warning("LoRA dependencies not available. Install torch, transformers, peft, accelerate, and bitsandbytes for LoRA support.")
            self.model_type = ModelType.OLLAMA_BASE.value
            return
            
        try:
            logger.info("Loading LoRA model...")
            
            # Load base model
            base_model = AutoModelForCausalLM.from_pretrained(
                self.config.LORA_BASE_MODEL,
                torch_dtype=torch.float16,
                device_map="auto",
                trust_remote_code=True,
                load_in_4bit=True  # For memory efficiency
            )
            
            # Load tokenizer
            self.lora_tokenizer = AutoTokenizer.from_pretrained(self.config.LORA_BASE_MODEL)
            self.lora_tokenizer.pad_token = self.lora_tokenizer.eos_token
            
            # Load LoRA adapters
            self.lora_model = PeftModel.from_pretrained(base_model, self.config.LORA_ADAPTER_PATH)
            
            # Create pipeline
            self.lora_pipeline = pipeline(
                "text-generation",
                model=self.lora_model,
                tokenizer=self.lora_tokenizer,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            
            logger.info("LoRA model loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading LoRA model: {e}")
            # Fallback to Ollama base model
            self.model_type = ModelType.OLLAMA_BASE.value
            logger.info("Falling back to Ollama base model")
    
    def get_user_context(self, user_id: int, db: Session) -> str:
        """Get recent user data for personalized responses"""
        try:
            # Get last 7 days of logs
            seven_days_ago = datetime.now() - timedelta(days=7)
            recent_logs = db.query(DailyLog).filter(
                DailyLog.user_id == user_id,
                DailyLog.date >= seven_days_ago
            ).order_by(DailyLog.date.desc()).limit(7).all()
            
            if not recent_logs:
                return "No recent tracking data available."
            
            context = "Recent user tracking data (last 7 days):\\n"
            for log in recent_logs:
                context += f"Date: {log.date.strftime('%Y-%m-%d')}, "
                context += f"Period: {log.period_status}, "
                context += f"Mood: {log.mood}/5, "
                context += f"Sleep: {log.sleep_hours or 'N/A'}h, "
                context += f"Pain: {log.pain_level}/5, "
                context += f"Cravings: {log.cravings}/5"
                if log.notes:
                    context += f", Notes: {log.notes[:50]}..."
                context += "\\n"
            
            return context
            
        except Exception as e:
            logger.error(f"Error getting user context: {e}")
            return "Unable to retrieve recent tracking data."
    
    def create_system_prompt(self, user_context: str = "") -> str:
        """Create system prompt for PCOS assistant"""
        base_prompt = """You are a knowledgeable PCOS (Polycystic Ovary Syndrome) assistant. Your role is to:

1. Provide accurate, helpful information about PCOS symptoms, management, and lifestyle
2. Give personalized advice based on user's tracking data when available
3. Suggest evidence-based lifestyle improvements for diet, exercise, sleep, and stress management
4. Explain PCOS concepts clearly and compassionately
5. NEVER prescribe specific medications or dosages
6. Always include appropriate medical disclaimers

Guidelines:
- Be supportive and understanding
- Focus on evidence-based lifestyle interventions
- Encourage professional medical consultation for diagnosis and treatment
- Provide actionable, practical advice
- Be concise but thorough
- Use a warm, empathetic tone"""

        if user_context:
            base_prompt += f"\\n\\nUser's Recent Tracking Data:\\n{user_context}"
        
        return base_prompt
    
    def create_medical_disclaimer(self) -> str:
        """Standard medical disclaimer"""
        return "\\n\\n⚠️ **Medical Disclaimer**: This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for personalized medical guidance, especially for PCOS management."
    
    async def generate_response_ollama(self, prompt: str, model_name: str) -> str:
        """Generate response using Ollama API"""
        try:
            payload = {
                "model": model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40,
                    "num_ctx": 4096
                }
            }
            
            response = requests.post(
                f"{self.config.OLLAMA_BASE_URL}/api/generate",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "Sorry, I couldn't generate a response.")
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return f"Error: Unable to connect to AI service (Status: {response.status_code})"
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama request error: {e}")
            return f"Error: AI service unavailable. Please ensure Ollama is running. ({str(e)})"
        except Exception as e:
            logger.error(f"Unexpected error in Ollama generation: {e}")
            return f"Error: {str(e)}"
    
    async def generate_response_huggingface_api(self, prompt: str) -> str:
        """Generate response using HuggingFace API"""
        try:
            if not self.config.HUGGINGFACE_API_TOKEN:
                return "HuggingFace API token not configured. Please set HUGGINGFACE_API_TOKEN in environment variables."
            
            headers = {"Authorization": f"Bearer {self.config.HUGGINGFACE_API_TOKEN}"}
            api_url = f"https://api-inference.huggingface.co/models/{self.config.HUGGINGFACE_MODEL}"
            
            payload = {"inputs": prompt}
            
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "No response generated")
                return str(result)
            else:
                return f"HuggingFace API error: {response.status_code}"
                
        except Exception as e:
            logger.error(f"HuggingFace API error: {e}")
            return f"Error with HuggingFace API: {str(e)}"
    
    async def generate_response_huggingface_api(self, prompt: str) -> str:
        """Generate response using HuggingFace Inference API"""
        try:
            if not self.config.HUGGINGFACE_API_TOKEN:
                return "HuggingFace API token not configured. Please set HUGGINGFACE_API_TOKEN in environment variables."
            
            headers = {"Authorization": f"Bearer {self.config.HUGGINGFACE_API_TOKEN}"}
            api_url = f"https://api-inference.huggingface.co/models/{self.config.HUGGINGFACE_MODEL}"
            
            payload = {"inputs": prompt}
            
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "No response generated")
                return str(result)
            else:
                return f"HuggingFace API error: {response.status_code}"
                
        except Exception as e:
            logger.error(f"HuggingFace API error: {e}")
            return f"Error: {str(e)}"
    
    async def generate_response_openai_api(self, prompt: str) -> str:
        """Generate response using OpenAI API"""
        try:
            if not self.config.OPENAI_API_KEY:
                return "OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables."
            
            headers = {
                "Authorization": f"Bearer {self.config.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.config.OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": self.create_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": self.config.MAX_RESPONSE_LENGTH,
                "temperature": 0.7
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                return f"OpenAI API error: {response.status_code}"
                
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return f"Error: {str(e)}"
    
    def generate_response_lora(self, prompt: str) -> str:
        """Generate response using LoRA pipeline"""
        if not LORA_AVAILABLE:
            return "LoRA model not available. Please install required dependencies: torch, transformers, peft, accelerate, bitsandbytes."
            
        try:
            if not self.lora_pipeline:
                return "LoRA model not available. Please check configuration."
            
            # Format prompt for Llama 3
            formatted_prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

{self.create_system_prompt()}<|eot_id|><|start_header_id|>user<|end_header_id|>

{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""
            
            # Generate response
            outputs = self.lora_pipeline(
                formatted_prompt,
                max_length=self.config.MAX_RESPONSE_LENGTH,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.lora_tokenizer.eos_token_id,
                eos_token_id=self.lora_tokenizer.eos_token_id
            )
            
            # Extract assistant response
            full_response = outputs[0]['generated_text']
            assistant_response = full_response.split("<|start_header_id|>assistant<|end_header_id|>")[-1].strip()
            
            # Clean up response
            assistant_response = assistant_response.replace("<|eot_id|>", "").strip()
            
            return assistant_response
            
        except Exception as e:
            logger.error(f"Error in LoRA generation: {e}")
            return f"Error generating response: {str(e)}"
    
    async def generate_response(self, user_message: str, user_id: int, db: Session, model_override: Optional[str] = None) -> str:
        """Generate response based on configured model type"""
        try:
            # Get user context for personalization
            user_context = self.get_user_context(user_id, db)
            
            # Determine which model to use
            current_model_type = model_override or self.model_type
            
            if current_model_type == ModelType.OLLAMA_FINETUNED.value:
                # Use fine-tuned Ollama model
                system_prompt = self.create_system_prompt(user_context)
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_FINETUNED_MODEL)
                
            elif current_model_type == ModelType.OLLAMA_GEMMA.value:
                # Use Gemma model
                system_prompt = self.create_system_prompt(user_context)
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_GEMMA_MODEL)
                
            elif current_model_type == ModelType.OLLAMA_MISTRAL.value:
                # Use Mistral model
                system_prompt = self.create_system_prompt(user_context)
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_MISTRAL_MODEL)
                
            elif current_model_type == ModelType.OLLAMA_CODELLAMA.value:
                # Use CodeLlama model
                system_prompt = self.create_system_prompt(user_context)
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_CODELLAMA_MODEL)
                
            elif current_model_type == ModelType.OLLAMA_LLAMA2.value:
                # Use Llama2 model
                system_prompt = self.create_system_prompt(user_context)
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_LLAMA2_MODEL)
                
            elif current_model_type == ModelType.LORA_PIPELINE.value:
                # Use LoRA pipeline
                contextualized_prompt = f"{user_message}\n\nContext: {user_context}"
                response = self.generate_response_lora(contextualized_prompt)
                
            elif current_model_type == ModelType.HUGGINGFACE_API.value:
                # Use HuggingFace API
                system_prompt = self.create_system_prompt(user_context)
                full_prompt = f"{system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_huggingface_api(full_prompt)
                
            elif current_model_type == ModelType.OPENAI_API.value:
                # Use OpenAI API
                contextualized_prompt = f"{user_message}\n\nContext: {user_context}"
                response = await self.generate_response_openai_api(contextualized_prompt)
                
            else:
                # Use base Ollama model (default)
                system_prompt = self.create_system_prompt(user_context)
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_BASE_MODEL)
            
            # Add medical disclaimer
            response += self.create_medical_disclaimer()
            
            return response
            
        except Exception as e:
            logger.error(f"Error in generate_response: {e}")
            return f"I apologize, but I'm experiencing technical difficulties. Please try again later. Error: {str(e)}"
    
    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available models"""
        models = [
            {
                "id": "base",
                "name": "Base Llama 3",
                "description": "General-purpose Llama 3 model",
                "type": ModelType.OLLAMA_BASE.value,
                "available": True
            }
        ]
        
        # Check Ollama models availability
        try:
            response = requests.get(f"{self.config.OLLAMA_BASE_URL}/api/tags", timeout=5)
            if response.status_code == 200:
                ollama_models = response.json().get("models", [])
                model_names = [model["name"] for model in ollama_models]
                
                # Check each alternative model
                models.extend([
                    {
                        "id": "finetuned",
                        "name": "PCOS-Specialized Llama 3",
                        "description": "Fine-tuned model specialized for PCOS guidance",
                        "type": ModelType.OLLAMA_FINETUNED.value,
                        "available": any(name.startswith(self.config.OLLAMA_FINETUNED_MODEL) for name in model_names)
                    },
                    {
                        "id": "gemma",
                        "name": "Google Gemma 2",
                        "description": "Google's lightweight Gemma model",
                        "type": ModelType.OLLAMA_GEMMA.value,
                        "available": any(name.startswith("gemma") for name in model_names)
                    },
                    {
                        "id": "mistral",
                        "name": "Mistral 7B",
                        "description": "Efficient Mistral model",
                        "type": ModelType.OLLAMA_MISTRAL.value,
                        "available": any(name.startswith("mistral") for name in model_names)
                    },
                    {
                        "id": "codellama",
                        "name": "Code Llama",
                        "description": "Code-specialized Llama model",
                        "type": ModelType.OLLAMA_CODELLAMA.value,
                        "available": any(name.startswith("codellama") for name in model_names)
                    },
                    {
                        "id": "llama2",
                        "name": "Llama 2",
                        "description": "Previous generation Llama model",
                        "type": ModelType.OLLAMA_LLAMA2.value,
                        "available": any(name.startswith("llama2") for name in model_names)
                    }
                ])
        except:
            # Add models as unavailable if can't check
            models.extend([
                {
                    "id": "finetuned",
                    "name": "PCOS-Specialized Llama 3",
                    "description": "Fine-tuned model specialized for PCOS guidance",
                    "type": ModelType.OLLAMA_FINETUNED.value,
                    "available": False
                },
                {
                    "id": "gemma",
                    "name": "Google Gemma 2",
                    "description": "Google's lightweight Gemma model",
                    "type": ModelType.OLLAMA_GEMMA.value,
                    "available": False
                },
                {
                    "id": "mistral",
                    "name": "Mistral 7B",
                    "description": "Efficient Mistral model",
                    "type": ModelType.OLLAMA_MISTRAL.value,
                    "available": False
                },
                {
                    "id": "codellama",
                    "name": "Code Llama",
                    "description": "Code-specialized Llama model",
                    "type": ModelType.OLLAMA_CODELLAMA.value,
                    "available": False
                },
                {
                    "id": "llama2",
                    "name": "Llama 2",
                    "description": "Previous generation Llama model",
                    "type": ModelType.OLLAMA_LLAMA2.value,
                    "available": False
                }
            ])
        
        # Check if LoRA model is available
        lora_available = LORA_AVAILABLE and self.lora_pipeline is not None
        models.append({
            "id": "lora",
            "name": "PCOS LoRA Model",
            "description": "LoRA-adapted model for PCOS expertise" + ("" if LORA_AVAILABLE else " (requires torch, transformers, peft)"),
            "type": ModelType.LORA_PIPELINE.value,
            "available": lora_available
        })
        
        # Add API-based models
        models.extend([
            {
                "id": "huggingface",
                "name": "HuggingFace API",
                "description": "Cloud-based HuggingFace model" + ("" if self.config.HUGGINGFACE_API_TOKEN else " (requires API token)"),
                "type": ModelType.HUGGINGFACE_API.value,
                "available": bool(self.config.HUGGINGFACE_API_TOKEN)
            },
            {
                "id": "openai",
                "name": "OpenAI GPT",
                "description": "OpenAI's GPT model" + ("" if self.config.OPENAI_API_KEY else " (requires API key)"),
                "type": ModelType.OPENAI_API.value,
                "available": bool(self.config.OPENAI_API_KEY)
            }
        ])
        
        return models
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get current model status and configuration"""
        return {
            "current_model": self.model_type,
            "config": self.config.get_model_config(),
            "available_models": self.get_available_models(),
            "lora_loaded": LORA_AVAILABLE and self.lora_pipeline is not None,
            "lora_dependencies_available": LORA_AVAILABLE
        }

# Global service instance
llm_service = LLMService()