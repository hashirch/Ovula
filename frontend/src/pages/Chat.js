import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Send, Bot, User, Trash2, Loader, Settings, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelStatus, setModelStatus] = useState(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
    fetchModelStatus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchModelStatus = async () => {
    try {
      const response = await axios.get('/chat/models');
      const data = response.data;
      setAvailableModels(data.available_models);
      setModelStatus(data);
      
      // Set default model to first available
      const defaultModel = data.available_models.find(m => m.available);
      if (defaultModel && !selectedModel) {
        setSelectedModel(defaultModel.type);
      }
    } catch (error) {
      console.error('Error fetching model status:', error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get('/chat/history?limit=50');
      setMessages(response.data.messages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message to UI immediately
    const tempUserMessage = {
      id: Date.now(),
      message: userMessage,
      response: '',
      created_at: new Date().toISOString(),
      isUser: true
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await axios.post('/chat/', { 
        message: userMessage,
        model_type: selectedModel || undefined
      });
      
      // Replace temp message with actual response
      setMessages(prev => {
        const newMessages = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [...newMessages, response.data];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) {
      return;
    }

    try {
      await axios.delete('/chat/history');
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (error) {
      toast.error('Failed to clear chat history');
    }
  };

  const testModel = async (modelType) => {
    try {
      setLoading(true);
      const response = await axios.post('/chat/test-model', {
        model_type: modelType,
        test_message: "What is PCOS?"
      });
      
      if (response.data.success) {
        toast.success(`${modelType} model test successful (${response.data.response_time}s)`);
      } else {
        toast.error(`${modelType} model test failed`);
      }
    } catch (error) {
      toast.error(`Failed to test ${modelType} model`);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text
      .split('\n')
      .map((line, index) => (
        <p key={index} className={line.trim() === '' ? 'mb-2' : 'mb-1'}>
          {line}
        </p>
      ));
  };

  const getModelIcon = (modelType) => {
    switch (modelType) {
      case 'ollama_finetuned':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'lora_pipeline':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Bot className="h-4 w-4 text-blue-500" />;
    }
  };

  const getModelBadge = (modelUsed) => {
    const model = availableModels.find(m => m.type === modelUsed);
    if (!model) return null;
    
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
        {getModelIcon(model.type)}
        <span>{model.name}</span>
      </span>
    );
  };

  const suggestedQuestions = [
    "What are the main symptoms of PCOS?",
    "How can I manage PCOS through diet?",
    "What exercises are best for PCOS?",
    "How does sleep affect PCOS symptoms?",
    "Can you explain insulin resistance in PCOS?",
    "What supplements might help with PCOS?"
  ];

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI PCOS Assistant</h1>
          {modelStatus && (
            <span className="text-sm text-gray-500">
              ({availableModels.filter(m => m.available).length} models available)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Models</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="btn-secondary flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Model Selector */}
      {showModelSelector && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Select AI Model:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {availableModels.map((model) => (
              <div
                key={model.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedModel === model.type
                    ? 'border-primary-500 bg-primary-50'
                    : model.available
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                }`}
                onClick={() => model.available && setSelectedModel(model.type)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getModelIcon(model.type)}
                    <span className="font-medium text-sm">{model.name}</span>
                  </div>
                  {model.available && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testModel(model.type);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      disabled={loading}
                    >
                      Test
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600">{model.description}</p>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    model.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {model.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to your Enhanced PCOS AI Assistant!
              </h3>
              <p className="text-gray-600 mb-6">
                I'm powered by advanced AI models specialized for PCOS guidance. 
                I can provide personalized suggestions based on your tracking data.
              </p>
              
              {/* Model Status */}
              {selectedModel && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Currently using:</p>
                  {getModelBadge(selectedModel)}
                </div>
              )}
              
              {/* Suggested Questions */}
              <div className="max-w-2xl mx-auto">
                <p className="text-sm font-medium text-gray-700 mb-3">Try asking me:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      "{question}"
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> This AI assistant provides general information and is not a substitute for professional medical advice. 
                  Always consult with healthcare professionals for personalized medical guidance.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="flex items-start space-x-2 max-w-3xl">
                      <div className="bg-primary-600 text-white rounded-lg px-4 py-2">
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-3xl">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="text-sm text-gray-800">
                          {formatMessage(msg.response)}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{new Date(msg.created_at).toLocaleString()}</span>
                          <div className="flex items-center space-x-2">
                            {msg.model_used && getModelBadge(msg.model_used)}
                            {msg.response_time && (
                              <span>({msg.response_time}s)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <Loader className="h-4 w-4 animate-spin text-gray-600" />
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t p-4">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about PCOS..."
              className="flex-1 input-field"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            {selectedModel && (
              <>Using {availableModels.find(m => m.type === selectedModel)?.name || 'AI Model'} • </>
            )}
            Responses are personalized using your recent tracking data.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;