
import React, { useRef } from 'react';
import { X, Book, UploadCloud, FileText, Trash2 } from 'lucide-react';
import { KnowledgeFile } from '../types';

interface KnowledgeBaseProps {
  isOpen: boolean;
  onClose: () => void;
  files: KnowledgeFile[];
  onAddFile: (file: KnowledgeFile) => void;
  onRemoveFile: (index: number) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ isOpen, onClose, files, onAddFile, onRemoveFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      const newFile: KnowledgeFile = {
        name: file.name,
        mimeType: file.type,
        data: base64String
      };
      onAddFile(newFile);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg text-amber-600 dark:text-amber-500">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Base de Conocimiento</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aporta manuales y libros (PDF)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0b1120]">
          
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="block text-blue-700 dark:text-blue-400 mb-1">Potencia MentorAI:</strong>
              Sube libros o documentación técnica en PDF. La IA usará este conocimiento para enriquecer el curso y responder preguntas en el chat.
            </p>
          </div>

          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-white dark:hover:bg-slate-900 transition-all group mb-8"
          >
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <UploadCloud className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Haz clic para subir un PDF</span>
            <span className="text-xs text-slate-400 mt-1">Máx. 10MB por archivo</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>

          {/* File List */}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Documentos Activos ({files.length})</h3>
          
          {files.length === 0 ? (
            <div className="text-center py-8 opacity-50">
              <Book className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs text-slate-400">No hay documentos cargados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                   <div className="flex items-center gap-3 overflow-hidden">
                     <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400 flex-shrink-0">
                       <FileText className="w-4 h-4" />
                     </div>
                     <span className="text-sm text-slate-700 dark:text-slate-300 truncate font-medium">{file.name}</span>
                   </div>
                   <button 
                     onClick={() => onRemoveFile(idx)}
                     className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
           <p className="text-[10px] text-slate-400">
             Los archivos se procesan temporalmente en tu navegador.
           </p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;