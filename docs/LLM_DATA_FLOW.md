# Ovula LLM System - Complete Data Flow Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [File Structure](#file-structure)
4. [Data Flow Steps](#data-flow-steps)
5. [Component Details](#component-details)

---

## System Overview

The Ovula LLM system uses **Ollama** to run locally-hosted language models specialized for PCOS healthcare assistance. The system supports multiple model types:
- **Base Model**: llama3.2 (2GB)
- **PCOS-Restricted Base**: pcos-base (custom wrapper with strict PCOS-only responses)
- **Fine-tuned Model**: pcos-llama3 (fine-tuned on PCOS dataset)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)          │  Mobile (React Native)             │
│  - Chat.js                 │  - ChatScreen.js                   │
│  - Message formatting      │  - Mobile chat UI                  │
│  - Model selection UI      │  - API integration                 │
└──────────────┬─────────────┴────────────────┬───────────────────┘
               │                              │
               │ HTTP POST /chat              │
               │ { message: "..." }           │
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (FastAPI)                      │
├─────────────────────────────────────────────────────────────────┤
│  main.py                                                        │
│  └─> Includes chat router                                      │
│                                                                 │
│  app/routes/chat.py                                            │
│  ├─> POST /chat/          - Send message                      │
│  ├─> GET /chat/history    - Get chat history                  │
│  ├─> DELETE /chat/history - Clear history                     │
│  ├─> GET /chat/models     - Get available models              │
│  └─> POST /chat/test-model - Test model                       │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ Calls LLMService
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LLM SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  app/services/llm_service.py                                   │
│  ├─> LLMService class                                          │
│  │   ├─> __init__() - Load config from .env                   │
│  │   ├─> is_off_topic() - Filter non-PCOS queries            │
│  │   ├─> get_user_context() - Fetch recent logs              │
│  │   └─> generate_response() - Main orchestrator             │
│  │                                                             │
│  └─> Model Types:                                             │
│      ├─> ollama_base (pcos-base model)                       │
│      ├─> ollama_finetuned (pcos-llama3)                      │
│      └─> lora_pipeline (disabled - needs PyTorch)            │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ HTTP Request to Ollama
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OLLAMA SERVER                                │
├─────────────────────────────────────────────────────────────────┤
│  Running on: http://localhost:11434                            │
│                                                                 │
│  Available Models:                                             │
│  ├─> llama3.2:latest (base model)                             │
│  ├─> pcos-base:latest (PCOS-restricted wrapper)               │
│  └─> pcos-llama3:latest (fine-tuned model)                    │
│                                                                 │
│  Model Storage: ~/.ollama/models/                             │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ Loads model configuration
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODEL CONFIGURATION                          │
├─────────────────────────────────────────────────────────────────┤
│  ai-models/Modelfile_Base_PCOS                                 │
│  ├─> FROM llama3.2:latest                                      │
│  ├─> PARAMETER temperature 0.7                                 │
│  ├─> PARAMETER num_predict 400 (max tokens)                   │
│  ├─> SYSTEM prompt with:                                       │
│  │   ├─> PCOS-only restrictions                               │
│  │   ├─> Concise response guidelines                          │
│  │   ├─> Formatting rules (bold, lists)                       │
│  │   └─> Medical disclaimer                                    │
│  └─> Created with: ollama create pcos-base -f Modelfile       │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

### 1. Configuration Files

#### `backend/.env`
```env
MODEL_TYPE=ollama_base              # Active model type
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_BASE_MODEL=pcos-base         # Model name in Ollama
OLLAMA_FINETUNED_MODEL=pcos-llama3
MAX_CHAT_HISTORY=50
MAX_RESPONSE_LENGTH=512
```


#### `backend/app/config.py`
```python
class Config:
    MODEL_TYPE = os.getenv("MODEL_TYPE", "ollama_base")
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_BASE_MODEL = os.getenv("OLLAMA_BASE_MODEL", "pcos-base")
    OLLAMA_FINETUNED_MODEL = os.getenv("OLLAMA_FINETUNED_MODEL", "pcos-llama3")
    MAX_CHAT_HISTORY = int(os.getenv("MAX_CHAT_HISTORY", "50"))
    MAX_RESPONSE_LENGTH = int(os.getenv("MAX_RESPONSE_LENGTH", "512"))
```

### 2. Model Configuration Files

#### `ai-models/Modelfile_Base_PCOS`
**Purpose**: Defines the PCOS-restricted base model configuration
**Key Components**:
- Base model: llama3.2:latest
- Temperature: 0.7 (balanced creativity)
- Top-p: 0.9 (nucleus sampling)
- Context window: 2048 tokens
- Max prediction: 400 tokens
- System prompt with strict PCOS-only rules
- Concise response formatting guidelines
- Medical disclaimer requirements

**Creation Command**:
```bash
ollama create pcos-base -f ai-models/Modelfile_Base_PCOS
```

#### `ai-models/Modelfile_PCOS`
**Purpose**: Fine-tuned PCOS model (trained on PCOS dataset)
**Differences from base**:
- More specialized PCOS knowledge
- Better understanding of medical terminology
- Trained on PCOS-specific Q&A pairs

---

## Data Flow Steps

### Step 1: User Sends Message

**Frontend (Chat.js)**
```javascript
const sendMessage = async (e) => {
  e.preventDefault();
  const userMessage = inputMessage.trim();
  
  // Add to UI immediately
  setMessages(prev => [...prev, tempUserMessage]);
  
  // Send to backend
  const response = await axios.post('/chat/', { 
    message: userMessage,
    model_type: selectedModel || undefined
  });
  
  setMessages(prev => [...newMessages, response.data]);
};
```

**Mobile (ChatScreen.js)**
```javascript
const response = await chatAPI.sendMessage(inputText);
```

