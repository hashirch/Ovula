<div align="center">

<img src="docs/ovula-logo.png" alt="Ovula Logo" width="150"/>

# Ovula

### PCOS Tracking & AI Healthcare Assistant

_A Final Year Project combining machine learning, LLM fine-tuning, and a full-stack mobile + web application for PCOS management_

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React Native](https://img.shields.io/badge/React_Native-0.73+-61dafb.svg)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![Ollama](https://img.shields.io/badge/Ollama-LLM-black.svg)](https://ollama.ai/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Overview](#-overview) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Quick Start](#-quick-start) • [Team](#-team)

</div>

---

## 🎓 Academic Research Project

<table>
<tr>
<td><strong>🏛️ University</strong></td>
<td>FAST National University of Computer and Emerging Sciences</td>
</tr>
<tr>
<td><strong>📍 Campus</strong></td>
<td>Peshawar</td>
</tr>
<tr>
<td><strong>📚 Project Type</strong></td>
<td>Final Year Project (FYP) — Machine Learning, NLP & Mobile Development</td>
</tr>
<tr>
<td><strong>🔬 Research Area</strong></td>
<td>Domain-Specific LLM Fine-Tuning & PCOS Healthcare</td>
</tr>
<tr>
<td><strong>👨‍🏫 Supervisor</strong></td>
<td>Shahzeb Khan</td>
</tr>
</table>

### 👥 Team

| Name                     | Reg. No  | GitHub                                               |
| ------------------------ | -------- | ---------------------------------------------------- |
| **Muhammad Hashir**      | 22P-9181 | [@hashirch](https://github.com/hashirch)             |
| **Laraib Shahid Abbasi** | 22P-0503 | [@Laraibshahid89](https://github.com/Laraibshahid89) |
| **Arooba Gohar**         | 22P-9216 | [@uroobagh123](https://github.com/uroobagh123)       |

---

## 🌸 Overview

Ovula is a PCOS (Polycystic Ovary Syndrome) health companion built as our Final Year Project at FAST NUCES Peshawar. The project has two main angles: fine-tuning open-source LLMs to be better at answering PCOS-related questions, and building an actual app that people can use to track their symptoms, menstrual cycles, and get AI-powered health insights.

PCOS affects roughly 1 in 10 women globally, but general-purpose AI models tend to give pretty vague answers on the topic. We wanted to see how much better a domain-fine-tuned model could do — and package that into something usable.

---

## ✨ Features

### Mobile App (React Native)

- **Dashboard** — personalized health overview and recent activity
- **Symptom Logging** — daily log entries for symptoms, mood, weight, and more
- **Cycle Tracker** — menstrual cycle tracking with period prediction
- **AI Chat** — conversational interface powered by the fine-tuned Llama model
  - 🌐 **Urdu Translation** — toggle to translate AI responses to Urdu using Google Translate
  - 🎤 **Voice Input** — speak your questions using speech recognition
  - 🔊 **Text-to-Speech** — listen to AI responses in English or Urdu
- **Logs History** — browse and review past health logs
- **User Profile** — manage account and health settings
- **Auth Flow** — register, login, and email OTP verification

### Backend (FastAPI)

- JWT-based authentication with email OTP verification
- Symptom log management (create, read, history)
- PCOS risk prediction using trained ML models
- AI-generated health insights from logs
- **Urdu Translation Service** — Google Translate integration for Urdu responses
- SQLite database with a clean schema

### ML Models

- **PCOS Risk Prediction** using KNN, Decision Tree, Logistic Regression, and Naive Bayes — best model selected for the backend prediction route
- Trained on a curated PCOS dataset

### LLM Fine-Tuning (AI Models)

- Base model: `llama-3.2-1b-instruct` (Q8_0 GGUF)
- Fine-tuned via Ollama using custom Modelfiles
- PCOS-specific system prompts and training configuration
- Separate Modelfiles for base vs fine-tuned comparison

### Web Frontend (React)

- Admin/comparison dashboard built with React and Tailwind CSS
- Visualizes model responses and user interaction logs

---

## 🛠 Tech Stack

### Mobile

```
React Native 0.73 (TypeScript)
├── React Navigation    — screen navigation
├── Axios               — API communication
├── AsyncStorage        — local session storage
└── React Native        — UI components
```

### Backend

```
Python / FastAPI
├── SQLAlchemy          — ORM & database models
├── Pydantic            — request/response validation
├── JWT                 — authentication tokens
├── OTP Service         — email-based verification
├── Google Translate    — Urdu translation service
└── SQLite              — local database (pcos_tracker.db)

API Routers:
├── /auth               — register, login, OTP
├── /logs               — symptom log CRUD
├── /prediction         — PCOS risk scoring
├── /chat               — AI chat with Urdu translation support
└── /insights           — AI-generated health insights
```

### Machine Learning

```
Python / scikit-learn
├── KNN
├── Decision Tree
├── Logistic Regression
└── Naive Bayes         — all evaluated; best model deployed
```

### LLM / AI

```
Ollama + Llama 3.2 (1B, quantized Q8_0)
└── Custom Modelfiles for PCOS domain fine-tuning
```

### Web Frontend

```
React 18 + Tailwind CSS
└── Interactive dashboard for model comparison
```

---

## 🏗️ Architecture Overview

The project follows a modern, professionally organized architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                         Ovula Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │    Mobile    │  │   Backend    │     │
│  │  (React.js)  │  │(React Native)│  │  (FastAPI)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │  REST API      │                       │
│                    │  (FastAPI)     │                       │
│                    └───────┬────────┘                       │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐            │
│         │                  │                  │             │
│    ┌────▼─────┐     ┌─────▼──────┐    ┌─────▼──────┐     │
│    │ SQLite   │     │  ML Models │    │ LLM (Ollama)│     │
│    │ Database │     │  (sklearn) │    │ Llama 3.2   │     │
│    └──────────┘     └────────────┘    └─────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Components

1. **`src/frontend/`**: React web application with glassmorphism design, featuring 11 pages for comprehensive PCOS management
2. **`src/backend/`**: FastAPI server handling authentication, data management, and ML/AI integration
3. **`src/mobile/`**: React Native cross-platform mobile app (iOS & Android)
4. **`src/ml-models/`**: Machine learning models and LLM fine-tuning workspace
5. **`docs/`**: Documentation, diagrams, and screenshots
6. **`scripts/`**: Utility scripts for easy startup and deployment

---

## 🔄 Complete System Pipeline

### End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐              ┌──────────────────┐                    │
│  │  Web Frontend    │              │  Mobile App      │                    │
│  │  (React.js)      │              │  (React Native)  │                    │
│  │                  │              │                  │                    │
│  │  • Dashboard     │              │  • Dashboard     │                    │
│  │  • Chat UI       │              │  • Chat Screen   │                    │
│  │  • Logs          │              │  • Logs          │                    │
│  │  • Cycle Tracker │              │  • Cycle Tracker │                    │
│  │  • Prediction    │              │  • Profile       │                    │
│  │  • Profile       │              │  • Auth Screens  │                    │
│  └────────┬─────────┘              └────────┬─────────┘                    │
│           │                                  │                               │
│           └──────────────┬───────────────────┘                               │
│                          │                                                   │
│                          │ HTTP/REST API                                     │
│                          │ (JSON)                                            │
│                          ▼                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    ┌──────────────────────────┐                             │
│                    │   FastAPI Application    │                             │
│                    │   (main.py)              │                             │
│                    │                          │                             │
│                    │   • CORS Middleware      │                             │
│                    │   • JWT Authentication   │                             │
│                    │   • Request Validation   │                             │
│                    │   • Error Handling       │                             │
│                    └────────────┬─────────────┘                             │
│                                 │                                            │
│                                 │ Route to Handlers                          │
│                                 ▼                                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          ROUTING LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ /auth        │  │ /logs        │  │ /chat        │  │ /prediction  │  │
│  │ (auth.py)    │  │ (logs.py)    │  │ (chat.py)    │  │(prediction.py)│  │
│  │              │  │              │  │              │  │              │  │
│  │ • register   │  │ • create_log │  │ • send_msg   │  │ • predict    │  │
│  │ • login      │  │ • get_logs   │  │ • history    │  │ • risk_score │  │
│  │ • verify_otp │  │ • get_by_id  │  │ • models     │  │              │  │
│  │ • refresh    │  │ • delete     │  │ • clear      │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │                  │           │
│         ▼                  ▼                  ▼                  ▼           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ Auth Service     │  │ LLM Service      │  │ Translation      │         │
│  │ (auth.py)        │  │ (llm_service.py) │  │ Service          │         │
│  │                  │  │                  │  │(translation_     │         │
│  │ • JWT tokens     │  │ • Model mgmt     │  │ service.py)      │         │
│  │ • Password hash  │  │ • Prompt eng     │  │                  │         │
│  │ • User validation│  │ • Context build  │  │ • Google         │         │
│  └────────┬─────────┘  │ • Response gen   │  │   Translate      │         │
│           │            │ • Off-topic det  │  │ • Preserve terms │         │
│           │            └────────┬─────────┘  │ • Clean output   │         │
│           │                     │            └────────┬─────────┘         │
│           │                     │                     │                    │
│           │                     │                     │                    │
│  ┌────────▼─────────┐  ┌────────▼─────────┐  ┌──────▼──────────┐         │
│  │ OTP Service      │  │ Model Selector   │  │ Text Processing │         │
│  │ (otp_service.py) │  │                  │  │                  │         │
│  │                  │  │ • Ollama Base    │  │ • Emoji removal  │         │
│  │ • Email sending  │  │ • Fine-tuned     │  │ • RTL detection  │         │
│  │ • Code generation│  │ • Gemma          │  │ • Formatting     │         │
│  │ • Verification   │  │ • Mistral        │  │                  │         │
│  └──────────────────┘  │ • Llama2         │  └──────────────────┘         │
│                        └──────────────────┘                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA & MODEL LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ Database Layer   │  │ ML Models        │  │ LLM Engine       │         │
│  │ (database.py)    │  │ (sklearn)        │  │ (Ollama)         │         │
│  │                  │  │                  │  │                  │         │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │         │
│  │ │ SQLAlchemy   │ │  │ │ KNN          │ │  │ │ Llama 3.2    │ │         │
│  │ │ ORM          │ │  │ │ Decision Tree│ │  │ │ 1B Instruct  │ │         │
│  │ └──────────────┘ │  │ │ Logistic Reg │ │  │ │ (Q8_0 GGUF)  │ │         │
│  │                  │  │ │ Naive Bayes  │ │  │ └──────────────┘ │         │
│  │ ┌──────────────┐ │  │ └──────────────┘ │  │                  │         │
│  │ │ Models       │ │  │                  │  │ ┌──────────────┐ │         │
│  │ │ (models.py)  │ │  │ ┌──────────────┐ │  │ │ Fine-tuned   │ │         │
│  │ │              │ │  │ │ Saved Model  │ │  │ │ PCOS Model   │ │         │
│  │ │ • User       │ │  │ │ (pcos_model  │ │  │ │ (Modelfile)  │ │         │
│  │ │ • DailyLog   │ │  │ │  .pkl)       │ │  │ └──────────────┘ │         │
│  │ │ • ChatMsg    │ │  │ └──────────────┘ │  │                  │         │
│  │ │ • OTPCode    │ │  │                  │  │ ┌──────────────┐ │         │
│  │ └──────────────┘ │  │ ┌──────────────┐ │  │ │ System       │ │         │
│  │                  │  │ │ Training     │ │  │ │ Prompts      │ │         │
│  │ ┌──────────────┐ │  │ │ Pipeline     │ │  │ │              │ │         │
│  │ │ SQLite DB    │ │  │ │              │ │  │ │ • English    │ │         │
│  │ │ (pcos_       │ │  │ │ • Data clean │ │  │ │ • Urdu       │ │         │
│  │ │  tracker.db) │ │  │ │ • Feature eng│ │  │ │ • Medical    │ │         │
│  │ └──────────────┘ │  │ │ • Model eval │ │  │ │   disclaimers│ │         │
│  │                  │  │ └──────────────┘ │  │ └──────────────┘ │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ Google Translate │  │ Email Service    │  │ Web Speech API   │         │
│  │ API              │  │ (SMTP)           │  │ (Browser)        │         │
│  │                  │  │                  │  │                  │         │
│  │ • English→Urdu   │  │ • OTP delivery   │  │ • Speech-to-Text │         │
│  │ • Term preserve  │  │ • Verification   │  │ • Text-to-Speech │         │
│  │ • googletrans    │  │ • Notifications  │  │ • Voice input    │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Module Interaction Flow

### 1. User Authentication Flow
```
User Input → /auth/register → Auth Service → Password Hash → Database
                                    ↓
                              OTP Service → Email → User Verification
                                    ↓
                              /auth/verify → JWT Token → Client Storage
```

### 2. Symptom Logging Flow
```
User Input → /logs/create → Validation (schemas.py) → Database (DailyLog)
                                    ↓
                              Response → Frontend Update → Dashboard Refresh
```

### 3. AI Chat Flow (with Urdu Translation)
```
User Message → /chat/ → LLM Service
                            ↓
                    ┌───────┴────────┐
                    │                │
            Off-topic Check    User Context
                    │          (from DB)
                    ↓                ↓
            System Prompt Generation
                    ↓
            Model Selection (Ollama)
                    ↓
            Response Generation
                    ↓
            ┌───────┴────────┐
            │                │
    translate_to_urdu?   English Response
            │                │
            ↓                │
    Translation Service      │
    (Google Translate)       │
            │                │
            └────────┬───────┘
                     ↓
            Medical Disclaimer
                     ↓
            Response → Client
                     ↓
            ┌────────┴────────┐
            │                 │
    Voice Output      Display (RTL if Urdu)
    (Text-to-Speech)
```

### 4. PCOS Prediction Flow
```
User Symptoms → /prediction/predict → Feature Extraction
                                            ↓
                                    Load ML Model (pcos_model.pkl)
                                            ↓
                                    Model Inference
                                            ↓
                                    Risk Score Calculation
                                            ↓
                                    Response with Recommendations
```

### 5. Voice Interaction Flow
```
User Clicks Mic → Web Speech API → Speech Recognition
                                            ↓
                                    Transcript → Input Field
                                            ↓
                                    User Sends → Chat Flow
                                            ↓
                                    Response Received
                                            ↓
                                    User Clicks Listen
                                            ↓
                                    Text-to-Speech (Urdu/English)
                                            ↓
                                    Audio Output (Emoji-filtered)
```

---

## 🗂️ Module Dependencies

### Frontend Dependencies
```
React Application
├── react-router-dom     → Navigation
├── axios                → API calls
├── tailwindcss          → Styling
├── lucide-react         → Icons
└── react-hot-toast      → Notifications
```

### Backend Dependencies
```
FastAPI Application
├── fastapi              → Web framework
├── sqlalchemy           → ORM
├── pydantic             → Validation
├── python-jose          → JWT
├── passlib              → Password hashing
├── googletrans          → Translation
├── scikit-learn         → ML models
├── requests             → HTTP client (Ollama)
└── python-multipart     → File uploads
```

### Mobile Dependencies
```
React Native Application
├── @react-navigation    → Navigation
├── axios                → API calls
├── @react-native-async-storage → Local storage
└── react-native-vector-icons → Icons
```

### ML/AI Dependencies
```
Machine Learning Pipeline
├── pandas               → Data processing
├── numpy                → Numerical operations
├── scikit-learn         → ML algorithms
├── matplotlib           → Visualization
└── jupyter              → Notebooks

LLM Pipeline
├── ollama               → LLM inference
└── llama-3.2-1b         → Base model (GGUF)
```

---

## 📁 Project Structure

```
ovula/
│
├── 📂 src/                             # Source code
│   │
│   ├── 📂 frontend/                    # React Web Application
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   └── ovula-logo.png
│   │   ├── src/
│   │   │   ├── components/             # Reusable components
│   │   │   │   └── Sidebar.js
│   │   │   ├── contexts/               # React contexts
│   │   │   │   └── AuthContext.js
│   │   │   ├── pages/                  # Application pages
│   │   │   │   ├── Login.js
│   │   │   │   ├── Register.js
│   │   │   │   ├── VerifyEmail.js
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── AddLog.js
│   │   │   │   ├── LogsHistory.js
│   │   │   │   ├── CycleTracker.js
│   │   │   │   ├── Chat.js
│   │   │   │   ├── PCOSPrediction.js
│   │   │   │   ├── Insights.js
│   │   │   │   └── Profile.js
│   │   │   ├── App.js
│   │   │   ├── index.js
│   │   │   └── index.css
│   │   ├── package.json
│   │   └── tailwind.config.js
│   │
│   ├── 📂 backend/                     # FastAPI Backend
│   │   ├── app/
│   │   │   ├── models/
│   │   │   │   └── chat.py
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   │   └── llm_service.py
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   ├── routers/
│   │   │   ├── auth.py                 # Authentication routes
│   │   │   ├── logs.py                 # Symptom log routes
│   │   │   ├── prediction.py           # ML prediction routes
│   │   │   ├── insights.py             # AI insights routes
│   │   │   └── chat.py                 # Chat routes
│   │   ├── main.py                     # App entry point
│   │   ├── models.py                   # Database models
│   │   ├── schemas.py                  # Pydantic schemas
│   │   ├── database.py                 # DB connection
│   │   ├── auth.py                     # Auth helpers
│   │   ├── otp_service.py              # Email OTP logic
│   │   ├── database_schema.sql         # SQL schema reference
│   │   ├── pcos_tracker.db             # SQLite database
│   │   ├── .env                        # Environment variables
│   │   └── requirements.txt
│   │
│   ├── 📂 mobile/                      # React Native App
│   │   ├── src/
│   │   │   ├── screens/                # App screens
│   │   │   │   ├── LoginScreen.js
│   │   │   │   ├── RegisterScreen.js
│   │   │   │   ├── VerifyEmailScreen.js
│   │   │   │   ├── DashboardScreen.js
│   │   │   │   ├── AddLogScreen.js
│   │   │   │   ├── LogsHistoryScreen.js
│   │   │   │   ├── CycleTrackerScreen.js
│   │   │   │   ├── ChatScreen.js
│   │   │   │   └── ProfileScreen.js
│   │   │   ├── navigation/             # Navigation setup
│   │   │   ├── contexts/               # Auth context
│   │   │   ├── services/               # API services
│   │   │   ├── components/             # Shared components
│   │   │   └── styles/                 # Global styles
│   │   ├── android/                    # Android native
│   │   ├── ios/                        # iOS native
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── 📂 ml-models/                   # Machine Learning & AI
│       ├── Modelfile                   # Primary fine-tuned Modelfile
│       ├── Modelfile_PCOS              # PCOS-specific tuning config
│       ├── Modelfile_Base_PCOS         # Base model for comparison
│       ├── llama-3.2-1b-instruct.Q8_0.gguf  # Quantized base model
│       └── finetune_pcos_model.ipynb   # Training notebook
│
├── 📂 docs/                            # Documentation & Assets
│   ├── ovula-logo.png
│   ├── pcos_poster.png
│   ├── pcos_detailed_uml.png
│   ├── pcos_er_diagram.png
│   ├── pcos_class_diagram.png
│   ├── llm_workflow_detailed_diagram.png
│   ├── prediction_workflow_detailed_diagram.png
│   └── screenshots/                    # App screenshots
│       ├── dashboard.png
│       ├── chat.png
│       ├── add-log.png
│       ├── cycle-tracker.png
│       ├── login.png
│       └── register.png
│
├── 📂 scripts/                         # Utility Scripts
│   ├── start_backend.sh                # Backend startup script
│   └── start_frontend.sh               # Frontend startup script
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 📸 App Screenshots

<div align="center">

### 🔐 Onboarding & Authentication
_Secure and seamless user onboarding flow_

<table>
  <tr>
    <td width="33%"><img src="docs/screenshots/login.png" alt="Login"/><br/><p align="center"><b>Login</b></p></td>
    <td width="33%"><img src="docs/screenshots/signup.png" alt="Register"/><br/><p align="center"><b>Sign Up</b></p></td>
    <td width="33%"><img src="docs/screenshots/verify_email.png" alt="Verify Email"/><br/><p align="center"><b>OTP Verification</b></p></td>
  </tr>
</table>

### 🏠 Dashboard & Health Overview
_Personalized insights and quick actions at a glance_

<img src="docs/screenshots/dashboard.png" alt="Dashboard" width="100%"/>
<p align="center"><em>Main Dashboard showing cycle progress, quick stats, and AI insights</em></p>

### 🌸 PCOS Care & Management
_In-depth tracking and specialized care tools_

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/pcos_care_1.png" alt="Hormonal Summary"/><br/><p align="center"><b>Hormonal Summary</b></p></td>
    <td width="50%"><img src="docs/screenshots/pcos_care_2.png" alt="Symptom Trends"/><br/><p align="center"><b>Symptom Trends</b></p></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/screenshots/pcos_care_3.png" alt="Health Resources"/><br/><p align="center"><b>Specialized Health Resources</b></p></td>
  </tr>
</table>

### 💬 AI Assistant (Multi-lingual)
_Conversational healthcare support in English and Urdu_

<img src="docs/screenshots/ai_assistant_urdu.png" alt="AI Assistant Urdu" width="100%"/>
<p align="center"><em>AI Assistant providing localized support with Urdu translation</em></p>

### 📅 Cycle Tracker & Insights
_Detailed menstrual health tracking and predictions_

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/calendar.png" alt="Cycle Calendar"/><br/><p align="center"><b>Cycle Calendar</b></p></td>
    <td width="50%"><img src="docs/screenshots/calendar_insights.png" alt="Cycle Insights"/><br/><p align="center"><b>Health Insights</b></p></td>
  </tr>
</table>

### 👤 User Profile & Settings
_Manage your health profile and app preferences_

<img src="docs/screenshots/profile.png" alt="Profile" width="100%"/>
<p align="center"><em>Comprehensive user profile with health goals and privacy settings</em></p>

</div>

---

## 🚀 Quick Start

### Prerequisites

**For Local Development:**
- Python 3.8+
- Node.js 18+
- [Ollama](https://ollama.ai/) installed and running (or use Groq API)
- Android Studio or Xcode for mobile development

**For Cloud Deployment (FREE):**
- GitHub account
- Railway account (backend hosting)
- Vercel account (frontend hosting)
- Groq API key (free LLM API)
- Gmail account (for OTP emails)

📚 **See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for 5-minute cloud deployment guide!**

### 1. Clone the Repo

```bash
git clone https://github.com/hashirch/ovula.git
cd ovula
```

### 2. Start the Backend

```bash
# Using the startup script (recommended)
./scripts/start_backend.sh
```

Or manually:

```bash
cd src/backend
pip install -r requirements.txt
# Copy .env.example to .env and fill in values
python main.py
```

Backend runs at `http://localhost:8000` — API docs at `http://localhost:8000/docs`.

**Note:** The backend includes Urdu translation support using Google Translate (`googletrans==4.0.0rc1`).

### 3. Run the Web Frontend

```bash
# Using the startup script (recommended)
./scripts/start_frontend.sh
```

Or manually:

```bash
cd src/frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

### 4. Run the Mobile App

```bash
cd src/mobile
npm install
npx react-native run-android   # or run-ios
```

### 5. Set Up the LLM

```bash
# Pull and create the fine-tuned model
ollama create pcos-llama -f src/ml-models/Modelfile_PCOS

# Test it
ollama run pcos-llama "What are the early signs of PCOS?"
```

---

## 🔬 LLM Fine-Tuning

We used Ollama with a locally quantized Llama 3.2 1B model (Q8_0) as our base. Fine-tuning was done by writing custom Modelfiles with PCOS-specific system prompts, behavioral constraints, and training parameters.

Three Modelfiles exist for comparison:

- `Modelfile_Base_PCOS` — base Llama with minimal PCOS context (baseline)
- `Modelfile_PCOS` — PCOS-specialized system prompt
- `Modelfile` — final tuned version used in production

```bash
# Create all three for comparison
ollama create pcos-base -f src/ml-models/Modelfile_Base_PCOS
ollama create pcos-v1   -f src/ml-models/Modelfile_PCOS
ollama create pcos      -f src/ml-models/Modelfile
```

---

## 🤖 ML Prediction Models

The `/prediction` backend route uses the best-performing classical ML model for PCOS risk scoring. We trained and evaluated four models:

| Model               | Notes                                      |
| ------------------- | ------------------------------------------ |
| K-Nearest Neighbors | Solid baseline, good on smaller datasets   |
| Decision Tree       | Interpretable, fast inference              |
| Logistic Regression | Lightweight, reliable                      |
| Naive Bayes         | Fast, works well with independent features |

`train_best_model.py` evaluates all four and saves the best-performing one for use in the API.

---

## 🚀 Cloud Deployment (FREE)

Deploy your Ovula app to production in minutes using free cloud services!

### Quick Deploy (5 minutes)

1. **Get API Keys**
   - Groq API: https://console.groq.com/ (free LLM API)
   - Gmail App Password: Google Account → Security → App Passwords

2. **Deploy Backend to Railway**
   - Push code to GitHub
   - Go to Railway.app → New Project → Deploy from GitHub
   - Add PostgreSQL database
   - Configure environment variables (see `.env.example`)

3. **Deploy Frontend to Vercel**
   - Go to Vercel.com → New Project → Import from GitHub
   - Set root directory: `src/frontend`
   - Add environment variable: `REACT_APP_API_URL`

4. **Test Your Deployment**
   - Visit your Vercel URL
   - Register, verify email, and test features

### 📚 Deployment Documentation

- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - 5-minute quick start guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide
- **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** - Step-by-step checklist
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Overview and architecture
- **[.env.example](.env.example)** - Environment variables template

### 💰 Cost: $0/month

All services used are free:
- Railway: $5 credit/month (backend + database)
- Vercel: Unlimited (frontend hosting)
- Groq: 30 req/min (LLM API)
- Gmail: Unlimited (OTP emails)

### 🏗️ Deployment Architecture

```
Frontend (Vercel) → Backend (Railway) → PostgreSQL (Railway)
                                      → Groq LLM API
```

---

## ⚠️ Disclaimer

Ovula is a research and educational project. The AI responses and PCOS risk scores are **not a substitute for professional medical advice**. Always consult a qualified healthcare provider for any health concerns.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Shahzeb Khan** — project supervisor
- **FAST NUCES Peshawar** — resources and infrastructure
- **Meta AI** — Llama 3.2 model
- **Ollama** — local LLM inference platform
- **Groq** — cloud LLM API for deployment
- **Hugging Face** — model tooling and ecosystem

---

<div align="center">

**Made with ❤️ by the Ovula team at FAST NUCES Peshawar**

**[⬆ Back to Top](#-ovula)**

</div>
