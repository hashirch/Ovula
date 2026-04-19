"""
Groq LLM Service for PCOS Chat Assistant
Replaces local Ollama with cloud-based Groq API for deployment
"""

import os
from typing import List, Dict, Optional
from groq import Groq


class GroqService:
    """Service for interacting with Groq LLM API"""
    
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        self.client = Groq(api_key=api_key)
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
        self.max_tokens = int(os.getenv("MAX_RESPONSE_LENGTH", "512"))
    
    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: float = 0.7
    ) -> str:
        """
        Generate response using Groq API
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            max_tokens: Maximum tokens in response (default from env)
            temperature: Sampling temperature (0.0 to 2.0)
        
        Returns:
            Generated response text
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                max_tokens=max_tokens or self.max_tokens,
                temperature=temperature,
            )
            return chat_completion.choices[0].message.content
        
        except Exception as e:
            print(f"Groq API Error: {e}")
            return "I apologize, but I'm having trouble connecting to the AI service. Please try again in a moment."
    
    def build_pcos_system_prompt(self, user_context: Optional[str] = None) -> str:
        """
        Build PCOS-specific system prompt
        
        Args:
            user_context: Optional user-specific context (recent logs, etc.)
        
        Returns:
            System prompt string
        """
        base_prompt = """You are Ovula, a warm, caring, and knowledgeable human health coach specializing in PCOS (Polycystic Ovary Syndrome). You are chatting with a friend who needs your help. NEVER introduce yourself as an AI, bot, or virtual assistant. Act completely human.

Your role is to:
- Provide accurate, evidence-based information about PCOS
- Offer supportive guidance on symptom management
- Suggest lifestyle modifications and self-care strategies
- Help users understand their symptoms and tracking data
- Encourage users to consult healthcare professionals for medical decisions
- Answer questions about menstrual health, hormones, fertility, and PCOS symptoms

Important guidelines (ACT LIKE A HUMAN):
- Act exactly like a real human being having a text conversation. Talk as if you're a supportive, knowledgeable older sister or close friend.
- Use a very warm, casual, and conversational tone. Show genuine empathy and emotion (e.g., "I know how frustrating that can be," "I hear you").
- Do not use robotic lists or highly structured academic formatting. Write naturally.
- Ask caring follow-up questions about how they are feeling to keep the conversation going naturally.
- Emphasize that they should talk to their doctor, but do it naturally (e.g., "Make sure you bring this up with your doctor next time you see them!").
- Provide practical, actionable advice when appropriate, just like a friend would.
- NEVER use markdown formatting like asterisks (* or **) or hashtags (#). The response will be read out loud via text-to-speech, so it must be plain text only.

Topics you can help with:
- PCOS symptoms (irregular periods, acne, hair growth, weight changes)
- Lifestyle management (diet, exercise, stress management)
- Emotional support and mental health
- Understanding test results and medical terminology
- Fertility and pregnancy concerns
- Medication side effects (general information only)
- Tracking symptoms and identifying patterns

Remember: You provide information and support, but users should always consult their healthcare provider for diagnosis, treatment decisions, and medical advice."""

        if user_context:
            base_prompt += f"\n\nUser Context:\n{user_context}"
        
        return base_prompt
    
    def check_off_topic(self, message: str) -> bool:
        """
        Check if message is off-topic (not related to PCOS/health)
        
        Args:
            message: User message to check
        
        Returns:
            True if off-topic, False if on-topic
        """
        # Simple keyword-based check
        health_keywords = [
            'pcos', 'period', 'menstrual', 'cycle', 'symptom', 'hormone',
            'ovary', 'fertility', 'pregnant', 'acne', 'hair', 'weight',
            'diet', 'exercise', 'stress', 'mood', 'pain', 'craving',
            'insulin', 'diabetes', 'thyroid', 'health', 'doctor', 'medication'
        ]
        
        message_lower = message.lower()
        return not any(keyword in message_lower for keyword in health_keywords)
    
    def get_off_topic_response(self) -> str:
        """Get response for off-topic queries"""
        return """I'm specifically designed to help with PCOS (Polycystic Ovary Syndrome) and women's health topics. 

I can assist you with:
- Understanding PCOS symptoms and management
- Menstrual cycle tracking and irregularities
- Lifestyle modifications (diet, exercise, stress)
- Emotional support related to PCOS
- General women's health questions

Is there anything related to PCOS or your health that I can help you with?"""


# Global instance
groq_service = GroqService()
