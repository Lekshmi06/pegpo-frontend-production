import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  Filter,
  Check,
  X,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';
import { TestResult, TestQuestion } from '../../../types/test';
import { Button } from '../../ui/Button';

interface TestAnalysisViewProps {
  result: TestResult;
  studentProfile?: any;
  onRetake: () => void;
  onBackToTests: () => void;
}

export default function TestAnalysisView({
  result,
  studentProfile,
  onRetake,
  onBackToTests,
}: TestAnalysisViewProps) {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'correct' | 'incorrect' | 'revise' | 'skipped'
  >('all');

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceBadge = (percent: number) => {
    if (percent >= 90) return { label: 'Outstanding!', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (percent >= 75) return { label: 'Great Job!', color: 'bg-teal-100 text-teal-800 border-teal-300' };
    if (percent >= 50) return { label: 'Good Effort', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { label: 'Needs Practice', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  };

  const badge = getPerformanceBadge(result.percentage);

  // Filter questions
  const filteredQuestions = result.questions.filter((q, idx) => {
    const userAnswer =
      q.userAnswer ||
      (result.answers
        ? result.answers[idx] || (q.questionId ? result.answers[q.questionId] : undefined)
        : undefined);

    const isCorrect =
      typeof q.isCorrect === 'boolean'
        ? q.isCorrect
        : Boolean(
            userAnswer &&
              q.correctAnswer &&
              userAnswer.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()
          );

    const status =
      q.status ||
      (result.statusByQuestion
        ? result.statusByQuestion[idx] || (q.questionId ? result.statusByQuestion[q.questionId] : undefined)
        : undefined);

    if (activeFilter === 'correct') return isCorrect;
    if (activeFilter === 'incorrect') return userAnswer && !isCorrect;
    if (activeFilter === 'revise') return status === 'revise';
    if (activeFilter === 'skipped') return !userAnswer || status === 'skipped';
    return true;
  });

  return (
    <div className="h-full w-full flex flex-col min-h-0 overflow-hidden bg-[#f8fbfe] text-slate-800">
      {/* Top Banner / Navigation (Sticky) */}
      <div className="bg-white border-b border-[#e2ebf4] px-6 md:px-12 py-4 shrink-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToTests}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0d9488] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            <span>Back to Tests</span>
          </button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetake}
              className="border-slate-200 text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onBackToTests}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-xs font-bold text-white shadow-2xs"
            >
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Analysis Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-8 pb-16">
          {/* Score & Performance Hero Card */}
        <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 md:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#2dd4bf]/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <span className={`inline-block text-xs font-extrabold px-3.5 py-1 rounded-full border shadow-2xs ${badge.color}`}>
                {badge.label}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
                {result.testTitle} — Test Analysis
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Detailed assessment summary, marks breakdown, and concept explanations.
              </p>
            </div>

            {/* Score Pill */}
            <div className="bg-gradient-to-br from-[#f0fdfa] to-[#e6fffa] border-2 border-[#2dd4bf]/50 rounded-3xl p-6 text-center shadow-xs min-w-[200px]">
              <span className="text-xs font-bold text-[#0f766e] uppercase tracking-wider block">
                Marks Scored
              </span>
              <div className="text-4xl md:text-5xl font-extrabold text-[#0d9488] tracking-tight mt-1">
                {result.score}{' '}
                <span className="text-xl md:text-2xl text-slate-400 font-semibold">
                  / {result.maxScore}
                </span>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-600">
                Score: {result.percentage}%
              </div>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-8 mt-6 border-t border-slate-100">
            <div className="bg-[#f8fafc] rounded-2xl p-3.5 text-center border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 block">Questions</span>
              <span className="text-lg font-extrabold text-slate-800 mt-1 block">
                {result.questions.length}
              </span>
            </div>

            <div className="bg-[#f0fdfa] rounded-2xl p-3.5 text-center border border-[#99f6e4]">
              <span className="text-[11px] font-bold text-[#0d9488] block">Attempted</span>
              <span className="text-lg font-extrabold text-[#0f766e] mt-1 block">
                {result.attempted}
              </span>
            </div>

            <div className="bg-[#f0fdf4] rounded-2xl p-3.5 text-center border border-[#bbf7d0]">
              <span className="text-[11px] font-bold text-emerald-600 block">Correct</span>
              <span className="text-lg font-extrabold text-emerald-700 mt-1 block">
                {result.correct}
              </span>
            </div>

            <div className="bg-[#fef2f2] rounded-2xl p-3.5 text-center border border-[#fecaca]">
              <span className="text-[11px] font-bold text-rose-500 block">Incorrect</span>
              <span className="text-lg font-extrabold text-rose-600 mt-1 block">
                {result.incorrect}
              </span>
            </div>

            <div className="bg-[#fffbeb] rounded-2xl p-3.5 text-center border border-[#fde68a]">
              <span className="text-[11px] font-bold text-amber-600 block">Revise Later</span>
              <span className="text-lg font-extrabold text-amber-700 mt-1 block">
                {result.reviseLater}
              </span>
            </div>

            <div className="bg-[#f8fafc] rounded-2xl p-3.5 text-center border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 block">Time Spent</span>
              <span className="text-xs font-extrabold text-slate-700 mt-2 block font-mono">
                {formatDuration(result.timeSpentSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Solutions & Question-by-Question Review */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
              Question Review & Explanations
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { key: 'all', label: `All (${result.questions.length})` },
                  { key: 'correct', label: `Correct (${result.correct})` },
                  { key: 'incorrect', label: `Incorrect (${result.incorrect})` },
                  { key: 'revise', label: `Revise Later (${result.reviseLater})` },
                  { key: 'skipped', label: `Skipped (${result.skipped})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === f.key
                      ? 'bg-[#0d9488] text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, qIndex) => {
              const originalIdx = result.questions.findIndex(
                (item) => (item.questionId && q.questionId ? item.questionId === q.questionId : item.id === q.id)
              );
              const displayIdx = originalIdx >= 0 ? originalIdx : qIndex;
              const userAnswer =
                q.userAnswer ||
                (result.answers
                  ? result.answers[displayIdx] || (q.questionId ? result.answers[q.questionId] : undefined)
                  : undefined);
              const isCorrect =
                typeof q.isCorrect === 'boolean'
                  ? q.isCorrect
                  : Boolean(
                      userAnswer &&
                        q.correctAnswer &&
                        userAnswer.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()
                    );
              const isSkipped = !userAnswer || q.status === 'skipped';

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-[#e2ebf4] p-6 shadow-2xs space-y-4 transition-all"
                >
                  {/* Top line of question review */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {originalIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {q.sidebarTitle || `Question ${originalIdx + 1}`}
                      </span>
                    </div>

                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1 Mark)
                      </span>
                    ) : isSkipped ? (
                      <span className="flex items-center gap-1 text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Not Answered (0 Marks)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect (0 Marks)
                      </span>
                    )}
                  </div>

                  {/* Question text */}
                  <h3 className="text-sm md:text-base font-bold text-[#111827] leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Options Review */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt) => {
                      const isUserChoice = userAnswer === opt.id;
                      const isCorrectChoice = q.correctAnswer === opt.id;

                      let style = 'border-slate-200 bg-white text-slate-700';
                      let badgeStyle = 'bg-slate-100 text-slate-600';

                      if (isCorrectChoice) {
                        style = 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-bold';
                        badgeStyle = 'bg-emerald-600 text-white';
                      } else if (isUserChoice && !isCorrect) {
                        style = 'border-rose-300 bg-rose-50/70 text-rose-900 font-bold line-through';
                        badgeStyle = 'bg-rose-600 text-white';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${style}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] ${badgeStyle}`}>
                              {opt.id}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isCorrectChoice && (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              Correct Answer
                            </span>
                          )}
                          {isUserChoice && !isCorrect && (
                            <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation Box */}
                  <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0369a1]">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Explanation & Solution:</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed pl-5">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button
            variant="outline"
            onClick={onRetake}
            className="px-8 py-2.5 text-xs font-bold border-slate-200"
          >
            Retake Test
          </Button>

          <Button
            onClick={onBackToTests}
            className="px-8 py-2.5 text-xs font-bold bg-[#0d9488] hover:bg-[#0f766e] text-white"
          >
            Back to Tests Shelf
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
}
