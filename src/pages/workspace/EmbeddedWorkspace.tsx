import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  Calendar,
  CheckSquare,
  HelpCircle,
  Award,
  RefreshCw,
  Maximize2,
  Minimize2,
  ShieldCheck,
  School,
  Building2,
  PenTool,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  User,
  GraduationCap
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';

// Import existing Core components where appropriate
import LessonPlanner from '../teacher/LessonPlanner';
import KanbanBoard from '../teacher/KanbanBoard';
import TeacherCalendar from '../teacher/TeacherCalendar';
import AssessmentStudio from '../teacher/assessment/AssessmentStudio';
import NotebookPage from '../student/Notebook';
import QuizHub from '../student/QuizHub';
import Courses from '../student/Courses';
import ExamCrackerPage from '../student/ExamCracker';
import StudentCalendar from '../student/Calendar';

type AuthStatus = 'awaiting_token' | 'exchanging' | 'authenticated' | 'error';

interface SSOSessionData {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    userType: string;
    sourceSystem: 'school' | 'college';
    externalUserId: string;
  };
  profile: any;
  role: 'teacher' | 'student';
  sourceSystem: 'school' | 'college';
  institutionId: string;
}

const ENV_ALLOWED_ORIGINS = (import.meta as any).env?.VITE_ALLOWED_PARENT_ORIGINS
  ? String((import.meta as any).env.VITE_ALLOWED_PARENT_ORIGINS).split(/[,\s]+/).filter(Boolean)
  : [];

const ALLOWED_PARENT_ORIGINS = [
  ...ENV_ALLOWED_ORIGINS,
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];

export default function EmbeddedWorkspace() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('awaiting_token');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<SSOSessionData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('planner');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Smart Board Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolColor, setToolColor] = useState('#2563eb');
  const [lineWidth, setLineWidth] = useState(4);

  // 1. Listen for secure postMessage handoff from parent ERP window
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate origin to prevent cross-site token interception
      const originAllowed =
        ALLOWED_PARENT_ORIGINS.includes(event.origin) ||
        event.origin === window.location.origin;

      if (!originAllowed) {
        return;
      }

      if (event.data && event.data.type === 'EDUPYE_SSO_INIT' && event.data.ssoToken) {
        setAuthStatus('exchanging');
        setErrorMessage(null);

        try {
          const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
          const exchangeUrl = apiBaseUrl.endsWith('/api')
            ? `${apiBaseUrl}/sso/exchange`
            : `${apiBaseUrl}/api/sso/exchange`;

          const response = await fetch(exchangeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ssoToken: event.data.ssoToken }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Token exchange failed');
          }

          const sessionData: SSOSessionData = data.data;

          // Safely initialize session for downstream Core service calls
          localStorage.setItem('token', sessionData.token);
          localStorage.setItem('userId', sessionData.user._id);
          localStorage.setItem('userType', sessionData.user.userType);
          localStorage.setItem('userEmail', sessionData.user.email);
          localStorage.setItem('userName', sessionData.user.name);

          if (sessionData.role === 'teacher' && sessionData.profile?._id) {
            localStorage.setItem('teacherProfileId', sessionData.profile._id);
            setActiveTab('planner');
          } else if (sessionData.role === 'student') {
            if (sessionData.profile?._id) {
              localStorage.setItem('studentProfileId', sessionData.profile._id);
            }
            setActiveTab('notebook');
          }

          setSession(sessionData);
          setAuthStatus('authenticated');

          // Notify parent ERP window of successful session initialization
          if (event.source && typeof (event.source as any).postMessage === 'function') {
            (event.source as any).postMessage(
              {
                type: 'EDUPYE_SSO_READY',
                role: sessionData.role,
                userId: sessionData.user._id,
              },
              event.origin
            );
          }
        } catch (err: any) {
          console.error('SSO Exchange error:', err);
          setAuthStatus('error');
          setErrorMessage(err.message || 'Failed to exchange SSO credentials');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Let the parent container know the iframe is mounted and ready for the token
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'EDUPYE_IFRAME_MOUNTED' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Smart Board canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = toolColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // --------------------------------------------------------------------------
  // RENDER: Loading / Awaiting Handoff State
  // --------------------------------------------------------------------------
  if (authStatus === 'awaiting_token' || authStatus === 'exchanging') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 max-w-md w-full text-center shadow-xl backdrop-blur">
          <div className="flex justify-center mb-5">
            <EdupyeLogo className="scale-125" />
          </div>

          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />

          <h2 className="text-lg font-bold text-slate-100 mb-2">
            {authStatus === 'awaiting_token'
              ? 'Connecting to Teaching & Learning Workspace...'
              : 'Verifying Single Sign-On Credentials...'}
          </h2>

          <p className="text-xs text-slate-400 mb-4">
            Performing secure cryptographic token exchange with EduPye Core. Tokens are never exposed in browser URLs.
          </p>

          <div className="flex items-center justify-center gap-2 text-[11px] text-blue-400 font-medium bg-blue-500/10 py-1.5 px-3 rounded-full border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Cross-Module Handshake</span>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Error State
  // --------------------------------------------------------------------------
  if (authStatus === 'error') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-slate-800/90 border border-rose-500/40 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-white mb-2">Workspace Access Denied</h2>
          <p className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 mb-4 font-mono">
            {errorMessage || 'Authentication handoff failed or token expired.'}
          </p>

          <p className="text-xs text-slate-400 mb-6">
            Please return to your School/College portal and relaunch the workspace. Single-use tokens cannot be replayed.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Authenticated Workspace (Role-Aware)
  // --------------------------------------------------------------------------
  const isTeacher = session?.role === 'teacher';
  const isSchool = session?.sourceSystem === 'school';
  const academicContext = session?.profile?.academicContext || {};

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Top Workspace Header & Context Badge */}
      <header className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <EdupyeLogo className="scale-90" />
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {isTeacher ? 'Teaching Workspace' : 'Learning Workspace'}
              </span>
              <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {session?.sourceSystem} ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span>{session?.user.name}</span>
              <span>•</span>
              <span className="text-slate-300">
                {session?.profile?.institution ||
                  session?.profile?.department ||
                  (isSchool ? 'Greenwood High School' : 'EduPye Institute of Technology')}
              </span>
              {session?.profile?.classesTaught?.[0] && (
                <>
                  <span>•</span>
                  <span className="text-blue-300 font-medium">
                    {session.profile.classesTaught[0]}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Workspace Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium">SSO Authenticated</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Workspace'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Workspace Role Navigation Tabs */}
      <nav className="bg-slate-900/90 border-b border-slate-800/80 px-5 flex items-center gap-2 overflow-x-auto shrink-0">
        {isTeacher ? (
          <>
            <button
              onClick={() => setActiveTab('planner')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'planner'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lesson Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('smartboard')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'smartboard'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Smart Board</span>
            </button>

            <button
              onClick={() => setActiveTab('assessment')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'assessment'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Assessment Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Teaching Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Teaching Calendar</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('notebook')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'notebook'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Interactive Notebook</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quiz Hub & Practice</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Course Learning</span>
            </button>

            <button
              onClick={() => setActiveTab('exam-cracker')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'exam-cracker'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Exam Cracker</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-3 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Study Calendar</span>
            </button>
          </>
        )}
      </nav>

      {/* Main Workspace Tool Canvas */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
        {/* TEACHER TOOLS */}
        {isTeacher && (
          <>
            {activeTab === 'planner' && (
              <div className="max-w-7xl mx-auto">
                <LessonPlanner />
              </div>
            )}

            {activeTab === 'smartboard' && (
              <div className="max-w-7xl mx-auto flex flex-col gap-4">
                {/* Smart Board Controls */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">Tool:</span>
                    <button
                      onClick={() => setToolColor('#2563eb')}
                      className={`w-6 h-6 rounded-full bg-blue-600 transition-transform ${
                        toolColor === '#2563eb' ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      title="Blue Pen"
                    />
                    <button
                      onClick={() => setToolColor('#ef4444')}
                      className={`w-6 h-6 rounded-full bg-red-500 transition-transform ${
                        toolColor === '#ef4444' ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      title="Red Pen"
                    />
                    <button
                      onClick={() => setToolColor('#10b981')}
                      className={`w-6 h-6 rounded-full bg-emerald-500 transition-transform ${
                        toolColor === '#10b981' ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      title="Green Pen"
                    />
                    <button
                      onClick={() => setToolColor('#f8fafc')}
                      className={`w-6 h-6 rounded-full bg-white transition-transform ${
                        toolColor === '#f8fafc' ? 'ring-2 ring-blue-500 scale-110' : ''
                      }`}
                      title="White Chalk"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Thickness:</span>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="w-20 accent-blue-500"
                      />
                    </div>

                    <button
                      onClick={clearCanvas}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Canvas</span>
                    </button>
                  </div>
                </div>

                {/* Live Drawing Surface */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                  <canvas
                    ref={canvasRef}
                    width={1200}
                    height={680}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-[620px] bg-slate-950 cursor-crosshair block"
                  />
                  <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 pointer-events-none bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                    Interactive Teaching Smart Board • Drawing Canvas
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assessment' && (
              <div className="max-w-7xl mx-auto">
                <AssessmentStudio />
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="max-w-7xl mx-auto">
                <KanbanBoard />
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="max-w-7xl mx-auto">
                <TeacherCalendar />
              </div>
            )}
          </>
        )}

        {/* STUDENT TOOLS */}
        {!isTeacher && (
          <>
            {activeTab === 'notebook' && (
              <div className="max-w-7xl mx-auto">
                <NotebookPage />
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="max-w-7xl mx-auto">
                <QuizHub />
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="max-w-7xl mx-auto">
                <Courses />
              </div>
            )}

            {activeTab === 'exam-cracker' && (
              <div className="max-w-7xl mx-auto">
                <ExamCrackerPage />
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="max-w-7xl mx-auto">
                <StudentCalendar />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
