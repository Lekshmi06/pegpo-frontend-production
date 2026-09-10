import React from 'react';
import { CheckCircle2, Sparkles, FileText, Database, Cpu, ArrowRight } from 'lucide-react';
import { SourceItem } from '../../../types/source';

interface PipelineStatusBannerProps {
  source: SourceItem | null;
  isUploading: boolean;
}

export const PipelineStatusBanner: React.FC<PipelineStatusBannerProps> = ({
  source,
  isUploading,
}) => {
  const isReady = source?.status === 'ready';
  const isAiReady = source?.aiReady;
  const isProcessing = isUploading || source?.status === 'processing' || source?.aiStatus === 'processing';

  const steps = [
    {
      id: 'upload',
      name: 'Upload',
      desc: 'PDF, DOCX, TXT',
      icon: FileText,
      status: isUploading ? 'active' : source ? 'completed' : 'pending',
    },
    {
      id: 'store',
      name: 'Store Source',
      desc: 'Disk & Mongo',
      icon: Database,
      status: isUploading ? 'active' : source ? 'completed' : 'pending',
    },
    {
      id: 'extract',
      name: 'Extract Content',
      desc: 'Text Parsing',
      icon: Cpu,
      status: isUploading ? 'active' : source ? 'completed' : 'pending',
    },
    {
      id: 'ai-analysis',
      name: 'AI Analysis',
      desc: 'Document Intelligence',
      icon: Sparkles,
      status: isProcessing ? 'active' : isAiReady ? 'completed' : source ? 'active' : 'pending',
    },
    {
      id: 'ready',
      name: 'AI-Ready Source',
      desc: 'Study Studio',
      icon: CheckCircle2,
      status: isAiReady ? 'completed' : isProcessing ? 'pending' : 'pending',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#e2ebf4] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0091ff]/10 text-[#0091ff] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#111827]">
              Document Ingestion Pipeline
            </h4>
            <p className="text-[11px] text-slate-500">
              Automated ingestion: Upload → Storage → Text Extraction → AI Analysis → Ready
            </p>
          </div>
        </div>

        {source && (
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                isAiReady
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isProcessing
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAiReady ? 'bg-emerald-500' : isProcessing ? 'bg-amber-500' : 'bg-slate-400'
                }`}
              />
              {isAiReady ? 'AI-Ready Source' : isProcessing ? 'Processing AI Models...' : 'Ingesting'}
            </span>
          </div>
        )}
      </div>

      {/* 5-step visual flow */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                isCompleted
                  ? 'bg-[#f0fdf4] border-emerald-200 text-emerald-900'
                  : isActive
                  ? 'bg-[#eff6ff] border-[#93c5fd] text-[#1e40af] shadow-xs ring-1 ring-[#0091ff]/20'
                  : 'bg-[#f8fbfe] border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-[#0091ff] text-white animate-bounce'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold opacity-60">0{idx + 1}</span>
              </div>
              <div>
                <p className="text-xs font-bold leading-tight truncate">{step.name}</p>
                <p className="text-[10px] opacity-75 truncate">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
