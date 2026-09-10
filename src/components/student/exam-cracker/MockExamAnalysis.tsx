import React, { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { MockExamSessionResult } from '../../../types/testTypes';
import { Button } from '../../ui/Button';

interface MockExamAnalysisProps {
  result: MockExamSessionResult;
  onRetake: () => void;
  onBackToCatalog: () => void;
}

export const MockExamAnalysis: React.FC<MockExamAnalysisProps> = ({
  result,
  onRetake,
  onBackToCatalog,
}) => {
  const [solutionFilter, setSolutionFilter] = useState<
    'all' | 'correct' | 'incorrect' | 'skipped'
  >('all');

  const filteredQuestions = result.questions.filter((q) => {
    const chosen = result.answers[q.id];
    const isCorrect = chosen === q.correctAnswer;

    if (solutionFilter === 'correct') return isCorrect;
    if (solutionFilter === 'incorrect') return chosen && !isCorrect;
    if (solutionFilter === 'skipped') return !chosen;
    return true;
  });

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}m ${remSecs}s`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCatalog}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exam Cracker
        </button>
        <Button
          size="sm"
          onClick={onRetake}
          className="bg-[#0091ff] hover:bg-[#007cdb] text-white flex items-center gap-1.5 text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake Exam
        </Button>
      </div>

      {/* Main Scorecard Header */}
      <div className="bg-gradient-to-br from-[#1c3352] to-[#0f1f33] rounded-3xl p-8 text-white shadow-md relative overflow-hidden space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-md bg-white/10 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide">
              {result.category} • Performance Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {result.examTitle}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Examination evaluated and ranked against nationwide test takers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xs">
              <Trophy className="w-9 h-9 stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* 5 Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Score</span>
            <span className="text-2xl font-extrabold text-white">
              {result.score}
              <span className="text-xs text-slate-400 font-medium"> / {result.totalMarks}</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Percentile</span>
            <span className="text-2xl font-extrabold text-emerald-300">
              {result.percentile}%
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Est. Rank</span>
            <span className="text-2xl font-extrabold text-amber-300">
              #{result.rankEstimate}
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">
              out of {result.totalCandidatesEstimate.toLocaleString()}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Accuracy</span>
            <span className="text-2xl font-extrabold text-white">{result.accuracy}%</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Time Spent</span>
            <span className="text-xl font-extrabold text-white">
              {formatTime(result.timeSpentSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Section-Wise Comparison Table */}
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#0091ff]" />
          Section-Wise Performance Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-2.5">Section</th>
                <th className="py-2.5">Score</th>
                <th className="py-2.5">Attempted</th>
                <th className="py-2.5">Correct</th>
                <th className="py-2.5">Incorrect</th>
                <th className="py-2.5">Accuracy</th>
                <th className="py-2.5">Time Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {result.sectionBreakdown.map((sec) => (
                <tr key={sec.sectionId} className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-[#111827]">{sec.sectionName}</td>
                  <td className="py-3 font-bold text-[#0091ff]">
                    {sec.score} / {sec.maxScore}
                  </td>
                  <td className="py-3">{sec.attempted}</td>
                  <td className="py-3 text-emerald-600 font-bold">{sec.correct}</td>
                  <td className="py-3 text-rose-500 font-bold">{sec.incorrect}</td>
                  <td className="py-3 font-bold">{sec.accuracy}%</td>
                  <td className="py-3 text-slate-500">{formatTime(sec.timeSpentSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Question Review & Solutions */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#111827]">
              Detailed Solutions & Explanations
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Review every question with verified answer keys and detailed reasoning.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `All (${result.questions.length})` },
              { id: 'correct', label: `Correct (${result.correctCount})` },
              { id: 'incorrect', label: `Incorrect (${result.incorrectCount})` },
              { id: 'skipped', label: `Skipped (${result.skippedCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSolutionFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  solutionFilter === f.id
                    ? 'bg-[#1c3352] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Cards */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const chosen = result.answers[q.id];
            const isCorrect = chosen === q.correctAnswer;
            const isSkipped = !chosen;

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#0091ff]">
                      Question {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {q.sectionName}
                    </span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        Correct (+{q.marks || 2})
                      </span>
                    ) : isSkipped ? (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-xl">
                        Skipped (0 Marks)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                        <XCircle className="w-4 h-4" />
                        Incorrect (-{q.negativeMarks || 0})
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-[#111827] leading-relaxed whitespace-pre-line">
                  {q.text}
                </h4>

                {/* Options Review */}
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isSelected = chosen === opt.id;
                    const isRightOption = opt.id === q.correctAnswer;

                    let optClass = 'bg-[#f8fafc] border-slate-200 text-slate-700';
                    if (isRightOption) {
                      optClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                    } else if (isSelected && !isRightOption) {
                      optClass = 'bg-rose-50 border-rose-400 text-rose-900 font-bold';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                              isRightOption
                                ? 'bg-emerald-600 text-white'
                                : isSelected
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        {isRightOption && (
                          <span className="text-[10px] font-extrabold uppercase text-emerald-700">
                            Correct Answer
                          </span>
                        )}
                        {isSelected && !isRightOption && (
                          <span className="text-[10px] font-extrabold uppercase text-rose-600">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 text-xs space-y-1.5">
                  <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Answer Key & Explanation:</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
