# RAG Implementation for PCOS Tracking System

## Overview

This directory contains the RAG (Retrieval-Augmented Generation) implementation that enhances the AI chatbot with domain-specific PCOS knowledge.

## Setup (Optional Enhancement)

### Prerequisites
```bash
pip install langchain chromadb sentence-transformers
```

### Implementation Structure

```
rag/
├── documents/          # PCOS guideline documents (PDFs, text files)
├── vector_store/       # ChromaDB vector database
├── embeddings.py       # Document embedding logic
├── retriever.py        # Document retrieval logic
└── integration.py      # Integration with main chat system
```

### How to Add Documents

1. **Place PCOS documents in `documents/` folder:**
   - Medical guidelines (PDF)
   - Research papers (PDF)
   - Treatment protocols (TXT)
   - Dietary guidelines (MD)

2. **Run document processing:**
   ```bash
   python embeddings.py
   ```

3. **Update chat router to use RAG:**
   - Modify `backend/routers/chat.py`
   - Add document retrieval before sending to Ollama

### Example Integration

```python
# In chat.py
from rag.retriever import get_relevant_documents

def create_pcos_prompt(user_message: str, user_context: str) -> str:
    # Get relevant documents
    relevant_docs = get_relevant_documents(user_message, top_k=3)
    
    # Add to prompt
    knowledge_context = "\n".join([doc.page_content for doc in relevant_docs])
    
    system_prompt = f"""You are a PCOS assistant with access to medical guidelines.

    Relevant Medical Information:
    {knowledge_context}

    User Context:
    {user_context}

    User Question: {user_message}
    
    Provide accurate, evidence-based responses using the medical information provided."""
    
    return system_prompt
```

### Benefits of RAG

1. **Accurate Medical Information:** Responses based on actual medical guidelines
2. **Up-to-date Knowledge:** Easy to add new research and guidelines
3. **Source Attribution:** Can cite specific documents
4. **Reduced Hallucination:** Grounded responses in factual content

### Document Sources to Add

- PCOS diagnostic criteria
- Treatment guidelines from medical associations
- Dietary recommendations for PCOS
- Exercise protocols for PCOS management
- Medication information (general, not prescriptive)
- Research papers on PCOS symptoms and management

### Note

This RAG implementation is optional but highly recommended for production use to ensure medical accuracy and reduce AI hallucinations.