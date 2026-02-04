# RAG Document Embedding Implementation
# This is a placeholder implementation for the RAG system

import os
from typing import List
from langchain.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma

class PCOSDocumentProcessor:
    def __init__(self, documents_dir: str = "documents", vector_store_dir: str = "vector_store"):
        self.documents_dir = documents_dir
        self.vector_store_dir = vector_store_dir
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
    
    def load_documents(self) -> List:
        """Load all documents from the documents directory"""
        documents = []
        
        if not os.path.exists(self.documents_dir):
            print(f"Documents directory {self.documents_dir} not found. Creating...")
            os.makedirs(self.documents_dir)
            return documents
        
        for filename in os.listdir(self.documents_dir):
            file_path = os.path.join(self.documents_dir, filename)
            
            try:
                if filename.endswith('.pdf'):
                    loader = PyPDFLoader(file_path)
                    documents.extend(loader.load())
                elif filename.endswith(('.txt', '.md')):
                    loader = TextLoader(file_path)
                    documents.extend(loader.load())
                else:
                    print(f"Skipping unsupported file: {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {e}")
        
        return documents
    
    def process_documents(self):
        """Process documents and create vector store"""
        print("Loading documents...")
        documents = self.load_documents()
        
        if not documents:
            print("No documents found. Please add PCOS-related documents to the documents/ folder.")
            return
        
        print(f"Loaded {len(documents)} documents")
        
        print("Splitting documents into chunks...")
        texts = self.text_splitter.split_documents(documents)
        print(f"Created {len(texts)} text chunks")
        
        print("Creating embeddings and vector store...")
        vector_store = Chroma.from_documents(
            documents=texts,
            embedding=self.embeddings,
            persist_directory=self.vector_store_dir
        )
        
        vector_store.persist()
        print(f"Vector store created and saved to {self.vector_store_dir}")

if __name__ == "__main__":
    processor = PCOSDocumentProcessor()
    processor.process_documents()