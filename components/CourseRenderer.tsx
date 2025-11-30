import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, CheckCircle2, XCircle, ChevronRight, LayoutTemplate, ExternalLink, Trophy, BarChart3 } from 'lucide-react';

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
  <div className="my-8 space-y-2">
    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      <span>Progreso del Curso</span>
      <span>{value}% Completado</span>
    </div>
    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
      <div 
        className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const BlockCompletionGraph: React.FC = () => (
  <div className="flex items-center gap-3 p-4 my-6 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl animate-fade-in-up">
    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
      <BarChart3 className="w-5 h-5" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-green-800 dark:text-green-300">Bloque Completado</h4>
      <p className="text-xs text-green-700 dark:text-green-400/80">Has asimilado los conceptos clave de esta sección.</p>
    </div>
    <div className="ml-auto text-2xl font-bold text-green-600 dark:text-green-400 opacity-20">100%</div>
  </div>
);

const GlossaryTerm: React.FC<{ term: string; def: string }> = ({ term, def }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <span 
        className="cursor-help border-b border-dashed border-blue-400 text-blue-600 dark:text-blue-300 font-medium transition-colors hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-0.5 rounded"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        {term}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900/95 backdrop-blur-sm text-slate-100 text-sm rounded-xl shadow-2xl border border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-200 leading-relaxed">
          <strong className="block text-blue-400 mb-2 border-b border-slate-700 pb-1">{term}</strong>
          {def}
        </span>
      )}
    </span>
  );
};

const SimulatedResource: React.FC<{ type: string; title: string }> = ({ type, title }) => (
  <div className="flex items-center gap-3 p-3 my-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-not-allowed opacity-90 group w-full">
    <div className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-500">
      <ExternalLink className="w-4 h-4" />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{type}</span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 decoration-dotted underline-offset-2 transition-colors">{title}</span>
    </div>
  </div>
);

const QuizBlock: React.FC<{ questions: QuizItem[] }> = ({ questions }) => {
  return (
    <div className="space-y-8 my-12 bg-slate-50 dark:bg-[#161f2e] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Evaluación de Conocimientos</h3>
      </div>
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
    <div className={`bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl p-5 md:p-6 transition-all duration-300 shadow-sm ${shake ? 'animate-shake ring-2 ring-red-400 dark:ring-red-500/50' : ''}`}>
      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-base md:text-lg mb-4 flex gap-3">
        <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold">{index + 1}</span>
        {item.question}
      </h4>
      
      <div className="space-y-2 mb-6">
        {item.options.map((opt, optIdx) => {
          let styles = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300";
          
          if (isSubmitted) {
            if (optIdx === item.correctAnswer) {
              styles = "bg-green-100 dark:bg-green-950/40 border-green-500/50 text-green-900 dark:text-green-100 ring-1 ring-green-500/50 font-medium";
            } else if (selected === optIdx) {
              styles = "bg-red-100 dark:bg-red-950/40 border-red-500/50 text-red-900 dark:text-red-100 ring-1 ring-red-500/50";
            } else {
              styles = "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50";
            }
          } else if (selected === optIdx) {
            styles = "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-100 ring-1 ring-blue-500 font-medium";
          }

          return (
            <button
              key={optIdx}
              onClick={() => handleSelect(optIdx)}
              disabled={isSubmitted}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 flex items-center justify-between group ${styles}`}
            >
              <span className="text-sm md:text-base leading-snug">{opt}</span>
              {isSubmitted && optIdx === item.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 ml-2" />}
              {isSubmitted && selected === optIdx && optIdx !== item.correctAnswer && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <div className="flex justify-end">
           <button
             onClick={submit}
             disabled={selected === null}
             className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-lg font-medium transition-colors text-sm shadow-lg shadow-blue-900/10"
           >
             Verificar Respuesta
           </button>
        </div>
      ) : (
        <div className={`mt-4 p-5 rounded-lg border animate-fade-in-up ${isCorrect ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'}`}>
          <div className="flex items-start gap-3">
             <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                <Lightbulb className="w-4 h-4" />
             </div>
             <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>
                  {isCorrect ? 'Explicación Correcta' : 'Refuerzo de Aprendizaje'}
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
  // Extract user level if present
  const levelMatch = content.match(/\[NIVEL ASIGNADO: (.*?)\]/);
  const userLevel = levelMatch ? levelMatch[1] : null;

  // Cleanup content for display
  const cleanContent = content
    .replace(/\[NIVEL ASIGNADO: .*?\]/g, '')
    .replace(/> \*\*\[DECLARACIÓN DE METADATOS:.*?\]\*\*/g, '')
    .replace(/> \*\*\[BOTÓN: Volver a las 10 Variaciones de Lección anteriores\]\*\*/g, '');

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none pb-32">
      {userLevel && (
         <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span>Nivel de Contenido: {userLevel}</span>
         </div>
      )}

      <ReactMarkdown
        components={{
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-16 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 tracking-tight" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-200 mt-10 mb-4 flex items-center gap-2" {...props}>
              <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
              {props.children}
            </h3>
          ),
          h4: ({ node, ...props }) => {
             // Specific handling for evaluation title
             if (String(props.children).includes("Evaluación del Módulo")) return null; // We handle title in QuizBlock
             return <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mt-8 mb-4" {...props} />;
          },
          p: ({ node, children, ...props }) => {
            const text = String(children);
            
            // Handle Progress Tag: [PROGRESO: 20]
            if (text.match(/\[PROGRESO:\s*(\d+)\]/)) {
               const match = text.match(/\[PROGRESO:\s*(\d+)\]/);
               if (match) {
                 return (
                   <>
                    <BlockCompletionGraph />
                    <ProgressBar value={parseInt(match[1])} />
                   </>
                 );
               }
               return null;
            }

            // Handle Resource Tags
            // Format 1: [RECURSO: Tipo | Título]
            // Format 2: [Documentación Oficial: Título]
            if (text.trim().startsWith('[RECURSO:') || text.match(/^\[(Documentación Oficial|Artículo Técnico):/)) {
               let type = "Recurso";
               let title = text;

               if (text.startsWith('[RECURSO:')) {
                  const match = text.match(/\[RECURSO:\s*([^|]+)\s*\|\s*([^\]]+)\]/);
                  if (match) {
                    type = match[1].trim();
                    title = match[2].trim();
                  }
               } else {
                  const match = text.match(/^\[(.*?):\s*(.*?)\]/);
                  if (match) {
                     type = match[1].trim();
                     title = match[2].trim();
                  }
               }
               return <SimulatedResource type={type} title={title} />;
            }

            // Handle Diagram Tag
            if (text.startsWith('[TAG DE DIAGRAMA:')) {
               const desc = text.replace('[TAG DE DIAGRAMA:', '').replace(']', '');
               return (
                 <div className="my-10 group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0f172a] dark:to-[#1e293b] border border-slate-200 dark:border-slate-700/50 shadow-inner">
                    <div className="absolute -right-10 -top-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                      <LayoutTemplate className="w-64 h-64 text-slate-900 dark:text-white" />
                    </div>
                    <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm text-blue-600 dark:text-blue-400">
                            <LayoutTemplate className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h5 className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Diagrama Arquitectónico
                            </h5>
                            <p className="text-slate-700 dark:text-slate-300 font-medium italic text-lg leading-snug">
                              "{desc.trim()}"
                            </p>
                        </div>
                    </div>
                 </div>
               );
            }
            
            // Handle Glossary Terms: [[Term|Definition]] or [[Term]]
            const parts = text.split(/(\[\[[^\]]+\]\])/g);
            if (parts.length > 1) {
              return (
                <p className="text-slate-600 dark:text-slate-300 leading-8 text-lg mb-6 font-light" {...props}>
                  {parts.map((part, i) => {
                     if (part.startsWith('[[') && part.endsWith(']]')) {
                        const content = part.slice(2, -2);
                        const [term, def] = content.split('|');
                        return <GlossaryTerm key={i} term={term} def={def || 'Definición disponible en el curso completo.'} />;
                     }
                     return part;
                  })}
                </p>
              );
            }

            return <p className="text-slate-600 dark:text-slate-300 leading-8 text-lg mb-6 font-light" {...props}>{children}</p>;
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside ml-6 space-y-2 text-slate-600 dark:text-slate-300 mb-8 marker:text-blue-500" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside ml-6 space-y-2 text-slate-600 dark:text-slate-300 mb-8 marker:text-slate-400 dark:marker:text-slate-500" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="text-slate-900 dark:text-white font-bold" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500/50 pl-6 py-2 my-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 italic rounded-r-lg" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (!isInline && match && match[1] === 'quiz') {
              try {
                const quizData = JSON.parse(String(children));
                return <QuizBlock questions={quizData} />;
              } catch (e) {
                console.error("Quiz Parse Error", e);
                return null;
              }
            }

            return isInline ? (
              <code className="bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-200 dark:border-slate-700" {...props}>
                {children}
              </code>
            ) : (
              <div className="my-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-slate-50 dark:bg-[#0d1117] group">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                   <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                   </div>
                   <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{match ? match[1] : 'script'}</span>
                </div>
                <div className="p-5 overflow-x-auto">
                  <code className={`${className} !bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200`} {...props}>
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

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-center z-40 transition-colors">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-xl hover:shadow-blue-500/30 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Volver a las 10 Variaciones
        </button>
      </div>
    </div>
  );
};

export default CourseRenderer;