import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  Layers,
  Video,
  FileText,
  HelpCircle,
  Activity,
  RotateCw,
  ExternalLink,
  Clock,
  Menu,
  X,
  Sparkles,
  Search,
  Save,
  Presentation,
  Download,
  Trash2,
} from 'lucide-react';
import { WhiteboardCanvas, WhiteboardCanvasRef, CanvasElement } from './WhiteboardCanvas';
import { lessonPlanService } from '../../../services/lessonPlanService';
import { LessonPlan, LessonSession, LessonResource } from '../../../types/lessonPlan';
import { Button } from '../../../components/ui/Button';
import { Loader } from '../../../components/ui/Loader';
import { useToast } from '../../../hooks/useToast';

export interface SavedBoardSnapshot {
  id: string;
  planId: string;
  sessionNumber: number;
  sessionTitle: string;
  timestamp: string;
  dataUrl: string;
  elements: CanvasElement[];
}

export default function IntegratedSmartBoard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const planId = searchParams.get('planId') || '';
  const sessionNumParam = searchParams.get('sessionNum') || '1';
  const currentSessionNum = parseInt(sessionNumParam, 10) || 1;

  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [currentSession, setCurrentSession] = useState<LessonSession | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'guide' | 'flashcards' | 'resources' | 'boards'>('guide');

  // Board snapshots & canvas ref
  const canvasRef = useRef<WhiteboardCanvasRef>(null);
  const [savedBoards, setSavedBoards] = useState<SavedBoardSnapshot[]>([]);
  const [previewBoardModal, setPreviewBoardModal] = useState<SavedBoardSnapshot | null>(null);

  // Interactive teaching states
  const [completedObjectives, setCompletedObjectives] = useState<Record<number, boolean>>({});
  const [sessionNotes, setSessionNotes] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Flashcards state
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Local storage persistence for saved boards
  const storageKey = `edupye_smartboard_snapshots_${planId}`;

  useEffect(() => {
    if (!planId) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSavedBoards(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to parse saved boards:', err);
    }
  }, [planId, storageKey]);

  // Load lesson plan from API
  const fetchPlan = useCallback(async () => {
    if (!planId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await lessonPlanService.getPlanById(planId);
      if (data) {
        setPlan(data);
        const matched = data.sessions?.find((s) => s.sessionNumber === currentSessionNum) || data.sessions?.[0] || null;
        setCurrentSession(matched);
        setSessionNotes(matched?.notes || '');
      }
    } catch (err) {
      toast.error('Failed to load lesson plan');
    } finally {
      setIsLoading(false);
    }
  }, [planId, currentSessionNum, toast]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Switch session within plan
  const switchSession = (targetNum: number) => {
    if (!plan || !plan.sessions) return;
    const found = plan.sessions.find((s) => s.sessionNumber === targetNum);
    if (found) {
      setCurrentSession(found);
      setSessionNotes(found.notes || '');
      setSearchParams({ planId, sessionNum: String(targetNum) });
      setActiveCardIndex(0);
      setIsCardFlipped(false);
      setCompletedObjectives({});
    }
  };

  const handleToggleSessionComplete = async () => {
    if (!plan || !currentSession) return;
    const newStatus = currentSession.status === 'completed' ? 'in_progress' : 'completed';
    try {
      const updated = await lessonPlanService.updateSessionStatus(
        plan._id,
        currentSession.sessionNumber,
        newStatus,
        sessionNotes
      );
      setPlan(updated);
      const updatedSession = updated.sessions.find((s) => s.sessionNumber === currentSession.sessionNumber);
      if (updatedSession) setCurrentSession(updatedSession);
      toast.success(`Session marked as ${newStatus === 'completed' ? 'Completed' : 'In Progress'}`);
    } catch {
      toast.error('Failed to update session status');
    }
  };

  const handleSaveNotes = async () => {
    if (!plan || !currentSession) return;
    try {
      await lessonPlanService.updateSessionStatus(
        plan._id,
        currentSession.sessionNumber,
        currentSession.status,
        sessionNotes
      );
      toast.success('Session notes saved');
    } catch {
      toast.error('Failed to save notes');
    }
  };

  // Save current smart board drawing as a snapshot for this session
  const handleSaveBoardSnapshot = () => {
    if (!canvasRef.current || !currentSession) return;
    const data = canvasRef.current.getCanvasData();
    if (!data) return;

    const newSnapshot: SavedBoardSnapshot = {
      id: `board_${Date.now()}`,
      planId,
      sessionNumber: currentSession.sessionNumber,
      sessionTitle: currentSession.title,
      timestamp: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dataUrl: data.dataUrl,
      elements: data.elements,
    };

    const updated = [newSnapshot, ...savedBoards];
    setSavedBoards(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage quota reached, keeping latest 5 boards...', e);
      const pruned = updated.slice(0, 5);
      try {
        localStorage.setItem(storageKey, JSON.stringify(pruned));
        setSavedBoards(pruned);
      } catch (e2) {
        console.warn('Failed to save to localStorage:', e2);
      }
    }
    toast.success(`Board saved for Session ${currentSession.sessionNumber}!`);
  };

  // Restore saved snapshot back onto the active Smart Board canvas
  const handleLoadBoardSnapshot = (snapshot: SavedBoardSnapshot) => {
    if (!canvasRef.current) return;
    if (
      window.confirm(
        `Load saved board from Session ${snapshot.sessionNumber} (${snapshot.sessionTitle})? This will replace your current whiteboard drawing.`
      )
    ) {
      canvasRef.current.loadBoard(snapshot.dataUrl, snapshot.elements || []);
      toast.success(`Restored board from Session ${snapshot.sessionNumber}!`);
    }
  };

  // Delete snapshot
  const handleDeleteBoardSnapshot = (id: string) => {
    const updated = savedBoards.filter((b) => b.id !== id);
    setSavedBoards(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update localStorage:', e);
    }
    toast.info('Saved board removed');
  };

  // Normalize resources
  const resources: LessonResource[] = (currentSession?.resources || []).map((r, idx) => {
    if (typeof r === 'string') {
      return {
        id: `res_${idx}`,
        type: 'reference',
        title: r,
        referenceText: r,
        source: 'teacher_added',
        isApproved: true,
      } as LessonResource;
    }
    return r as LessonResource;
  });

  // Collect flashcard resources
  const flashcardResources = resources.filter((r) => r.type === 'flashcard_deck');
  const allCards = flashcardResources.flatMap((r) => (r.type === 'flashcard_deck' ? r.cards || [] : []));

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" text="Loading smart board session..." />
      </div>
    );
  }

  if (!plan || !currentSession) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-600 font-semibold text-sm">Lesson plan or session not found.</p>
        <Button onClick={() => navigate('/teacher/smartboard')}>Back to Smart Board Hub</Button>
      </div>
    );
  }

  const isCompleted = currentSession.status === 'completed';
  const totalSessions = plan.sessions?.length || 1;
  const hasPrev = currentSession.sessionNumber > 1;
  const hasNext = currentSession.sessionNumber < totalSessions;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#214d7d] text-white px-4 flex items-center justify-between shadow-xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher/smartboard')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Smart Board Hub</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isSidebarOpen ? 'bg-sky-400 text-[#173c63]' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Lesson Hub</span>
          </button>

          <div className="h-5 w-px bg-white/20" />

          {/* Chapter & Session Info */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 text-xs font-bold border border-sky-400/30">
              Session {currentSession.sessionNumber}/{totalSessions}
            </span>
            <div className="truncate max-w-[200px] sm:max-w-md">
              <h1 className="text-xs font-bold text-white truncate">{currentSession.title}</h1>
              <p className="text-[10px] text-sky-200 truncate">{plan.chapterTitle} • {plan.subject}</p>
            </div>
          </div>
        </div>

        {/* Right header controls */}
        <div className="flex items-center gap-2">
          {/* Save Board Snapshot Button */}
          <button
            onClick={handleSaveBoardSnapshot}
            title="Save current board snapshot for this session"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden sm:inline">Save Board</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-300" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={handleToggleSessionComplete}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isCompleted ? '✓ Completed' : 'Mark Complete'}
          </button>
        </div>
      </header>

      {/* Main Workspace (Sidebar + Canvas) */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-white">
        {/* Left Collapsible Lesson Panel */}
        <aside
          className={`shrink-0 h-full bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-200 z-20 shadow-sm ${
            isSidebarOpen ? 'w-80 sm:w-96' : 'w-0 border-r-0 overflow-hidden'
          }`}
        >
          {/* 4-Tab Selectors (2x2 Grid for optimal readability) */}
          <div className="grid grid-cols-2 gap-1 border-b border-slate-200 bg-white p-2 shrink-0">
            <button
              onClick={() => setActiveTab('guide')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'guide'
                  ? 'bg-[#214d7d] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Objectives & Steps
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'flashcards'
                  ? 'bg-[#214d7d] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Flashcards ({allCards.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'resources'
                  ? 'bg-[#214d7d] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('boards')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                activeTab === 'boards'
                  ? 'bg-[#214d7d] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 text-sky-400" />
              <span>Saved Boards ({savedBoards.length})</span>
            </button>
          </div>

          {/* Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* TAB 1: GUIDE & OBJECTIVES */}
            {activeTab === 'guide' && (
              <div className="space-y-4">
                {/* Learning Objectives Checklist */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0091ff]" />
                    Learning Objectives (Check to mark covered)
                  </span>
                  <div className="space-y-1.5">
                    {currentSession.learningObjectives?.length > 0 ? (
                      currentSession.learningObjectives.map((obj, oIdx) => {
                        const isDone = completedObjectives[oIdx] || false;
                        return (
                          <div
                            key={oIdx}
                            onClick={() =>
                              setCompletedObjectives((prev) => ({
                                ...prev,
                                [oIdx]: !isDone,
                              }))
                            }
                            className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer select-none ${
                              isDone
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                                : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <span className={`text-xs ${isDone ? 'line-through font-semibold' : ''}`}>
                              {obj}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 italic">No specific objectives specified.</p>
                    )}
                  </div>
                </div>

                {/* Teaching Method */}
                {currentSession.teachingMethod && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1.5">
                      <Presentation className="w-3.5 h-3.5 text-blue-500" />
                      Teaching Method
                    </span>
                    <p className="text-slate-700 font-medium pl-1">{currentSession.teachingMethod}</p>
                  </div>
                )}

                {/* Activities */}
                {currentSession.activities && currentSession.activities.length > 0 && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      Activities & Discussion Prompts
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 font-medium">
                      {currentSession.activities.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Concepts Tags */}
                {currentSession.keyConcepts?.length > 0 && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] block">
                      Key Concepts
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {currentSession.keyConcepts.map((concept, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0091ff] border border-blue-200 text-[11px] font-bold"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignment */}
                {currentSession.assignment && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2d5a] block">
                      Assignment / Revision Task
                    </span>
                    <p className="text-slate-700 pl-1 font-medium">{currentSession.assignment}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INTERACTIVE FLASHCARDS */}
            {activeTab === 'flashcards' && (
              <div className="space-y-3">
                {allCards.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-purple-900 font-bold">
                      <span className="text-xs">Classroom Active Recall Deck</span>
                      <span className="text-[11px] text-purple-600">
                        Card {activeCardIndex + 1} of {allCards.length}
                      </span>
                    </div>

                    {/* Flippable card */}
                    <div
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="min-h-[140px] p-5 bg-white rounded-2xl border-2 border-purple-200 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:border-purple-400 transition-all select-none"
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 mb-2">
                        {isCardFlipped ? 'Answer / Explanation' : 'Question (Click to Flip)'}
                      </span>
                      <p className="text-sm font-bold text-slate-800 leading-snug">
                        {isCardFlipped ? allCards[activeCardIndex]?.back : allCards[activeCardIndex]?.front}
                      </p>
                      {allCards[activeCardIndex]?.hint && !isCardFlipped && (
                        <p className="text-[10px] text-slate-400 mt-2 italic">
                          Hint: {allCards[activeCardIndex]?.hint}
                        </p>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activeCardIndex === 0}
                        onClick={() => {
                          setActiveCardIndex((prev) => Math.max(0, prev - 1));
                          setIsCardFlipped(false);
                        }}
                      >
                        <ChevronLeft className="w-4 h-4 mr-0.5" /> Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsCardFlipped(!isCardFlipped)}
                        className="text-purple-700 font-bold"
                      >
                        <RotateCw className="w-3.5 h-3.5 mr-1" /> Flip
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activeCardIndex >= allCards.length - 1}
                        onClick={() => {
                          setActiveCardIndex((prev) => Math.min(allCards.length - 1, prev + 1));
                          setIsCardFlipped(false);
                        }}
                      >
                        Next <ChevronRight className="w-4 h-4 ml-0.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-200 space-y-2">
                    <Layers className="w-8 h-8 mx-auto text-purple-400" />
                    <p className="text-xs font-bold text-slate-700">No Flashcards Attached</p>
                    <p className="text-[11px] text-slate-400">
                      Open the Lesson Planner to generate AI flashcards for this session.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SUPPORTING RESOURCES */}
            {activeTab === 'resources' && (
              <div className="space-y-3">
                {resources.length === 0 ? (
                  <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs font-semibold text-slate-600">No supporting resources attached.</p>
                  </div>
                ) : (
                  resources.map((res) => (
                    <div key={res.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-3xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {res.type.replace('_', ' ')}
                        </span>
                        {res.isApproved && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Approved
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-800">{res.title}</h4>

                      {/* Video */}
                      {res.type === 'video' && (
                        <div className="space-y-1.5 pt-1">
                          {res.recommendationReason && (
                            <p className="text-[11px] text-slate-600 italic">
                              💡 {res.recommendationReason}
                            </p>
                          )}
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(res.searchQuery || res.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Launch YouTube Search
                          </a>
                          {res.verifiedUrl && (
                            <div className="pt-1">
                              <a
                                href={res.verifiedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 underline font-semibold truncate block"
                              >
                                Watch Verified Video: {res.verifiedUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Visual */}
                      {res.type === 'visual/animation' && (
                        <p className="text-[11px] text-slate-700 bg-cyan-50/50 p-2 rounded border border-cyan-200">
                          {res.promptOrConcept}
                        </p>
                      )}

                      {/* Worksheet */}
                      {res.type === 'worksheet' && (
                        <div className="text-[11px] text-slate-700 bg-emerald-50/50 p-2 rounded border border-emerald-200 space-y-1">
                          <p className="font-semibold">{res.instructions}</p>
                          {res.exercises && (
                            <ul className="list-disc list-inside space-y-0.5 pl-1">
                              {res.exercises.map((ex, i) => (
                                <li key={i}>{ex}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Quiz */}
                      {res.type === 'quiz' && (
                        <div className="text-[11px] space-y-1.5">
                          {res.questions?.map((q, qIdx) => (
                            <div key={qIdx} className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
                              <p className="font-bold text-slate-800">{qIdx + 1}. {q.question}</p>
                              {q.options?.map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className={`block text-[10px] px-1.5 py-0.5 rounded ${
                                    oIdx === q.correctIndex ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}) {opt}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: SAVED SMART BOARDS & PREVIOUS SESSIONS */}
            {activeTab === 'boards' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-black text-slate-800">Saved Session Boards</h3>
                    <p className="text-[10px] text-slate-500">
                      Snapshots saved across all sessions in this lesson plan
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSaveBoardSnapshot}
                    className="bg-[#214d7d] text-white text-[11px] font-bold h-7 px-2.5"
                  >
                    <Save className="w-3 h-3 mr-1" /> Save Current
                  </Button>
                </div>

                {savedBoards.length === 0 ? (
                  <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-200 space-y-2">
                    <Presentation className="w-8 h-8 mx-auto text-sky-400" />
                    <p className="text-xs font-bold text-slate-700">No Saved Boards Yet</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Draw on the Smart Board and click &quot;Save Board&quot; in the top bar to save snapshots for this session. You can restore them anytime!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedBoards.map((b) => {
                      const isCurrent = b.sessionNumber === currentSession?.sessionNumber;
                      return (
                        <div
                          key={b.id}
                          className={`bg-white rounded-xl border transition-all overflow-hidden shadow-3xs ${
                            isCurrent ? 'border-sky-300 ring-1 ring-sky-200' : 'border-slate-200'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                  isCurrent ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                Session {b.sessionNumber}
                              </span>
                              <span className="text-[11px] font-bold text-slate-800 truncate" title={b.sessionTitle}>
                                {b.sessionTitle}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{b.timestamp}</span>
                          </div>

                          {/* Thumbnail preview */}
                          <div
                            onClick={() => setPreviewBoardModal(b)}
                            className="relative aspect-video bg-slate-100 cursor-pointer group overflow-hidden border-b border-slate-100"
                          >
                            <img
                              src={b.dataUrl}
                              alt={`Session ${b.sessionNumber} Board`}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                              <ExternalLink className="w-3.5 h-3.5" /> Click to Zoom
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-2 bg-white flex items-center justify-between gap-1">
                            <button
                              onClick={() => handleLoadBoardSnapshot(b)}
                              className="flex-1 py-1 px-2 rounded-lg bg-[#214d7d] hover:bg-[#183a61] text-white text-[10px] font-extrabold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Restore these drawings onto the active Smart Board canvas"
                            >
                              <RotateCw className="w-3 h-3" /> Load onto Board
                            </button>

                            <a
                              href={b.dataUrl}
                              download={`Session_${b.sessionNumber}_SmartBoard.png`}
                              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Download PNG image"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleDeleteBoardSnapshot(b.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete snapshot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Teacher Session Notes Input */}
          <div className="p-3 border-t border-slate-200 bg-white space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Teacher Notes</span>
              <button
                onClick={handleSaveNotes}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3 h-3" /> Save
              </button>
            </div>
            <textarea
              rows={2}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Session reflections, student questions..."
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none resize-none"
            />
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 h-full relative overflow-hidden bg-white">
          <WhiteboardCanvas ref={canvasRef} className="w-full h-full" />
        </main>
      </div>

      {/* Bottom Session Navigation Bar */}
      <footer className="h-12 bg-white border-t border-slate-200 px-4 flex items-center justify-between shadow-xs shrink-0 z-20">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!hasPrev}
            onClick={() => switchSession(currentSession.sessionNumber - 1)}
            className="text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4 mr-0.5" /> Previous Session
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={!hasNext}
            onClick={() => switchSession(currentSession.sessionNumber + 1)}
            className="text-xs font-bold"
          >
            Next Session <ChevronRight className="w-4 h-4 ml-0.5" />
          </Button>
        </div>

        {/* Session Progress Pills */}
        <div className="hidden md:flex items-center gap-1.5">
          {plan.sessions?.map((s) => {
            const isCurrent = s.sessionNumber === currentSession.sessionNumber;
            const isDone = s.status === 'completed';
            return (
              <button
                key={s.sessionNumber}
                onClick={() => switchSession(s.sessionNumber)}
                title={`Session ${s.sessionNumber}: ${s.title}`}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#214d7d] text-white shadow-2xs scale-110'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.sessionNumber}
              </button>
            );
          })}
        </div>

        <div>
          <button
            onClick={() => navigate(`/teacher/lesson-plan`)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
          >
            Back to Lesson Planner
          </button>
        </div>
      </footer>

      {/* Zoom Modal for Saved Board Snapshot */}
      {previewBoardModal && (
        <div
          onClick={() => setPreviewBoardModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-xs font-extrabold">
                  Session {previewBoardModal.sessionNumber}
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 truncate">
                  {previewBoardModal.sessionTitle}
                </h3>
                <span className="text-xs text-slate-400">• {previewBoardModal.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleLoadBoardSnapshot(previewBoardModal);
                    setPreviewBoardModal(null);
                  }}
                  className="px-3 py-1.5 bg-[#214d7d] hover:bg-[#183a61] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Load onto Board
                </button>
                <a
                  href={previewBoardModal.dataUrl}
                  download={`Session_${previewBoardModal.sessionNumber}_SmartBoard.png`}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewBoardModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              <img
                src={previewBoardModal.dataUrl}
                alt="Saved Board Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
