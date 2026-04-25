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
  const [useUrdu, setUseUrdu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
    fetchModelStatus();
    initializeSpeechRecognition();
    // Preload voices for TTS
    const loadVoices = () => synthRef.current?.getVoices();
    loadVoices();
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize Speech Recognition (Web Speech API)
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    // Always use en-US so Urdu speech is transcribed as Roman Urdu
    // (e.g. "mujhe PCOS hai" instead of "مجھے پی سی او ایس ہے")
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      finalTranscript = '';
      setIsListening(true);
      toast.success('🎙️ Listening... Speak now', { duration: 2000 });
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setInputMessage((finalTranscript + interim).trim());
    };

    recognition.onerror = (event) => {
      console.error('STT error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Try again.');
      } else if (event.error === 'audio-capture') {
        toast.error('Microphone not found. Check permissions.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Allow it in browser settings.');
      } else if (event.error === 'aborted') {
        // User stopped — no error needed
      } else {
        toast.error(`Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  // Start/Stop Voice Input
  const toggleVoiceInput = async () => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
      if (!recognitionRef.current) {
        toast.error('Speech recognition not supported in this browser');
        return;
      }
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    // Check for Secure Context (HTTPS)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isHttp = window.location.protocol === 'http:';
      const isNotLocal = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      if (isHttp && isNotLocal) {
        toast.error('🎤 Microphone requires HTTPS or a Secure Context on this server. Use a secure connection or see browser settings for insecure origins.', {
          duration: 6000,
          icon: '⚠️'
        });
      } else {
        toast.error('Speech recognition is not supported in this environment.');
      }
      return;
    }

    // Explicitly request mic permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Mic permission denied:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone access denied. Please allow it in your browser settings.');
      } else {
        toast.error('Failed to access microphone. Check if it is plugged in.');
      }
      return;
    }

    try {
      // Reinitialize to force en-US (prevents browser from auto-detecting Urdu script)
      initializeSpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.start();
    } catch (error) {
      recognitionRef.current.stop();
      setTimeout(() => {
        try {
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.start();
        } catch (e) { /* ignore */ }
      }, 200);
    }
  };

  // Text-to-Speech using Backend Edge TTS
  const speakText = async (text, msgId) => {
    if (!text) return;
    
    // Toggle off if same message
    if (isSpeaking && activeMessageId === msgId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    // Clean text: remove markdown, emojis, disclaimers
    let cleanText = text.split('⚠️')[0].trim();
    cleanText = cleanText.replace(/[*#_`~>]/g, '');
    cleanText = cleanText.replace(/\[.*?\]\(.*?\)/g, '');
    cleanText = cleanText.replace(/[\u{1F600}-\u{1F9FF}]/gu, '');
    cleanText = cleanText.trim();

    if (!cleanText) return;

    setIsSpeaking(true);
    setActiveMessageId(msgId);
    
    try {
        const isUrduText = /[\u0600-\u06FF]/.test(cleanText);
        const lang = isUrduText ? 'ur' : 'en';
        
        const response = await axios.post('/chat/tts', {
            text: cleanText,
            lang: lang
        }, {
            responseType: 'blob'
        });
        
        const audioUrl = URL.createObjectURL(response.data);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
            setIsSpeaking(false);
            setActiveMessageId(null);
            URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
            setIsSpeaking(false);
            setActiveMessageId(null);
            toast.error('Failed to play audio');
            URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
    } catch (error) {
        console.error("TTS Error:", error);
        toast.error("Failed to generate speech");
        setIsSpeaking(false);
        setActiveMessageId(null);
    }
  };

  // Stop Speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setActiveMessageId(null);
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

    // Show user message immediately
    const tempId = Date.now();
    const tempUserMsg = {
      id: tempId,
      message: userMessage,
      response: '',
      created_at: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const token = localStorage.getItem('token')
                    || axios.defaults.headers.common['Authorization']?.replace('Bearer ', '')
                    || sessionStorage.getItem('token');

      const apiBase = axios.defaults.baseURL
                      ? axios.defaults.baseURL.replace(/\/$/, '')
                      : '';

      const res = await fetch(
        apiBase + '/chat/stream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMessage,
            model_type: selectedModel || undefined,
            use_urdu: useUrdu,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let finalMeta = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              accumulated += data.token;
              setMessages(prev =>
                prev.map(m =>
                  m.id === tempId
                    ? { ...m, response: accumulated }
                    : m
                )
              );
            }
            if (data.done) {
              finalMeta = { id: data.id, response_time: data.response_time, model_used: data.model_used };
            }
          } catch (_) {}
        }
      }

      // Finalize
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId
            ? {
                ...m,
                id: finalMeta.id || m.id,
                response: accumulated,
                response_time: finalMeta.response_time,
                model_used: finalMeta.model_used,
                isStreaming: false,
              }
            : m
        )
      );

    } catch (error) {
      console.error('Stream error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
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
    if (!text) return null;

    // Handle DeepSeek thinking blocks
    let display_text = text;
    let thinking = null;
    
    if (text.includes('<think>')) {
      if (text.includes('</think>')) {
        const parts = text.split('</think>');
        thinking = parts[0].replace('<think>', '').trim();
        display_text = parts[1].trim();
      } else {
        const parts = text.split('<think>');
        thinking = parts[1].trim();
        display_text = '';
      }
    }
    
    const textWithoutMarkdown = display_text.replace(/[*#_`]/g, '');
    
    return (
      <div className="flex flex-col gap-2">
        {thinking && (
          <div className="mb-2">
            <details className="group">
              <summary className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 cursor-pointer hover:text-slate-500 transition-colors list-none">
                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center group-open:rotate-90 transition-transform">
                  <Zap className="w-2.5 h-2.5" />
                </span>
                {text.includes('</think>') ? 'Reasoning completed' : 'Thinking...'}
              </summary>
              <div className="mt-2 pl-4 border-l-2 border-slate-100 text-xs text-slate-400 italic whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-left-1">
                {thinking}
              </div>
            </details>
          </div>
        )}
        {display_text && textWithoutMarkdown.split('\n').map((line, i) => (
          <p key={i} className="mb-2 last:mb-0" dir={/[\u0600-\u06FF]/.test(line) ? 'rtl' : 'ltr'}>{line}</p>
        ))}
      </div>
    );
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
    <div className="flex h-full p-6 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
              <button
                onClick={() => setUseUrdu(!useUrdu)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  useUrdu 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                اردو
              </button>
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
                  {(msg.response || msg.isStreaming) && (
                    <div className="flex gap-4 max-w-[85%]">
                      <div className="w-10 h-10 rounded-full bg-pink-500 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-pink-200 mt-auto">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-sm bg-pink-50 text-slate-800 rounded-bl-none border border-pink-100">
                        <div className="whitespace-pre-wrap">
                          {msg.response ? formatMessage(msg.response) : null}
                          {msg.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-pink-400 ml-0.5 animate-pulse rounded-sm" />
                          )}
                        </div>
                        {/* Metadata row after streaming is done */}
                        {!msg.isStreaming && (
                        <div className="mt-3 pt-3 border-t border-pink-200 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>{new Date(msg.created_at).toLocaleString()}</span>
                            {msg.response_time && <span>({msg.response_time}s)</span>}
                          </div>
                          <button
                            onClick={() => speakText(msg.response, msg.id)}
                            className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${isSpeaking && activeMessageId === msg.id ? 'bg-pink-100 text-pink-600' : 'hover:bg-pink-100 text-pink-500'}`}
                            title={isSpeaking && activeMessageId === msg.id ? "Stop reading" : "Read aloud"}
                          >
                            <Volume2 className="w-4 h-4" />
                            <span className="text-xs">{isSpeaking && activeMessageId === msg.id ? "Stop" : "Listen"}</span>
                          </button>
                        </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {loading && !messages.some(m => m.isStreaming) && (
                <div className="flex gap-4 max-w-[85%]">
                  <div className="w-10 h-10 rounded-full bg-pink-500 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-pink-200">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="rounded-3xl px-6 py-4 bg-pink-50 border border-pink-100">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                      </div>
                      <span className="text-sm text-slate-600">Ovula is thinking...</span>
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
