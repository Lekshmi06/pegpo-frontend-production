import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, RefreshCw, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { SourceItem, ChapterItem } from '../../../types/source';
import { sourceService } from '../../../services/sourceService';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';

interface SourceChaptersViewProps {
  source: SourceItem;
}

export const SourceChaptersView: React.FC<SourceChaptersViewProps> = ({ source }) => {
  const toast = useToast();
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const fetchChapters = async (forceRegenerate = false) => {
    setIsLoading(true);
    try {
      const res = await sourceService.triggerAIAction(source._id, 'chapters', { forceRegenerate });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setChapters(res.data);
      } else {
        toast.error('Could not generate chapter breakdown.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate chapters';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters(false);
  }, [source._id]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-3">
        <Loader size="lg" />
        <h4 className="text-sm font-extrabold text-[#111827]">Generating Chapter Outlines...</h4>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Gemini is partitioning "{source.originalName}" into study modules and key takeaway bullets.
        </p>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-4 text-center">
        <BookOpen className="w-12 h-12 text-slate-300" />
        <h4 className="text-sm font-bold text-[#111827]">No Chapter Breakdown Available</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Click below to generate an organized syllabus and chapter guide.
        </p>
        <Button onClick={() => fetchChapters(true)} className="py-2.5 px-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Chapters
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <span>Chapter & Module Breakdown</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-100 text-indigo-700">
                  {chapters.length} Modules
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Structured syllabus layout for systematic revision</p>
            </div>
          </div>

          <button
            onClick={() => fetchChapters(true)}
            className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Chapters Accordion */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {chapters.map((ch, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'bg-[#f8fbfe] border-[#0091ff] shadow-xs'
                    : 'bg-[#fafcff] border-[#e2ebf4] hover:border-[#cbd5e1]'
                }`}
              >
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#e3edf7] text-[#1c3352] text-xs font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#111827]">{ch.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-md">{ch.summary}</p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-700 p-1">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-200/60 animate-in fade-in duration-150">
                    <div className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-100">
                      {ch.summary}
                    </div>

                    {ch.keyPoints && ch.keyPoints.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Key Learning Takeaways
                        </span>
                        <div className="space-y-1">
                          {ch.keyPoints.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
        <span>Ready for exam syllabus tracking</span>
        <span className="text-[#0091ff]">Gemini Structured Modules</span>
      </div>
    </div>
  );
};
