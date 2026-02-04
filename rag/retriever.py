# RAG Document Retrieval Implementation
# This is a placeholder implementation for the RAG system

import os
from typing import List
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma

class PCOSDocumentRetriever:
    def __init__(self, vector_store_dir: str = "vector_store"):
        self.vector_store_dir = vector_store_dir
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.vector_store = None
        self._load_vector_store()
    
    def _load_vector_store(self):
        """Load the vector store if it exists"""
        if os.path.exists(self.vector_store_dir):
            try:
                self.vector_store = Chroma(
                    persist_directory=self.vector_store_dir,
                    embedding_function=self.embeddings
                )
                print("Vector store loaded successfully")
            except Exception as e:
                print(f"Error loading vector store: {e}")
                self.vector_store = None
        else:
            print(f"Vector store not found at {self.vector_store_dir}")
            print("Run embeddings.py first to create the vector store")
    
    def get_relevant_documents(self, query: str, top_k: int = 3) -> List:
        """Retrieve relevant documents for a query"""
        if not self.vector_store:
            print("Vector store not available. Returning empty results.")
            return []
        
        try:
            # Perform similarity search
            docs = self.vector_store.similarity_search(query, k=top_k)
            return docs
        except Exception as e:
            print(f"Error retrieving documents: {e}")
            return []
    
    def get_relevant_context(self, query: str, top_k: int = 3) -> str:
        """Get relevant context as a formatted string"""
        docs = self.get_relevant_documents(query, top_k)
        
        if not docs:
            return "No relevant medical information found in knowledge base."
        
        context_parts = []
        for i, doc in enumerate(docs, 1):
            context_parts.append(f"Source {i}:\n{doc.page_content}\n")
        
        return "\n".join(context_parts)

# Global retriever instance
_retriever = None

def get_retriever():
    """Get or create the global retriever instance"""
    global _retriever
    if _retriever is None:
        _retriever = PCOSDocumentRetriever()
    return _retriever

def get_relevant_documents(query: str, top_k: int = 3) -> List:
    """Convenience function to get relevant documents"""
    retriever = get_retriever()
    return retriever.get_relevant_documents(query, top_k)

def get_relevant_context(query: str, top_k: int = 3) -> str:
    """Convenience function to get relevant context"""
    retriever = get_retriever()
    return retriever.get_relevant_context(query, top_k)