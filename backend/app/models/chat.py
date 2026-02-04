from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ChatMessageCreate(BaseModel):
    message: str
    model_type: Optional[str] = None  # Allow model selection per message

class ChatMessageResponse(BaseModel):
    id: int
    message: str
    response: str
    model_used: Optional[str] = None
    response_time: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]
    total_count: int
    model_status: dict

class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    type: str
    available: bool

class ModelStatusResponse(BaseModel):
    current_model: str
    available_models: List[ModelInfo]
    lora_loaded: bool
    config: dict