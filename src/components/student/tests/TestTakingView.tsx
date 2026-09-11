import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Pause,
  Play,
  Search,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import userImg from '../../../assets/user.png';
import { TestItem, QuestionStatus } from '../../../types/test';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useToast } from '../../../hooks/useToast';

interface TestTakingViewProps {
  test: TestItem;
  attemptId?: string;
  isSubmitting?: boolean;
  studentProfile?: any;
  onExit: () => void;
  onFinish: (results: {
    attemptId?: string;
    answers: Record<number | string, string>;
    statusByQuestion: Record<number | string, QuestionStatus>;
    timeSpentSeconds: number;
  }) => void;
}

export default function TestTakingView({
  test,
  attemptId,
  isSubmitting,
  studentProfile,
  onExit,
  onFinish,
}: TestTakingViewProps) {
  const toast = useToast();

  const testIdKey = test.id || test._id || 'active_test';
  const answersStorageKey = `edupye_answers_${testIdKey}`;
  const statusStorageKey = `edupye_status_${testIdKey}`;
  const timeStorageKey = `edupye_time_${testIdKey}`;

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = sessionStorage.getItem(answersStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [statusByQuestion, setStatusByQuestion] = useState<
    Record<number, QuestionStatus>
  >(() => {
    try {
      const saved = sessionStorage.getItem(statusStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(timeStorageKey);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const questions = test.questions || [];
  const currentQuestion = questions[currentQuestionIdx] || {
    id: 1,
    question: 'Loading question...',
    sidebarTitle: 'Question',
    options: [],
  };

  const isUntimedMode = !test.durationMinutes || test.durationMinutes === 0 || Boolean((test as any).isUntimed);

  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>(
    isUntimedMode ? 'stopwatch' : test.durationMinutes ? 'countdown' : 'stopwatch'
  );

  // Live timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => {
        const next = prev + 1;
        // Auto-finish only if in timed countdown mode and expires
        if (!isUntimedMode && test.durationMinutes && next >= test.durationMinutes * 60) {
          clearInterval(timer);
          setShowFinishConfirm(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, test.durationMinutes, isUntimedMode]);

  // Persist answers, statuses, and time to sessionStorage for refresh tolerance
  useEffect(() => {
    try {
      sessionStorage.setItem(answersStorageKey, JSON.stringify(answers));
      sessionStorage.setItem(statusStorageKey, JSON.stringify(statusByQuestion));
      sessionStorage.setItem(timeStorageKey, String(timeElapsed));
    } catch {
      // ignore quota issues
    }
  }, [answers, statusByQuestion, timeElapsed, answersStorageKey, statusStorageKey, timeStorageKey]);

  const clearSessionProgress = () => {
    try {
      sessionStorage.removeItem(answersStorageKey);
      sessionStorage.removeItem(statusStorageKey);
      sessionStorage.removeItem(timeStorageKey);
    } catch {
      // ignore
    }
  };

  // Format timer as HH : MM : SS
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  };

  const totalAllowedSeconds = (test.durationMinutes || 60) * 60;
  const remainingSeconds = Math.max(0, totalAllowedSeconds - timeElapsed);
  const isLowTime = timerMode === 'countdown' && remainingSeconds <= 300 && remainingSeconds > 60;
  const isCriticalTime = timerMode === 'countdown' && remainingSeconds <= 60 && remainingSeconds > 0;

  // Counts: Attempted, Revise Later, and Unanswered/Skipped
  const attemptedCount = Object.values(statusByQuestion).filter(
    (s) => s === 'attempted'
  ).length;
  const reviseCount = Object.values(statusByQuestion).filter(
    (s) => s === 'revise'
  ).length;
  const skippedCount = Math.max(0, questions.length - attemptedCount - reviseCount);

  const completionPercentage =
    questions.length > 0
      ? Math.round((attemptedCount / questions.length) * 100)
      : 0;

  const handleSelectOption = (optId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optId }));
    setStatusByQuestion((prev) => ({
      ...prev,
      [currentQuestionIdx]: 'attempted',
    }));
  };

  const handleAttemptLater = () => {
    setStatusByQuestion((prev) => ({
      ...prev,
      [currentQuestionIdx]: 'revise',
    }));
    toast.info('Question marked for Revise Later');
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (statusByQuestion[currentQuestionIdx] !== 'attempted') {
      setStatusByQuestion((prev) => ({
        ...prev,
        [currentQuestionIdx]: 'skipped',
      }));
    }
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleExitNow = () => {
    clearSessionProgress();
    setShowExitConfirm(false);
    onExit();
  };

  const submitTest = () => {
    clearSessionProgress();
    setShowFinishConfirm(false);
    onFinish({
      attemptId,
      answers,
      statusByQuestion,
      timeSpentSeconds: timeElapsed,
    });
  };

  return (
    <div className="flex h-full w-full bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Leave Test?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Are you sure you want to exit? Your current answers and progress for{' '}
            <strong>{test.title}</strong> will be discarded.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitConfirm(false)}
            >
              Resume Test
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleExitNow}
            >
              Exit Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Finish Confirmation Modal */}
      <Modal
        isOpen={showFinishConfirm}
        onClose={() => setShowFinishConfirm(false)}
        title="Submit Test"
      >
        <div className="space-y-4">
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-emerald-800">
              Test Completion Summary
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white rounded-xl p-2 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">
                  Attempted
                </span>
                <span className="text-sm font-extrabold text-[#0d9488]">
                  {attemptedCount} / {questions.length}
                </span>
              </div>
              <div className="bg-white rounded-xl p-2 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">
                  Revise Later
                </span>
                <span className="text-sm font-extrabold text-[#f59e0b]">
                  {reviseCount}
                </span>
              </div>
              <div className="bg-white rounded-xl p-2 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">
                  Unanswered
                </span>
                <span className="text-sm font-extrabold text-slate-500">
                  {questions.length - attemptedCount}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Once submitted, your final marks, score breakdown, and step-by-step
            solutions will be evaluated immediately.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFinishConfirm(false)}
            >
              Keep Reviewing
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white disabled:opacity-50"
              onClick={submitTest}
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Test'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pause Modal */}
      <Modal
        isOpen={isPaused}
        onClose={() => setIsPaused(false)}
        title="Test Paused"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <Pause className="w-6 h-6 stroke-[2.5]" />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            The timer is paused. Take a breath and resume whenever you're ready!
          </p>
          <Button
            className="w-full py-2.5 bg-[#0d9488] hover:bg-[#0f766e]"
            onClick={() => setIsPaused(false)}
          >
            Resume Test
          </Button>
        </div>
      </Modal>

      {/* Left Sidebar: Test Summary & Question List (Image 1) */}
      <aside className="w-64 bg-white border-r border-[#e2ebf4] flex flex-col flex-shrink-0 select-none overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Test Summary Section */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-extrabold text-[#111827] tracking-tight">
              Test Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#2dd4bf] shrink-0"></span>
                  <span>Attempted</span>
                </div>
                <span className="font-bold text-slate-700">{attemptedCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shrink-0"></span>
                  <span>Revise Later</span>
                </div>
                <span className="font-bold text-slate-700">{reviseCount}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#64748b] shrink-0"></span>
                  <span>Skipped</span>
                </div>
                <span className="font-bold text-slate-700">{skippedCount}</span>
              </div>
            </div>
          </div>

          {/* Question List Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-[#111827] tracking-tight">
              Question List
            </h3>
            <div className="space-y-1.5">
              {questions.map((q, idx) => {
                const isCurrent = currentQuestionIdx === idx;
                const status = statusByQuestion[idx];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-full text-left p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-xs font-semibold ${
                      isCurrent
                        ? 'bg-[#f1f5f9] text-[#111827] shadow-2xs font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[11px] font-bold transition-colors ${
                        isCurrent
                          ? 'bg-white text-[#111827] shadow-2xs border border-slate-200'
                          : status === 'attempted'
                          ? 'bg-[#2dd4bf]/20 text-[#0f766e]'
                          : status === 'revise'
                          ? 'bg-[#fef3c7] text-[#ca8a04]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="line-clamp-2 leading-relaxed flex-1">
                      {q.sidebarTitle || q.question}
                    </span>
                    {status === 'attempted' && (
                      <span className="w-2 h-2 rounded-full bg-[#2dd4bf] mt-1.5 shrink-0" />
                    )}
                    {status === 'revise' && (
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] mt-1.5 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Matching Image 1: CBSE, CLASS 10, EN, Search, Profile) */}
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-6 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-[#f1f5f9] text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs uppercase">
              {studentProfile?.education?.board || test.board || 'CBSE'}
            </span>
            <span className="px-3 py-1.5 bg-[#f1f5f9] text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs uppercase">
              {studentProfile?.education?.classLevel || test.classLevel || 'CLASS 10'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer hidden sm:block">
              EN
            </span>

            <div className="relative w-44 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-[#f8fafc] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0d9488]"
              />
            </div>

            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={studentProfile?.avatar || userImg}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              <span className="text-xs font-bold text-[#0d9488] hidden md:inline">
                {studentProfile?.name ? studentProfile.name.split(' ')[0] : 'Profile'}
              </span>
            </div>
          </div>
        </header>

        {/* Sub-Header: Back arrow, Progress Bar (% COMPLETED), Live Timer */}
        <div className="bg-white border-b border-[#e2ebf4] px-6 md:px-8 py-3 flex items-center justify-between gap-6">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Exit Test"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Progress Bar with % COMPLETED */}
          <div className="flex-1 max-w-xl flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="h-full bg-[#2dd4bf] transition-all duration-300 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#0d9488] tracking-wider whitespace-nowrap">
              {completionPercentage}% COMPLETED
            </span>
          </div>

          {/* Live Timer with Countdown / Stopwatch mode */}
          {isUntimedMode ? (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-800 select-none shrink-0"
              title="Untimed self-paced practice mode"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              <span className="text-xs font-bold tracking-wider font-mono text-emerald-900">
                {formatTimer(timeElapsed)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded-md">
                Untimed Practice
              </span>
            </div>
          ) : (
            <div
              onClick={() => setTimerMode((prev) => (prev === 'countdown' ? 'stopwatch' : 'countdown'))}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none shrink-0 ${
                isCriticalTime
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : isLowTime
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title={`Click to switch to ${timerMode === 'countdown' ? 'elapsed time (stopwatch)' : 'remaining time (countdown)'}`}
            >
              <Clock className={`w-3.5 h-3.5 stroke-[2] ${isLowTime ? 'text-amber-600' : isCriticalTime ? 'text-rose-600' : 'text-slate-500'}`} />
              <span className="text-xs font-bold tracking-wider font-mono">
                {formatTimer(timerMode === 'countdown' ? remainingSeconds : timeElapsed)}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-tight text-slate-400">
                {timerMode === 'countdown' ? 'Left' : 'Elapsed'}
              </span>
            </div>
          )}
        </div>

        {/* Question View Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col justify-between bg-[#f8fbfe]">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Main Question Card (Image 1) */}
            <div className="bg-white rounded-2xl border border-[#e2ebf4] shadow-xs p-6 md:p-8 space-y-6">
              {/* Question Card Top Bar: Badge, Attempt Later button, Pause button */}
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#f1f5f9] text-[#0d9488] font-bold text-sm flex items-center justify-center border border-slate-200 shadow-2xs">
                  {currentQuestionIdx + 1}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAttemptLater}
                    className="px-4 py-1.5 bg-[#fffbeb] hover:bg-[#fef3c7] text-[#d97706] border border-[#fde68a] text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Attempt Later
                  </button>

                  <button
                    onClick={() => setIsPaused(true)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Pause Test"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Statement in Teal text */}
              <div className="pt-2">
                <h2 className="text-base md:text-lg font-bold text-[#0d9488] leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestionIdx] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3.5 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-150 border ${
                        isSelected
                          ? 'border-[#0d9488] bg-[#f0fdfa] shadow-xs'
                          : 'border-slate-200 bg-white hover:border-[#2dd4bf]/70 hover:bg-slate-50/70'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#0d9488] text-white'
                            : 'bg-[#f1f5f9] text-slate-600'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span
                        className={`text-xs md:text-sm font-semibold ${
                          isSelected ? 'text-[#0f766e]' : 'text-slate-800'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls: Previous, Skip, Next, Finish */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={handlePrevious}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentQuestionIdx === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs'
                }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSkip}
                  className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  Skip
                </button>

                {currentQuestionIdx < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-[#d8eaf8] hover:bg-[#c5dff2] text-[#1c3352] rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                ) : null}

                <Button
                  onClick={() => setShowFinishConfirm(true)}
                  className="px-6 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  Finish Test
                </Button>
              </div>
            </div>
          </div>

          {/* Floating Action Button (⚡ icon in bottom right) */}
          <div className="fixed bottom-6 right-6 z-20">
            <button
              onClick={() => toast.info('Quick Test Mode active')}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0d9488] flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              title="Quick Action"
            >
              <Zap className="w-5 h-5 fill-slate-800 hover:fill-[#0d9488]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
