import React, { useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  FileCode2,
  Sparkles,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { WorkbookChapter } from '../../../types/testTypes';
import { Button } from '../../ui/Button';
import { useToast } from '../../../hooks/useToast';

interface WorkbookViewProps {
  chapters: WorkbookChapter[];
  selectedSubject: string;
}

export const WorkbookView: React.FC<WorkbookViewProps> = ({
  chapters,
  selectedSubject,
}) => {
  const toast = useToast();
  const filteredChapters =
    selectedSubject === 'All'
      ? chapters
      : chapters.filter((c) => c.subject.toLowerCase() === selectedSubject.toLowerCase());

  const [selectedChapter, setSelectedChapter] = useState<WorkbookChapter | null>(null);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string | number, boolean>>({});

  const toggleSolution = (id: string | number) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (selectedChapter) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedChapter(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0d9488] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chapters
          </button>
          <span className="text-xs font-semibold text-slate-500">
            {selectedChapter.subject} • {selectedChapter.chapterName}
          </span>
        </div>

        {/* Formula Cheatsheet Banner */}
        {selectedChapter.formulaCheats && selectedChapter.formulaCheats.length > 0 && (
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1d4ed8]">
              <FileCode2 className="w-4 h-4 text-[#2563eb]" />
              <span>Chapter Formula Cheatsheet & Key Relations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedChapter.formulaCheats.map((f, idx) => (
                <div key={idx} className="bg-white/80 rounded-xl p-3 border border-blue-100 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">{f.title}</div>
                  <div className="font-mono text-xs font-extrabold text-[#1e3a8a]">{f.formula}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Problem Bank */}
        <div className="space-y-6">
          <h3 className="text-lg font-extrabold text-[#111827]">
            Practice Problems ({selectedChapter.problems.length})
          </h3>

          {selectedChapter.problems.map((prob, idx) => {
            const isSolutionOpen = !!revealedSolutions[prob.id];

            return (
              <div
                key={prob.id}
                className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    Problem #{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {prob.difficulty}
                  </span>
                </div>

                <p className="text-sm font-bold text-[#111827] leading-relaxed">
                  {prob.text}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {prob.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-200 flex items-center justify-center font-bold text-[10px]">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => toggleSolution(prob.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0d9488] hover:underline cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    {isSolutionOpen ? 'Hide Solution' : 'Reveal Solution & Working'}
                  </button>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Correct Option: {prob.correctAnswer}
                  </span>
                </div>

                {isSolutionOpen && (
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 space-y-2 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Step-by-Step Verified NCERT Solution:</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {prob.explanation}
                    </p>
                    {prob.stepByStepSolution && (
                      <div className="space-y-1 pt-1 text-xs text-slate-600">
                        {prob.stepByStepSolution.map((st, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredChapters.map((ch) => (
          <div
            key={ch.id}
            onClick={() => setSelectedChapter(ch)}
            className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-2xs hover:shadow-md hover:border-[#0d9488]/40 transition-all cursor-pointer flex flex-col justify-between h-52 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase">
                  {ch.subject}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {ch.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-[#111827] group-hover:text-[#0d9488] transition-colors leading-snug">
                {ch.chapterName}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Completion Rate</span>
                  <span>{ch.completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0d9488]"
                    style={{ width: `${ch.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs font-bold text-[#0d9488]">
                <span>{ch.problemsCount} Worksheet Problems</span>
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Open Manual &rarr;
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
