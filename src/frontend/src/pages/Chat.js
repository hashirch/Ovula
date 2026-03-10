import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Sparkles, Send, Mic, MicOff, Volume2, PlusCircle, MoreVertical, Trash2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelStatus, setModelStatus] = useState(null);
  const [translateToUrdu, setTranslateToUrdu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    fetchChatHistory();
    fetchModelStatus();
    initializeSpeechRecognition();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize Speech Recognition
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak now');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast.error('No speech detected');
      } else if (event.error === 'audio-capture') {
        toast.error('Microphone not found');
      } else {
        toast.error('Speech recognition error');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  // Start/Stop Voice Input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        toast.error('Could not start speech recognition');
      }
    }
  };

  // Text to Speech using ElevenLabs
  const speakText = async (text) => {
    if (!text) return;

    try {
      // Stop any ongoing speech
      synthRef.current.cancel();
      setIsSpeaking(true);

      // Use ElevenLabs for Urdu, browser TTS for English
      if (translateToUrdu || isUrduText(text)) {
        // Call backend ElevenLabs TTS endpoint
        const response = await axios.post('/speech/tts', 
          { text },
          { responseType: 'blob' }
        );
        
        const audioBlob = response.data;
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          toast.error('Failed to play audio');
        };
        
        await audio.play();
      } else {
        // Use browser's built-in TTS for English
        const cleanText = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]|[✓✗✕✖✘]/gu, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast.error('Failed to generate speech');
    }
  };

  // Stop Speaking
  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const fetchModelStatus = async () => {
    try {
      const response = await axios.get('/chat/models');
      const data = response.data;
      setAvailableModels(data.available_models);
      setModelStatus(data);
      
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
      setMessages(response.data.messages.reverse());
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
        model_type: selectedModel || undefined,
        translate_to_urdu: translateToUrdu
      });
      
      setMessages(prev => {
        const newMessages = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [...newMessages, response.data];
      });

      // Auto-speak removed - only speak when user clicks the button
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
      
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

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-2 last:mb-0">{line}</p>
    ));
  };
  
  const isUrduText = (text) => {
    // Check if text contains Urdu characters (Unicode range U+0600 to U+06FF)
    const urduRegex = /[\u0600-\u06FF]/;
    return urduRegex.test(text);
  };

  const suggestedQuestions = [
    "What are the main symptoms of PCOS?",
    "How can I manage PCOS through diet?",
    "What exercises are best for PCOS?",
    "How does sleep affect PCOS symptoms?"
  ];

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500"></div>
          <p className="text-pink-600 font-semibold">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full p-6 gap-6">
      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-xl overflow-hidden border border-pink-100 h-[calc(100vh-3rem)]">
        
        {/* Chat Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none text-slate-900">Ovula AI Assistant</h2>
              <p className="text-sm text-pink-500 font-medium mt-1">Online & analyzing your data</p>
            </div>
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-200">
              <input
                type="checkbox"
                checked={translateToUrdu}
                onChange={(e) => setTranslateToUrdu(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-slate-700">اردو</span>
            </label>
            {messages.length > 0 && (
              <button 
                onClick={clearHistory}
                className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-white to-pink-50/30">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-pink-100 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome to your AI Assistant!
              </h3>
              <p className="text-slate-600 mb-8 max-w-md">
                I'm here to help you understand PCOS better and provide personalized guidance based on your tracking data.
              </p>
              
              <div className="max-w-2xl w-full">
                <p className="text-sm font-semibold text-slate-700 mb-4">Try asking me:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="text-left p-4 glass-card rounded-2xl text-sm text-slate-700 hover:bg-white transition-all border border-pink-100"
                    >
                      "{question}"
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl max-w-2xl">
                <p className="text-xs text-yellow-800">
                  <strong>Disclaimer:</strong> This AI assistant provides general information and is not a substitute for professional medical advice.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  {/* User Message */}
                  <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border-2 border-white shadow-md mt-auto">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-sm bg-white text-slate-800 rounded-br-none border border-slate-100">
                      {msg.message}
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-pink-500 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-pink-200 mt-auto">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className={`rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-sm bg-pink-50 text-slate-800 rounded-bl-none border border-pink-100 ${isUrduText(msg.response) ? 'text-right' : ''}`} dir={isUrduText(msg.response) ? 'rtl' : 'ltr'}>
                      <div className="whitespace-pre-wrap">{formatMessage(msg.response)}</div>
                      <div className="mt-3 pt-3 border-t border-pink-200 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span>{new Date(msg.created_at).toLocaleString()}</span>
                          {msg.response_time && <span>({msg.response_time}s)</span>}
                        </div>
                        <button
                          onClick={() => speakText(msg.response)}
                          className="p-1.5 rounded-full hover:bg-pink-100 text-pink-500 transition-colors flex items-center gap-1"
                          title="Read aloud"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="text-xs">Listen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-4 max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-pink-500 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-pink-200">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="rounded-3xl px-6 py-4 bg-pink-50 border border-pink-100">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-200 border-t-pink-500"></div>
                      <span className="text-sm text-slate-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-pink-50">
          <form onSubmit={sendMessage} className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <input 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                className="w-full bg-white border border-pink-200 rounded-full py-4 pl-14 pr-28 text-[15px] text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-100 focus:border-pink-300 outline-none transition-all shadow-sm" 
                placeholder="Ask Ovula anything..." 
                type="text"
                disabled={loading}
              />
              <button 
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-500 transition-colors"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <button 
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-full transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-slate-400 hover:text-pink-500 hover:bg-pink-50'
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                {isSpeaking && (
                  <button 
                    type="button"
                    onClick={stopSpeaking}
                    className="p-2 rounded-full text-pink-500 hover:bg-pink-50 transition-all animate-pulse"
                    title="Stop speaking"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="w-14 h-14 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30 hover:bg-pink-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-6 h-6 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
