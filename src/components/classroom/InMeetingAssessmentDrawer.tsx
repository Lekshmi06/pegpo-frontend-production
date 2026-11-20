import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Send,
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  BarChart2,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  InMeetingAssessment,
  InMeetingQuestion,
  InMeetingSubmission,
  LiveAssessmentType,
} from '../../types/webrtc';

interface InMeetingAssessmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  sessionId: string;
  programId?: string;
  assessments: InMeetingAssessment[];
  studentSubmissions: Map<string, InMeetingSubmission>;
  onPublishAssessment: (data: any) => Promise<void> | void;
  onSubmitAssessment: (assessmentId: string, answers: any[]) => Promise<void> | void;
  onCloseAssessment: (assessmentId: string) => Promise<void> | void;
  currentUserId?: string;
  currentUserName?: string;
}

export const InMeetingAssessmentDrawer: React.FC<InMeetingAssessmentDrawerProps> = ({
  isOpen,
  onClose,
  isHost,
  sessionId,
  programId,
  assessments = [],
  studentSubmissions,
  onPublishAssessment,
  onSubmitAssessment,
  onCloseAssessment,
  currentUserId = '',
  currentUserName = 'Student',
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Teacher Form State
  const [type, setType] = useState<LiveAssessmentType>('quiz');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(5);
  const [questions, setQuestions] = useState<InMeetingQuestion[]>([
    {
      id: `q-${Date.now()}-1`,
      question: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0,
      points: 1,
    },
  ]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Student Taking State
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);

  // Auto-select latest active assessment for student
  useEffect(() => {
    if (!isHost && assessments.length > 0) {
      const activeUnsubmitted = assessments.find((a) => {
        const hasSubmitted =
          studentSubmissions.has(a._id) ||
          a.submissions?.some((s) => s.studentId === currentUserId);
        return a.status === 'active' && !hasSubmitted;
      });
      if (activeUnsubmitted) {
        setSelectedAssessmentId(activeUnsubmitted._id);
        if (activeUnsubmitted.timeLimitMinutes && activeUnsubmitted.timeLimitMinutes > 0) {
          setActiveTimerSeconds(activeUnsubmitted.timeLimitMinutes * 60);
        }
      } else if (!selectedAssessmentId && assessments[0]) {
        setSelectedAssessmentId(assessments[0]._id);
      }
    }
  }, [assessments, isHost, studentSubmissions, currentUserId]);

  // Countdown timer effect for student
  useEffect(() => {
    if (activeTimerSeconds === null || activeTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setActiveTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerSeconds]);

  if (!isOpen) return null;

  // Add question to teacher form
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        question: '',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
        points: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof InMeetingQuestion, val: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q))
    );
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = val;
        return { ...q, options: newOpts };
      })
    );
  };

  // Quick preset loader
  const handleApplyPreset = (preset: 'quick_check' | 'pop_quiz' | 'task') => {
    if (preset === 'quick_check') {
      setType('quiz');
      setTitle('Concept Check: Understood?');
      setInstructions('Quick poll: Select your confidence or answer.');
      setTimeLimitMinutes(2);
      setQuestions([
        {
          id: `q-${Date.now()}-1`,
          question: 'Are you clear with the formula derived on the SmartBoard?',
          options: ['Yes, completely clear', 'Somewhat clear, need 1 more example', 'Not clear at all'],
          correctOptionIndex: 0,
          points: 1,
        },
      ]);
    } else if (preset === 'pop_quiz') {
      setType('quiz');
      setTitle('In-Class Pop Quiz');
      setInstructions('Answer the following 2 questions. Auto-graded immediately.');
      setTimeLimitMinutes(5);
      setQuestions([
        {
          id: `q-${Date.now()}-1`,
          question: 'What is the SI unit of Electric Current?',
          options: ['Volt (V)', 'Ampere (A)', 'Ohm (Ω)', 'Watt (W)'],
          correctOptionIndex: 1,
          points: 5,
        },
        {
          id: `q-${Date.now()}-2`,
          question: 'Ohm’s law states that V is directly proportional to:',
          options: ['Current (I)', 'Power (P)', 'Time (t)', 'Charge (Q)'],
          correctOptionIndex: 0,
          points: 5,
        },
      ]);
    } else if (preset === 'task') {
      setType('assignment');
      setTitle('Class Exercise & Homework');
      setInstructions('Solve problem #4 from the lecture notes. Submissions sync to the Workspace Homework tab.');
      setTimeLimitMinutes(15);
      setQuestions([
        {
          id: `q-${Date.now()}-1`,
          question: 'State your final calculated numerical answer and brief steps:',
          options: ['Option A: 24.5 m/s', 'Option B: 18.2 m/s', 'Option C: 32.0 m/s', 'Option D: 12.0 m/s'],
          correctOptionIndex: 0,
          points: 10,
        },
      ]);
    }
  };

  // Teacher publish
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setIsSubmittingForm(true);
      await onPublishAssessment({
        sessionId,
        programId,
        type,
        title: title.trim(),
        instructions: instructions.trim(),
        timeLimitMinutes,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0),
        questions,
      });
      setTitle('');
      setInstructions('');
      setActiveTab('list');
    } catch (err) {
      console.error('[InMeetingAssessment] Error publishing assessment:', err);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Student submit
  const handleStudentSubmit = async (assessmentId: string) => {
    try {
      setIsSubmittingAnswers(true);
      const formattedAnswers = Object.entries(studentAnswers).map(
        ([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        })
      );
      await onSubmitAssessment(assessmentId, formattedAnswers);
    } catch (err) {
      console.error('[InMeetingAssessment] Error submitting answers:', err);
    } finally {
      setIsSubmittingAnswers(false);
    }
  };

  const selectedAssessment = assessments.find((a) => a._id === selectedAssessmentId);
  const mySubmission = selectedAssessment
    ? studentSubmissions.get(selectedAssessment._id) ||
      selectedAssessment.submissions?.find((s) => s.studentId === currentUserId)
    : null;

  return (
    <aside className="w-96 max-w-full bg-slate-900 border-l border-slate-800 flex flex-col h-full z-40 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
        <div className="flex items-center gap-2 text-white font-extrabold text-sm">
          <Award className="w-4 h-4 text-purple-400" />
          <span>Tests, Quizzes & Tasks</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Teacher Tabs */}
      {isHost && (
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-1 gap-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Active & Results ({assessments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Launch New</span>
          </button>
        </div>
      )}

      {/* Main Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TEACHER CREATE FORM */}
        {isHost && activeTab === 'create' ? (
          <form onSubmit={handlePublish} className="space-y-4">
            {/* Quick Presets */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick 1-Click Templates
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('quick_check')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-600/50 text-left transition-all cursor-pointer text-xs group"
                >
                  <span className="font-bold text-slate-200 group-hover:text-purple-300 block text-[11px]">
                    Concept Check
                  </span>
                  <span className="text-[10px] text-slate-500">1 Quick Q</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('pop_quiz')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-600/50 text-left transition-all cursor-pointer text-xs group"
                >
                  <span className="font-bold text-slate-200 group-hover:text-purple-300 block text-[11px]">
                    Pop Quiz
                  </span>
                  <span className="text-[10px] text-slate-500">2 MCQs</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('task')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-600/50 text-left transition-all cursor-pointer text-xs group"
                >
                  <span className="font-bold text-slate-200 group-hover:text-purple-300 block text-[11px]">
                    Class Task
                  </span>
                  <span className="text-[10px] text-slate-500">Sync HW</span>
                </button>
              </div>
            </div>

            {/* Assessment Type */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['quiz', 'test', 'assignment'] as LiveAssessmentType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-1.5 text-xs font-bold rounded-lg border capitalize cursor-pointer transition-all ${
                      type === t
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Title / Topic <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electric Charges & Fields Quick Check"
                className="w-full bg-slate-800 text-white text-xs rounded-xl px-3 py-2 border border-slate-700 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Instructions / Formula Hints
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Read questions carefully. All answers are final upon submission."
                className="w-full bg-slate-800 text-white text-xs rounded-xl px-3 py-2 border border-slate-700 focus:border-purple-500 outline-none resize-none"
              />
            </div>

            {/* Time Limit */}
            <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">Time Limit (mins):</span>
              </div>
              <input
                type="number"
                min={0}
                max={120}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 0)}
                className="w-16 bg-slate-900 text-white text-xs rounded-lg px-2 py-1 text-center font-bold border border-slate-700 outline-none"
              />
            </div>

            {/* Questions list */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-200">
                  Questions ({questions.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-purple-400 uppercase tracking-wide">
                      Q{qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Enter question text..."
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 outline-none"
                  />

                  {/* Options */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Options (Click radio to mark correct answer)
                    </label>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctOptionIndex === oIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', oIdx)}
                          className="accent-purple-500 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                          className="flex-1 bg-slate-900 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Launch button */}
            <button
              type="submit"
              disabled={isSubmittingForm || !title.trim()}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmittingForm ? 'Broadcasting...' : 'Broadcast to Meeting'}</span>
            </button>
          </form>
        ) : isHost && activeTab === 'list' ? (
          /* TEACHER ASSESSMENTS LIST & LEADERBOARD */
          <div className="space-y-3">
            {assessments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
                <p className="text-xs font-semibold">No in-meeting assessments yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Launch a quick quiz or pop-test above to engage students.
                </p>
              </div>
            ) : (
              assessments.map((a) => (
                <div
                  key={a._id}
                  className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                            a.status === 'active'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40 animate-pulse'
                              : 'bg-slate-900 text-slate-400 border-slate-700/60'
                          }`}
                        >
                          {a.status}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-purple-400">
                          {a.type}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white mt-1">{a.title}</h4>
                      {a.instructions && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {a.instructions}
                        </p>
                      )}
                    </div>
                    {a.status === 'active' && (
                      <button
                        onClick={() => onCloseAssessment(a._id)}
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/40 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                      >
                        End
                      </button>
                    )}
                  </div>

                  {/* Submission Leaderboard */}
                  <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Submissions ({a.submissions?.length || 0})</span>
                      </span>
                      <span className="text-slate-400">
                        Total {a.totalPoints || 100} Pts
                      </span>
                    </div>

                    {(!a.submissions || a.submissions.length === 0) ? (
                      <p className="text-[10px] text-slate-500 italic py-1">
                        Waiting for student responses...
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
                        {a.submissions.map((sub, sIdx) => (
                          <div
                            key={sub.studentId || sIdx}
                            className="flex items-center justify-between text-[11px] bg-slate-800/60 px-2 py-1 rounded"
                          >
                            <span className="font-semibold text-slate-200">
                              {sub.studentName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {sub.score} / {sub.totalPossible}
                              </span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                  sub.percentage >= 80
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : sub.percentage >= 50
                                    ? 'bg-amber-950 text-amber-400'
                                    : 'bg-rose-950 text-rose-400'
                                }`}
                              >
                                {sub.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* STUDENT MODE: ACTIVE QUIZ TAKER OR SCORE CARD */
          <div className="space-y-4">
            {/* Active Assessment Selector Pill List if multiple */}
            {assessments.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {assessments.map((a) => (
                  <button
                    key={a._id}
                    onClick={() => {
                      setSelectedAssessmentId(a._id);
                      if (a.timeLimitMinutes && a.timeLimitMinutes > 0) {
                        setActiveTimerSeconds(a.timeLimitMinutes * 60);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      selectedAssessmentId === a._id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {a.title}
                  </button>
                ))}
              </div>
            )}

            {!selectedAssessment ? (
              <div className="text-center py-10 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
                <p className="text-xs font-semibold">No active in-meeting test right now.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  When your instructor launches a quiz, test, or task, it will pop up here in real time.
                </p>
              </div>
            ) : mySubmission ? (
              /* INSTANT RESULT & SCORE CARD */
              <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {selectedAssessment.title} Submitted!
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your answers were auto-graded instantly.
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Your In-Meeting Score
                  </span>
                  <div className="text-2xl font-black text-emerald-400 my-1">
                    {mySubmission.score} / {mySubmission.totalPossible}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      mySubmission.percentage >= 80
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : mySubmission.percentage >= 50
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                        : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                    }`}
                  >
                    {mySubmission.percentage}% Score
                  </span>
                </div>
              </div>
            ) : (
              /* ACTIVE QUIZ FORM FOR STUDENT */
              <div className="space-y-4">
                <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                      Live {selectedAssessment.type}
                    </span>
                    {activeTimerSeconds !== null && (
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(activeTimerSeconds / 60)}:
                        {String(activeTimerSeconds % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-extrabold text-white">
                    {selectedAssessment.title}
                  </h3>
                  {selectedAssessment.instructions && (
                    <p className="text-[11px] text-slate-300">
                      {selectedAssessment.instructions}
                    </p>
                  )}
                </div>

                {/* Questions */}
                <div className="space-y-3">
                  {selectedAssessment.questions?.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>
                          Q{qIdx + 1}. {q.question}
                        </span>
                        <span className="text-[10px] text-purple-400 font-extrabold">
                          {q.points || 1} Pt
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = studentAnswers[q.id] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() =>
                                setStudentAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx,
                                }))
                              }
                              className={`w-full text-left p-2 rounded-lg text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                                  : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={() => handleStudentSubmit(selectedAssessment._id)}
                  disabled={
                    isSubmittingAnswers ||
                    Object.keys(studentAnswers).length <
                      (selectedAssessment.questions?.length || 1)
                  }
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmittingAnswers
                      ? 'Submitting & Auto-grading...'
                      : 'Submit Answers Now'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
