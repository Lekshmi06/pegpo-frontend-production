import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckSquare,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Send,
  RotateCcw,
  Clock,
  Copy,
  Download,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  PenTool,
  Plus,
  Flame,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { sendAIChatMessage } from '../../services/aiService';
import { coursesData } from '../../data/mockData';
import {
  exerciseProblems,
  revisionFlashcards,
  workbookChapters,
} from '../../data/practiceData';
import { ExerciseProblem, FlashcardItem } from '../../types/testTypes';

export type LmsNavTab = 'learn' | 'practice' | 'ai-coach' | 'flashcards';

interface InteractiveLmsWorkspaceProps {
  sessionId: string;
  sessionTitle?: string;
  isHost?: boolean;
}

export const InteractiveLmsWorkspace: React.FC<InteractiveLmsWorkspaceProps> = ({
  sessionId,
  sessionTitle,
  isHost = false,
}) => {
  const [activeTab, setActiveTab] = useState<LmsNavTab>('learn');
  const [isNotesOpen, setIsNotesOpen] = useState(true);

  // ----------------------------------------------------
  // 1. LEARN STATE
  // ----------------------------------------------------
  const [selectedLearnSubject, setSelectedLearnSubject] = useState<string>('All');
  const [selectedCourseId, setSelectedCourseId] = useState<string | number>(coursesData[0]?.id || 1);
  const [selectedChapterId, setSelectedChapterId] = useState<string | number>(
    coursesData[0]?.chapters?.[0]?.id || 101
  );
  const [understoodTopics, setUnderstoodTopics] = useState<Set<string>>(new Set());

  const activeCourse =
    coursesData.find((c) => c.id === selectedCourseId) || coursesData[0];
  const activeChapter =
    activeCourse?.chapters?.find((ch) => ch.id === selectedChapterId) ||
    activeCourse?.chapters?.[0];

  // Matched workbook chapter for formula cheats
  const matchedWorkbook = workbookChapters.find(
    (wb) =>
      wb.subject.toLowerCase() === activeCourse?.subject?.toLowerCase() ||
      activeCourse?.title?.toLowerCase().includes(wb.subject.toLowerCase())
  ) || workbookChapters[0];

  const handleToggleUnderstood = (topicKey: string) => {
    setUnderstoodTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicKey)) next.delete(topicKey);
      else next.add(topicKey);
      return next;
    });
  };

  // ----------------------------------------------------
  // 2. PRACTICE / MCQ RUNNER STATE
  // ----------------------------------------------------
  const [practiceSubject, setPracticeSubject] = useState<string>('All');
  const filteredProblems =
    practiceSubject === 'All'
      ? exerciseProblems
      : exerciseProblems.filter((p) => p.subject.toLowerCase() === practiceSubject.toLowerCase());

  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ correct: 0, attempted: 0 });

  const activeProblem: ExerciseProblem | undefined =
    filteredProblems[currentProblemIdx] || filteredProblems[0];

  const handleSelectOption = (optId: string) => {
    if (isChecked) return; // Prevent changing after checked
    setSelectedOption(optId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || !activeProblem || isChecked) return;
    setIsChecked(true);
    const isCorrect = selectedOption === activeProblem.correctAnswer;
    setPracticeStats((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      attempted: prev.attempted + 1,
    }));
    setShowExplanation(true);
  };

  const handleNextProblem = () => {
    if (currentProblemIdx < filteredProblems.length - 1) {
      setCurrentProblemIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setShowHint(false);
      setShowExplanation(false);
    }
  };

  const handlePrevProblem = () => {
    if (currentProblemIdx > 0) {
      setCurrentProblemIdx((prev) => prev - 1);
      setSelectedOption(null);
      setIsChecked(false);
      setShowHint(false);
      setShowExplanation(false);
    }
  };

  const handleResetProblem = () => {
    setSelectedOption(null);
    setIsChecked(false);
    setShowHint(false);
    setShowExplanation(false);
  };

  // ----------------------------------------------------
  // 3. AI STUDY COACH STATE
  // ----------------------------------------------------
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ q: string; a: string; time: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleAskAi = async (overridePrompt?: string) => {
    const q = (overridePrompt || aiQuestion).trim();
    if (!q || isAiLoading) return;
    setIsAiLoading(true);
    if (!overridePrompt) setAiQuestion('');

    try {
      const response = await sendAIChatMessage(
        q,
        sessionTitle || activeCourse?.title || 'Interactive Class',
        isHost ? 'Teacher' : 'Student'
      );
      setAiChat((prev) => [
        ...prev,
        {
          q,
          a: response.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setAiChat((prev) => [
        ...prev,
        {
          q,
          a: 'Could not connect to the EduPye AI Study Coach. Please check connection and retry.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // ----------------------------------------------------
  // 4. FLASHCARDS & REVISION STATE
  // ----------------------------------------------------
  const [fcSubject, setFcSubject] = useState<string>('All');
  const [customFlashcards, setCustomFlashcards] = useState<FlashcardItem[]>([]);
  const allCards = [...revisionFlashcards, ...customFlashcards];
  const filteredFlashcards =
    fcSubject === 'All'
      ? allCards
      : allCards.filter((c) => c.subject.toLowerCase() === fcSubject.toLowerCase());

  const [currentFcIdx, setCurrentFcIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');

  const activeFlashcard: FlashcardItem | undefined =
    filteredFlashcards[currentFcIdx] || filteredFlashcards[0];

  const handleToggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Auto advance
    if (currentFcIdx < filteredFlashcards.length - 1) {
      setCurrentFcIdx((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardQ.trim() || !newCardA.trim()) return;
    const newCard: FlashcardItem = {
      id: `custom-${Date.now()}`,
      subject: fcSubject === 'All' ? 'General' : fcSubject,
      chapter: 'Live Lecture Note',
      frontTitle: newCardQ.trim(),
      frontSubtitle: 'Student Created Flashcard',
      backConcept: newCardA.trim(),
      formulaOrRule: '',
      exampleOrNote: 'Created during live class session',
      isMastered: false,
    };
    setCustomFlashcards((prev) => [newCard, ...prev]);
    setNewCardQ('');
    setNewCardA('');
    setShowAddCard(false);
    setIsFlipped(false);
  };

  // ----------------------------------------------------
  // 5. CLASS NOTES & AUTO-SAVE
  // ----------------------------------------------------
  const notesStorageKey = `edupye_classroom_notes_${sessionId || 'default'}`;
  const [noteTitle, setNoteTitle] = useState(() => `${sessionTitle || 'Class'} Notes`);
  const [noteContent, setNoteContent] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [notesCopied, setNotesCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(notesStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.title) setNoteTitle(parsed.title);
        if (parsed.content) setNoteContent(parsed.content);
        if (parsed.savedAt) setLastSavedTime(parsed.savedAt);
      }
    } catch {}
  }, [notesStorageKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(
          notesStorageKey,
          JSON.stringify({ title: noteTitle, content: noteContent, savedAt: now })
        );
        setLastSavedTime(now);
      } catch {}
    }, 1200);
    return () => clearTimeout(timer);
  }, [noteTitle, noteContent, notesStorageKey]);

  const handleInsertTimestamp = () => {
    const stamp = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
    setNoteContent((prev) => (prev ? `${prev}\n${stamp}` : stamp));
  };

  const handleCopyNotes = () => {
    if (!noteContent.trim()) return;
    navigator.clipboard.writeText(`# ${noteTitle}\n\n${noteContent}`);
    setNotesCopied(true);
    setTimeout(() => setNotesCopied(false), 2000);
  };

  const handleDownloadNotes = () => {
    const md = `# ${noteTitle}\n\n*EduPye Live Lecture Notes - ${new Date().toLocaleDateString()}*\n\n${noteContent}`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${noteTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || 'notes'}.md`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ==================================================== */}
      {/* 1. LEFT MINI NAVIGATION RAIL                         */}
      {/* ==================================================== */}
      <div className="w-12 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-3 gap-2 shrink-0 select-none z-10 shadow-xs">
        <button
          onClick={() => setActiveTab('learn')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'learn'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
          title="Learn: Courses & Syllabus Outline"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'practice'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
          title="Practice: Interactive MCQs & Solution Derivations"
        >
          <CheckSquare className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('ai-coach')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'ai-coach'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
          title="AI Coach: Instant Academic Doubts"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'flashcards'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
          title="Flashcards: Spaced Repetition"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* ==================================================== */}
      {/* 2. MAIN LMS WORKSPACE VIEW                           */}
      {/* ==================================================== */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-slate-50/50 dark:bg-slate-900/50">
        {/* TAB A: LEARN (COURSES, CHAPTERS, FORMULAS) */}
        {activeTab === 'learn' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Header & Subject Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>EduPye Curriculum &amp; Concept Guide</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a course or chapter to review key formulas, derivations and core axioms.
                </p>
              </div>

              {/* Subject Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Maths', 'Physics', 'Chemistry'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedLearnSubject(sub)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      selectedLearnSubject === sub
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses / Chapters Selector Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {coursesData
                .filter(
                  (c) =>
                    selectedLearnSubject === 'All' ||
                    c.subject.toLowerCase() === selectedLearnSubject.toLowerCase()
                )
                .map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      if (course.chapters && course.chapters.length > 0) {
                        setSelectedChapterId(course.chapters[0].id);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedCourseId === course.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400">{course.subject}</span>
                      <span className="text-slate-400">{course.progress}% done</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {course.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Instructor: {course.instructor}
                    </p>
                  </div>
                ))}
            </div>

            {/* Active Chapter Details */}
            {activeChapter && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Module {activeChapter.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {activeChapter.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{activeChapter.duration}</span>
                  </div>
                </div>

                {/* Formula Cheatsheet */}
                {matchedWorkbook?.formulaCheats && matchedWorkbook.formulaCheats.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        Formula Cheatsheet &amp; Equations
                      </span>
                      <span className="text-[10px] text-slate-400">Essential for live problem solving</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedWorkbook.formulaCheats.map((fc, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                        >
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {fc.title}
                          </span>
                          <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            {fc.formula}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concept Checkpoints */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lecture Checkpoints (Click to mark understood)
                  </span>
                  <div className="space-y-1.5">
                    {[
                      'Definition and fundamental SI units',
                      'Mathematical statement and boundary conditions',
                      'Real-world physical applications and lab experiments',
                      'Standard exam pitfalls and edge cases',
                    ].map((cp, idx) => {
                      const topicId = `${activeChapter.id}-cp-${idx}`;
                      const isDone = understoodTopics.has(topicId);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleUnderstood(topicId)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-medium">{cp}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">Checkpoint #{idx + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B: PRACTICE / REAL INTERACTIVE MCQ SOLVER */}
        {activeTab === 'practice' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Header & Subject Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                  <span>Interactive Question Bank &amp; MCQs</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Solve real exam problems with instant step-by-step scoring and explanations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Score: {practiceStats.correct} / {practiceStats.attempted}
                </span>

                <div className="flex items-center gap-1">
                  {['All', 'Physics', 'Maths'].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setPracticeSubject(sub);
                        setCurrentProblemIdx(0);
                        setSelectedOption(null);
                        setIsChecked(false);
                        setShowHint(false);
                        setShowExplanation(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        practiceSubject === sub
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Problem Card */}
            {activeProblem && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-sm">
                {/* Meta Bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Problem {currentProblemIdx + 1} of {filteredProblems.length}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {activeProblem.subject} &bull; {activeProblem.chapter}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeProblem.difficulty === 'Hard'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {activeProblem.difficulty || 'Medium'}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {activeProblem.text}
                </p>

                {/* Options List */}
                <div className="space-y-2">
                  {activeProblem.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isCorrect = opt.id === activeProblem.correctAnswer;
                    let optStyle =
                      'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200';

                    if (isChecked) {
                      if (isCorrect) {
                        optStyle =
                          'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optStyle =
                          'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                      }
                    } else if (isSelected) {
                      optStyle =
                        'bg-blue-500/10 dark:bg-blue-950/30 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30 font-bold';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${optStyle}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {opt.id}
                        </span>
                        <span className="text-xs leading-relaxed">{opt.text}</span>
                        {isChecked && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                        )}
                        {isChecked && isSelected && !isCorrect && (
                          <AlertCircle className="w-4 h-4 text-rose-500 ml-auto shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons: Check Answer, Hint, Next/Prev */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!isChecked ? (
                      <button
                        onClick={handleCheckAnswer}
                        disabled={!selectedOption}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleResetProblem}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                      </button>
                    )}

                    {activeProblem.hint && (
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="px-3 py-2 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                      </button>
                    )}
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevProblem}
                      disabled={currentProblemIdx === 0}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNextProblem}
                      disabled={currentProblemIdx >= filteredProblems.length - 1}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      <span>Next Problem</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hint Accordion */}
                {showHint && activeProblem.hint && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2 animate-fadeIn">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{activeProblem.hint}</p>
                  </div>
                )}

                {/* Step-by-Step Explanation Accordion */}
                {isChecked && activeProblem.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Explanation &amp; Solution
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Correct: Option {activeProblem.correctAnswer}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeProblem.explanation}
                    </p>
                    {activeProblem.stepByStepSolution && (
                      <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                        {activeProblem.stepByStepSolution.map((st, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-400">
                            {st}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB C: AI STUDY COACH & DOUBTS */}
        {activeTab === 'ai-coach' && (
          <div className="space-y-4 max-w-3xl mx-auto h-full flex flex-col justify-between">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>EduPye Live AI Study Coach</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ask conceptual doubts, derivations, or exam strategy anytime during class.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Connected
              </span>
            </div>

            {/* Quick Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                '💡 Explain this formula step-by-step',
                '📐 How is this derived?',
                '⚡ Give me an interactive practice problem',
                '🎯 Common pitfalls in this topic',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAi(chip.slice(2))}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-amber-400 transition-all cursor-pointer shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat History View */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[350px] p-2">
              {aiChat.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Need instant conceptual clarity?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Type a question below or pick a suggestion chip above. The AI Coach helps explain complex theorems and verifies homework steps.
                  </p>
                </div>
              ) : (
                aiChat.map((msg, i) => (
                  <div key={i} className="space-y-1.5 animate-fadeIn">
                    <div className="flex justify-end">
                      <div className="p-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-xs max-w-[85%] font-medium">
                        {msg.q}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 text-slate-800 dark:text-slate-200 text-xs max-w-[90%] shadow-xs leading-relaxed space-y-1">
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Coach &bull; {msg.time}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.a}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isAiLoading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>AI Coach is drafting explanation...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Ask doubt about theorem, equation, or homework topic..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-400"
              />
              <button
                onClick={() => handleAskAi()}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB D: FLASHCARDS & SPACED RECALL */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Header & Subject Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Revision Flashcards &amp; Memory Decks</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tap card to flip between definition and formulas.
                </p>
              </div>

              <div className="flex items-center gap-1">
                {['All', 'Physics', 'Chemistry'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setFcSubject(sub);
                      setCurrentFcIdx(0);
                      setIsFlipped(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      fcSubject === sub
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Flashcard Component */}
            {activeFlashcard && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Card {currentFcIdx + 1} of {filteredFlashcards.length}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {masteredIds.size} Mastered
                  </span>
                </div>

                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`min-h-[190px] p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-md select-none ${
                    isFlipped
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400/50 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {activeFlashcard.subject} &bull; {activeFlashcard.chapter}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {isFlipped ? 'Back (Click to flip)' : 'Front (Click to flip)'}
                    </span>
                  </div>

                  <div className="py-3 text-center space-y-1">
                    {!isFlipped ? (
                      <>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {activeFlashcard.frontTitle}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {activeFlashcard.frontSubtitle}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-semibold leading-relaxed">
                          {activeFlashcard.backConcept}
                        </p>
                        {activeFlashcard.formulaOrRule && (
                          <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white/60 dark:bg-slate-950/60 p-2 rounded-lg border border-indigo-200 dark:border-indigo-900/60 mt-2 inline-block">
                            {activeFlashcard.formulaOrRule}
                          </div>
                        )}
                        {activeFlashcard.exampleOrNote && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1">
                            {activeFlashcard.exampleOrNote}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-center text-[10px] text-slate-400 font-semibold">
                    {isFlipped ? 'Tap to see Question' : 'Tap to reveal Definition & Formula'}
                  </div>
                </div>

                {/* Flashcard Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleMastered(activeFlashcard.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        masteredIds.has(activeFlashcard.id)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{masteredIds.has(activeFlashcard.id) ? 'Mastered!' : 'Mark Mastered'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (currentFcIdx < filteredFlashcards.length - 1) {
                          setCurrentFcIdx((i) => i + 1);
                          setIsFlipped(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Review Again
                    </button>
                  </div>

                  {/* Card navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (currentFcIdx > 0) {
                          setCurrentFcIdx((i) => i - 1);
                          setIsFlipped(false);
                        }
                      }}
                      disabled={currentFcIdx === 0}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (currentFcIdx < filteredFlashcards.length - 1) {
                          setCurrentFcIdx((i) => i + 1);
                          setIsFlipped(false);
                        }
                      }}
                      disabled={currentFcIdx >= filteredFlashcards.length - 1}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Add Custom Flashcard Toggle */}
                <div className="pt-2">
                  {!showAddCard ? (
                    <button
                      onClick={() => setShowAddCard(true)}
                      className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Flashcard for this Lecture</span>
                    </button>
                  ) : (
                    <form onSubmit={handleAddCustomCard} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span>New Custom Flashcard</span>
                        <button
                          type="button"
                          onClick={() => setShowAddCard(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Question or concept title..."
                        value={newCardQ}
                        onChange={(e) => setNewCardQ(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Answer, definition, or formula..."
                        value={newCardA}
                        onChange={(e) => setNewCardA(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Save Flashcard
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 3. COLLAPSIBLE RIGHT CLASS NOTES / CREATE DRAWER     */}
      {/* ==================================================== */}
      <div
        className={`${
          isNotesOpen ? 'w-60 sm:w-68' : 'w-8'
        } bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 transition-all flex flex-col shrink-0 overflow-hidden select-none z-10 shadow-xs`}
      >
        {/* Drawer Header with Collapse Toggle */}
        <div className="h-9 px-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          {isNotesOpen && (
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5" />
              <span>Class Notes</span>
            </span>
          )}
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer ml-auto"
            title={isNotesOpen ? 'Collapse Notes' : 'Expand Notes'}
          >
            {isNotesOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Drawer Body */}
        {isNotesOpen && (
          <div className="flex-1 p-3 flex flex-col justify-between space-y-3 overflow-y-auto text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Auto-saved locally</span>
                {lastSavedTime && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Saved {lastSavedTime}
                  </span>
                )}
              </div>

              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white text-xs outline-none focus:border-amber-400"
              />

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Take personal lecture notes, write formulas, or record questions..."
                className="w-full h-44 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs resize-none outline-none leading-relaxed focus:border-amber-400 font-sans"
              />

              <button
                type="button"
                onClick={handleInsertTimestamp}
                className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Insert Timestamp [HH:MM]</span>
              </button>
            </div>

            {/* Note Actions: Copy & Download */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyNotes}
                disabled={!noteContent.trim()}
                className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                {notesCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{notesCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadNotes}
                disabled={!noteContent.trim()}
                className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Export .md</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveLmsWorkspace;
