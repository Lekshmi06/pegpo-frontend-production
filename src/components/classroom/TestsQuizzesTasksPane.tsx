import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  HelpCircle,
  ClipboardList,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Send,
  Award,
  ChevronRight,
  BookOpen,
  FileText,
  Upload,
  ExternalLink,
  Loader2,
  Paperclip,
  Check,
} from 'lucide-react';
import {
  InMeetingAssessment,
  InMeetingSubmission,
} from '../../types/webrtc';
import {
  tuitionService,
  TuitionProgramAssessmentItem,
  TuitionMCQQuestion,
} from '../../services/tuitionService';
import { MCQTestBuilderModal } from '../tuition/MCQTestBuilderModal';
import { MCQTestRunnerModal } from '../tuition/MCQTestRunnerModal';
import { PostAssignmentModal } from '../tuition/PostAssignmentModal';
import { AssignmentSubmissionsModal } from '../tuition/AssignmentSubmissionsModal';

interface TestsQuizzesTasksPaneProps {
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
  programDetails?: any;
  defaultTab?: 'quizzes' | 'tasks';
}

export const TestsQuizzesTasksPane: React.FC<TestsQuizzesTasksPaneProps> = ({
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
  currentUserName = '',
  programDetails,
  defaultTab = 'quizzes',
}) => {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'tasks'>(defaultTab);

  // In-Meeting Quick Quiz state
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  // Quick live quiz creator
  const [isCreatingQuickQuiz, setIsCreatingQuickQuiz] = useState(false);
  const [quickQuizTitle, setQuickQuizTitle] = useState('');
  const [quickQuestion, setQuickQuestion] = useState('');
  const [quickOptions, setQuickOptions] = useState(['Option A', 'Option B', 'Option C', 'Option D']);
  const [quickCorrectOption, setQuickCorrectOption] = useState(0);

  // Program-level persistent assessments & homework (MCQ tests & PDF assignments)
  const [programAssessments, setProgramAssessments] = useState<TuitionProgramAssessmentItem[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // Modals state
  const [isMCQBuilderOpen, setIsMCQBuilderOpen] = useState(false);
  const [isPostAssignmentOpen, setIsPostAssignmentOpen] = useState(false);
  const [activeRunningMCQ, setActiveRunningMCQ] = useState<TuitionProgramAssessmentItem | null>(null);
  const [viewingSubmissionsAssessment, setViewingSubmissionsAssessment] = useState<TuitionProgramAssessmentItem | null>(null);

  // Student PDF Upload state for assignments
  const [uploadingPdfForId, setUploadingPdfForId] = useState<string | null>(null);
  const [uploadSuccessMap, setUploadSuccessMap] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadAssessments = async () => {
    if (!programId) return;
    try {
      setLoadingAssessments(true);
      const res = await tuitionService.getProgramAssessments(programId);
      if (res.success && res.assessments) {
        setProgramAssessments(res.assessments);
      }
    } catch (err) {
      console.warn('Failed to load program assessments in live classroom pane:', err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  useEffect(() => {
    if (isOpen && programId) {
      loadAssessments();
    }
  }, [isOpen, programId]);

  if (!isOpen) return null;

  const activeInMeetingAssessments = assessments.filter((a) => a.status === 'active');
  const activeInMeeting = assessments.find((a) => a._id === selectedAssessmentId) || activeInMeetingAssessments[0] || assessments[0];

  const mcqTests = programAssessments.filter((a) => a.type === 'mcq_test');
  const assignmentTasks = programAssessments.filter((a) => a.type === 'assignment');

  // Quick In-Meeting Quiz Answer Select
  const handleQuickOptionSelect = (qId: string, optIdx: number) => {
    setStudentAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuickQuiz = async () => {
    if (!activeInMeeting || isSubmittingQuick) return;
    setIsSubmittingQuick(true);
    try {
      const answersList = activeInMeeting.questions.map((q) => ({
        questionId: q.id,
        selectedOptionIndex: studentAnswers[q.id] ?? -1,
      }));
      await onSubmitAssessment(activeInMeeting._id, answersList);
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  // Broadcast Quick In-Meeting Quiz
  const handlePublishQuickQuiz = async () => {
    if (!quickQuizTitle.trim() || !quickQuestion.trim()) return;
    try {
      await onPublishAssessment({
        type: 'quiz',
        title: quickQuizTitle.trim(),
        instructions: 'Answer before time runs out.',
        timeLimitMinutes: 3,
        totalPoints: 1,
        questions: [
          {
            id: `q-${Date.now()}`,
            question: quickQuestion.trim(),
            options: quickOptions,
            correctOptionIndex: quickCorrectOption,
            points: 1,
          },
        ],
      });
      setIsCreatingQuickQuiz(false);
      setQuickQuizTitle('');
      setQuickQuestion('');
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Full MCQ Creation
  const handleSaveFullMCQ = async (data: {
    title: string;
    subject?: string;
    durationMinutes: number;
    questions: TuitionMCQQuestion[];
  }) => {
    if (!programId) {
      await onPublishAssessment({
        type: 'test',
        title: data.title,
        instructions: `Full MCQ Test (${data.durationMinutes} mins)`,
        timeLimitMinutes: data.durationMinutes,
        totalPoints: data.questions.length,
        questions: data.questions.map((q, i) => ({
          id: `q-${Date.now()}-${i}`,
          question: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          points: q.marks || 1,
        })),
      });
      return;
    }

    const res = await tuitionService.createProgramAssessment(programId, {
      type: 'mcq_test',
      title: data.title,
      subject: data.subject,
      durationMinutes: data.durationMinutes,
      questions: data.questions,
    });

    if (res.success) {
      onPublishAssessment({
        type: 'test',
        title: data.title,
        instructions: `New cohort MCQ Test assigned by teacher.`,
        timeLimitMinutes: data.durationMinutes,
        totalPoints: data.questions.length,
        questions: data.questions.map((q, i) => ({
          id: `q-${Date.now()}-${i}`,
          question: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          points: q.marks || 1,
        })),
      });
      await loadAssessments();
    }
  };

  // Handle Post Assignment
  const handleSaveAssignment = async (data: any) => {
    if (!programId) return;
    const res = await tuitionService.createProgramAssessment(programId, data);
    if (res.success) {
      await loadAssessments();
    }
  };

  // Handle Student PDF Submission for an Assignment
  const handleStudentPdfUpload = async (assessmentId: string, file: File) => {
    try {
      setUploadingPdfForId(assessmentId);
      const res = await tuitionService.submitAssignmentPdf(assessmentId, file);
      if (res.success) {
        setUploadSuccessMap((prev) => ({
          ...prev,
          [assessmentId]: res.fileName || file.name,
        }));
        await loadAssessments();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to upload PDF submission.');
    } finally {
      setUploadingPdfForId(null);
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-900 border-b border-slate-800/90 overflow-hidden shrink-0 max-h-[55%] min-h-[250px]">
      {/* Pane Header */}
      <div className="h-11 px-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/95">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quizzes'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>MCQs &amp; Quizzes</span>
            {(activeInMeetingAssessments.length > 0 || mcqTests.length > 0) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Tasks &amp; Homework</span>
            {assignmentTasks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-indigo-500/30 text-indigo-300">
                {assignmentTasks.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons & Close */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Tests & Tasks Pane"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pane Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* ========================================================= */}
        {/* TAB 1: QUIZZES & MCQ TESTS                                */}
        {/* ========================================================= */}
        {activeTab === 'quizzes' && (
          <div className="space-y-3">
            {/* Teacher Actions Bar */}
            {isHost && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsMCQBuilderOpen(true)}
                  className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Full MCQ Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreatingQuickQuiz(!isCreatingQuickQuiz)}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-700"
                >
                  <HelpCircle className="w-3 h-3 text-amber-400" />
                  <span>{isCreatingQuickQuiz ? 'Hide Quick Quiz' : 'Quick 1-Question'}</span>
                </button>
              </div>
            )}

            {/* Quick Live In-Call Quiz Creator */}
            {isHost && isCreatingQuickQuiz && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Quick In-Call Live Poll / Quiz</span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingQuickQuiz(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Quiz title..."
                  value={quickQuizTitle}
                  onChange={(e) => setQuickQuizTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                />
                <textarea
                  placeholder="Question text..."
                  value={quickQuestion}
                  onChange={(e) => setQuickQuestion(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none resize-none h-12"
                />
                <div className="space-y-1">
                  {quickOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="quickCorrectOpt"
                        checked={quickCorrectOption === i}
                        onChange={() => setQuickCorrectOption(i)}
                        className="accent-amber-400"
                        title="Mark correct option"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...quickOptions];
                          updated[i] = e.target.value;
                          setQuickOptions(updated);
                        }}
                        className="flex-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handlePublishQuickQuiz}
                  className="w-full py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Broadcast Live to Class
                </button>
              </div>
            )}

            {/* Persistent MCQ Tests List */}
            {mcqTests.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
                  Cohort MCQ Tests ({mcqTests.length})
                </span>
                {mcqTests.map((test) => (
                  <div
                    key={test._id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate max-w-[170px]">
                        {test.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{test.questions?.length || 0} Questions</span>
                        <span>&bull;</span>
                        <span>{test.durationMinutes || 30}m</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isHost ? (
                        <button
                          type="button"
                          onClick={() => setViewingSubmissionsAssessment(test)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer"
                        >
                          Submissions ({test.submissionsCount ?? 0})
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveRunningMCQ(test)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            test.hasSubmitted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          }`}
                        >
                          {test.hasSubmitted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Score: {test.mySubmission?.score ?? 0}/{test.totalMarks}</span>
                            </>
                          ) : (
                            <span>Take Test</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active In-Meeting Quick Quiz Taking */}
            {activeInMeeting ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white truncate max-w-[180px]">
                    Live Poll: {activeInMeeting.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                    Live
                  </span>
                </div>

                {activeInMeeting.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-1.5">
                    <p className="text-xs text-slate-200 font-medium">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="space-y-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = studentAnswers[q.id] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={isHost}
                            onClick={() => handleQuickOptionSelect(q.id, oIdx)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500/30 text-amber-200 border border-amber-400'
                                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!isHost && (
                  <button
                    onClick={handleSubmitQuickQuiz}
                    disabled={isSubmittingQuick}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingQuick ? 'Submitting...' : 'Submit Answers'}</span>
                  </button>
                )}
              </div>
            ) : mcqTests.length === 0 && !isCreatingQuickQuiz ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <HelpCircle className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                <p>No active tests or quizzes right now.</p>
              </div>
            ) : null}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TASKS & HOMEWORK WITH PDF UPLOAD                   */}
        {/* ========================================================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {/* Teacher Post Assignment Button */}
            {isHost && (
              <button
                type="button"
                onClick={() => setIsPostAssignmentOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post New Homework / Assignment Topic</span>
              </button>
            )}

            {assignmentTasks.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1.5 text-xs text-slate-400">
                <ClipboardList className="w-7 h-7 mx-auto text-slate-600" />
                <p className="font-semibold text-slate-300">No Assignments Posted Yet</p>
                <p className="text-[11px] text-slate-500">
                  {isHost
                    ? 'Post assignment topics and students will upload PDF solutions directly.'
                    : 'Your teacher has not assigned any homework topics for this cohort yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignmentTasks.map((task) => {
                  const hasSub = Boolean(task.hasSubmitted || task.mySubmission);
                  const isUploading = uploadingPdfForId === task._id;

                  return (
                    <div
                      key={task._id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            {task.topic || task.subject || 'Assignment'}
                          </span>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {task.title}
                          </h4>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {task.totalMarks} pts
                        </span>
                      </div>

                      {task.instructions && (
                        <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">
                          {task.instructions}
                        </p>
                      )}

                      {/* Reference Study PDF (if teacher attached one) */}
                      {task.referenceFileUrl && (
                        <div className="pt-0.5">
                          <a
                            href={task.referenceFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-indigo-300 text-[11px] border border-indigo-500/30 transition-colors"
                          >
                            <FileText className="w-3 h-3 text-indigo-400" />
                            <span className="truncate max-w-[170px]">
                              {task.referenceFileName || 'Study Sheet.pdf'}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      )}

                      {/* Action Strip */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {isHost ? (
                          <>
                            <span className="text-[11px] text-slate-400">
                              Submissions: <strong className="text-white">{task.submissionsCount ?? 0}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewingSubmissionsAssessment(task)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Award className="w-3 h-3 text-indigo-400" />
                              <span>View PDF Submissions</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div>
                              {hasSub ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Submitted PDF</span>
                                  </span>
                                  {task.mySubmission?.fileUrl && (
                                    <a
                                      href={task.mySubmission.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-[10px] text-indigo-300 hover:underline truncate max-w-[130px]"
                                    >
                                      {task.mySubmission.fileName || 'View Uploaded PDF'}
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-amber-400 font-bold">
                                  Pending PDF Upload
                                </span>
                              )}
                            </div>

                            {/* Hidden file input */}
                            <input
                              type="file"
                              ref={(el) => {
                                fileInputRefs.current[task._id] = el;
                              }}
                              accept="application/pdf,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleStudentPdfUpload(task._id, file);
                              }}
                              className="hidden"
                            />

                            <button
                              type="button"
                              disabled={isUploading}
                              onClick={() => fileInputRefs.current[task._id]?.click()}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3 h-3" />
                                  <span>{hasSub ? 'Re-upload PDF' : 'Upload PDF'}</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. MCQ Test Builder Modal */}
      {isMCQBuilderOpen && (
        <MCQTestBuilderModal
          isOpen={isMCQBuilderOpen}
          onClose={() => setIsMCQBuilderOpen(false)}
          onSave={handleSaveFullMCQ}
          initialSubject={programDetails?.subject || 'Tuition Program'}
        />
      )}

      {/* 2. MCQ Test Runner Modal */}
      {activeRunningMCQ && (
        <MCQTestRunnerModal
          isOpen={Boolean(activeRunningMCQ)}
          onClose={() => setActiveRunningMCQ(null)}
          assessment={activeRunningMCQ}
          onSubmit={async (answers) => {
            const res = await tuitionService.submitMcqTest(activeRunningMCQ._id, answers);
            await loadAssessments();
            return res;
          }}
        />
      )}

      {/* 3. Post Assignment Modal */}
      {isPostAssignmentOpen && (
        <PostAssignmentModal
          isOpen={isPostAssignmentOpen}
          onClose={() => setIsPostAssignmentOpen(false)}
          onSave={handleSaveAssignment}
          initialSubject={programDetails?.subject || 'Tuition Program'}
        />
      )}

      {/* 4. Submissions Review Modal */}
      {viewingSubmissionsAssessment && (
        <AssignmentSubmissionsModal
          isOpen={Boolean(viewingSubmissionsAssessment)}
          onClose={() => setViewingSubmissionsAssessment(null)}
          assessment={viewingSubmissionsAssessment}
        />
      )}
    </div>
  );
};

export default TestsQuizzesTasksPane;
