import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Send,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  tuitionService,
  TuitionProgramAssessmentItem,
  TuitionAssessmentSubmission,
} from '../../services/tuitionService';

interface MCQTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: TuitionProgramAssessmentItem;
  onSubmit?: (
    answers: Array<{ questionIndex: number; selectedOptionIndex: number }>
  ) => Promise<any>;
  onSubmitted?: () => Promise<void> | void;
}

export const MCQTestRunnerModal: React.FC<MCQTestRunnerModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onSubmit,
  onSubmitted,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(
    assessment.mySubmission || null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !assessment) return null;

  const questions = assessment.questions || [];
  const isReviewed = Boolean(submissionResult || assessment.hasSubmitted);
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isReviewed) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || isReviewed) return;
    setErrorMsg(null);

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      const confirmIncomplete = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Do you want to submit anyway?`
      );
      if (!confirmIncomplete) return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = questions.map((_, idx) => ({
        questionIndex: idx,
        selectedOptionIndex: selectedAnswers[idx] ?? -1,
      }));

      let res;
      if (onSubmit) {
        res = await onSubmit(formattedAnswers);
      } else {
        res = await tuitionService.submitMcqTest(assessment._id, formattedAnswers);
      }

      if (res && res.submission) {
        setSubmissionResult(res.submission);
      } else if (res) {
        setSubmissionResult(res);
      }
      if (onSubmitted) {
        await onSubmitted();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit MCQ test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const score = submissionResult?.score ?? 0;
  const totalMarks = submissionResult?.totalMarks ?? assessment.totalMarks;
  const percentage =
    submissionResult?.percentage ??
    (totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Interactive MCQ Test
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {assessment.subject || 'Tuition Program'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {assessment.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{assessment.durationMinutes || 30} mins</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Post-Submission Auto-Grade Score Banner */}
        {isReviewed && (
          <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                  Auto-Graded Test Results
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Review your answers and verified correct explanations below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/60 text-right shadow-2xs">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Score</div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {score} / {totalMarks} ({percentage}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {questions.map((q, qIdx) => {
            // Find student's answer if reviewed
            const evaluatedAnswer = submissionResult?.answers?.find(
              (a: any) => Number(a.questionIndex) === qIdx
            );
            const userSelectedOpt = isReviewed
              ? evaluatedAnswer?.selectedOptionIndex ?? -1
              : selectedAnswers[qIdx] ?? -1;

            const isCorrect = evaluatedAnswer?.isCorrect ?? false;
            const correctOptIdx = q.correctOptionIndex ?? -1;

            return (
              <div
                key={qIdx}
                className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                  isReviewed
                    ? isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60'
                    : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {qIdx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>

                  {isReviewed && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>+{q.marks || 1} pt</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>0 pts</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {q.options.map((optText, optIdx) => {
                    const isSelected = userSelectedOpt === optIdx;
                    const isTheCorrectAnswer = isReviewed && correctOptIdx === optIdx;

                    let cardClass =
                      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400';

                    if (isReviewed) {
                      if (isTheCorrectAnswer) {
                        cardClass =
                          'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
                        cardClass =
                          'bg-rose-100/70 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200 font-bold';
                      } else {
                        cardClass = 'opacity-60 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
                      }
                    } else if (isSelected) {
                      cardClass =
                        'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 font-bold shadow-xs';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isReviewed}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${cardClass} ${
                          isReviewed ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {optionLetters[optIdx]}
                          </span>
                          <span className="leading-snug">{optText}</span>
                        </div>

                        {isReviewed && (
                          <div className="shrink-0">
                            {isTheCorrectAnswer && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Correct Answer
                              </span>
                            )}
                            {isSelected && !isCorrect && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                                <XCircle className="w-3.5 h-3.5" />
                                Your Choice
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation if reviewed */}
                {isReviewed && q.explanation && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      Explanation:
                    </span>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500 font-medium">
            {isReviewed
              ? `Completed on ${new Date(submissionResult?.submittedAt || Date.now()).toLocaleTimeString()}`
              : `${Object.keys(selectedAnswers).length} of ${questions.length} answered`}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isReviewed ? 'Close' : 'Cancel'}
            </button>

            {!isReviewed && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Grading Test...' : 'Submit Answers & View Score'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQTestRunnerModal;
