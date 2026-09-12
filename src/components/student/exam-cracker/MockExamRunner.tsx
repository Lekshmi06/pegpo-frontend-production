import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Pause,
  Play,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import userImg from '../../../assets/user.png';
import {
  MockExamItem,
  MockExamQuestion,
  CbtQuestionStatus,
  MockExamSessionResult,
} from '../../../types/testTypes';
import { TimerBadge } from '../common/TimerBadge';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useToast } from '../../../hooks/useToast';

interface MockExamRunnerProps {
  exam: MockExamItem;
  studentProfile?: any;
  onExit: () => void;
  onFinishExam: (result: MockExamSessionResult) => void;
}

export const MockExamRunner: React.FC<MockExamRunnerProps> = ({
  exam,
  studentProfile,
  onExit,
  onFinishExam,
}) => {
  const toast = useToast();

  // Flatten all questions across sections
  const allQuestions: MockExamQuestion[] = [];
  exam.sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      allQuestions.push(q);
    });
  });

  const [activeSectionId, setActiveSectionId] = useState<string>(
    exam.sections[0]?.id || ''
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [statusMap, setStatusMap] = useState<Record<string | number, CbtQuestionStatus>>(() => {
    const initial: Record<string | number, CbtQuestionStatus> = {};
    allQuestions.forEach((q, idx) => {
      initial[q.id] = idx === 0 ? 'not_answered' : 'not_visited';
    });
    return initial;
  });

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  const activeQuestion = allQuestions[currentQuestionIndex] || allQuestions[0];

  // When current question changes, if it was 'not_visited', mark it as 'not_answered'
  useEffect(() => {
    if (activeQuestion && statusMap[activeQuestion.id] === 'not_visited') {
      setStatusMap((prev) => ({
        ...prev,
        [activeQuestion.id]: 'not_answered' as CbtQuestionStatus,
      }));
    }
    // Sync activeSectionId
    if (activeQuestion && activeQuestion.sectionId !== activeSectionId) {
      setActiveSectionId(activeQuestion.sectionId);
    }
  }, [currentQuestionIndex, activeQuestion]);

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: optionId,
    }));
  };

  const handleSaveAndNext = () => {
    const hasAnswer = !!answers[activeQuestion.id];
    setStatusMap((prev) => ({
      ...prev,
      [activeQuestion.id]: (hasAnswer ? 'answered' : 'not_answered') as CbtQuestionStatus,
    }));

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handleMarkForReviewAndNext = () => {
    const hasAnswer = !!answers[activeQuestion.id];
    setStatusMap((prev) => ({
      ...prev,
      [activeQuestion.id]: (hasAnswer ? 'answered_and_marked' : 'marked_for_review') as CbtQuestionStatus,
    }));

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[activeQuestion.id];
      return next;
    });
    setStatusMap((prev) => ({
      ...prev,
      [activeQuestion.id]: 'not_answered' as CbtQuestionStatus,
    }));
    toast.info('Response cleared for this question');
  };

  const handleJumpToQuestion = (idx: number) => {
    // preserve status of question we are leaving if unanswered
    if (!answers[activeQuestion.id] && statusMap[activeQuestion.id] === 'not_visited') {
      setStatusMap((prev) => ({ ...prev, [activeQuestion.id]: 'not_answered' as CbtQuestionStatus }));
    }
    setCurrentQuestionIndex(idx);
  };

  const handleSelectSection = (secId: string) => {
    setActiveSectionId(secId);
    const targetIdx = allQuestions.findIndex((q) => q.sectionId === secId);
    if (targetIdx !== -1) {
      handleJumpToQuestion(targetIdx);
    }
  };

  // Evaluation on Submit
  const handleFinalSubmit = () => {
    setShowSubmitModal(false);

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let answeredCount = 0;

    const sectionBreakdownMap: Record<
      string,
      {
        sectionId: string;
        sectionName: string;
        score: number;
        maxScore: number;
        attempted: number;
        correct: number;
        incorrect: number;
        accuracy: number;
        timeSpentSeconds: number;
      }
    > = {};

    exam.sections.forEach((sec) => {
      sectionBreakdownMap[sec.id] = {
        sectionId: sec.id,
        sectionName: sec.name,
        score: 0,
        maxScore: sec.totalQuestions * sec.marksPerQuestion,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
        timeSpentSeconds: Math.round(timeSpentSeconds / exam.sections.length),
      };
    });

    allQuestions.forEach((q) => {
      const chosen = answers[q.id];
      const secData = sectionBreakdownMap[q.sectionId];
      const marks = q.marks || 2;
      const neg = q.negativeMarks || 0;

      if (chosen) {
        answeredCount += 1;
        if (secData) secData.attempted += 1;

        if (chosen === q.correctAnswer) {
          totalScore += marks;
          correctCount += 1;
          if (secData) {
            secData.score += marks;
            secData.correct += 1;
          }
        } else {
          totalScore -= neg;
          incorrectCount += 1;
          if (secData) {
            secData.score -= neg;
            secData.incorrect += 1;
          }
        }
      }
    });

    const skippedCount = allQuestions.length - answeredCount;
    const markedReviewCount = Object.values(statusMap).filter(
      (s) => s === 'marked_for_review' || s === 'answered_and_marked'
    ).length;

    // Calculate percentages
    const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const percentage =
      exam.totalMarks > 0 ? Math.round((finalScore / exam.totalMarks) * 100) : 0;
    const accuracy =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    // Calculate section accuracies
    Object.values(sectionBreakdownMap).forEach((s) => {
      s.accuracy = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
      s.score = Math.max(0, Math.round(s.score * 100) / 100);
    });

    // Simulated competitive percentile & rank
    const percentile = Math.min(
      99.8,
      Math.max(35.0, Math.round((percentage * 1.05 + 15) * 10) / 10)
    );
    const totalCandidatesEstimate = 45200;
    const rankEstimate = Math.max(
      1,
      Math.round(totalCandidatesEstimate * ((100 - percentile) / 100))
    );

    const result: MockExamSessionResult = {
      examId: exam.id,
      examTitle: exam.title,
      category: exam.category,
      totalMarks: exam.totalMarks,
      score: finalScore,
      percentage,
      percentile,
      rankEstimate,
      totalCandidatesEstimate,
      accuracy,
      timeSpentSeconds,
      totalQuestions: allQuestions.length,
      answeredCount,
      correctCount,
      incorrectCount,
      skippedCount,
      markedReviewCount,
      answers,
      statusByQuestion: statusMap,
      sectionBreakdown: Object.values(sectionBreakdownMap),
      questions: allQuestions,
    };

    onFinishExam(result);
  };

  // Counts for sidebar legend
  const answeredTotal = Object.values(statusMap).filter((s) => s === 'answered').length;
  const notAnsweredTotal = Object.values(statusMap).filter((s) => s === 'not_answered').length;
  const markedReviewTotal = Object.values(statusMap).filter(
    (s) => s === 'marked_for_review'
  ).length;
  const answeredAndMarkedTotal = Object.values(statusMap).filter(
    (s) => s === 'answered_and_marked'
  ).length;
  const notVisitedTotal = Object.values(statusMap).filter((s) => s === 'not_visited').length;

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fbfe] text-slate-800 select-none overflow-hidden fixed inset-0 z-50">
      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Examination"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Are you sure you want to submit your examination paper? You will not be able to change your answers once submitted.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Answered</span>
              <span className="text-emerald-600 text-lg font-extrabold">
                {answeredTotal + answeredAndMarkedTotal}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Not Answered</span>
              <span className="text-rose-500 text-lg font-extrabold">{notAnsweredTotal}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Marked for Review</span>
              <span className="text-purple-600 text-lg font-extrabold">
                {markedReviewTotal + answeredAndMarkedTotal}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Not Visited</span>
              <span className="text-slate-500 text-lg font-extrabold">{notVisitedTotal}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setShowSubmitModal(false)}>
              Resume Exam
            </Button>
            <Button
              size="sm"
              onClick={handleFinalSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Yes, Final Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exit Modal */}
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title="Exit Exam">
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-600 font-medium">
            Leaving now will terminate this examination attempt. Your responses will not be evaluated.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowExitModal(false)}>
              Continue Exam
            </Button>
            <Button size="sm" onClick={onExit} className="bg-rose-600 hover:bg-rose-700 text-white">
              Exit Without Saving
            </Button>
          </div>
        </div>
      </Modal>

      {/* CBT Top Header Bar */}
      <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 sm:px-8 shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitModal(true)}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer"
            title="Exit Exam"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-[#111827] truncate max-w-xs sm:max-w-md">
              {exam.title}
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {exam.category} • Total Questions: {allQuestions.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time Countdown Timer */}
          <TimerBadge
            mode="countdown"
            durationMinutes={exam.durationMinutes}
            isPaused={isPaused}
            onTimeUpdate={(elapsed) => setTimeSpentSeconds(elapsed)}
            onTimeout={handleFinalSubmit}
            onTogglePause={() => setIsPaused(!isPaused)}
            showControls={true}
          />

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={studentProfile?.avatar || userImg}
              alt="Candidate"
              className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-2xs hidden sm:block"
            />
            <Button
              size="sm"
              onClick={() => setShowSubmitModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Submit Exam
            </Button>
          </div>
        </div>
      </header>

      {/* Section Switcher Tabs */}
      <div className="h-11 bg-[#eaf3fa] border-b border-[#cbd5e1]/60 px-4 sm:px-8 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mr-2 shrink-0">
          Sections:
        </span>
        {exam.sections.map((sec) => {
          const isActive = sec.id === activeSectionId;
          return (
            <button
              key={sec.id}
              onClick={() => handleSelectSection(sec.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#0091ff] shadow-xs'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              {sec.name} ({sec.totalQuestions})
            </button>
          );
        })}
      </div>

      {/* Main Examination Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area (Left) */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-8 bg-white">
          <div className="space-y-6 max-w-3xl">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#0091ff]">
                  Question {currentQuestionIndex + 1} of {allQuestions.length}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                  {activeQuestion.sectionName}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-emerald-600">+{activeQuestion.marks || 2} Marks</span>
                {activeQuestion.negativeMarks ? (
                  <span className="text-rose-500">-{activeQuestion.negativeMarks} Negative</span>
                ) : (
                  <span className="text-slate-400">No Negative</span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-bold text-[#111827] leading-relaxed whitespace-pre-line">
              {activeQuestion.text}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {activeQuestion.options.map((opt) => {
                const isSelected = answers[activeQuestion.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#0091ff] text-[#0091ff] shadow-xs font-bold ring-2 ring-[#0091ff]/20'
                        : 'bg-[#f8fafc] border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#0091ff] text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-xs sm:text-sm">{opt.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="border-t border-slate-100 pt-4 mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkForReviewAndNext}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-colors cursor-pointer"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Previous
                </button>
              )}
              <Button
                onClick={handleSaveAndNext}
                className="px-6 py-2 bg-[#0091ff] hover:bg-[#007cdb] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save & Next &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (Right) */}
        <aside className="w-72 sm:w-80 bg-[#f1f6fb] border-l border-[#cbd5e1]/60 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4 select-none">
          {/* Candidate Card */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center gap-3">
            <img
              src={studentProfile?.avatar || userImg}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div className="truncate">
              <div className="text-xs font-extrabold text-[#111827]">
                {studentProfile?.name || 'Student Candidate'}
              </div>
              <div className="text-[10px] font-bold text-emerald-600">Active CBT Session</div>
            </div>
          </div>

          {/* Palette Legend */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2 text-[11px] font-bold">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  {answeredTotal}
                </span>
                <span className="text-slate-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center text-[10px]">
                  {notAnsweredTotal}
                </span>
                <span className="text-slate-600">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px]">
                  {markedReviewTotal}
                </span>
                <span className="text-slate-600">Marked Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px] relative">
                  {answeredAndMarkedTotal}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white" />
                </span>
                <span className="text-slate-600">Ans & Marked</span>
              </div>
            </div>
          </div>

          {/* Question Palette Number Grid */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 flex-1">
            <h3 className="text-xs font-extrabold text-[#111827] uppercase tracking-wide">
              Question Palette
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {allQuestions.map((q, idx) => {
                const status = statusMap[q.id] || 'not_visited';
                const isCurrent = idx === currentQuestionIndex;

                let colorClasses = 'bg-slate-200 text-slate-700 hover:bg-slate-300';
                if (status === 'answered') {
                  colorClasses = 'bg-emerald-500 text-white hover:bg-emerald-600';
                } else if (status === 'not_answered') {
                  colorClasses = 'bg-rose-500 text-white hover:bg-rose-600';
                } else if (status === 'marked_for_review') {
                  colorClasses = 'bg-purple-600 text-white hover:bg-purple-700';
                } else if (status === 'answered_and_marked') {
                  colorClasses = 'bg-purple-600 text-white hover:bg-purple-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer relative ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-[#0091ff] scale-105 shadow-xs' : ''
                    }`}
                  >
                    {idx + 1}
                    {status === 'answered_and_marked' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
