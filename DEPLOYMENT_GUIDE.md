# 🚀 Ovula - Free Deployment Guide

This guide will help you deploy the Ovula PCOS tracking application using **100% free tools** with all functionalities working.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Backend Deployment (Railway)](#backend-deployment)
4. [Frontend Deployment (Vercel)](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [LLM Configuration (Groq API)](#llm-configuration)
7. [Environment Variables](#environment-variables)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

Create free accounts on:
- [Railway](https://railway.app/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting
- [Groq](https://console.groq.com/) - Free LLM API (replaces Ollama)
- [ElevenLabs](https://elevenlabs.io/) - Text-to-Speech (optional, has free tier)
- [Gmail](https://gmail.com/) - For OTP emails

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYED ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Vercel     │────────▶│   Railway    │                 │
│  │  (Frontend)  │  HTTPS  │  (Backend)   │                 │
│  │  React App   │         │  FastAPI     │                 │
│  └──────────────┘         └──────┬───────┘                 │
│                                   │                          │
│                          ┌────────┴────────┐                │
│                          │                 │                │
│                   ┌──────▼──────┐   ┌─────▼──────┐         │
│                   │  Railway    │   │   Groq     │         │
│                   │  PostgreSQL │   │   LLM API  │         │
│                   └─────────────┘   └────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Backend for Deployment

Create `railway.json` in project root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd src/backend && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "cd src/backend && uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 2: Update Backend Dependencies

The backend will use Groq API instead of Ollama. Update `src/backend/requirements.txt`:
```txt
fastapi>=0.100.0
uvicorn[standard]>=0.20.0
sqlalchemy>=2.0.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
python-dotenv>=1.0.0
requests>=2.31.0
pydantic[email]>=2.8.0
alembic>=1.13.0
deep-translator>=1.11.4
elevenlabs>=1.0.0
pydub>=0.25.1
groq>=0.4.0
psycopg2-binary>=2.9.0
```

### Step 3: Deploy to Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect and deploy

### Step 4: Add PostgreSQL Database

1. In Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will provide a `DATABASE_URL` automatically
3. The database will be linked to your backend service

### Step 5: Configure Environment Variables

In Railway dashboard, add these variables:
```env
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=${{Postgres.DATABASE_URL}}
MODEL_TYPE=groq_api
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama-3.1-70b-versatile
MAX_CHAT_HISTORY=50
MAX_RESPONSE_LENGTH=512
ELEVENLABS_API_KEY=your-elevenlabs-key-optional
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
OTP_ENABLED=true
EMAIL_BACKEND=smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
FROM_EMAIL=your-email@gmail.com
APP_NAME=Ovula
APP_URL=https://your-frontend-url.vercel.app
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

Create `vercel.json` in `src/frontend/`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 2: Update Frontend Environment

Create `src/frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

Update `src/frontend/package.json` to remove proxy and add build script:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "vercel-build": "react-scripts build"
  }
}
```

### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Set root directory to `src/frontend`
5. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app`
6. Click "Deploy"

---

## 🗄️ Database Setup

Railway PostgreSQL is automatically configured. To migrate from SQLite:

### Option 1: Keep SQLite (Simpler)
Railway supports SQLite with persistent volumes. No changes needed.

### Option 2: Use PostgreSQL (Recommended for production)

Update `src/backend/database.py` to handle both:
```python
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pcos_tracker.db")

# Fix for Railway PostgreSQL URL format
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 🤖 LLM Configuration (Groq API)

Groq provides **free API access** to Llama models with high speed.

### Step 1: Get Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up for free account
3. Navigate to API Keys
4. Create new API key
5. Copy the key

### Step 2: Update LLM Service

Create `src/backend/app/services/groq_service.py`:
```python
import os
from groq import Groq
from typing import List, Dict

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
    
    def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: int = 512,
        temperature: float = 0.7
    ) -> str:
        """Generate response using Groq API"""
        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API Error: {e}")
            return "I apologize, but I'm having trouble connecting to the AI service. Please try again."
    
    def build_pcos_system_prompt(self) -> str:
        """Build PCOS-specific system prompt"""
        return """You are a knowledgeable and empathetic PCOS (Polycystic Ovary Syndrome) health assistant. 
        
Your role is to:
- Provide accurate, evidence-based information about PCOS
- Offer supportive guidance on symptom management
- Suggest lifestyle modifications and self-care strategies
- Help users understand their symptoms and tracking data
- Encourage users to consult healthcare professionals for medical decisions

Important guidelines:
- Always be compassionate and non-judgmental
- Provide information in clear, accessible language
- Emphasize that you're not a replacement for medical professionals
- Focus on empowerment and self-management
- Be culturally sensitive and inclusive

Remember: You provide information and support, but users should always consult their healthcare provider for diagnosis and treatment decisions."""

groq_service = GroqService()
```

### Step 3: Update Chat Router

Modify `src/backend/app/routes/chat.py` to use Groq:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import User, ChatMessage
from auth import get_current_user
from app.services.groq_service import groq_service
from app.services.translation_service import translation_service
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    translate_to_urdu: bool = False

class ChatResponse(BaseModel):
    response: str
    model_used: str
    timestamp: datetime

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send message to AI assistant with optional Urdu translation"""
    try:
        # Build conversation context
        system_prompt = groq_service.build_pcos_system_prompt()
        
        # Get recent chat history for context
        recent_chats = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id
        ).order_by(ChatMessage.created_at.desc()).limit(5).all()
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add chat history
        for chat in reversed(recent_chats):
            messages.append({"role": "user", "content": chat.message})
            messages.append({"role": "assistant", "content": chat.response})
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        # Generate response
        start_time = datetime.now()
        response_text = groq_service.generate_response(messages)
        response_time = (datetime.now() - start_time).total_seconds()
        
        # Translate if requested
        if request.translate_to_urdu:
            response_text = translation_service.translate_to_urdu(response_text)
        
        # Save to database
        chat_message = ChatMessage(
            user_id=current_user.id,
            message=request.message,
            response=response_text,
            model_used=groq_service.model,
            response_time=response_time
        )
        db.add(chat_message)
        db.commit()
        
        return ChatResponse(
            response=response_text,
            model_used=groq_service.model,
            timestamp=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@router.get("/history")
async def get_chat_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for current user"""
    chats = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": chat.id,
            "message": chat.message,
            "response": chat.response,
            "model_used": chat.model_used,
            "created_at": chat.created_at
        }
        for chat in chats
    ]

@router.delete("/history")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all chat history for current user"""
    db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "Chat history cleared successfully"}
```

---

## 🔐 Environment Variables

### Backend (Railway)
```env
# Security
SECRET_KEY=generate-a-secure-random-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (auto-provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Groq LLM
MODEL_TYPE=groq_api
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.1-70b-versatile

# Email/OTP
OTP_ENABLED=true
EMAIL_BACKEND=smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
APP_NAME=Ovula
APP_URL=https://your-app.vercel.app

# Optional: ElevenLabs TTS
ELEVENLABS_API_KEY=your-key-here
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-backend.railway.app
```

---

## ✅ Testing

### 1. Test Backend Health
```bash
curl https://your-backend.railway.app/health
```

### 2. Test Frontend
Visit `https://your-app.vercel.app` and:
- Register a new account
- Verify email with OTP
- Log in
- Add a daily log
- Test AI chat
- Test Urdu translation

### 3. Test API Endpoints
```bash
# Register
curl -X POST https://your-backend.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST https://your-backend.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Database connection errors
```bash
# Solution: Check DATABASE_URL format
# Railway uses postgres://, but SQLAlchemy needs postgresql://
# The code handles this automatically
```

**Problem**: Groq API errors
```bash
# Solution: Verify API key
# Check rate limits (free tier: 30 requests/minute)
# Ensure GROQ_API_KEY is set correctly
```

### Frontend Issues

**Problem**: CORS errors
```bash
# Solution: Ensure backend CORS allows your frontend domain
# Check main.py CORS configuration
```

**Problem**: API calls failing
```bash
# Solution: Verify REACT_APP_API_URL is correct
# Check browser console for errors
# Ensure backend is running
```

### Email Issues

**Problem**: OTP emails not sending
```bash
# Solution: Use Gmail App Password
# 1. Enable 2FA on Gmail
# 2. Generate App Password
# 3. Use that password in SMTP_PASSWORD
```

---

## 🎉 Success Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] PostgreSQL database connected
- [ ] Groq API key configured
- [ ] Email OTP working
- [ ] User registration working
- [ ] Login working
- [ ] Daily logs working
- [ ] AI chat working
- [ ] Urdu translation working
- [ ] Cycle tracker working
- [ ] PCOS prediction working

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

---

## 💰 Cost Breakdown (All FREE!)

| Service | Free Tier | Usage |
|---------|-----------|-------|
| Railway | $5 credit/month | Backend + Database |
| Vercel | Unlimited | Frontend hosting |
| Groq | 30 req/min | LLM API |
| Gmail | Unlimited | OTP emails |
| ElevenLabs | 10k chars/month | Text-to-Speech (optional) |

**Total Monthly Cost: $0** 🎉

---

## 🚀 Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Railway/Vercel)
3. Set up monitoring and logging
4. Configure backup strategy
5. Implement rate limiting
6. Add analytics

---

**Need Help?** Open an issue on GitHub or contact the team!
