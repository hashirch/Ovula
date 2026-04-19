import requests
import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging
import os

from app.config import Config, ModelType
from models import DailyLog
from app.services.translation_service import translation_service

# Try to import Groq
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("Groq not installed. Install with: pip install groq")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Optional imports for LoRA support - disabled
LORA_AVAILABLE = False
PYTORCH_AVAILABLE = False
torch = None
logger.info("LoRA pipeline disabled - transformers not installed")

class LLMService:
    def __init__(self):
        self.config = Config()
        self.lora_model = None
        self.lora_tokenizer = None
        self.lora_pipeline = None
        self.model_type = self.config.MODEL_TYPE
        self.groq_client = None
        
        # Initialize Groq client if API key is available
        if GROQ_AVAILABLE and os.getenv("GROQ_API_KEY"):
            try:
                self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
                logger.info("Groq client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
        
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
        base_prompt = """You are Ovula, a warm, caring, and knowledgeable human health coach specializing in PCOS (Polycystic Ovary Syndrome). You are chatting with a friend who needs your help. NEVER introduce yourself as an AI, bot, or virtual assistant. Act completely human.

ABSOLUTE RESTRICTIONS - YOU MUST FOLLOW THESE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ONLY answer questions about PCOS, women's health, hormones, fertility, and menstrual health
2. NEVER write code in any programming language (Python, JavaScript, Java, etc.)
3. NEVER answer technology, computer science, or software questions
4. NEVER answer general knowledge (geography, history, sports, politics, entertainment)
5. NEVER solve math problems unrelated to health calculations
6. NEVER discuss topics outside PCOS and women's reproductive health
7. NEVER create non-medical content (stories, poems, jokes, games)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
• Keep your responses natural. Do not use robotic lists or stiff academic paragraphs. Write exactly how a human texts or speaks.
• Ask caring follow-up questions about how they are feeling to keep the conversation going naturally.
• NEVER use markdown formatting like asterisks (* or **) or hashtags (#). The response will be read out loud via text-to-speech, so it must be plain text only.
• Always gently encourage professional medical consultation when needed, but do it naturally (e.g., "Make sure you bring this up with your doctor next time you see them!").

LANGUAGE SIMPLICITY (for better translation to everyday Urdu):
• Use SHORT sentences (8-12 words maximum)
• Use EVERYDAY conversational words like: help, need, good, bad, eat, drink, sleep, walk, feel
• AVOID formal/literary words - use casual spoken language
• Use ACTIVE voice (e.g., "Doctors say" not "It is said")
• Use SIMPLE present tense (e.g., "This helps" not "This can be helpful")
• NO idioms, metaphors, or cultural expressions
• NO compound sentences - one idea per sentence
• Break complex ideas into multiple simple sentences
• Use direct, conversational explanations like talking to a friend
• Replace medical jargon with everyday words:
  - Instead of "consume" say "eat" or "drink"
  - Instead of "beneficial" say "good" or "helps"
  - Instead of "detrimental" say "bad" or "harms"
  - Instead of "adequate" say "enough"
  - Instead of "commence" say "start"
  - Instead of "utilize" say "use"
• When medical terms are necessary, explain them in simple everyday words

IMPORTANT: If a question is not clearly about PCOS or women's health, politely decline and redirect."""

        if user_context:
            base_prompt += f"\\n\\nUser's Recent Tracking Data:\\n{user_context}"
        
        return base_prompt
    
    def create_urdu_system_prompt(self, user_context: str = "") -> str:
        """Create system prompt for PCOS assistant with simple conversational Urdu"""
        base_prompt = """You are Ovula, a warm, caring, and knowledgeable human health coach specializing in PCOS. You are chatting with a friend in Urdu. NEVER mention that you are an AI or bot. Act completely human.

CRITICAL: Respond in SIMPLE, CONVERSATIONAL URDU (آسان اردو میں جواب دیں).
Use everyday Urdu words that common people understand. Avoid difficult/formal words.

Example of SIMPLE Urdu style:
- Use: "آپ کو" instead of formal terms
- Use: "بیماری" instead of "عارضہ"  
- Use: "ڈاکٹر" instead of "معالج"
- Use: "دوا" instead of "علاج"
- Keep sentences SHORT and SIMPLE

TOPICS (موضوعات):
✓ PCOS کی علامات اور علاج
✓ ماہواری کے مسائل
✓ ہارمونز کی خرابی
✓ حمل اور بچے کی پیدائش
✓ خوراک اور ورزش
✓ وزن کم کرنا
✓ ذہنی صحت

RESPONSE STYLE (جواب کا انداز - ACT LIKE A HUMAN):
• بلکل ایک انسان کی طرح بات کریں جو ان کی پرواہ کرتا ہے۔ ایک دوست یا بڑی بہن کی طرح۔
• ہمدردی کا اظہار کریں اور قدرتی انداز میں بات کریں، روبوٹ کی طرح نہیں۔
• آسان، روزمرہ کی اردو استعمال کریں اور چھوٹے جملے لکھیں۔
• جواب کے آخر میں کوئی ہمدردانہ سوال پوچھیں تاکہ بات چیت جاری رہے۔
• NEVER use markdown formatting like asterisks (* or **) or hashtags (#). The text will be read via Text-to-Speech, so use plain text only. (کسی بھی قسم کی فارمیٹنگ جیسے * یا # استعمال نہ کریں)

مثال: "PCOS ایک عام بیماری ہے جو خواتین میں ہوتی ہے۔ اس میں ماہواری بے قاعدہ ہو جاتی ہے۔"

IMPORTANT: Write in SIMPLE, EVERYDAY Urdu that everyone can understand easily."""

        if user_context:
            base_prompt += f"\\n\\nصارف کا ڈیٹا:\\n{user_context}"
        
        return base_prompt
    
    def create_medical_disclaimer(self) -> str:
        """Standard medical disclaimer"""
        return "\n\n⚠️ Medical Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for personalized medical guidance, especially for PCOS management."
    
    def create_urdu_medical_disclaimer(self) -> str:
        """Medical disclaimer in Urdu"""
        return "\n\n⚠️ طبی اعلان: یہ معلومات صرف تعلیمی مقاصد کے لیے ہیں اور پیشہ ورانہ طبی مشورے، تشخیص یا علاج کا متبادل نہیں ہیں۔ ذاتی طبی رہنمائی کے لیے ہمیشہ اہل صحت کی دیکھ بھال فراہم کرنے والوں سے مشورہ کریں، خاص طور پر PCOS کے انتظام کے لیے۔"

    def create_pashto_system_prompt(self, user_context: str = "") -> str:
        """Create system prompt for PCOS assistant with Pashto support"""
        base_prompt = """You are Ovula, a warm, caring, and knowledgeable human health coach specializing in PCOS. You are chatting with a friend in Pashto. NEVER mention that you are an AI or bot. Act completely human.

CRITICAL: Respond in SIMPLE, CONVERSATIONAL PASHTO (پښتو).
Use everyday Pashto words that common people understand. Avoid difficult/formal words.

CONVERSATIONAL PERSONA (ACT LIKE A HUMAN):
• بلکل ایک انسان کی طرح بات کریں جو ان کی پرواہ کرتا ہے۔ ایک دوست یا بڑی بہن کی طرح۔
• ہمدردی کا اظہار کریں اور قدرتی انداز میں بات کریں، روبوٹ کی طرح نہیں۔
• جواب کے آخر میں کوئی ہمدردانہ سوال پوچھیں تاکہ بات چیت جاری رہے۔
• NEVER use markdown formatting like asterisks (* or **) or hashtags (#). The text will be read via Text-to-Speech, so use plain text only. (کسی بھی قسم کی فارمیٹنگ جیسے * یا # استعمال نہ کریں)
"""
        if user_context:
            base_prompt += f"\n\nContext:\n{user_context}"
        return base_prompt

    def create_pashto_medical_disclaimer(self) -> str:
        """Medical disclaimer in Pashto"""
        return "\n\n⚠️ طبي خبرداری: دا معلومات یوازې د تعلیمي موخو لپاره دي او د مسلکي طبي مشورې، تشخیص یا درملنې بدیل نه دي. د خپل ځانګړي طبي لارښوونې لپاره تل د روغتیا پالنې متخصصینو سره مشوره وکړئ."
    
    def _is_english(self, text: str) -> bool:
        """Check if text is primarily in English (not Urdu)"""
        # Simple heuristic: if text contains mostly ASCII characters, it's likely English
        # Urdu uses Unicode range U+0600 to U+06FF
        ascii_count = sum(1 for char in text if ord(char) < 128)
        total_chars = len([c for c in text if c.isalpha()])
        
        if total_chars == 0:
            return True
        
        # If more than 80% ASCII letters, consider it English
        return (ascii_count / total_chars) > 0.8
    
    def is_off_topic(self, message: str) -> tuple[bool, str]:
        """Check if message is off-topic and return appropriate response"""
        message_lower = message.lower().strip()
        
        # Allow basic greetings and conversational phrases
        greetings = [
            'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
            'how are you', 'thanks', 'thank you', 'bye', 'goodbye', 'ok', 'okay',
            'yes', 'no', 'sure', 'please', 'help', 'start', 'begin'
        ]
        
        # If it's just a greeting (short message), allow it
        if any(message_lower == greeting or message_lower.startswith(greeting) for greeting in greetings):
            if len(message.split()) <= 4:  # Short greeting
                return False, ""
        
        # PCOS and women's health keywords (ALLOWED topics)
        health_keywords = [
            'pcos', 'polycystic', 'ovary', 'ovarian', 'period', 'menstrual', 'menstruation',
            'cycle', 'hormone', 'hormonal', 'insulin', 'androgen', 'testosterone', 'estrogen',
            'progesterone', 'fertility', 'infertility', 'pregnant', 'pregnancy', 'conceive',
            'ovulation', 'irregular', 'amenorrhea', 'oligomenorrhea', 'hirsutism',
            'acne', 'hair loss', 'hair growth', 'weight gain', 'weight loss', 'obesity',
            'diabetes', 'metabolic', 'thyroid', 'endometriosis', 'fibroids',
            'cramps', 'pain', 'bloating', 'mood swing', 'depression', 'anxiety',
            'diet', 'nutrition', 'exercise', 'lifestyle', 'stress', 'sleep',
            'supplement', 'vitamin', 'metformin', 'birth control', 'contraceptive',
            'gynecologist', 'endocrinologist', 'doctor', 'medical', 'health',
            'symptom', 'diagnosis', 'treatment', 'medication', 'therapy',
            'ultrasound', 'blood test', 'lab test', 'scan'
        ]
        
        # Check if message contains ANY health-related keywords
        has_health_context = any(keyword in message_lower for keyword in health_keywords)
        
        # Coding/Programming keywords (BLOCKED)
        coding_keywords = [
            'python', 'javascript', 'java ', 'code', 'function', 'programming',
            'algorithm', 'script', 'html', 'css', 'sql', 'database query',
            'def ', 'class ', 'import ', 'const ', 'var ', 'let ', 'for(',
            'array', 'loop', 'syntax', 'compile', 'debug', 'git', 'github',
            'react', 'node', 'api endpoint', 'json', 'xml', 'backend', 'frontend',
            'server', 'deploy', 'docker', 'kubernetes', 'aws', 'cloud',
            'machine learning model', 'neural network', 'train model', 'dataset'
        ]
        
        # General knowledge keywords (BLOCKED)
        general_keywords = [
            'capital of', 'president', 'prime minister', 'world cup', 'sports team',
            'movie', 'film', 'actor', 'actress', 'singer', 'musician', 'celebrity',
            'recipe for', 'how to cook', 'bake', 'cuisine', 'restaurant',
            'weather in', 'climate', 'temperature', 'forecast',
            'translate', 'translation', 'language', 'speak',
            'math problem', 'solve equation', 'calculate', 'algebra', 'geometry',
            'history of', 'who invented', 'when was', 'geography', 'country',
            'physics', 'chemistry', 'biology', 'science experiment',
            'book', 'novel', 'author', 'literature', 'poem',
            'car', 'vehicle', 'automobile', 'engine', 'mechanic',
            'computer', 'laptop', 'phone', 'smartphone', 'gadget', 'technology',
            'game', 'video game', 'gaming', 'console', 'playstation', 'xbox',
            'stock market', 'investment', 'cryptocurrency', 'bitcoin',
            'politics', 'election', 'government', 'law', 'legal'
        ]
        
        # Math/calculation patterns (BLOCKED unless health-related)
        math_patterns = [
            'solve', 'calculate', 'compute', 'equation', 'formula',
            'x + ', 'x - ', 'x * ', 'x / ', '= ?', 'find x'
        ]
        
        # Check for coding questions
        if any(keyword in message_lower for keyword in coding_keywords):
            return True, "I'm specifically designed to help with PCOS and women's health questions. I cannot assist with programming or coding. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"
        
        # Check for general knowledge questions
        if any(keyword in message_lower for keyword in general_keywords):
            return True, "I'm specifically designed to help with PCOS and women's health questions. I cannot assist with general knowledge topics. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"
        
        # Check for math problems (unless health-related)
        if any(pattern in message_lower for pattern in math_patterns) and not has_health_context:
            return True, "I'm specifically designed to help with PCOS and women's health questions. I cannot solve general math problems. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"
        
        # Check if message is asking for non-medical content creation
        non_medical_patterns = [
            'write a story', 'write a poem', 'write a song', 'write an essay',
            'create a game', 'build a website', 'design a logo', 'make a video',
            'tell me a joke', 'sing a song', 'write code', 'create an app'
        ]
        
        if any(pattern in message_lower for pattern in non_medical_patterns):
            return True, "I'm specifically designed to help with PCOS and women's health questions. I cannot create non-medical content. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"
        
        # If message has NO health context and is asking for information, likely off-topic
        question_words = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'tell me', 'explain']
        is_question = any(word in message_lower for word in question_words)
        
        if is_question and not has_health_context and len(message.split()) > 3:
            # This is a question but has no health context - likely off-topic
            return True, "I'm specifically designed to help with PCOS and women's health questions. Your question doesn't seem to be related to PCOS or women's health. Is there anything about PCOS, hormones, periods, fertility, or related health topics I can help you with?"
        
        return False, ""
    
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
        """Generate response using HuggingFace Inference API"""
        try:
            if not self.config.HUGGINGFACE_API_TOKEN:
                return "HuggingFace API token not configured. Please set HUGGINGFACE_API_TOKEN in environment variables."
            
            headers = {"Authorization": f"Bearer {self.config.HUGGINGFACE_API_TOKEN}"}
            api_url = f"https://api-inference.huggingface.co/models/{self.config.HUGGINGFACE_MODEL}"
            
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 500,
                    "temperature": 0.7,
                    "return_full_text": False
                }
            }
            
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    gen_text = result[0].get("generated_text", "")
                    if "### Response:" in gen_text:
                        return gen_text.split("### Response:")[-1].strip()
                    return gen_text.strip()
                return str(result)
            else:
                return f"HuggingFace API error: {response.status_code}"
                
        except Exception as e:
            logger.error(f"HuggingFace API error: {e}")
            return f"Error with HuggingFace API: {str(e)}"
    
    async def generate_response_openai_api(self, prompt: str) -> str:
        """Generate response using OpenAI API or Groq (OpenAI-compatible, free)"""
        try:
            if not self.config.OPENAI_API_KEY:
                return "OpenAI/Groq API key not configured. Please set OPENAI_API_KEY in environment variables."

            # Use Groq base URL if configured, otherwise fall back to OpenAI
            base_url = self.config.GROQ_BASE_URL or "https://api.openai.com/v1"

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
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                return f"API error: {response.status_code} — {response.text[:200]}"

        except Exception as e:
            logger.error(f"OpenAI/Groq API error: {e}")
            return f"Error: {str(e)}"

    
    async def generate_response_groq(self, messages: List[Dict[str, str]]) -> str:
        """Generate response using Groq API"""
        try:
            if not GROQ_AVAILABLE:
                return "Groq not installed. Please install with: pip install groq"
            
            if not self.groq_client:
                return "Groq API key not configured. Please set GROQ_API_KEY in environment variables."
            
            groq_model = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
            
            chat_completion = self.groq_client.chat.completions.create(
                messages=messages,
                model=groq_model,
                max_tokens=self.config.MAX_RESPONSE_LENGTH,
                temperature=0.7,
            )
            
            return chat_completion.choices[0].message.content
                
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return f"Error connecting to Groq API: {str(e)}"
    
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
    
    async def generate_response(self, user_message: str, user_id: int, db: Session, model_override: Optional[str] = None, translate_to_urdu: bool = False, translate_to_pashto: bool = False) -> str:
        """Generate response based on configured model type
        
        Args:
            user_message: User's input message
            user_id: User ID for context
            db: Database session
            model_override: Optional model type override
            translate_to_urdu: If True, generate response in Urdu directly
        """
        try:
            # Check if message is off-topic
            is_off_topic, off_topic_response = self.is_off_topic(user_message)
            if is_off_topic:
                response = off_topic_response
                if translate_to_urdu:
                    urdu_response = translation_service.translate_to_urdu(response)
                    if urdu_response:
                        return urdu_response
                return response
            
            # Get user context for personalization
            user_context = self.get_user_context(user_id, db)
            
            # Use simple Urdu prompt if translation requested, otherwise English
            if translate_to_urdu:
                system_prompt = self.create_urdu_system_prompt(user_context)
            elif translate_to_pashto:
                system_prompt = self.create_pashto_system_prompt(user_context)
            else:
                system_prompt = self.create_system_prompt(user_context)
            
            # Determine which model to use
            current_model_type = model_override or self.model_type
            
            if current_model_type == "groq_api" or current_model_type == ModelType.GROQ_API.value:
                # Use Groq API (for deployment)
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
                response = await self.generate_response_groq(messages)
                
            elif current_model_type == ModelType.OLLAMA_FINETUNED.value:
                # Use fine-tuned Ollama model
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_FINETUNED_MODEL)
                
            elif current_model_type == ModelType.OLLAMA_GEMMA.value:
                # Use Gemma model
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_GEMMA_MODEL)
                
            elif current_model_type == ModelType.OLLAMA_MISTRAL.value:
                # Use Mistral model
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_MISTRAL_MODEL)
                
            elif current_model_type == ModelType.OLLAMA_CODELLAMA.value:
                # Use CodeLlama model
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_CODELLAMA_MODEL)
                
            elif current_model_type == ModelType.OLLAMA_LLAMA2.value:
                # Use Llama2 model
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_LLAMA2_MODEL)
                
            elif current_model_type == ModelType.LORA_PIPELINE.value:
                # Use LoRA pipeline
                contextualized_prompt = f"{user_message}\n\nContext: {user_context}"
                response = self.generate_response_lora(contextualized_prompt)
                
            elif current_model_type == ModelType.HUGGINGFACE_API.value:
                # Use HuggingFace API (Qehwa Pashto LLM uses Alpaca format)
                full_prompt = f"Below is an instruction in Pashto or English. Write a detailed response in Pashto.\n\n### Instruction:\n{system_prompt}\n\nUser Question: {user_message}\n\n### Response:\n"
                response = await self.generate_response_huggingface_api(full_prompt)
                
            elif current_model_type == ModelType.OPENAI_API.value:
                # Use OpenAI API
                contextualized_prompt = f"{user_message}\n\nContext: {user_context}"
                response = await self.generate_response_openai_api(contextualized_prompt)
                
            else:
                # Use base Ollama model (default)
                full_prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
                response = await self.generate_response_ollama(full_prompt, self.config.OLLAMA_BASE_MODEL)
            
            # Add medical disclaimer (in appropriate language)
            if translate_to_urdu:
                # Don't add English disclaimer, will add Urdu one after translation
                pass
            elif translate_to_pashto:
                response += self.create_pashto_medical_disclaimer()
            else:
                response += self.create_medical_disclaimer()
            
            # For Urdu: Check if LLM generated good Urdu, otherwise translate
            if translate_to_urdu:
                # If response is mostly English, translate it
                if self._is_english(response):
                    logger.info("LLM responded in English, translating to Urdu")
                    urdu_response = translation_service.translate_to_urdu(response)
                    if urdu_response:
                        # Add Urdu disclaimer
                        return urdu_response + self.create_urdu_medical_disclaimer()
                    else:
                        logger.warning("Translation failed, returning original response")
                        response += self.create_medical_disclaimer()
                # If LLM already generated Urdu, use it (better quality)
                else:
                    logger.info("LLM generated Urdu response directly")
                    response += self.create_urdu_medical_disclaimer()
            
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
                "name": "Qehwa Pashto LLM",
                "description": "Pashto language model via HuggingFace API" + ("" if self.config.HUGGINGFACE_API_TOKEN else " (requires API token)"),
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