import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, CheckCircle2, XCircle, ChevronRight, LayoutTemplate, Palette, Book, ExternalLink } from 'lucide-react';

interface CourseRendererProps {
  content: string;
  onBack: () => void;
}

interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// --- Components ---

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="my-6 px-4 py-3 bg-slate-900/50 dark:bg-slate-900/50 bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-4">
    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-600 transition-all duration-1000 ease-out rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 min-w-[3rem] text-right">{value}%</span>
  </div>
);

const GlossaryTerm: React.FC<{ term: string; def: string }> = ({ term, def }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <span 
        className="cursor-help border-b border-dashed border-blue-400 text-blue-600 dark:text-blue-300 font-medium transition-colors hover:text-blue-500 hover:border-blue-500"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        {term}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-slate-200 text-xs rounded-lg shadow-xl border border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-200 leading-relaxed pointer-events-none">
          <strong className="block text-blue-400 mb-1">{term}</strong>
          {def}
        </span>
      )}
    </span>
  );
};

const SimulatedResource: React.FC<{ type: string; title: string }> = ({ type, title }) => (
  <div className="flex items-center gap-2 p-2 my-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-not-allowed opacity-80 group">
    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">{type}</span>
    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 underline decoration-dotted decoration-slate-400 underline-offset-2">{title}</span>
  </div>
);

const QuizBlock: React.FC<{ questions: QuizItem[] }> = ({ questions }) => {
  return (
    <div className="space-y-6 my-10">
      {questions.map((q, idx) => (
        <QuizQuestion key={idx} item={q} index={idx} />
      ))}
    </div>
  );
};

const QuizQuestion: React.FC<{ item: QuizItem; index: number }> = ({ item, index }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelected(optionIdx);
  };

  const submit = () => {
    if (selected === null) return;
    setIsSubmitted(true);
    
    const isCorrect = selected === item.correctAnswer;
    
    if (!isCorrect) {
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const isCorrect = selected === item.correctAnswer;

  return (
    <div className={`bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg p-6 transition-all duration-300 shadow-sm ${shake ? 'animate-shake' : ''}`}>
      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-lg mb-4 flex gap-2">
        <span className="text-blue-600 dark:text-blue-400">P{index + 1}.</span> {item.question}
      </h4>
      
      <div className="space-y-2.5 mb-6">
        {item.options.map((opt, optIdx) => {
          let styles = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300";
          
          if (isSubmitted) {
            if (optIdx === item.correctAnswer) {
              styles = "bg-green-100 dark:bg-green-950/40 border-green-500/50 text-green-800 dark:text-green-100 ring-1 ring-green-500/50";
            } else if (selected === optIdx) {
              styles = "bg-red-100 dark:bg-red-950/40 border-red-500/50 text-red-800 dark:text-red-100 ring-1 ring-red-500/50";
            } else {
              styles = "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50";
            }
          } else if (selected === optIdx) {
            styles = "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-100 ring-1 ring-blue-500";
          }

          return (
            <button
              key={optIdx}
              onClick={() => handleSelect(optIdx)}
              disabled={isSubmitted}
              className={`w-full text-left px-4 py-3 rounded border transition-all duration-200 flex items-center justify-between group ${styles}`}
            >
              <span className="text-sm md:text-base">{opt}</span>
              {isSubmitted && optIdx === item.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />}
              {isSubmitted && selected === optIdx && optIdx !== item.correctAnswer && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <div className="flex justify-end">
           <button
             onClick={submit}
             disabled={selected === null}
             className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded font-medium transition-colors text-sm shadow-lg shadow-blue-900/20"
           >
             Comprobar
           </button>
        </div>
      ) : (
        <div className={`mt-4 p-4 rounded border-l-4 animate-fade-in-up ${isCorrect ? 'bg-green-50 dark:bg-green-900/10 border-green-500' : 'bg-blue-50 dark:bg-slate-800/50 border-blue-500'}`}>
          <div className="flex items-start gap-3">
             <div className={`mt-0.5 p-1 rounded-full flex-shrink-0 ${isCorrect ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                <Lightbulb className={`w-4 h-4 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
             </div>
             <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {isCorrect ? 'Correcto' : 'Refuerzo de Aprendizaje'}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.explanation}
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CourseRenderer: React.FC<CourseRendererProps> = ({ content, onBack }) => {
  const cleanContent = content.replace(/> \*\*\[BOTÓN: Volver a las 10 Variaciones de Lección anteriores\]\*\*/g, '');

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none pb-32">
      <ReactMarkdown
        components={{
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-16 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-100 mt-10 mb-4" {...props} />
          ),
          h4: ({ node, ...props }) => (
             <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mt-12 mb-6" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            const text = String(children);
            
            // Handle Progress Tag
            if (text.startsWith('[PROGRESS:')) {
               const match = text.match(/\[PROGRESS:\s*(\d+)\]/);
               if (match) return <ProgressBar value={parseInt(match[1])} />;
               return null;
            }

            // Handle Resource Tag
            if (text.startsWith('[RECURSO:')) {
               const match = text.match(/\[RECURSO:\s*([^|]+)\s*\|\s*([^\]]+)\]/);
               if (match) return <SimulatedResource type={match[1].trim()} title={match[2].trim()} />;
               return null;
            }

            // Handle Diagram Tag
            if (text.startsWith('[TAG DE DIAGRAMA:')) {
               const desc = text.replace('[TAG DE DIAGRAMA:', '').replace(']', '');
               return (
                 <div className="my-8 group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0f172a] dark:to-[#1e293b] border border-slate-200 dark:border-slate-700/50">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <LayoutTemplate className="w-32 h-32 text-blue-500" />
                    </div>
                    <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 text-blue-600 dark:text-blue-400">
                            <LayoutTemplate className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Recurso Visual Recomendado</h5>
                            <p className="text-slate-600 dark:text-slate-300 font-medium italic">
                              "{desc.trim()}"
                            </p>
                        </div>
                    </div>
                 </div>
               );
            }
            
            // Handle Glossary Terms: [[Term|Definition]] or [[Term]]
            // Use regex to parse and replace with component
            const parts = text.split(/(\[\[[^\]]+\]\])/g);
            return (
              <p className="text-slate-600 dark:text-slate-300 leading-8 text-lg mb-6 font-light" {...props}>
                {parts.map((part, i) => {
                   if (part.startsWith('[[') && part.endsWith(']]')) {
                      const content = part.slice(2, -2);
                      const [term, def] = content.split('|');
                      return <GlossaryTerm key={i} term={term} def={def || 'Definición no disponible en vista previa.'} />;
                   }
                   return part;
                })}
              </p>
            );
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside ml-6 space-y-2 text-slate-600 dark:text-slate-300 mb-8 marker:text-blue-500" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside ml-6 space-y-2 text-slate-600 dark:text-slate-300 mb-8 marker:text-slate-400 dark:marker:text-slate-500" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="text-slate-900 dark:text-white font-semibold" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500/50 pl-6 py-1 my-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 italic" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (!isInline && match && match[1] === 'quiz') {
              try {
                const quizData = JSON.parse(String(children));
                return <QuizBlock questions={quizData} />;
              } catch (e) {
                return null;
              }
            }

            return isInline ? (
              <code className="bg-slate-200 dark:bg-slate-800 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-300 dark:border-slate-700" {...props}>
                {children}
              </code>
            ) : (
              <div className="my-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl bg-slate-50 dark:bg-[#0d1117]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50">
                   <span className="text-xs font-mono text-slate-500 lowercase">{match ? match[1] : 'code'}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code className={`${className} !bg-transparent text-sm text-slate-800 dark:text-slate-200`} {...props}>
                    {children}
                  </code>
                </div>
              </div>
            );
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-center z-40 transition-colors">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/25"
        >
          <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Volver a las Variaciones
        </button>
      </div>
    </div>
  );
};

export default CourseRenderer;