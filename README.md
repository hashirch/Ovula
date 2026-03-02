<div align="center">

# 🌸 Ovula

### Fine-Tuned LLM for PCOS Healthcare Domain

*Domain-Specific Language Model Fine-Tuning with Real-World Application*

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-ee4c2c.svg)](https://pytorch.org/)
[![Transformers](https://img.shields.io/badge/🤗_Transformers-4.30+-yellow.svg)](https://huggingface.co/transformers/)
[![Ollama](https://img.shields.io/badge/Ollama-LLM-black.svg)](https://ollama.ai/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Research Focus](#-research-focus) • [Fine-Tuning](#-fine-tuning-methodology) • [Evaluation](#-model-evaluation) • [Demo App](#-demonstration-application)

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
<td>Final Year Project (FYP) - Machine Learning & NLP</td>
</tr>
<tr>
<td><strong>🔬 Research Area</strong></td>
<td>Domain-Specific LLM Fine-Tuning for Healthcare</td>
</tr>
<tr>
<td><strong>👨‍🏫 Supervisor</strong></td>
<td>Shahzeb Khan</td>
</tr>
</table>

### 👥 Research Team

| Name | Registration Number | GitHub |
|------|---------------------|--------|
| **Muhammad Hashir** | 22P-9181 | [@hashirch](https://github.com/hashirch) |
| **Laraib Shahid Abbasi** | 22P-0503 | [@laraib]() |
| **Arooba Gohar** | 22P-9216 | [@uroobagh123](https://github.com/uroobagh123) |

---

## 🔬 Research Focus

### Problem Statement

General-purpose Large Language Models (LLMs) like Llama 3, GPT, and Gemma lack specialized knowledge in specific healthcare domains. When queried about PCOS (Polycystic Ovary Syndrome), these models provide generic responses that may not address the nuanced medical, lifestyle, and emotional aspects of the condition.

### Research Objective

**To fine-tune open-source LLMs on domain-specific PCOS data and evaluate their performance against base models in providing accurate, contextual, and empathetic healthcare guidance.**

### Key Research Questions

1. How does fine-tuning improve response quality for domain-specific medical queries?
2. What is the optimal dataset size and composition for healthcare domain adaptation?
3. Can fine-tuned models maintain general knowledge while specializing in PCOS?
4. How do different fine-tuning techniques (LoRA, full fine-tuning) compare in this domain?

### Hypothesis

Fine-tuning LLMs on curated PCOS-specific datasets will significantly improve:
- Medical accuracy in PCOS-related responses
- Contextual understanding of symptoms and treatments
- Empathetic and supportive communication
- Practical lifestyle and dietary recommendations

---

## 🎯 Project Contributions

### 1. Domain-Specific Dataset Creation
- **7 curated JSONL datasets** with PCOS-specific Q&A pairs
- Covers: symptoms, diagnosis, treatments, lifestyle, diet, mental health
- Multiple dataset sizes for experimentation (concise to comprehensive)
- Total: 50,000+ tokens of specialized medical content

### 2. Multi-Model Fine-Tuning Pipeline
- **Base Models**: Llama 3 (8B), Gemma 2, Mistral
- **Fine-Tuning Methods**: 
  - Full fine-tuning with Ollama
  - LoRA (Low-Rank Adaptation) for efficient training
  - Parameter-efficient fine-tuning (PEFT)
- **Training Infrastructure**: Local GPU training with Ollama

### 3. RAG (Retrieval-Augmented Generation) Integration
- Vector embeddings for PCOS knowledge base
- Document retrieval for context-aware responses
- Hybrid approach: Fine-tuned model + RAG

### 4. Real-World Demonstration Application
- Full-stack web application to showcase model capabilities
- User interaction logging for model evaluation
- A/B testing framework for base vs fine-tuned models
- Performance metrics collection (response time, accuracy, user satisfaction)

---

## � Dataset Overview

### Training Data Structure

```
data/
├── pcos_dataset.jsonl                    # Base training set
├── pcos_comprehensive_dataset.jsonl      # Extended training set
├── pcos_training_complete.jsonl          # Complete training corpus
├── concise_training_dataset.jsonl        # Concise version
├── OnlyPCOS.json                         # PCOS-specific data
├── allData.json                          # Complete dataset
└── clean_data.json                       # Cleaned and validated data
```

### Dataset Statistics

| Dataset | Size | Q&A Pairs | Tokens | Use Case |
|---------|------|-----------|--------|----------|
| Concise | 50 KB | 100+ | 10K+ | Quick experiments |
| Base | 200 KB | 500+ | 40K+ | Standard training |
| Comprehensive | 500 KB | 1000+ | 100K+ | Full fine-tuning |
| Complete | 1 MB | 2000+ | 200K+ | Maximum performance |

### Data Categories

- **Symptoms & Diagnosis** (30%): Irregular periods, acne, weight gain, hair loss
- **Treatment Options** (25%): Medications, hormonal therapy, supplements
- **Lifestyle & Diet** (20%): Exercise, nutrition, weight management
- **Mental Health** (15%): Anxiety, depression, emotional support
- **Fertility & Pregnancy** (10%): Conception, pregnancy management

---

## 🔧 Fine-Tuning Methodology

### Approach 1: Ollama Fine-Tuning (Recommended)

```bash
# 1. Create Modelfile
cat > Modelfile <<EOF
FROM llama3
PARAMETER temperature 0.7
PARAMETER top_p 0.9
SYSTEM You are a specialized PCOS healthcare assistant...
EOF

# 2. Train the model
ollama create pcos-llama3 -f Modelfile

# 3. Test the model
ollama run pcos-llama3 "What are common PCOS symptoms?"
```

### Approach 2: LoRA Fine-Tuning

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# Load base model
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3-8B")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B")

# Configure LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

# Apply LoRA
model = get_peft_model(model, lora_config)

# Train on PCOS dataset
# ... training code ...
```

### Training Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Learning Rate | 2e-5 | Stable convergence |
| Batch Size | 4 | Memory constraints |
| Epochs | 3-5 | Prevent overfitting |
| Max Length | 512 | Context window |
| LoRA Rank (r) | 16 | Balance efficiency/performance |
| Temperature | 0.7 | Balanced creativity |

---

## 📈 Model Evaluation

### Evaluation Metrics

1. **Perplexity**: Measure model confidence
2. **BLEU Score**: Compare generated vs reference responses
3. **ROUGE Score**: Evaluate response quality
4. **Human Evaluation**: Medical accuracy, empathy, helpfulness
5. **Response Time**: Inference speed comparison

### Comparison Framework

| Model | Perplexity | BLEU | ROUGE-L | Avg Response Time | Medical Accuracy |
|-------|------------|------|---------|-------------------|------------------|
| Llama 3 (Base) | TBD | TBD | TBD | TBD | TBD |
| Llama 3 (Fine-tuned) | TBD | TBD | TBD | TBD | TBD |
| Gemma 2 (Base) | TBD | TBD | TBD | TBD | TBD |
| Gemma 2 (Fine-tuned) | TBD | TBD | TBD | TBD | TBD |

*Note: Fill in metrics after training and evaluation*

### Sample Comparison

**Query**: "I have irregular periods and acne. Could this be PCOS?"

**Base Model Response**:
> "Irregular periods and acne can have many causes. You should consult a doctor for proper diagnosis."

**Fine-Tuned Model Response**:
> "Irregular periods and acne are indeed common PCOS symptoms. PCOS affects 1 in 10 women and often presents with hormonal imbalances. I recommend consulting an endocrinologist or gynecologist who can perform blood tests (checking androgen levels, insulin resistance) and an ultrasound. In the meantime, maintaining a balanced diet and regular exercise can help manage symptoms."

---

## 🏗️ Technology Stack

### Machine Learning & NLP

```
🤖 LLM Framework
├── Ollama                  - Local LLM inference
├── PyTorch                 - Deep learning framework
├── Transformers (Hugging Face) - Model architecture
├── PEFT                    - Parameter-efficient fine-tuning
└── LangChain               - LLM application framework

📊 Data Processing
├── Pandas                  - Data manipulation
├── NumPy                   - Numerical computing
└── JSONL                   - Training data format

🔍 RAG Components
├── ChromaDB                - Vector database
├── Sentence Transformers   - Embeddings
└── FAISS                   - Similarity search
```

### Demonstration Application

```
Backend (FastAPI)
├── Python 3.8+
├── FastAPI                 - Web framework
├── SQLAlchemy              - ORM
├── Pydantic                - Data validation
└── JWT                     - Authentication

Frontend (React)
├── React 18
├── Tailwind CSS
├── Axios
├── Recharts                - Data visualization
└── React Router

Database
└── SQLite                  - User data & logs
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- [Ollama](https://ollama.ai/) installed
- CUDA-capable GPU (recommended for training)
- 16GB+ RAM

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/hashirch/Ovula.git
cd Ovula
```

#### 2. Install Dependencies

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
cd ../frontend
npm install
```

#### 3. Install Ollama Models

```bash
# Pull base models
ollama pull llama3
ollama pull gemma2
ollama pull mistral
```

#### 4. Fine-Tune Your Model

```bash
# Generate training dataset
python scripts/create_training_dataset.py

# Create fine-tuned model
./scripts/create_custom_model.sh
```

#### 5. Run the Application

```bash
# Start all services
./scripts/run_system.sh

# Or start individually:
# Backend: python backend/main.py
# Frontend: cd frontend && npm start
# Ollama: ollama serve
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Ollama**: http://localhost:11434

---

## 🧪 Experimentation Guide

### Experiment 1: Compare Base vs Fine-Tuned

```bash
# Test base model
ollama run llama3 "What causes PCOS?"

# Test fine-tuned model
ollama run pcos-llama3 "What causes PCOS?"

# Compare responses
```

### Experiment 2: Dataset Size Impact

```bash
# Train on concise dataset
python scripts/create_training_dataset.py --dataset concise
./scripts/create_custom_model.sh

# Train on comprehensive dataset
python scripts/create_training_dataset.py --dataset comprehensive
./scripts/create_custom_model.sh

# Compare model performance
```

### Experiment 3: LoRA vs Full Fine-Tuning

```python
# Configure in backend/.env
MODEL_TYPE=ollama_finetuned  # Full fine-tuning
# vs
MODEL_TYPE=lora_pipeline     # LoRA fine-tuning

# Compare training time, memory usage, and performance
```

---

## 📸 Demonstration Application Screenshots

> The web application serves as a real-world testing platform for the fine-tuned models

<div align="center">

### 🏠 Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*User dashboard for tracking PCOS symptoms and health metrics*

### 💬 AI Chatbot Interface
![AI Chat](docs/screenshots/chat.png)
*Interactive chat with fine-tuned PCOS specialist LLM*

### 📝 Symptom Logging
![Add Log](docs/screenshots/add-log.png)
*Daily symptom tracking for model training data collection*

### � Cycle Tracker
![Cycle Tracker](docs/screenshots/cycle-tracker.png)
*Menstrual cycle monitoring with AI-powered predictions*

### 🔐 Authentication
<table>
<tr>
<td width="50%">
<img src="docs/screenshots/login.png" alt="Login Page"/>
<p align="center"><em>Secure user authentication</em></p>
</td>
<td width="50%">
<img src="docs/screenshots/register.png" alt="Register Page"/>
<p align="center"><em>User registration</em></p>
</td>
</tr>
</table>

</div>

---

## 📁 Project Structure

```
ovula/
│
├── 📂 data/                             # Training Datasets (PRIMARY FOCUS)
│   ├── pcos_dataset.jsonl               # Base training data
│   ├── pcos_comprehensive_dataset.jsonl # Extended training data
│   ├── pcos_training_complete.jsonl     # Complete training corpus
│   ├── concise_training_dataset.jsonl   # Concise version
│   ├── OnlyPCOS.json                    # PCOS-specific data
│   ├── allData.json                     # Complete dataset
│   └── clean_data.json                  # Cleaned data
│
├── 📂 scripts/                          # Fine-Tuning Scripts
│   ├── create_training_dataset.py       # Dataset generation
│   ├── create_custom_model.sh           # Ollama fine-tuning
│   ├── generate_concise_dataset.py      # Dataset preprocessing
│   └── run_system.sh                    # Start all services
│
├── 📂 rag/                              # RAG Implementation
│   ├── embeddings.py                    # Vector embeddings
│   └── retriever.py                     # Document retrieval
│
├── 📂 backend/                          # Demo Application Backend
│   ├── 📂 app/
│   │   ├── 📂 services/
│   │   │   └── llm_service.py           # LLM integration (LoRA, Ollama)
│   │   ├── 📂 routes/
│   │   │   └── chat.py                  # Chat API endpoints
│   │   └── config.py                    # Model configuration
│   ├── main.py                          # FastAPI application
│   ├── models.py                        # Database models
│   └── requirements.txt                 # Python dependencies
│
├── 📂 frontend/                         # Demo Application Frontend
│   ├── 📂 src/
│   │   ├── 📂 pages/
│   │   │   ├── Chat.js                  # Chat interface
│   │   │   ├── Dashboard.js             # User dashboard
│   │   │   └── ...
│   │   └── App.js                       # Main component
│   └── package.json                     # Node dependencies
│
├── 📂 docs/                             # Documentation
│   ├── 📂 screenshots/                  # Application screenshots
│   └── SCREENSHOTS_GUIDE.md             # Screenshot guide
│
└── README.md                            # This file
```

---

## � Research Methodology

### Phase 1: Data Collection & Preparation
1. Gather PCOS-related medical information from reliable sources
2. Create Q&A pairs covering various PCOS aspects
3. Validate data with medical professionals (if possible)
4. Format data in JSONL for training

### Phase 2: Model Selection & Baseline
1. Select base models (Llama 3, Gemma 2, Mistral)
2. Establish baseline performance metrics
3. Test base models on PCOS queries
4. Document limitations and gaps

### Phase 3: Fine-Tuning
1. Configure training parameters
2. Fine-tune models using Ollama and LoRA
3. Monitor training metrics (loss, perplexity)
4. Save checkpoints and best models

### Phase 4: Evaluation
1. Quantitative evaluation (BLEU, ROUGE, perplexity)
2. Qualitative evaluation (human assessment)
3. A/B testing in demo application
4. Collect user feedback

### Phase 5: Analysis & Documentation
1. Compare base vs fine-tuned performance
2. Analyze strengths and limitations
3. Document findings and insights
4. Prepare research paper/presentation

---

## 📊 Expected Outcomes

### Quantitative Improvements
- **20-30% reduction** in perplexity on PCOS-specific queries
- **15-25% improvement** in BLEU/ROUGE scores
- **Faster response time** with LoRA (vs full fine-tuning)
- **90%+ medical accuracy** on common PCOS questions

### Qualitative Improvements
- More empathetic and supportive responses
- Better understanding of PCOS-specific terminology
- Contextual awareness of symptom relationships
- Practical, actionable advice

### Research Contributions
- Methodology for healthcare domain LLM fine-tuning
- Curated PCOS dataset for future research
- Comparison of fine-tuning techniques
- Real-world application framework

---

## 🔄 Future Work

### Model Improvements
- [ ] Expand training dataset to 500K+ tokens
- [ ] Multi-lingual support (Urdu, Arabic)
- [ ] Fine-tune larger models (70B parameters)
- [ ] Implement reinforcement learning from human feedback (RLHF)

### Application Enhancements
- [ ] Real-time model performance monitoring
- [ ] Advanced A/B testing framework
- [ ] Integration with wearable devices
- [ ] Telemedicine consultation features

### Research Extensions
- [ ] Publish research paper on findings
- [ ] Extend to other healthcare domains
- [ ] Federated learning for privacy
- [ ] Edge deployment for mobile devices

---

## 📚 References & Resources

### Research Papers
- "LoRA: Low-Rank Adaptation of Large Language Models" (Hu et al., 2021)
- "Fine-tuning Language Models for Healthcare" (Various)
- "Domain-Specific LLM Applications" (Various)

### Tools & Frameworks
- [Ollama Documentation](https://ollama.ai/docs)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [PEFT Library](https://github.com/huggingface/peft)
- [LangChain](https://python.langchain.com/)

### Datasets & Models
- [Meta Llama 3](https://huggingface.co/meta-llama/Meta-Llama-3-8B)
- [Google Gemma](https://huggingface.co/google/gemma-2b)
- [Mistral AI](https://huggingface.co/mistralai/Mistral-7B-v0.1)

---

## � Contributing

We welcome contributions to improve the fine-tuning methodology, expand the dataset, or enhance the evaluation framework!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

### Areas for Contribution
- Additional PCOS training data
- Improved evaluation metrics
- Alternative fine-tuning approaches
- Documentation improvements

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Academic Support
- **FAST NUCES Peshawar** for providing resources and infrastructure
- **Shahzeb Khan** for supervision and guidance
- Faculty members for technical support

### Technical Resources
- **Ollama** for local LLM inference platform
- **Hugging Face** for model hosting and tools
- **Meta AI** for Llama 3 model
- **Google** for Gemma model
- Open-source community for various tools and libraries

### Medical Expertise
- Healthcare professionals who validated PCOS information
- Online medical resources and research papers

---

## 📧 Contact & Support

### Research Team

- **Muhammad Hashir**: hashir.22pwbcsf9181@student.nu.edu.pk
- **Laraib Shahid Abbasi**: laraib.22pwbcsf0503@student.nu.edu.pk
- **Arooba Gohar**: arooba.22pwbcsf9216@student.nu.edu.pk

### Getting Help

- 📖 Check the [Documentation](#-quick-start)
- � Report issues via GitHub Issues
- 💬 Contact the team via email
- 📧 Reach out to supervisor: Shahzeb Khan

---

## ⚠️ Disclaimer

**Important**: This research project is for educational and research purposes only. The fine-tuned models are **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult with qualified healthcare providers regarding any medical conditions or concerns.

The models may produce inaccurate or inappropriate responses. Users should verify all medical information with healthcare professionals.

---

<div align="center">

### ⭐ Star this repository if you find our research helpful!

**Made with ❤️ by the Ovula Research Team at FAST NUCES Peshawar**

**[⬆ Back to Top](#-ovula)**

</div>
