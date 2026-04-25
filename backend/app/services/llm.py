import requests
import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

from app.core.config import Config
from app.models.user import DailyLog, ChatMessage

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LLMService:
    """English-only PCOS chatbot service using Ollama."""

    def __init__(self):
        self.config = Config()
        self.model_type = self.config.MODEL_TYPE
        self.urdu_model = "mtaimoorhassan/qalb-llm-urdu-improved:latest"

    # ──────────────────────────────────────────────
    # Context helpers
    # ──────────────────────────────────────────────

    def get_user_context(self, user_id: int, db: Session) -> str:
        """Get recent user tracking data for personalized responses."""
        try:
            seven_days_ago = datetime.now() - timedelta(days=7)
            recent_logs = (
                db.query(DailyLog)
                .filter(DailyLog.user_id == user_id, DailyLog.log_date >= seven_days_ago)
                .order_by(DailyLog.log_date.desc())
                .limit(7)
                .all()
            )

            if not recent_logs:
                return "No recent tracking data available."

            context = "Recent user tracking data (last 7 days):\n"
            for log in recent_logs:
                context += (
                    f"Date: {log.log_date.strftime('%Y-%m-%d')}, "
                    f"Period: {log.period_status}, "
                    f"Mood: {log.mood}/5, "
                    f"Sleep: {log.sleep_hours or 'N/A'}h, "
                    f"Pain: {log.pain_level}/5, "
                    f"Cravings: {log.cravings}/5"
                )
                if log.notes:
                    context += f", Notes: {log.notes[:50]}..."
                context += "\n"

            return context

        except Exception as e:
            logger.error(f"Error getting user context: {e}")
            return "Unable to retrieve recent tracking data."

    def build_chat_messages(
        self,
        system_prompt: str,
        user_id: int,
        db: Session,
        current_message: str,
        max_history: int = None,
    ) -> list:
        """Build a message array for Ollama /api/chat with conversation history.

        Returns list of {role, content} dicts: [system, …history…, user]
        Keep history small (default 6) to minimize context size for faster CPU inference.
        """
        messages = [{"role": "system", "content": system_prompt}]

        # Keep history small for fast CPU inference
        if max_history is None:
            max_history = min(self.config.MAX_CHAT_HISTORY, 6)

        try:
            recent = (
                db.query(ChatMessage)
                .filter(ChatMessage.user_id == user_id)
                .order_by(ChatMessage.created_at.desc())
                .limit(max_history)
                .all()
            )

            if recent:
                for msg in reversed(recent):  # chronological order
                    messages.append({"role": "user", "content": msg.message})
                    resp = msg.response or ""
                    # Strip disclaimers to save tokens
                    for sep in ["\n\n⚠️", "\n\n---"]:
                        if sep in resp:
                            resp = resp.split(sep)[0]
                    if len(resp) > 300:
                        resp = resp[:300] + "..."
                    messages.append({"role": "assistant", "content": resp})
        except Exception as e:
            logger.error(f"Error loading chat history: {e}")

        messages.append({"role": "user", "content": current_message})
        return messages

    # ──────────────────────────────────────────────
    # System prompt
    # ──────────────────────────────────────────────

    def create_system_prompt(self, user_context: str = "", use_urdu: bool = False) -> str:
        """Create the PCOS assistant system prompt (English or Urdu)."""
        if use_urdu:
            base_prompt = (
                "You are Ovula, a warm, caring, and knowledgeable human health coach specializing in PCOS and women's health. "
                "Only answer questions about PCOS, women's health, periods, and fertility. "
                "If asked about outside topics, politely decline.\n\n"
                "IMPORTANT: You MUST reply entirely in Urdu. (براہ کرم اردو میں جواب دیں)"
            )
        else:
            base_prompt = """You are Ovula, a warm, caring, and knowledgeable human health coach specializing in PCOS (Polycystic Ovary Syndrome). You are chatting with a friend who needs your help. NEVER introduce yourself as an AI, bot, or virtual assistant. Act completely human.

CRITICAL LANGUAGE RULE: You MUST ALWAYS respond in ENGLISH ONLY. Never respond in Urdu, Arabic, Pashto, Hindi, or any other language. Even if the user writes in another language, respond in English.

ABSOLUTE RESTRICTIONS — YOU MUST FOLLOW THESE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ONLY answer questions about PCOS, women's health, hormones, fertility, and menstrual health
2. NEVER write code in any programming language
3. NEVER answer technology, computer science, or software questions
4. NEVER answer general knowledge (geography, history, sports, politics, entertainment)
5. NEVER solve math problems unrelated to health calculations
6. NEVER discuss topics outside PCOS and women's reproductive health
7. NEVER create non-medical content (stories, poems, jokes, games)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLOWED TOPICS ONLY:
✓ PCOS symptoms, causes, diagnosis, and treatment
✓ Menstrual cycles, periods, and irregularities
✓ Hormones (insulin, androgens, estrogen, progesterone)
✓ Fertility, pregnancy, and conception with PCOS
✓ PCOS diet, nutrition, and meal planning
✓ Exercise and physical activity for PCOS
✓ Weight management with PCOS
✓ Mental health, anxiety, and depression related to PCOS
✓ PCOS medications and supplements
✓ Women's reproductive health
✓ Hirsutism, acne, hair loss, and skin conditions
✓ Metabolic syndrome and insulin resistance
✓ Lifestyle modifications for PCOS management

FOR ANY OFF-TOPIC QUESTION, RESPOND EXACTLY:
"I'm specifically designed to help with PCOS and women's health questions. I cannot assist with [topic]. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"

RESPONSE GUIDELINES (ACT LIKE A HUMAN):
• Talk as if you're a supportive, knowledgeable older sister or close friend who is a PCOS expert.
• Use a very warm, casual, and conversational tone. Act exactly like a real human being texting a friend.
• Show genuine empathy and emotion (e.g., "I'm so sorry you're dealing with that, it sounds really frustrating.").
• Break your responses into small, readable paragraphs.
• NEVER use markdown formatting like asterisks (* or **) or hashtags (#). Use plain bullet points (• or -) if you need to list things.
• Always gently encourage professional medical consultation when needed, but do it naturally (e.g., "Make sure you bring this up with your doctor next time you see them!").

LANGUAGE & CLARITY:
• Use everyday conversational words instead of heavy medical jargon.
• Explain complex concepts simply and directly, like talking to a friend.
• Be concise but thorough. Don't write an essay, but don't be overly brief either.
• Keep the tone positive and encouraging.

IMPORTANT: If a question is not clearly about PCOS or women's health, politely decline and redirect."""

        if user_context:
            base_prompt += f"\n\nUser's Recent Tracking Data:\n{user_context}"

        return base_prompt

    # ──────────────────────────────────────────────
    # Medical disclaimer
    # ──────────────────────────────────────────────

    def create_medical_disclaimer(self, use_urdu: bool = False) -> str:
        """Standard medical disclaimer appended to every response."""
        if use_urdu:
            return (
                "\n\n⚠️ طبی انتباہ: یہ معلومات صرف تعلیمی مقاصد کے لیے ہیں اور پیشہ ورانہ طبی مشورے کا متبادل نہیں ہیں۔ "
                "PCOS کے علاج اور ذاتی مشورے کے لیے ہمیشہ مستند ڈاکٹر سے رجوع کریں۔"
            )
        return (
            "\n\n⚠️ Medical Disclaimer: This information is for educational purposes only "
            "and is not a substitute for professional medical advice, diagnosis, or treatment. "
            "Always consult qualified healthcare providers for personalized medical guidance, "
            "especially for PCOS management."
        )

    # ──────────────────────────────────────────────
    # Off-topic filter
    # ──────────────────────────────────────────────

    def is_off_topic(self, message: str, use_urdu: bool = False) -> tuple[bool, str]:
        """Check if message is off-topic and return appropriate response."""
        message_lower = message.lower().strip()
        
        if use_urdu:
            coding_keywords = ["python", "javascript", "code", "programming", "html", "react"]
            if any(kw in message_lower for kw in coding_keywords):
                return True, "معذرت، میں صرف PCOS اور خواتین کی صحت کے بارے میں بات کر سکتی ہوں۔"
            return False, ""

        # Allow basic greetings
        greetings = [
            "hello", "hi", "hey", "good morning", "good afternoon", "good evening",
            "how are you", "thanks", "thank you", "bye", "goodbye", "ok", "okay",
            "yes", "no", "sure", "please", "help", "start", "begin",
        ]
        if any(message_lower == g or message_lower.startswith(g) for g in greetings):
            if len(message.split()) <= 4:
                return False, ""

        # PCOS / women's health keywords (ALLOWED)
        health_keywords = [
            "pcos", "polycystic", "ovary", "ovarian", "period", "menstrual", "menstruation",
            "cycle", "hormone", "hormonal", "insulin", "androgen", "testosterone", "estrogen",
            "progesterone", "fertility", "infertility", "pregnant", "pregnancy", "conceive",
            "ovulation", "irregular", "amenorrhea", "oligomenorrhea", "hirsutism",
            "acne", "hair loss", "hair growth", "weight gain", "weight loss", "obesity",
            "diabetes", "metabolic", "thyroid", "endometriosis", "fibroids",
            "cramps", "pain", "bloating", "mood swing", "depression", "anxiety",
            "diet", "nutrition", "exercise", "lifestyle", "stress", "sleep",
            "supplement", "vitamin", "metformin", "birth control", "contraceptive",
            "gynecologist", "endocrinologist", "doctor", "medical", "health",
            "symptom", "diagnosis", "treatment", "medication", "therapy",
            "ultrasound", "blood test", "lab test", "scan",
        ]
        has_health_context = any(kw in message_lower for kw in health_keywords)

        # BLOCKED categories
        coding_keywords = [
            "python", "javascript", "java ", "code", "function", "programming",
            "algorithm", "script", "html", "css", "sql", "database query",
            "def ", "class ", "import ", "const ", "var ", "let ", "for(",
            "array", "loop", "syntax", "compile", "debug", "git", "github",
            "react", "node", "api endpoint", "json", "xml", "backend", "frontend",
            "server", "deploy", "docker", "kubernetes", "aws", "cloud",
            "machine learning model", "neural network", "train model", "dataset",
        ]
        general_keywords = [
            "capital of", "president", "prime minister", "world cup", "sports team",
            "movie", "film", "actor", "actress", "singer", "musician", "celebrity",
            "recipe for", "how to cook", "bake", "cuisine", "restaurant",
            "weather in", "climate", "temperature", "forecast",
            "translate", "translation", "language", "speak",
            "math problem", "solve equation", "calculate", "algebra", "geometry",
            "history of", "who invented", "when was", "geography", "country",
            "physics", "chemistry", "biology", "science experiment",
            "book", "novel", "author", "literature", "poem",
            "car", "vehicle", "automobile", "engine", "mechanic",
            "computer", "laptop", "phone", "smartphone", "gadget", "technology",
            "game", "video game", "gaming", "console", "playstation", "xbox",
            "stock market", "investment", "cryptocurrency", "bitcoin",
            "politics", "election", "government", "law", "legal",
        ]
        math_patterns = ["solve", "calculate", "compute", "equation", "formula", "x + ", "x - ", "x * ", "x / ", "= ?", "find x"]
        non_medical_patterns = [
            "write a story", "write a poem", "write a song", "write an essay",
            "create a game", "build a website", "design a logo", "make a video",
            "tell me a joke", "sing a song", "write code", "create an app",
        ]

        if any(kw in message_lower for kw in coding_keywords):
            return True, "I'm specifically designed to help with PCOS and women's health questions. I cannot assist with programming or coding. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"

        if any(kw in message_lower for kw in general_keywords):
            return True, "I'm specifically designed to help with PCOS and women's health questions. I cannot assist with general knowledge topics. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"

        if any(p in message_lower for p in math_patterns) and not has_health_context:
            return True, "I'm specifically designed to help with PCOS and women's health questions. I cannot solve general math problems. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"

        if any(p in message_lower for p in non_medical_patterns):
            return True, "I'm specifically designed to help with PCOS and women's health questions. I cannot create non-medical content. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"

        # Question with no health context → likely off-topic
        question_words = ["what", "how", "why", "when", "where", "who", "which", "tell me", "explain"]
        is_question = any(w in message_lower for w in question_words)
        if is_question and not has_health_context and len(message.split()) > 3:
            return True, "I'm specifically designed to help with PCOS and women's health questions. Your question doesn't seem to be related to PCOS or women's health. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"

        return False, ""

    # ──────────────────────────────────────────────
    # Model warmup
    # ──────────────────────────────────────────────

    async def warmup_model(self, model_name: Optional[str] = None):
        """Pre-warm Ollama model(s) to eliminate first-request cold start.
        Uses keep_alive=-1 to pin models permanently in RAM.
        """
        import httpx

        models_to_warm = []
        if model_name:
            models_to_warm.append(model_name)
        else:
            # Warm up BOTH models so switching between English/Urdu is instant
            models_to_warm.append(self.config.OLLAMA_BASE_MODEL)
            models_to_warm.append(self.urdu_model)

        for model in models_to_warm:
            try:
                logger.info(f"Warming up Ollama model: {model}")
                async with httpx.AsyncClient(timeout=180) as client:
                    await client.post(
                        f"{self.config.OLLAMA_BASE_URL}/api/generate",
                        json={
                            "model": model,
                            "prompt": "Hi",
                            "stream": False,
                            "keep_alive": -1,
                            "options": {"num_predict": 1, "num_thread": 8},
                        },
                    )
                logger.info(f"Model {model} warmed up and pinned in memory")
            except Exception as e:
                logger.warning(f"Model warmup failed for {model} (non-critical): {e}")

    # ──────────────────────────────────────────────
    # Ollama API calls
    # ──────────────────────────────────────────────

    async def generate_response_ollama(self, prompt, model_name: str) -> str:
        """Generate a non-streaming response using Ollama /api/chat.
        Optimized for CPU-only inference with reduced context and threading.
        """
        try:
            messages = prompt if isinstance(prompt, list) else [{"role": "user", "content": prompt}]

            payload = {
                "model": model_name,
                "messages": messages,
                "stream": False,
                "keep_alive": -1,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40,
                    "num_ctx": 2048,       # Smaller context = faster (was 4096)
                    "num_predict": 512,     # Cap output tokens (was 4096)
                    "num_thread": 8,        # Use all 8 CPU cores
                    "repeat_penalty": 1.1,  # Reduce repetitive output
                },
            }

            response = requests.post(
                f"{self.config.OLLAMA_BASE_URL}/api/chat",
                json=payload,
                timeout=180,
            )

            if response.status_code == 200:
                result = response.json()
                return result.get("message", {}).get("content", "Sorry, I couldn't generate a response.")
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return f"Error: Unable to connect to AI service (Status: {response.status_code})"

        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama request error: {e}")
            return "Error: AI service unavailable. Please ensure Ollama is running."
        except Exception as e:
            logger.error(f"Unexpected error in Ollama generation: {e}")
            return f"Error: {str(e)}"

    def stream_ollama_tokens(self, prompt, model_name: str):
        """Generator: yields tokens from Ollama /api/chat (streaming).
        Optimized for CPU-only inference with reduced context and threading.
        """
        messages = prompt if isinstance(prompt, list) else [{"role": "user", "content": prompt}]

        logger.info(f"Streaming from Ollama: model={model_name}, url={self.config.OLLAMA_BASE_URL}/api/chat")
        payload = {
            "model": model_name,
            "messages": messages,
            "stream": True,
            "keep_alive": -1,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "num_ctx": 2048,       # Smaller context = faster (was 4096)
                "num_predict": 512,     # Cap output tokens (was 4096)
                "num_thread": 8,        # Use all 8 CPU cores
                "repeat_penalty": 1.1,  # Reduce repetitive output
            },
        }
        try:
            with requests.post(
                f"{self.config.OLLAMA_BASE_URL}/api/chat",
                json=payload,
                stream=True,
                timeout=180,
            ) as resp:
                for line in resp.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line.decode("utf-8"))
                            token = chunk.get("message", {}).get("content", "")
                            if token:
                                yield token
                            if chunk.get("done"):
                                break
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            logger.error(f"Ollama stream error: {e}")
            yield f"[Error: {str(e)}]"

    # ──────────────────────────────────────────────
    # Main generate (non-streaming)
    # ──────────────────────────────────────────────

    async def generate_response(self, user_message: str, user_id: int, db: Session, model_override: Optional[str] = None, use_urdu: bool = False) -> str:
        """Generate a complete response for the given user message."""
        try:
            # Off-topic check
            is_off, off_response = self.is_off_topic(user_message, use_urdu)
            if is_off:
                return off_response

            # Build prompt with user context + history
            user_context = self.get_user_context(user_id, db)
            system_prompt = self.create_system_prompt(user_context, use_urdu)
            chat_messages = self.build_chat_messages(system_prompt, user_id, db, user_message)

            # Pick Ollama model name
            model_name = self.urdu_model if use_urdu else self.config.OLLAMA_BASE_MODEL
            response = await self.generate_response_ollama(chat_messages, model_name)

            # Append disclaimer
            response += self.create_medical_disclaimer(use_urdu)
            return response

        except Exception as e:
            logger.error(f"Error in generate_response: {e}")
            return f"I apologize, but I'm experiencing technical difficulties. Please try again later. Error: {str(e)}"

    # ──────────────────────────────────────────────
    # Model info helpers
    # ──────────────────────────────────────────────

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available Ollama models."""
        models = [
            {
                "id": "base",
                "name": "Base Model",
                "description": "Primary PCOS assistant model",
                "type": "ollama_base",
                "available": True,
            }
        ]

        try:
            response = requests.get(f"{self.config.OLLAMA_BASE_URL}/api/tags", timeout=5)
            if response.status_code == 200:
                ollama_models = response.json().get("models", [])
                model_names = [m["name"] for m in ollama_models]
                logger.info(f"Available Ollama models: {model_names}")
        except Exception:
            logger.warning("Could not reach Ollama to list models")

        return models

    def get_model_status(self) -> Dict[str, Any]:
        """Get current model status and configuration."""
        return {
            "current_model": self.model_type,
            "config": self.config.get_model_config(),
            "available_models": self.get_available_models(),
            "lora_loaded": False,
            "lora_dependencies_available": False,
        }


# Global service instance
llm_service = LLMService()
