
import React, { useState, useRef, useEffect } from 'react';
import { Book, Message } from '../types';
import { GeminiService } from '../services/geminiService';

interface AIAssistantProps {
  books: Book[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ books }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hello! I'm Lumina, your AI Librarian. I can help you find books in our collection or suggest new additions based on your interests. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gemini = new GeminiService();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const catalogSummary = books.map(b => `${b.title} by ${b.author} (${b.category})`).join(', ');
      const response = await gemini.getBookRecommendation(userMessage, catalogSummary);
      setMessages(prev => [...prev, { role: 'assistant', text: response || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I encountered an error while connecting to the neural library. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-3">
            <i className="fas fa-robot text-sm"></i>
          </span>
          AI Librarian
        </h1>
        <p className="text-slate-500">Intelligent recommendations and collection analysis</p>
      </header>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-800 shadow-sm border border-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Tell me what you're in the mood to read..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-100 border-none px-6 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping}
              className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-widest font-bold">
            Powered by Gemini AI 3.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
