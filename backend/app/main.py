from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import asyncio
import threading
from dotenv import load_dotenv

from app.db.session import engine
from app.models.user import Base
from app.api.v1 import auth, logs, insights, prediction, chat, speech
from app.core.config import Config

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm up the LLM model in background on startup so first request is instant"""
    from app.services.llm import llm_service
    def _warmup():
        try:
            llm_service.warmup_model()
        except Exception as e:
            print(f"[warmup] non-fatal: {e}")
    threading.Thread(target=_warmup, daemon=True).start()
    yield

app = FastAPI(
    title="Ovula API",
    description="AI-powered PCOS tracking and management system with intelligent chatbot",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware - Allow all origins for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (mobile app, web, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth, prefix="/auth", tags=["Authentication"])
app.include_router(logs, prefix="/logs", tags=["Logs"])
app.include_router(chat, prefix="/chat", tags=["AI Chat"])
app.include_router(speech, prefix="/speech", tags=["Speech"])
app.include_router(insights, prefix="/insights", tags=["Insights"])
app.include_router(prediction, prefix="/prediction", tags=["PCOS Prediction"])

@app.get("/")
async def root():
    return {
        "message": "Ovula API - AI-Powered PCOS Management",
        "version": "2.0.0",
        "model_config": Config.get_model_config()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_type": Config.MODEL_TYPE}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)