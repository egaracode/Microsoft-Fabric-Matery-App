
import React, { useEffect, useState } from 'react';
import { Terminal, Database, Cloud, Sun, Moon, MessageSquare, History, ChevronLeft, Award } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onToggleQA?: () => void;
  isQAOpen?: boolean;
  onToggleHistory?: () => void;
  isHistoryOpen?: boolean;
  onBack?: () => void; // New prop for navigation
  score?: number; // New prop for gamification
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onToggleQA, isQAOpen, 
  onToggleHistory, isHistoryOpen, 
  onBack,
  score = 0
}) => {
  // Initialize dark mode based on system preference or default to true (as per requirement)
  const [isDark, setIsDark] = useState(true);
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    setAnimateScore(true);
    const timer = setTimeout(() => setAnimateScore(false), 1000);
    return () => clearTimeout(timer);
  }, [score]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button 
                onClick={onBack}
                className="mr-1 p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Volver atrás"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
                <Database className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none hidden md:block">Microsoft Fabric Mastery</h1>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none md:hidden">Fabric Mastery</h1>
              <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mt-0.5">MentorAI Expert</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
             
             {/* Gamification Score Badge */}
             <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold text-xs transition-transform duration-300 ${animateScore ? 'scale-110' : 'scale-100'}`}>
                <Award className="w-4 h-4" />
                <span>{score} XP</span>
             </div>

             <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-500 mr-2 ml-2">
              <span className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Cloud className="w-3.5 h-3.5" />
                Azure
              </span>
              <span className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Terminal className="w-3.5 h-3.5" />
                CI/CD
              </span>
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

            {/* History Button */}
            {onToggleHistory && (
               <button
                onClick={onToggleHistory}
                className={`p-2 rounded-full transition-colors ${
                  isHistoryOpen
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Historial de Inputs"
               >
                 <History className="w-4 h-4" />
               </button>
            )}

            {/* Q&A Button */}
            {onToggleQA && (
              <button
                onClick={onToggleQA}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isQAOpen 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Q&A</span>
              </button>
            )}

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 md:py-12 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 mt-12 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-500 dark:text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} Microsoft Fabric Mastery. Powered by Google Gemini 2.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
