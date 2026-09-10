import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { ExerciseProblem } from '../../../types/testTypes';
import { Button } from '../../ui/Button';
import { useToast } from '../../../hooks/useToast';

interface ExerciseViewProps {
  problems: ExerciseProblem[];
  selectedSubject: string;
}

export const ExerciseView: React.FC<ExerciseViewProps> = ({
  problems,
  selectedSubject,
}) => {
  const toast = useToast();
  const filteredProblems =
    selectedSubject === 'All'
      ? problems
      : problems.filter((p) => p.subject.toLowerCase() === selectedSubject.toLowerCase());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string | number, string>>({});
  const [revealedIds, setRevealedIds] = useState<Set<string | number>>(new Set());
  const [showHintMap, setShowHintMap] = useState<Record<string | number, boolean>>({});
  const [instantReveal, setInstantReveal] = useState<boolean>(true);

  const activeProblem = filteredProblems[currentIndex] || filteredProblems[0];

  if (!activeProblem || filteredProblems.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 font-medium text-xs">
        No exercise problems found for {selectedSubject}.
      </div>
    );
  }

  const selectedAnswer = selectedOptions[activeProblem.id];
  const isRevealed = instantReveal
    ? !!selectedAnswer
    : revealedIds.has(activeProblem.id);
  const isCorrect = selectedAnswer === activeProblem.correctAnswer;
  const isHintOpen = !!showHintMap[activeProblem.id];

  const handleSelectOption = (optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [activeProblem.id]: optionId }));

    if (instantReveal) {
      setRevealedIds((prev) => new Set(prev).add(activeProblem.id));
      if (optionId === activeProblem.correctAnswer) {
        toast.success('Correct answer! 🎉');
      } else {
        toast.info('Not quite right. Review the instant solution below.');
      }
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) {
      toast.info('Please pick an option first');
      return;
    }
    setRevealedIds((prev) => new Set(prev).add(activeProblem.id));
    if (selectedAnswer === activeProblem.correctAnswer) {
      toast.success('Correct answer! Well done! 🎯');
    } else {
      toast.info('Review the detailed step-by-step solution below.');
    }
  };

  const handleResetCurrent = () => {
    setSelectedOptions((prev) => {
      const next = { ...prev };
      delete next[activeProblem.id];
      return next;
    });
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.delete(activeProblem.id);
      return next;
    });
    setShowHintMap((prev) => ({ ...prev, [activeProblem.id]: false }));
  };

  const handleNext = () => {
    if (currentIndex < filteredProblems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
      toast.success('Completed all exercise worksheets in this section!');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Exercise Mode Controls Bar */}
      <div className="bg-white rounded-2xl border border-[#e2ebf4] p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold rounded-lg uppercase">
            {activeProblem.subject} • {activeProblem.chapter}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Worksheet {currentIndex + 1} of {filteredProblems.length}
          </span>
        </div>

        {/* Instant Reveal Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={instantReveal}
              onChange={(e) => setInstantReveal(e.target.checked)}
              className="rounded text-[#0d9488] focus:ring-[#0d9488] cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Zap className={`w-3.5 h-3.5 ${instantReveal ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              Instant Answer Reveal
            </span>
          </label>
        </div>
      </div>

      {/* Main Problem Card */}
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#0d9488] uppercase tracking-wide">
              {activeProblem.topic}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              {activeProblem.difficulty || 'Standard'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] leading-relaxed">
            {activeProblem.text}
          </h2>
        </div>

        {/* Hint Accordion */}
        {activeProblem.hint && (
          <div className="border border-amber-200/80 bg-amber-50/50 rounded-2xl p-3.5 text-xs">
            <button
              onClick={() =>
                setShowHintMap((prev) => ({
                  ...prev,
                  [activeProblem.id]: !prev[activeProblem.id],
                }))
              }
              className="flex items-center justify-between w-full font-bold text-amber-800 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Need a Hint before answering?
              </span>
              {isHintOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isHintOpen && (
              <p className="mt-2 text-slate-600 font-medium leading-relaxed animate-in fade-in duration-150">
                {activeProblem.hint}
              </p>
            )}
          </div>
        )}

        {/* Options Grid */}
        <div className="space-y-3">
          {activeProblem.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrectOption = option.id === activeProblem.correctAnswer;

            let optionStyle =
              'bg-[#f8fafc] border-slate-200 text-slate-700 hover:border-[#0d9488]/50 hover:bg-slate-50';

            if (isRevealed) {
              if (isCorrectOption) {
                optionStyle =
                  'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-300';
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-2 ring-rose-300';
              }
            } else if (isSelected) {
              optionStyle =
                'bg-teal-50 border-[#0d9488] text-[#0d9488] font-bold shadow-xs';
            }

            return (
              <div
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isRevealed && isCorrectOption
                        ? 'bg-emerald-600 text-white'
                        : isRevealed && isSelected && !isCorrectOption
                        ? 'bg-rose-600 text-white'
                        : isSelected
                        ? 'bg-[#0d9488] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {option.id}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold">{option.text}</span>
                </div>

                {isRevealed && (
                  <div className="shrink-0">
                    {isCorrectOption ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls (if not in instant reveal mode) */}
        {!instantReveal && !isRevealed && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={handleCheckAnswer}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs"
            >
              Check Answer
            </Button>
          </div>
        )}

        {/* Instant Detailed Solution & Takeaway */}
        {isRevealed && (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>
                  {isCorrect ? 'Correct! Verified Solution' : 'Solution & Explanation'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">
                Correct Answer: Option {activeProblem.correctAnswer}
              </span>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {activeProblem.explanation}
            </p>

            {/* Step-by-Step Derivation */}
            {activeProblem.stepByStepSolution && activeProblem.stepByStepSolution.length > 0 && (
              <div className="bg-white/80 rounded-xl p-4 border border-emerald-200/60 space-y-2">
                <h4 className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wide">
                  Step-by-Step Working:
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                  {activeProblem.stepByStepSolution.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={handleResetCurrent}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Question
          </button>

          <Button
            size="sm"
            onClick={handleNext}
            className="bg-[#0d9488] hover:bg-[#0f766e] text-white flex items-center gap-1.5 text-xs font-bold"
          >
            Next Problem
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
