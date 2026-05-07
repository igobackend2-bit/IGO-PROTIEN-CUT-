import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Sparkles, ShoppingCart, Loader2, Mic } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

console.log("AIAssistant.tsx is being executed");

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your IGO Meat Assistant. Need help picking a cut or planning a recipe?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleSearchAI = (e: any) => {
      const query = e.detail;
      setIsOpen(true);
      if (query) {
        setInput(query);
        // We need a small delay to ensure the input is set before sending
        setTimeout(() => {
          const sendBtn = document.getElementById('ai-send-button');
          sendBtn?.click();
        }, 100);
      }
    };

    const handleOpenAI = () => {
      setIsOpen(true);
    };

    window.addEventListener('searchAI', handleSearchAI);
    window.addEventListener('openAI', handleOpenAI);
    
    return () => {
      window.removeEventListener('searchAI', handleSearchAI);
      window.removeEventListener('openAI', handleOpenAI);
    };
  }, []);

  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Always use the Server Proxy (Solves CORS and protects API keys)
      const systemPrompt = `You are the IGO Culinary Expert for "IGO Protein Cuts". 
      Your goal is to help customers choose the best meat cuts and provide professional recipes.
      
      OUR PRODUCTS: Chicken (Whole, Breast, Naattu Kozhi), Mutton (Curry Cut, Keema), Fish (Vanjaram, Salmon), Seafood (Crab, Prawns).
      OUR STANDARDS: 100% Traceable, Never Frozen, Antibiotic-Free, Farm-Fresh to home within 120 mins.
      
      GUIDELINES:
      1. Give detailed, chef-quality recipes using IGO cuts.
      2. Always emphasize freshness and "Never Frozen" quality.
      3. Use markdown (bold, lists) for clarity.
      4. Tone: Premium, helpful, and passionate.`;

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          systemPrompt: systemPrompt
        })
      });

      const data = await res.json();
      
      if (data.error) {
        // Log the error but provide a friendly message to the user
        console.error("AI Proxy Data Error:", data.error);
        if (data.error.includes("API Key")) {
           setMessages(prev => [...prev, { role: 'bot', text: "The AI service is currently being configured by our team. Please try again in a few minutes!" }]);
           return;
        }
        throw new Error(data.error);
      }

      const text = data.text || "I'm here to help with your premium protein needs! What's cooking today?";

      setMessages(prev => [...prev, { role: 'bot', text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having a slight connection issue with the farm server. Please try asking again in a few seconds!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 md:bottom-10 right-6 z-50 w-16 h-16 rounded-full bg-igo-green text-white shadow-2xl flex items-center justify-center group border-4 border-white"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative">
              <MessageSquare className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-igo-gold rounded-full border-2 border-white animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-44 md:bottom-28 right-6 z-50 w-[90vw] md:w-[400px] h-[550px] glass rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/40"
          >
            {/* Header */}
            <div className="p-6 bg-igo-green text-white flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-none mb-1">IGO Assistant</h3>
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Online & Ready
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-igo-green/10 text-igo-green' : 'bg-neutral-dark text-white'}`}>
                    {msg.role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm max-w-[80%] ${
                    msg.role === 'bot' 
                      ? 'bg-white border border-neutral-100 text-neutral-dark shadow-sm' 
                      : 'bg-igo-green text-white shadow-lg'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-igo-green/10 text-igo-green flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-igo-green" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Section Wrapper */}
            <div className="p-6 bg-white/50 backdrop-blur-md border-t border-neutral-100">
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                {['High Protein', 'Family Pack', 'Low Carb', 'Quick Snack'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => { setInput(tag); handleSend(); }}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-igo-green/10 hover:text-igo-green text-neutral-500 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border border-transparent hover:border-igo-green/20"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-inner border border-neutral-100 focus-within:border-igo-green transition-all relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 text-sm focus:outline-none pr-10"
                />
                <button 
                  onClick={handleVoiceInput}
                  className={cn(
                    "absolute right-12 top-1/2 -translate-y-1/2 p-2 transition-all",
                    isListening ? "text-red-500 scale-125 animate-pulse" : "text-neutral-400 hover:text-igo-green"
                  )}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  id="ai-send-button"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-igo-green text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-4">
                <button 
                  onClick={() => { setInput("Suggest a recipe"); handleSend(); }}
                  className="text-[10px] font-bold text-neutral-400 hover:text-igo-green transition-colors flex items-center gap-1 uppercase tracking-widest"
                >
                  <Sparkles className="w-3 h-3" />
                  Suggest Recipe
                </button>
                <div className="w-px h-2 bg-neutral-200" />
                <button className="text-[10px] font-bold text-neutral-400 hover:text-igo-green transition-colors flex items-center gap-1 uppercase tracking-widest">
                  <ShoppingCart className="w-3 h-3" />
                  Track Order
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
