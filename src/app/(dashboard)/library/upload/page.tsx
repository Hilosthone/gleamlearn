'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Upload, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

export default function UploadMaterialPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartProcessing = () => {
    // Navigate to the processing stage page
    router.push('/library/processing');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--color-brand-blue)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Upload Study Material 📤
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload your lecture notes, syllabi, textbooks, or past questions to instantly generate structured classes, notes, and quizzes.
        </p>
      </div>

      {/* Drag & Drop Upload Card */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]); }}
        className={`p-10 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-[#111827] ${
          isDragging 
            ? 'border-[var(--color-brand-blue)] bg-blue-50/50 dark:bg-blue-950/20' 
            : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[var(--color-brand-blue)] flex items-center justify-center shadow-inner">
          <Upload className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {selectedFile ? selectedFile.name : 'Drag & drop your files here'}
          </h3>
          <p className="text-xs text-gray-400">
            Supports PDF, DOCX, TXT, PPTX, and CSV up to 50MB
          </p>
        </div>

        <label className="px-6 py-3 rounded-2xl bg-[var(--color-brand-blue)] text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-colors cursor-pointer">
          <span>Browse Files</span>
          <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt,.pptx,.csv" />
        </label>
      </div>

      {/* File Selected Action Bar */}
      {selectedFile && (
        <div className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center justify-between animate-in slide-in-from-bottom-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{selectedFile.name}</h4>
              <p className="text-xs text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze</p>
            </div>
          </div>

          <button
            onClick={handleStartProcessing}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Class & Notes</span>
          </button>
        </div>
      )}

    </div>
  );
}