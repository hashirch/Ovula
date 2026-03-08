from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

from database import engine
from models import Base
from routers import auth, logs, insights, prediction
from app.routes import chat
from app.config import Config

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ovula API",
    description="AI-powered PCOS tracking and management system with intelligent chatbot",
    version="2.0.0"
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
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
app.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
app.include_router(insights.router, prefix="/insights", tags=["Insights"])
app.include_router(prediction.router, prefix="/prediction", tags=["PCOS Prediction"])

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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)