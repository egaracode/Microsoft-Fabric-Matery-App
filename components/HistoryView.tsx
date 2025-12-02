
import React, { useState } from 'react';
import { X, History, MessageSquare, Search, CalendarClock, ChevronRight } from 'lucide-react';
import { HistoryLog } from '../types';

interface HistoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  logs: HistoryLog[];
  onSelectLog: (log: HistoryLog) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ isOpen, onClose, logs, onSelectLog }) => {
  const [activeTab, setActiveTab] = useState<'COURSE' | 'QA'>('COURSE');

  if (!isOpen) return null;

  const filteredLogs = logs
    .filter(log => log.source === activeTab)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historial de Inputs</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona para recuperar</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('COURSE')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === 'COURSE' 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            Temas de Curso
            {activeTab === 'COURSE' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('QA')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === 'QA' 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Consultas Q&A
            {activeTab === 'QA' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-[#0b1120]">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center">
              <CalendarClock className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">No hay registros en esta categoría aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <button
                  key={log.id} 
                  onClick={() => onSelectLog(log)}
                  className="w-full text-left bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 hover:ring-1 hover:ring-blue-300 dark:hover:ring-blue-500 transition-all group"
                >
                  <p className="text-slate-800 dark:text-slate-200 text-sm font-medium mb-2 leading-relaxed line-clamp-2">
                    "{log.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {formatDate(log.timestamp)}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
           <p className="text-[10px] text-slate-400">
             Selecciona un ítem para recuperarlo y volver a él.
           </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
