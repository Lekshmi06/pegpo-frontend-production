import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { SourceItem, QuizQuestion } from '../../../types/source';
import { sourceService } from '../../../services/sourceService';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';

interface SourceQuizViewProps {
  source: SourceItem;
}

export const SourceQuizView: React.FC<SourceQuizViewProps> = ({ source }) => {
  const toast = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const fetchQuiz = async (forceRegenerate = false) => {
    setIsLoading(true);
    try {
      const res = await sourceService.triggerAIAction(source._id, 'quiz', {
        forceRegenerate,
        count: 5,
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setQuestions(res.data);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setShowExplanation({});
        setQuizFinished(false);
      } else {
        toast.error('Could not generate quiz questions from this document.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate quiz';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz(false);
  }, [source._id]);

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // already answered

    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const score = Object.entries(selectedAnswers).reduce((acc, [idx, chosen]) => {
    const qIndex = parseInt(idx, 10);
    return chosen === questions[qIndex]?.correctIndex ? acc + 1 : acc;
  }, 0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-3">
        <Loader size="lg" />
        <h4 className="text-sm font-extrabold text-[#111827]">Generating Interactive Quiz...</h4>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Analyzing key concepts and creating multiple-choice questions with full explanations.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-4 text-center">
        <HelpCircle className="w-12 h-12 text-slate-300" />
        <h4 className="text-sm font-bold text-[#111827]">No Quiz Available Yet</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Click below to generate an interactive quiz from "{source.originalName}".
        </p>
        <Button onClick={() => fetchQuiz(true)} className="py-2.5 px-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Quiz
        </Button>
      </div>
    );
  }

  if (quizFinished) {
    const percentage = Math.round((score / totalQ) * 100);
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 sm:p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-[#111827]">Quiz Completed!</h3>
          <p className="text-xs text-slate-500">
            You scored <strong className="text-[#0091ff] font-extrabold">{score}</strong> out of{' '}
            <strong>{totalQ}</strong> ({percentage}%)
          </p>
        </div>

        <div className="w-full max-w-xs bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              percentage >= 70 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => {
              setSelectedAnswers({});
              setShowExplanation({});
              setCurrentIndex(0);
              setQuizFinished(false);
            }}
            className="px-5 py-2.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#1c3352] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Quiz</span>
          </button>

          <Button
            onClick={() => fetchQuiz(true)}
            className="py-2.5 px-5 text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Questions</span>
          </Button>
        </div>
      </div>
    );
  }

  const hasAnswered = selectedAnswers[currentIndex] !== undefined;
  const chosenIndex = selectedAnswers[currentIndex];
  const isCorrect = chosenIndex === currentQ.correctIndex;

  return (
    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[500px] flex flex-col justify-between">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#eef6fc] text-[#0091ff] border border-[#d8eaf8]">
              Question {currentIndex + 1} of {totalQ}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Score: <strong className="text-emerald-600 font-bold">{score}</strong> / {answeredCount}
            </span>
          </div>

          <button
            onClick={() => fetchQuiz(true)}
            className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors flex items-center gap-1 cursor-pointer"
            title="Generate a brand new set of quiz questions"
          >
            <RefreshCw className="w-3 h-3" />
            <span>New Quiz</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0091ff] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Body */}
      <div className="py-6 space-y-6 flex-1">
        <h3 className="text-sm sm:text-base font-extrabold text-[#111827] leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            let optionStyles = 'bg-[#f8fbfe] border-[#e2ebf4] hover:bg-[#f0f6fc] text-slate-800';

            if (hasAnswered) {
              if (optIdx === currentQ.correctIndex) {
                optionStyles = 'bg-[#f0fdf4] border-emerald-400 text-emerald-900 ring-1 ring-emerald-400';
              } else if (optIdx === chosenIndex) {
                optionStyles = 'bg-[#fef2f2] border-rose-400 text-rose-900 ring-1 ring-rose-400';
              } else {
                optionStyles = 'bg-[#f8fbfe] border-[#e2ebf4] text-slate-400 opacity-60';
              }
            }

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  hasAnswered ? 'cursor-default' : 'cursor-pointer hover:border-[#0091ff]'
                } ${optionStyles}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      hasAnswered && optIdx === currentQ.correctIndex
                        ? 'bg-emerald-500 text-white'
                        : hasAnswered && optIdx === chosenIndex
                        ? 'bg-rose-500 text-white'
                        : 'bg-[#e2ebf4] text-[#1c3352]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-xs sm:text-sm font-medium">{opt}</span>
                </div>

                {hasAnswered && optIdx === currentQ.correctIndex && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {hasAnswered && optIdx === chosenIndex && optIdx !== currentQ.correctIndex && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation Card */}
        {hasAnswered && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 animate-in fade-in duration-150 ${
              isCorrect
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}
          >
            <div className="font-extrabold flex items-center gap-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Incorrect. The correct answer was option {String.fromCharCode(65 + currentQ.correctIndex)}.</span>
                </>
              )}
            </div>
            <p className="font-medium text-slate-700 pt-1">{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed text-slate-400'
              : 'hover:bg-slate-100 text-[#1c3352] cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {currentIndex === totalQ - 1 ? (
          <Button
            onClick={() => setQuizFinished(true)}
            disabled={!hasAnswered}
            className="py-2 px-5 text-xs font-bold"
          >
            <span>Finish Quiz</span>
          </Button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
            disabled={!hasAnswered}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              hasAnswered
                ? 'bg-[#0091ff] hover:bg-[#0080e6] text-white cursor-pointer shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
