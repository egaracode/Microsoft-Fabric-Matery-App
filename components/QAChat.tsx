
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader2, MessageSquare, Award } from 'lucide-react';
import { ChatMessage, KnowledgeFile } from '../types';
import { getChatResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QAChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onNewMessage?: (text: string) => void;
  inputDraft?: string;
  knowledgeFiles?: KnowledgeFile[];
  onAddPoints: (points: number) => void;
}

const QAChat: React.FC<QAChatProps> = ({ isOpen, onClose, messages, setMessages, onNewMessage, inputDraft, knowledgeFiles = [], onAddPoints }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load draft text when provided
  useEffect(() => {
    if (inputDraft) {
      setInput(inputDraft);
    }
  }, [inputDraft]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    
    // Notify parent component for history logging
    if (onNewMessage) {
      onNewMessage(userText);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(userText, messages, knowledgeFiles);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      onAddPoints(10); // Award points for Q&A interaction
    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white leading-none">Q&A Fabric Expert</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-blue-600 dark:text-blue-400">Pregunta cualquier duda técnica</span>
              <span className="flex items-center gap-0.5 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 px-1.5 rounded-full font-bold">
                 <Award className="w-3 h-3" /> +10 XP
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-950"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-600 p-8">
            <Bot className="w-16 h-16 mb-4 opacity-20" />
            <p className="max-w-xs text-sm">
              Hola, soy MentorAI. Pregúntame sobre DAX, Pipelines de Azure DevOps, Fabric Capacities o cualquier duda técnica.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700 dark:bg-slate-800'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none'
            }`}>
              {msg.role === 'model' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="markdown-table-container">
                          <table className="custom-table" {...props} />
                        </div>
                      )
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              )}
              <span className={`text-[10px] block mt-2 opacity-60 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
               <Bot className="w-5 h-5 text-white" />
             </div>
             <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 flex items-center gap-2">
               <span className="text-xs text-slate-500">Escribiendo...</span>
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto relative flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu pregunta sobre Microsoft Fabric..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white px-5 py-3.5 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-full transition-all shadow-lg shadow-blue-900/10"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QAChat;
