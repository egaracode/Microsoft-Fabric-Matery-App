
import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, StepState, UserLevel, ChatMessage, HistoryLog, KnowledgeFile } from './types';
import { generateDiagnosisQuestions, evaluateUserLevel, generatePillars, generateVariations, generateCourse } from './services/geminiService';
import Layout from './components/Layout';
import CourseRenderer from './components/CourseRenderer';
import QAChat from './components/QAChat';
import HistoryView from './components/HistoryView';
import KnowledgeBase from './components/KnowledgeBase';
import { ArrowRight, Loader2, BookOpen, Layers, ChevronRight, Sparkles, CheckCircle2, XCircle, Book } from 'lucide-react';

const INITIAL_STATE: StepState = {
  currentStep: AppStep.DIAGNOSIS,
  userLevel: null,
  topic: '',
  selectedPillar: '',
  selectedVariation: '',
  pillars: [],
  variations: [],
  course: null,
  isLoading: false,
  error: null,
  diagnosisQuestions: [],
  knowledgeFiles: [],
};

export default function App() {
  const [state, setState] = useState<StepState>(INITIAL_STATE);
  const [inputText, setInputText] = useState('');
  
  // Q&A State
  const [isQAOpen, setIsQAOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [qaInputDraft, setQaInputDraft] = useState('');

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);

  // KnowledgeBase State
  const [isKBOpen, setIsKBOpen] = useState(false);

  // Diagnosis State
  const [diagnosisAnswers, setDiagnosisAnswers] = useState<Record<number, string>>({});
  const [isDiagnosisReview, setIsDiagnosisReview] = useState(false);

  // Gamification Score
  const [score, setScore] = useState(0);

  // Load History & Score from LocalStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('fabric_mastery_history');
    if (savedHistory) {
      try {
        setHistoryLogs(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history from local storage");
      }
    }
    
    const savedScore = localStorage.getItem('fabric_mastery_score');
    if (savedScore) {
      try {
        setScore(parseInt(savedScore, 10) || 0);
      } catch (e) {
        console.error("Failed to parse score");
      }
    }
  }, []);

  const handleAddPoints = (amount: number) => {
    setScore(prev => {
      const newScore = prev + amount;
      localStorage.setItem('fabric_mastery_score', newScore.toString());
      return newScore;
    });
  };

  const addToHistory = (text: string, source: 'COURSE' | 'QA') => {
    // Avoid duplicates or empty
    if (!text.trim()) return;
    
    // Check if the most recent log is identical to prevent spamming history
    if (historyLogs.length > 0 && historyLogs[0].text === text && historyLogs[0].source === source) {
      return;
    }

    const newLog: HistoryLog = {
      id: Date.now().toString() + Math.random().toString().slice(2),
      text,
      timestamp: new Date().toISOString(),
      source
    };
    
    const updatedLogs = [newLog, ...historyLogs];
    setHistoryLogs(updatedLogs);
    localStorage.setItem('fabric_mastery_history', JSON.stringify(updatedLogs));
  };

  useEffect(() => {
    // Initial fetch for diagnosis questions
    const loadDiagnosis = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const questions = await generateDiagnosisQuestions();
        setState(prev => ({ ...prev, isLoading: false, diagnosisQuestions: questions }));
      } catch (err) {
        handleError(err);
      }
    };
    loadDiagnosis();
  }, []);

  const handleError = (error: unknown) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: error instanceof Error ? error.message : "Ha ocurrido un error inesperado." 
    }));
  };

  const submitDiagnosis = async () => {
    if (Object.keys(diagnosisAnswers).length < state.diagnosisQuestions.length) return;
    
    if (!isDiagnosisReview) {
      // First click: Show results (Review Mode)
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Evaluate level in background while showing review
        const formattedAnswers = state.diagnosisQuestions.map(q => ({
          question: q.question,
          answer: diagnosisAnswers[q.id]
        }));
        
        const level = await evaluateUserLevel(formattedAnswers);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          userLevel: level,
        }));
        setIsDiagnosisReview(true);
      } catch (err) {
        handleError(err);
      }
    } else {
      // Second click: Continue to next step
      setState(prev => ({
        ...prev,
        currentStep: AppStep.INPUT_TOPIC
      }));
    }
  };

  const submitTopic = async (topic: string = inputText) => {
    if (!topic.trim()) return;

    // Save to history
    addToHistory(topic.trim(), 'COURSE');

    setState(prev => ({ ...prev, isLoading: true, error: null, topic: topic.trim() }));
    try {
      const pillars = await generatePillars(topic.trim(), state.userLevel || 'Principiante', state.knowledgeFiles);
      setState(prev => ({
        ...prev,
        isLoading: false,
        pillars,
        currentStep: AppStep.SELECT_PILLAR
      }));
    } catch (err) {
      handleError(err);
    }
  };

  const selectPillar = async (pillar: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, selectedPillar: pillar }));
    try {
      const variations = await generateVariations(pillar, state.userLevel || 'Principiante', state.knowledgeFiles);
      setState(prev => ({
        ...prev,
        isLoading: false,
        variations,
        currentStep: AppStep.SELECT_VARIATION
      }));
    } catch (err) {
      handleError(err);
    }
  };

  const selectVariation = async (variation: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, selectedVariation: variation }));
    try {
      const course = await generateCourse(variation, state.userLevel || 'Principiante', state.knowledgeFiles);
      setState(prev => ({
        ...prev,
        isLoading: false,
        course,
        currentStep: AppStep.COURSE_VIEW
      }));
    } catch (err) {
      handleError(err);
    }
  };

  // --- Knowledge Base Logic ---
  const handleAddFile = (file: KnowledgeFile) => {
    setState(prev => ({
      ...prev,
      knowledgeFiles: [...prev.knowledgeFiles, file]
    }));
  };

  const handleRemoveFile = (index: number) => {
    setState(prev => {
      const newFiles = [...prev.knowledgeFiles];
      newFiles.splice(index, 1);
      return { ...prev, knowledgeFiles: newFiles };
    });
  };

  // --- Navigation & Restoration Logic ---

  const handleBack = () => {
    setState(prev => {
      switch (prev.currentStep) {
        case AppStep.SELECT_PILLAR:
          return { ...prev, currentStep: AppStep.INPUT_TOPIC, pillars: [], error: null };
        case AppStep.SELECT_VARIATION:
          return { ...prev, currentStep: AppStep.SELECT_PILLAR, variations: [], error: null };
        case AppStep.COURSE_VIEW:
          return { ...prev, currentStep: AppStep.SELECT_VARIATION, course: null, error: null };
        case AppStep.INPUT_TOPIC:
          // Optional: allow going back to Diagnosis? Usually not needed after init.
          // return { ...prev, currentStep: AppStep.DIAGNOSIS };
          return prev;
        default:
          return prev;
      }
    });
  };

  const canGoBack = 
    state.currentStep === AppStep.SELECT_PILLAR || 
    state.currentStep === AppStep.SELECT_VARIATION || 
    state.currentStep === AppStep.COURSE_VIEW;

  const handleHistorySelect = (log: HistoryLog) => {
    setIsHistoryOpen(false);
    
    if (log.source === 'COURSE') {
      setInputText(log.text);
      // Reset flow to input step so user can re-submit
      setState(prev => ({
        ...prev,
        currentStep: AppStep.INPUT_TOPIC,
        topic: log.text,
        error: null,
        pillars: [],
        variations: [],
        course: null
      }));
    } else if (log.source === 'QA') {
      setQaInputDraft(log.text);
      setIsQAOpen(true);
    }
  };

  const toggleQA = () => {
    setIsQAOpen(!isQAOpen);
    setIsHistoryOpen(false);
    setIsKBOpen(false);
  };
  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
    setIsQAOpen(false);
    setIsKBOpen(false);
  };
  const toggleKB = () => {
    setIsKBOpen(!isKBOpen);
    setIsQAOpen(false);
    setIsHistoryOpen(false);
  };

  // --- Render Helpers ---

  const renderLoading = (message: string) => (
    <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
        <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-500 animate-spin relative z-10" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mt-8 mb-2">MentorAI Trabajando...</h3>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-mono text-sm">{message}</p>
    </div>
  );

  const renderDiagnosis = () => (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
       <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Diagnóstico de Nivel</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Para personalizar tus cursos, responde estas 3 preguntas sobre el ecosistema.
        </p>
      </div>
      
      <div className="space-y-8">
        {state.diagnosisQuestions.map((q, i) => (
          <div key={q.id} className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <h4 className="font-semibold text-slate-800 dark:text-white mb-4 flex gap-2">
               <span className="text-blue-600 dark:text-blue-400">{i + 1}.</span> {q.question}
             </h4>
             <div className="space-y-2">
               {q.options.map((opt, optIdx) => {
                 const isSelected = diagnosisAnswers[q.id] === opt;
                 const isCorrect = optIdx === q.correctAnswer;
                 
                 let containerClass = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800";
                 if (isDiagnosisReview) {
                    if (isCorrect) {
                      containerClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-900 dark:text-green-100 ring-1 ring-green-500";
                    } else if (isSelected && !isCorrect) {
                      containerClass = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-900 dark:text-red-100 ring-1 ring-red-500";
                    } else {
                      containerClass = "border-slate-100 dark:border-slate-800 opacity-50";
                    }
                 } else if (isSelected) {
                    containerClass = "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500";
                 }

                 return (
                   <label key={opt} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${containerClass}`}>
                     <input 
                       type="radio" 
                       name={`q-${q.id}`} 
                       className="hidden" // Hide default radio to use custom style wrapper or full div click
                       checked={isSelected}
                       onChange={() => !isDiagnosisReview && setDiagnosisAnswers(prev => ({...prev, [q.id]: opt}))}
                       disabled={isDiagnosisReview}
                     />
                     
                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                        isSelected 
                        ? (isDiagnosisReview && optIdx !== q.correctAnswer ? 'border-red-500 bg-red-500' : 'border-blue-600 bg-blue-600') 
                        : (isDiagnosisReview && isCorrect ? 'border-green-500 bg-green-500' : 'border-slate-400')
                     }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        {isDiagnosisReview && isCorrect && !isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                     </div>

                     <span className="flex-1 text-slate-700 dark:text-slate-300 text-sm">{opt}</span>
                     
                     {isDiagnosisReview && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 ml-2" />}
                     {isDiagnosisReview && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 ml-2" />}
                   </label>
                 );
               })}
             </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
           onClick={submitDiagnosis}
           disabled={Object.keys(diagnosisAnswers).length < state.diagnosisQuestions.length}
           className={`px-6 py-3 rounded-full font-medium transition-all shadow-lg flex items-center gap-2 text-white ${
             isDiagnosisReview 
             ? 'bg-green-600 hover:bg-green-500' 
             : 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600'
           }`}
        >
          <span>{isDiagnosisReview ? 'Continuar' : 'Verificar Resultados'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderInputTopic = () => (
    <div className="max-w-2xl mx-auto py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-500/20 mb-6">
          <Sparkles className="w-3 h-3" />
          <span>Nivel detectado: {state.userLevel}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
          Microsoft Fabric Mastery
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-lg mx-auto">
          ¿Qué desafío técnico quieres resolver hoy? <br/>
          <span className="text-slate-500 text-sm">Ej: Pipelines, Power BI CI/CD, Lakehouse Security...</span>
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitTopic()}
            placeholder="Introduce tu tema (ej: Implementación de Medallion Architecture)"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-5 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
          />
          <button
            onClick={() => submitTopic()}
            disabled={!inputText.trim()}
            className="absolute right-3 top-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white p-2.5 rounded-lg transition-colors shadow-lg"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mt-10 flex gap-3 justify-center flex-wrap">
        {['Fabric Git Integration', 'Power BI Deployment Pipelines', 'Synapse Data Engineering'].map(suggestion => (
          <button
            key={suggestion}
            onClick={() => { 
                setInputText(suggestion); 
            }}
            className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-slate-600 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-300 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );

  const renderListSelection = (
    title: string,
    subtitle: string,
    items: string[], 
    onSelect: (item: string) => void,
    icon: React.ReactNode
  ) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm ml-11">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            className="group relative bg-white dark:bg-[#1e293b]/50 hover:bg-slate-50 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 p-5 rounded-xl text-left transition-all duration-300 flex items-center gap-5 shadow-sm hover:shadow-md"
          >
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-all font-mono text-xs border border-slate-200 dark:border-slate-800 group-hover:border-blue-400">
              {idx + 1}
            </span>
            <div className="flex-1">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-white transition-colors">
                {item}
              </h3>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Layout 
      onToggleQA={toggleQA} 
      isQAOpen={isQAOpen}
      onToggleHistory={toggleHistory}
      isHistoryOpen={isHistoryOpen}
      onBack={canGoBack ? handleBack : undefined}
      score={score}
    >
      <div className="fixed top-20 right-6 z-40 hidden md:block">
         <button
           onClick={toggleKB}
           className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
           title="Base de Conocimiento"
         >
           <Book className="w-5 h-5" />
         </button>
      </div>
      
      {/* KnowledgeBase Overlay */}
      <KnowledgeBase
        isOpen={isKBOpen}
        onClose={() => setIsKBOpen(false)}
        files={state.knowledgeFiles}
        onAddFile={handleAddFile}
        onRemoveFile={handleRemoveFile}
      />

      {/* Q&A Overlay */}
      <QAChat 
        isOpen={isQAOpen} 
        onClose={() => setIsQAOpen(false)} 
        messages={chatMessages}
        setMessages={setChatMessages}
        onNewMessage={(text) => addToHistory(text, 'QA')}
        inputDraft={qaInputDraft}
        knowledgeFiles={state.knowledgeFiles}
        onAddPoints={handleAddPoints}
      />

      {/* History Overlay */}
      <HistoryView 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        logs={historyLogs}
        onSelectLog={handleHistorySelect}
      />

      {/* Main App Content - Hidden when overlays are open to preserve state/layout */}
      <div className={isQAOpen || isHistoryOpen || isKBOpen ? 'hidden' : 'block'}>
        {state.error && (
          <div className="bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-200 p-4 rounded-lg mb-8 flex items-center gap-3 animate-in fade-in">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {state.error}
          </div>
        )}

        {state.isLoading ? (
          renderLoading(
            state.currentStep === AppStep.DIAGNOSIS ? "Analizando perfil y generando diagnóstico..." :
            state.currentStep === AppStep.INPUT_TOPIC ? "Analizando arquitectura y generando pilares estratégicos..." :
            state.currentStep === AppStep.SELECT_PILLAR ? "Diseñando variaciones de lección específicas..." :
            "Consultando bases de conocimiento, estructurando curso y generando evaluaciones..."
          )
        ) : (
          <>
            {state.currentStep === AppStep.DIAGNOSIS && renderDiagnosis()}

            {state.currentStep === AppStep.INPUT_TOPIC && renderInputTopic()}
            
            {state.currentStep === AppStep.SELECT_PILLAR && renderListSelection(
              "Pilares Estratégicos",
              `Selecciona un área de enfoque para: ${state.topic}`,
              state.pillars,
              selectPillar,
              <Layers className="w-5 h-5" />
            )}

            {state.currentStep === AppStep.SELECT_VARIATION && renderListSelection(
              "Variaciones de Lección",
              `Profundiza en un escenario específico de: ${state.selectedPillar}`,
              state.variations,
              selectVariation,
              <BookOpen className="w-5 h-5" />
            )}

            {state.currentStep === AppStep.COURSE_VIEW && state.course && (
              <div className="animate-in fade-in duration-700">
                <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-4 font-mono uppercase tracking-wider">
                    <span className="opacity-50">Curso</span>
                    <span className="opacity-30">/</span>
                    <span className="font-semibold">{state.userLevel}</span>
                    <span className="opacity-30">/</span>
                    <span>{state.selectedPillar}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{state.course.title}</h1>
                </div>
                
                <CourseRenderer content={state.course.markdown} onBack={handleBack} onAddPoints={handleAddPoints} />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
