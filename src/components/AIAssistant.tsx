import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Sparkles, ShoppingCart, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        // Fallback mock responses for high-fidelity demonstration
        setTimeout(() => {
          let response = "I'm currently in demo mode. I'd recommend our Fresh Farm Chicken or Mutton Curry Cuts for a great meal! Would you like a recipe?";
          if (userMessage.toLowerCase().includes('recipe')) {
            response = "For a classic Mutton Curry: 1. Sear the meat with onions. 2. Add ginger-garlic paste and spices. 3. Pressure cook for 4 whistles. Use our Heritage Mutton Cuts for best results!";
          } else if (userMessage.toLowerCase().includes('protein')) {
            response = "Our Chicken Breast is a fitness favorite with 26g of protein per 100g. It's never frozen and delivered fresh!";
          }
          setMessages(prev => [...prev, { role: 'bot', text: response }]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      const genAI = new GoogleGenAI({ apiKey });
      
      const prompt = `You are the IGO Meat Assistant for "IGO Protein Cuts". 
      A premium meat delivery service in India. 
      The user says: "${userMessage}"
      
      RULES:
      1. Suggest specific IGO cuts: Chicken Breast, Mutton Curry Cut, Vanjaram Steaks, Nattu Kozhi Eggs.
      2. Mention quality: 100% Traceable, Never Frozen, Farm-to-Fork.
      3. If they ask for a recipe, give a brief 3-step guide and list the products.
      4. Professional, helpful, and appetizing tone.
      
      Keep it concise (max 3 sentences).`;

      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      const text = response.text;

      setMessages(prev => [...prev, { role: 'bot', text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having a little trouble connecting right now. But I'd love to help you with our premium cuts!" }]);
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
              <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-inner border border-neutral-100 focus-within:border-igo-green transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 text-sm focus:outline-none"
                />
                <button
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
