import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Users,
  Video,
  Radio,
  CheckCircle,
  Presentation,
  Clock,
  ShieldAlert,
  X,
  ShieldCheck,
  BookOpen,
  LogOut,
  Maximize2,
  Minimize2,
  Minus,
  RotateCcw,
  PanelLeft,
  ChevronRight,
  ClipboardList,
  LayoutGrid,
} from 'lucide-react';
import { useWebRTCClassroom } from '../../hooks/useWebRTCClassroom';
import { liveClassService } from '../../services/liveClassService';
import { tuitionService } from '../../services/tuitionService';
import { authService } from '../../services/authService';
import { LiveClassSession, LiveClassRole, ICallParticipant } from '../../types/webrtc';
import { VideoParticipantCard } from './VideoParticipantCard';
import { ClassroomControlsBar } from './ClassroomControlsBar';
import { ParticipantListDrawer } from './ParticipantListDrawer';
import { ClassroomChatDrawer } from './ClassroomChatDrawer';
import { TuitionMenuSidebar, WindowViewState } from './TuitionMenuSidebar';
import { StudentLmsPane } from './StudentLmsPane';
import { TestsQuizzesTasksPane } from './TestsQuizzesTasksPane';
import { ClassroomLmsSplitPane } from './ClassroomLmsSplitPane';
import { WhiteboardCanvas } from '../../pages/teacher/smartboard/WhiteboardCanvas';

interface NativeLiveClassroomProps {
  sessionId?: string;
  forcedRole?: LiveClassRole;
  isDemoSession?: boolean;
  demoParticipantName?: string;
  demoRole?: 'teacher' | 'student';
  onExit?: () => void;
}

export const NativeLiveClassroom: React.FC<NativeLiveClassroomProps> = ({
  sessionId: propSessionId,
  forcedRole,
  isDemoSession = false,
  demoParticipantName,
  demoRole,
  onExit,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = useParams<{ sessionId?: string; programId?: string }>();
  const activeSessionId = propSessionId || routeParams.sessionId || routeParams.programId || '';

  const locationState = location.state as any;
  const searchParams = new URLSearchParams(location.search);
  const explicitProgramId =
    locationState?.programId ||
    searchParams.get('programId') ||
    searchParams.get('batchId') ||
    '';
  const explicitProgramCode =
    locationState?.programCode || searchParams.get('code') || '';

  const [session, setSession] = useState<LiveClassSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionFetchError, setSessionFetchError] = useState<string | null>(null);
  const [isWaitingForTeacher, setIsWaitingForTeacher] = useState(false);

  // Post-class summary modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [sessionSummaryData, setSessionSummaryData] = useState<{
    durationMinutes: number;
    totalAttendees: number;
    attendees: Array<{ name: string; role: string }>;
  } | null>(null);

  // 6-Pane Multi-Window State Management - All secondary panes default to closed on room entry
  const [smartboardState, setSmartboardState] = useState<WindowViewState>('closed');
  const [teacherLmsState, setTeacherLmsState] = useState<WindowViewState>('closed');
  const [studentLmsState, setStudentLmsState] = useState<WindowViewState>('closed');
  const [videoState, setVideoState] = useState<WindowViewState>('open'); // Primary active canvas on entry

  // Column 3 Utility Panels State - Closed by default on room entry
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [utilityTab, setUtilityTab] = useState<'quizzes' | 'tasks'>('quizzes');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Focus / Expand Full-Stage Window
  const [expandedWindow, setExpandedWindow] = useState<'smartboard' | 'teacher_lms' | 'student_lms' | 'video' | null>(null);

  // Passport-Sized Student PiP inside Video Window
  const [isStudentPipOpen, setIsStudentPipOpen] = useState(true);

  // Supplementary Drawers & Left Tuition Menu - Closed by default on room entry
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isClassInfoOpen, setIsClassInfoOpen] = useState(false);
  const [isTuitionMenuOpen, setIsTuitionMenuOpen] = useState(false);
  const [programDetails, setProgramDetails] = useState<any | null>(null);
  const [whiteboardElements, setWhiteboardElements] = useState<any[]>([]);

  // Auto-logout compliance state (15-min idle rule)
  const [isIdleAutoLoggedOut, setIsIdleAutoLoggedOut] = useState(false);
  const [idleLogoutReason, setIdleLogoutReason] = useState<string | null>(null);

  // Current user info
  const currentUser = authService.getCurrentUser();
  const { token: tuitionToken } = tuitionService.getTuitionModeSession();
  const authToken = authService.getToken();

  const userRole = (currentUser?.role || currentUser?.activeRole || (currentUser as any)?.userType || '').toLowerCase();
  const isTeacherRole = Boolean(
    isDemoSession
      ? demoRole === 'teacher' || forcedRole === 'host'
      : (
          userRole === 'teacher' ||
          userRole === 'tuition_provider' ||
          userRole === 'institution' ||
          userRole === 'admin' ||
          userRole === 'super_admin' ||
          Boolean(currentUser?.teacherCode) ||
          forcedRole === 'host'
        )
  );

  // Determine return URL when exiting classroom
  const isTuitionContext =
    location.pathname.startsWith('/tuition-mode') ||
    Boolean(sessionStorage.getItem('tuition_mode_token')) ||
    (session?.sessionType === 'tuition');

  const returnUrl = isDemoSession
    ? '/demo-room'
    : isTuitionContext
    ? '/tuition-mode'
    : isTeacherRole
    ? '/teacher/live-classes'
    : '/student/live-classes';

  // Tuition Mode Authorization Gate: Enforce active session or code verification ONLY for Tuition sessions
  useEffect(() => {
    // Demo Trial Class bypasses student/teacher permanent login gate completely
    if (isDemoSession || activeSessionId.startsWith('demo-')) {
      return;
    }

    // If standard LMS live session, authenticated LMS users are authorized immediately
    const isStandardLmsSession =
      !location.pathname.startsWith('/tuition-mode') &&
      session?.sessionType !== 'tuition';

    const hasAuth = Boolean(currentUser || authToken || authService.getToken());

    if (isStandardLmsSession && hasAuth) {
      return; // Standard LMS teacher or student bypasses Tuition Mode Code gate completely!
    }

    const hasUser = Boolean(currentUser);
    const hasTuitionToken = Boolean(tuitionToken);
    const hasAuthToken = Boolean(authToken);

    if (!hasUser && !hasTuitionToken && !hasAuthToken) {
      navigate(isStandardLmsSession ? '/login' : '/tuition-mode', {
        replace: true,
        state: {
          returnUrl: location.pathname,
          message: isStandardLmsSession
            ? 'Please log in to join this live classroom.'
            : 'Tuition Mode authorization required. Please select your program and enter your Student or Teacher Code.',
        },
      });
      return;
    }

    // Check verification status
    // 1) Active Tuition Mode code session (user already verified their Name + Code in Tuition Mode)
    const { token: activeTuitionToken, programContext } = tuitionService.getTuitionModeSession();
    const hasActiveTuitionCode = Boolean(
      (currentUser?.studentCode || currentUser?.teacherCode || (currentUser as any)?.code) &&
      (activeTuitionToken || authToken || hasUser)
    );

    // 2) Any verified program flag in sessionStorage
    const hasAnyVerifiedFlag = tuitionService.hasAnyVerifiedProgram();

    // 3) Direct program/session verification
    const isDirectlyVerified =
      tuitionService.isProgramVerified(activeSessionId) ||
      (explicitProgramId ? tuitionService.isProgramVerified(explicitProgramId, explicitProgramCode) : false) ||
      (programContext ? tuitionService.isProgramVerified(programContext._id || programContext.programId, programContext.code) : false);

    const isAuthorized = hasActiveTuitionCode || hasAnyVerifiedFlag || isDirectlyVerified;

    if (!isAuthorized) {
      sessionStorage.setItem('tuition_redirect_after_login', `/live/${encodeURIComponent(activeSessionId)}`);
      navigate('/tuition-mode', {
        replace: true,
        state: {
          programId: explicitProgramId || activeSessionId,
          autoPromptCodeLogin: true,
          message:
            'Security Verification Required: Please enter your Full Name & Alphanumeric Code to enter this live classroom.',
        },
      });
    } else {
      // Mark current session verified in sessionStorage so subsequent intra-meeting reloads stay unlocked
      if (activeSessionId) {
        tuitionService.setProgramVerified(activeSessionId, explicitProgramCode || explicitProgramId);
      }
    }
  }, [
    currentUser,
    tuitionToken,
    authToken,
    activeSessionId,
    explicitProgramId,
    explicitProgramCode,
    session?.sessionType,
    location.pathname,
    navigate,
  ]);

  // Periodic 15-Minute Idle Heartbeat Check
  useEffect(() => {
    if (isDemoSession || activeSessionId.startsWith('demo-')) {
      return; // Bypassed for Demo Trial Classrooms
    }

    const IDLE_CHECK_INTERVAL_MS = 60 * 1000;
    const interval = setInterval(() => {
      try {
        const { token } = tuitionService.getTuitionModeSession();
        if (!token && !authService.getToken()) {
          setIsIdleAutoLoggedOut(true);
          setIdleLogoutReason(
            'You have been logged out of this tuition session due to inactivity or expired authorization.'
          );
        }
      } catch (e) {
        // Continue loop silently
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isDemoSession, activeSessionId]);

  const currentUserId = (currentUser as any)?.id || (currentUser as any)?._id || (currentUser as any)?.userId || '';
  const currentUserName = isDemoSession
    ? (demoParticipantName || (isTeacherRole ? 'Demo Tutor' : 'Prospective Student'))
    : ((currentUser as any)?.name || (currentUser as any)?.displayName || (isTeacherRole ? 'Teacher' : 'Student'));

  // Load Session Info & Roster
  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      if (!activeSessionId) {
        setSessionFetchError('No session ID provided');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setSessionFetchError(null);

        const data = await liveClassService.getLiveClassDetails(activeSessionId);
        if (!isMounted) return;

        if (data.isWaiting) {
          setIsWaitingForTeacher(true);
          setSession(data.session || null);
        } else if (data.session) {
          setSession(data.session);
          setIsWaitingForTeacher(false);
        }

        // Fetch batch topic & required materials
        tuitionService.getProgramRoster(activeSessionId).then((rosterRes) => {
          if (isMounted && rosterRes.success && rosterRes.program) {
            setProgramDetails(rosterRes.program);
          }
        }).catch((e) => console.warn('Could not load program details:', e));
      } catch (err: any) {
        if (!isMounted) return;
        const errMsg = err.response?.data?.message || err.message || 'Failed to load classroom session';
        setSessionFetchError(errMsg);

        // Auto-provision ad-hoc session if teacher
        if (isTeacherRole) {
          try {
            const adHoc = await liveClassService.createLiveClass({
              title: `Tuition Live: ${activeSessionId}`,
              sessionType: 'tuition',
              tuitionSessionId: activeSessionId,
            });
            if (isMounted) {
              setSession(adHoc.session || null);
              setSessionFetchError(null);
            }
          } catch (autoCreateErr: any) {
            if (isMounted) {
              setSession({
                _id: activeSessionId,
                title: `Tuition Batch ${activeSessionId}`,
                hostId: currentUserId,
                hostRole: 'teacher',
                status: 'live',
                sessionType: 'tuition',
                tuitionSessionId: activeSessionId,
                authorizedStudentIds: [],
                settings: {
                  allowMicrophone: true,
                  allowCamera: true,
                  allowScreenShare: true,
                  allowChat: true,
                },
              });
              setIsWaitingForTeacher(false);
            }
          }
        } else {
          // If student, fallback session representation
          if (isMounted) {
            setSession({
              _id: activeSessionId,
              title: `Tuition Batch ${activeSessionId}`,
              hostId: 'teacher-host',
              hostRole: 'teacher',
              status: 'live',
              sessionType: 'tuition',
              tuitionSessionId: activeSessionId,
              authorizedStudentIds: [],
              settings: {
                allowMicrophone: true,
                allowCamera: true,
                allowScreenShare: true,
                allowChat: true,
              },
            });
            setIsWaitingForTeacher(false);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSession();
    return () => {
      isMounted = false;
    };
  }, [activeSessionId, currentUserId, isTeacherRole]);

  // Polling for students waiting for the instructor to start
  useEffect(() => {
    if (!isWaitingForTeacher || isTeacherRole || !activeSessionId) return;

    const interval = setInterval(async () => {
      try {
        const data = await liveClassService.getLiveClassDetails(activeSessionId);
        if (data.session && data.session.status === 'live' && !data.isWaiting) {
          setSession(data.session);
          setIsWaitingForTeacher(false);
        }
      } catch (err) {
        // Continue waiting
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isWaitingForTeacher, isTeacherRole, activeSessionId]);

  const isHost = isDemoSession
    ? demoRole === 'teacher' || forcedRole === 'host'
    : (
        isTeacherRole &&
        (forcedRole === 'host' ||
          (session && typeof session.hostId === 'string'
            ? session.hostId === currentUserId
            : (session?.hostId as any)?._id === currentUserId))
      );

  const {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    hasPermissionError,
    permissionErrorMessage,
    participants,
    chatMessages,
    isClassEnded,
    isForceLoggedOut,
    endReason,
    joinClass,
    leaveClass,
    endClass,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage,
    broadcastWhiteboardData,
    broadcastWhiteboardDraw,
    broadcastWhiteboardClear,
    broadcastWhiteboardUndo,
    retryMedia,
    allowStudentBoardDraw,
    studentBoardPermissions,
    canDrawWhiteboard,
    setBoardDrawingPermission,
    requestWhiteboardSync,
    activeAssessments,
    studentSubmissions,
    publishAssessment,
    submitAssessment,
    closeAssessment,
  } = useWebRTCClassroom({
    sessionId: session?._id || activeSessionId,
    role: isHost ? 'host' : 'student',
    userName: currentUserName,
    autoJoin: !isWaitingForTeacher && !loading && Boolean(session && session.status === 'live'),
    onWhiteboardSync: (elements) => {
      setWhiteboardElements(elements || []);
    },
    onWhiteboardDraw: (element) => {
      if (!element || !element.id) return;
      setWhiteboardElements((prev) => {
        if (prev.some((e) => e.id === element.id)) return prev;
        return [...prev, element];
      });
    },
    onWhiteboardClear: () => {
      setWhiteboardElements([]);
    },
    onWhiteboardUndo: (elements) => {
      if (elements) {
        setWhiteboardElements(elements);
      } else {
        setWhiteboardElements((prev) => prev.slice(0, -1));
      }
    },
    onAssessmentPublished: (_assessment) => {
      setIsTasksOpen(true);
      setUtilityTab('quizzes');
    },
    onForceLogout: (reason) => {
      setIsIdleAutoLoggedOut(true);
      setIdleLogoutReason(
        reason ||
          'Your tuition session was terminated due to policy limits or idle timeout compliance.'
      );
    },
  });

  // Watch for session ending
  useEffect(() => {
    if (isClassEnded) {
      const duration = session?.totalDurationMinutes || 45;
      const attendeesList = [
        { name: `${currentUserName} (You)`, role: isHost ? 'Instructor' : 'Student' },
        ...participants.map((p) => ({
          name: p.name,
          role: p.role === 'host' ? 'Instructor' : 'Student',
        })),
      ];

      setSessionSummaryData({
        durationMinutes: duration,
        totalAttendees: attendeesList.length,
        attendees: attendeesList,
      });
      setShowSummaryModal(true);

      if (!isHost) {
        tuitionService.clearProgramVerified(activeSessionId);
      }
    }
  }, [isClassEnded, session?.totalDurationMinutes, currentUserName, isHost, participants]);

  const localParticipant: ICallParticipant = {
    peerId: 'local-self',
    name: `${currentUserName}`,
    role: isHost ? 'host' : 'student',
    stream: localStream || undefined,
    isMicMuted: isAudioMuted,
    isVideoMuted: isVideoMuted,
    isLocal: true,
  };

  // Resolve Teacher Participant and Student Participant for PiP
  const teacherParticipant = isHost
    ? localParticipant
    : participants.find((p) => p.role === 'host') || participants[0] || localParticipant;

  const studentParticipant = isHost
    ? participants.find((p) => p.role !== 'host') || participants[0] || null
    : localParticipant;

  const handleExit = () => {
    leaveClass();
    if (onExit) {
      onExit();
    } else {
      navigate(returnUrl);
    }
  };

  const handleTeacherEndClass = async (logoutTuition = false) => {
    try {
      await endClass();
      if (logoutTuition) {
        tuitionService.exitTuitionMode();
      }
    } catch (e) {
      console.error('Error ending class:', e);
      handleExit();
    }
  };

  // Waiting Room state for students
  if (isWaitingForTeacher) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Classroom Waiting Room</h2>
            <p className="text-xs text-slate-400 mt-2">
              The assigned teacher has not launched the live SmartBoard session yet.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-left space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Assigned Batch Details
            </div>
            <div className="text-xs text-slate-300 font-semibold truncate">
              {session?.title || `Session ID: ${activeSessionId}`}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Connecting automatically when teacher joins...</span>
          </div>
          <button
            onClick={() => navigate(returnUrl)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            {returnUrl === '/tuition-mode' ? 'Back to Programs' : 'Back to Live Classes'}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-xs text-slate-400 font-medium">Entering Live Classroom...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Classroom Header Bar */}
      <header className="h-12 bg-slate-900/90 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={handleExit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Exit Classroom"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Left Tuition Menu Toggle Button */}
          <button
            onClick={() => setIsTuitionMenuOpen(!isTuitionMenuOpen)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 ${
              isTuitionMenuOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isTuitionMenuOpen ? 'Collapse Tuition Menu' : 'Expand Tuition Menu'}
          >
            <PanelLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Tuition Menu</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs md:max-w-sm">
              {session?.title || programDetails?.title || `Classroom #${activeSessionId}`}
            </h1>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 shrink-0 font-bold hidden md:inline-block">
              {session?.sessionType === 'tuition' ? 'Tuition Batch' : 'Live SmartBoard'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* SmartBoard Button */}
          <button
            onClick={() => {
              if (expandedWindow) setExpandedWindow(null);
              const nextState = smartboardState === 'open' ? 'closed' : 'open';
              setSmartboardState(nextState);
              if (nextState === 'open') requestWhiteboardSync();
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              smartboardState === 'open'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={smartboardState === 'open' ? 'Close SmartBoard' : 'Open SmartBoard'}
          >
            <Presentation className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">SmartBoard</span>
          </button>

          {/* EduPye LMS Button */}
          <button
            onClick={() => {
              if (expandedWindow) setExpandedWindow(null);
              if (isHost) {
                setTeacherLmsState(teacherLmsState === 'open' ? 'closed' : 'open');
              } else {
                setStudentLmsState(studentLmsState === 'open' ? 'closed' : 'open');
              }
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              (isHost ? teacherLmsState === 'open' : studentLmsState === 'open')
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={(isHost ? teacherLmsState === 'open' : studentLmsState === 'open') ? 'Close EduPye LMS' : 'Open EduPye LMS'}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">EduPye LMS</span>
          </button>

          {/* Tests, Quizzes & Tasks Button */}
          <button
            onClick={() => setIsTasksOpen(!isTasksOpen)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isTasksOpen
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isTasksOpen ? 'Close Tests & Tasks' : 'Open Tests & Tasks'}
          >
            <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Tests &amp; Tasks</span>
          </button>

          {/* Class Brief & Topic Button */}
          <button
            onClick={() => setIsClassInfoOpen(!isClassInfoOpen)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isClassInfoOpen
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30'
            }`}
            title="Class Brief & Syllabus Topic"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Topic</span>
          </button>

          {/* Present Count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{participants.length + 1}</span>
          </div>

          {/* User Role Tag */}
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40 hidden sm:inline-block">
            {isHost ? 'Instructor' : 'Student'}
          </span>
        </div>
      </header>

      {/* Permission Warning Banner if mic/cam blocked */}
      {hasPermissionError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-amber-300 text-xs font-medium shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{permissionErrorMessage}</span>
          </div>
          <button
            onClick={joinClass}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
          >
            Retry Permissions
          </button>
        </div>
      )}

      {/* Main Classroom Viewport: Collapsible Left Tuition Menu Rail + 3-Column Multi-Window Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Task 1: Far-Left Tuition Menu Bar (Collapsed by default, opens in exact slot) */}
        {isTuitionMenuOpen && (
          <TuitionMenuSidebar
            isHost={Boolean(isHost)}
            smartboardState={smartboardState}
            onToggleSmartboard={() => {
              if (expandedWindow) setExpandedWindow(null);
              setSmartboardState((prev) => {
                const nextState = prev === 'open' ? 'closed' : 'open';
                if (nextState === 'open') requestWhiteboardSync();
                return nextState;
              });
            }}
            teacherLmsState={teacherLmsState}
            onToggleTeacherLms={() => {
              if (expandedWindow) setExpandedWindow(null);
              setTeacherLmsState((prev) => (prev === 'open' ? 'closed' : 'open'));
            }}
            studentLmsState={studentLmsState}
            onToggleStudentLms={() => {
              if (expandedWindow) setExpandedWindow(null);
              setStudentLmsState((prev) => (prev === 'open' ? 'closed' : 'open'));
            }}
            videoState={videoState}
            onToggleVideo={() => {
              if (expandedWindow) setExpandedWindow(null);
              setVideoState((prev) => (prev === 'open' ? 'minimized' : 'open'));
            }}
            isTasksOpen={isTasksOpen}
            onToggleTasks={() => {
              setIsTasksOpen(!isTasksOpen);
              setUtilityTab('tasks');
            }}
            isQuizzesOpen={isTasksOpen && utilityTab === 'quizzes'}
            onToggleQuizzes={() => {
              setIsTasksOpen(true);
              setUtilityTab('quizzes');
            }}
            isChatOpen={isChatOpen}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            unreadChatCount={0}
            activeAssessmentCount={activeAssessments.length}
            isScreenSharing={isScreenSharing}
            onClose={() => setIsTuitionMenuOpen(false)}
          />
        )}

        {/* Crisp left-edge toggle handle when Tuition Menu is collapsed */}
        {!isTuitionMenuOpen && (
          <button
            onClick={() => setIsTuitionMenuOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900/95 hover:bg-slate-800 text-amber-400 border-r border-y border-slate-700/80 rounded-r-xl p-1.5 shadow-2xl transition-all hover:pl-2.5 cursor-pointer group"
            title="Expand Tuition Menu Sidebar"
            aria-label="Expand Tuition Menu Sidebar"
          >
            <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Focus / Full Stage Window Mode */}
        {expandedWindow ? (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
            <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Focused Window: {expandedWindow.replace('_', ' ').toUpperCase()}
                {expandedWindow === 'smartboard' && (
                  isHost ? (
                    <button
                      onClick={() => setBoardDrawingPermission(!allowStudentBoardDraw)}
                      className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                        allowStudentBoardDraw
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title={allowStudentBoardDraw ? 'Click to disable student drawing' : 'Click to allow students to draw on SmartBoard'}
                    >
                      {allowStudentBoardDraw ? '✏️ Student Draw: ON' : '🔒 Student Draw: OFF'}
                    </button>
                  ) : (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        canDrawWhiteboard
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}
                    >
                      {canDrawWhiteboard ? '✏️ Drawing Enabled' : '🔒 View Only'}
                    </span>
                  )
                )}
              </span>
              <button
                onClick={() => setExpandedWindow(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Restore Grid View</span>
              </button>
            </div>

            <div className="flex-1 p-2 overflow-hidden">
              {expandedWindow === 'smartboard' && (
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <WhiteboardCanvas
                    className="w-full h-full"
                    remoteElements={whiteboardElements}
                    onDrawStroke={(el) => broadcastWhiteboardDraw(el)}
                    onClearBoard={() => broadcastWhiteboardClear()}
                    onUndoBoard={(remaining) => broadcastWhiteboardUndo(remaining)}
                    onSyncState={(allEls) => broadcastWhiteboardData(allEls)}
                    canDraw={canDrawWhiteboard}
                    drawPermissionNotice={
                      isHost
                        ? undefined
                        : canDrawWhiteboard
                        ? 'Drawing Enabled by Teacher'
                        : "View Only — Teacher drawing mode"
                    }
                    onRequestSync={requestWhiteboardSync}
                    isOpen={true}
                    isExpanded={true}
                  />
                </div>
              )}

              {expandedWindow === 'teacher_lms' && (
                <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <ClassroomLmsSplitPane
                    isOpen={true}
                    onClose={() => setExpandedWindow(null)}
                    isExpanded={true}
                    onToggleExpand={() => setExpandedWindow(null)}
                    sessionId={activeSessionId}
                    sessionTitle={session?.title || programDetails?.title}
                    isHost={true}
                  />
                </div>
              )}

              {expandedWindow === 'student_lms' && (
                <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <StudentLmsPane
                    isOpen={true}
                    onClose={() => setExpandedWindow(null)}
                    isExpanded={true}
                    onToggleExpand={() => setExpandedWindow(null)}
                    onMinimize={() => setExpandedWindow(null)}
                    sessionId={activeSessionId}
                    sessionTitle={session?.title || programDetails?.title}
                    isHost={Boolean(isHost)}
                  />
                </div>
              )}

              {expandedWindow === 'video' && (
                <div className="w-full h-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl relative flex items-center justify-center">
                  {screenStream ? (
                    <video
                      autoPlay
                      playsInline
                      ref={(el) => {
                        if (el && screenStream) el.srcObject = screenStream;
                      }}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <VideoParticipantCard
                      participant={teacherParticipant}
                      isLocal={isHost}
                      className="w-full h-full"
                      onRetryMedia={() => retryMedia(teacherParticipant?.peerId)}
                    />
                  )}

                  {/* Student PiP in Expanded Video view */}
                  {studentParticipant && isStudentPipOpen && (
                    <div className="absolute top-4 right-4 z-30 w-44 sm:w-52 aspect-[4/3] rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-slate-950/95 backdrop-blur-md">
                      <div className="h-6 px-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-amber-300 truncate">
                          {studentParticipant.name} (Student)
                        </span>
                        <button
                          onClick={() => setIsStudentPipOpen(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1 h-[calc(100%-24px)]">
                        <VideoParticipantCard
                          participant={studentParticipant}
                          isLocal={!isHost}
                          className="w-full h-full"
                          onRetryMedia={() => retryMedia(studentParticipant?.peerId)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Task 2: 3-Column Multi-Window Classroom Grid */
          <div className="flex-1 flex overflow-hidden p-2 gap-2 bg-slate-950">
            {/* COLUMN 1 (Left Main Column): Smart Board (Top) + Teacher LMS (Bottom, Teacher-only) */}
            {(smartboardState !== 'closed' || (isHost && teacherLmsState !== 'closed')) && (
              <div className="w-full lg:w-[38%] xl:w-[40%] flex flex-col gap-2 h-full overflow-hidden shrink-0">
                {/* Smart Board Window */}
                {smartboardState !== 'closed' && (
                  <div
                    className={`rounded-2xl border border-slate-800 bg-white overflow-hidden shadow-xl flex flex-col transition-all ${
                      smartboardState === 'minimized'
                        ? 'h-9 shrink-0 bg-slate-900!'
                        : isHost && teacherLmsState === 'open'
                        ? 'flex-1 h-1/2 min-h-[220px]'
                        : 'flex-1 h-full'
                    }`}
                  >
                    {/* Header */}
                    <div className="h-9 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-white shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <Presentation className="w-4 h-4 text-amber-400" />
                        <span className="font-bold">Interactive SmartBoard</span>
                        {isHost ? (
                          <button
                            onClick={() => setBoardDrawingPermission(!allowStudentBoardDraw)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                              allowStudentBoardDraw
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                            title={allowStudentBoardDraw ? 'Click to disable student drawing' : 'Click to allow students to draw on SmartBoard'}
                          >
                            {allowStudentBoardDraw ? '✏️ Student Draw: ON' : '🔒 Student Draw: OFF'}
                          </button>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              canDrawWhiteboard
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            }`}
                          >
                            {canDrawWhiteboard ? '✏️ Drawing Enabled' : '🔒 View Only'}
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Dual-Dock
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSmartboardState(smartboardState === 'minimized' ? 'open' : 'minimized')}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title={smartboardState === 'minimized' ? 'Restore SmartBoard' : 'Minimize SmartBoard'}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpandedWindow('smartboard')}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Expand Full Stage"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSmartboardState('closed')}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Close SmartBoard"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Canvas Body (when not minimized) */}
                    {smartboardState !== 'minimized' && (
                      <div className="flex-1 min-h-0 bg-white">
                        <WhiteboardCanvas
                          className="w-full h-full"
                          remoteElements={whiteboardElements}
                          onDrawStroke={(el) => broadcastWhiteboardDraw(el)}
                          onClearBoard={() => broadcastWhiteboardClear()}
                          onUndoBoard={(remaining) => broadcastWhiteboardUndo(remaining)}
                          onSyncState={(allEls) => broadcastWhiteboardData(allEls)}
                          canDraw={canDrawWhiteboard}
                          drawPermissionNotice={
                            isHost
                              ? undefined
                              : canDrawWhiteboard
                              ? 'Drawing Enabled by Teacher'
                              : "View Only — Teacher drawing mode"
                          }
                          onRequestSync={requestWhiteboardSync}
                          isOpen={smartboardState === 'open'}
                          isExpanded={false}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Teacher LMS Window (Bottom of Column 1, Teacher-only) */}
                {isHost && teacherLmsState !== 'closed' && (
                  <div
                    className={`rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl flex flex-col transition-all ${
                      teacherLmsState === 'minimized'
                        ? 'h-9 shrink-0'
                        : smartboardState === 'open'
                        ? 'flex-1 h-1/2 min-h-[220px]'
                        : 'flex-1 h-full'
                    }`}
                  >
                    {/* Header */}
                    <div className="h-9 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-white shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="font-bold">Teacher EduPye LMS</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          Lesson Planner &amp; Tools
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setTeacherLmsState(teacherLmsState === 'minimized' ? 'open' : 'minimized')}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title={teacherLmsState === 'minimized' ? 'Restore LMS' : 'Minimize LMS'}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpandedWindow('teacher_lms')}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Expand Full Stage"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTeacherLmsState('closed')}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Close LMS"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Teacher LMS Content Body */}
                    {teacherLmsState !== 'minimized' && (
                      <div className="flex-1 min-h-0">
                        <ClassroomLmsSplitPane
                          isOpen={true}
                          onClose={() => setTeacherLmsState('closed')}
                          isExpanded={false}
                          onToggleExpand={() => setExpandedWindow('teacher_lms')}
                          sessionId={activeSessionId}
                          sessionTitle={session?.title || programDetails?.title}
                          isHost={true}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* COLUMN 2 (Center Main Column): Student LMS (Top) + Video & Screen Share (Bottom) */}
            <div className="flex-1 flex flex-col gap-2 h-full overflow-hidden min-w-[320px]">
              {/* EduPye LMS (Student View) Window (Top) */}
              {studentLmsState !== 'closed' && (
                <div
                  className={`transition-all overflow-hidden flex flex-col ${
                    studentLmsState === 'minimized'
                      ? 'h-9 shrink-0 rounded-2xl border border-slate-800 bg-slate-900'
                      : videoState === 'open'
                      ? 'flex-1 h-1/2 min-h-[200px]'
                      : 'flex-1 h-full'
                  }`}
                >
                  {studentLmsState === 'minimized' ? (
                    <div className="h-9 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-white">
                      <span className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        EduPye LMS (Student View) - Minimized
                      </span>
                      <button
                        onClick={() => setStudentLmsState('open')}
                        className="text-slate-400 hover:text-white"
                        title="Restore LMS"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <StudentLmsPane
                      isOpen={true}
                      onClose={() => setStudentLmsState('closed')}
                      isExpanded={false}
                      onToggleExpand={() => setExpandedWindow('student_lms')}
                      onMinimize={() => setStudentLmsState('minimized')}
                      sessionId={activeSessionId}
                      sessionTitle={session?.title || programDetails?.title}
                      isHost={Boolean(isHost)}
                    />
                  )}
                </div>
              )}

              {/* Video & Screen Share Window (Bottom) */}
              {videoState !== 'closed' && (
                <div
                  className={`rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl flex flex-col relative transition-all ${
                    videoState === 'minimized'
                      ? 'h-9 shrink-0'
                      : studentLmsState === 'open'
                      ? 'flex-1 h-1/2 min-h-[220px]'
                      : 'flex-1 h-full'
                  }`}
                >
                  {/* Window Header */}
                  <div className="h-9 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-white shrink-0 select-none z-10">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-rose-400" />
                      <span className="font-bold">
                        {screenStream ? 'Screen Share Active' : 'Live Classroom Video'}
                      </span>
                      {screenStream && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Broadcasting
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setVideoState(videoState === 'minimized' ? 'open' : 'minimized')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title={videoState === 'minimized' ? 'Restore Video' : 'Minimize Video'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpandedWindow('video')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Expand Full Stage"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setVideoState('closed')}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Close Video"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Video Stage Body */}
                  {videoState !== 'minimized' && (
                    <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                      {screenStream ? (
                        <video
                          autoPlay
                          playsInline
                          ref={(el) => {
                            if (el && screenStream) el.srcObject = screenStream;
                          }}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <VideoParticipantCard
                          participant={teacherParticipant}
                          isLocal={isHost}
                          className="w-full h-full"
                          onRetryMedia={() => retryMedia(teacherParticipant?.peerId)}
                        />
                      )}

                      {/* Passport-Sized Student Video PiP Card (Docked in Top-Right Corner) */}
                      {studentParticipant && isStudentPipOpen && (
                        <div className="absolute top-3 right-3 z-20 w-36 sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-slate-950/95 backdrop-blur-md flex flex-col">
                          <div className="h-5 px-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px]">
                            <span className="font-bold text-amber-300 truncate">
                              {studentParticipant.name}
                            </span>
                            <button
                              onClick={() => setIsStudentPipOpen(false)}
                              className="text-slate-400 hover:text-white"
                              title="Hide Student PiP"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex-1 relative">
                            <VideoParticipantCard
                              participant={studentParticipant}
                              isLocal={!isHost}
                              className="w-full h-full"
                              onRetryMedia={() => retryMedia(studentParticipant?.peerId)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Small pill to reopen student PiP if closed */}
                      {studentParticipant && !isStudentPipOpen && (
                        <button
                          onClick={() => setIsStudentPipOpen(true)}
                          className="absolute top-3 right-3 z-20 px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[10px] text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 shadow-lg cursor-pointer"
                        >
                          <span>+ Show Student PiP</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLUMN 3 (Narrower Right Utility Column — Fixed Width ~300px–340px) */}
            {(isTasksOpen || isChatOpen) && (
              <div className="w-80 xl:w-88 flex flex-col h-full shrink-0 border-l border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
                {/* Top Panel (Tests, Quizzes, Tasks) */}
                {isTasksOpen && (
                  <TestsQuizzesTasksPane
                    isOpen={true}
                    onClose={() => setIsTasksOpen(false)}
                    isHost={Boolean(isHost)}
                    sessionId={session?._id || activeSessionId}
                    programId={(session as any)?.batchId || (session as any)?.tuitionSessionId}
                    assessments={activeAssessments}
                    studentSubmissions={studentSubmissions}
                    onPublishAssessment={publishAssessment}
                    onSubmitAssessment={submitAssessment}
                    onCloseAssessment={closeAssessment}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    programDetails={programDetails}
                    defaultTab={utilityTab}
                  />
                )}

                {/* Bottom Panel (Chat): Teacher Left, Student Right, Audio & Attachment Composer */}
                {isChatOpen && (
                  <div className="flex-1 flex flex-col min-h-0">
                    <ClassroomChatDrawer
                      isOpen={true}
                      onClose={() => setIsChatOpen(false)}
                      messages={chatMessages}
                      onSendMessage={sendChatMessage}
                      currentUserId={currentUserId || (isHost ? 'host' : 'student')}
                      alternateUserId={(currentUser as any)?._id}
                      isDocked={true}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Slide-out Drawers */}
        <ParticipantListDrawer
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          participants={participants}
          localParticipant={localParticipant}
          isHost={Boolean(isHost)}
          allowStudentBoardDraw={allowStudentBoardDraw}
          studentBoardPermissions={studentBoardPermissions}
          onToggleStudentDraw={(studentId, allowed) => setBoardDrawingPermission(allowed, studentId)}
        />

        {/* Class Brief & People Drawer */}
        {isClassInfoOpen && (
          <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-40 animate-slideLeft shadow-2xl absolute right-0 top-0 bottom-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Class Brief &amp; People</h3>
                  <p className="text-[10px] text-slate-400">Readiness, Topic &amp; Participants</p>
                </div>
              </div>
              <button
                onClick={() => setIsClassInfoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Today's Session Topic
                </span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs font-bold text-white">
                    {programDetails?.nextSessionTopic || session?.title || 'Live Interactive Class'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Synchronized interactive whiteboard derivations &amp; real-time quizzes.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Required Materials Checklist
                </span>
                <div className="space-y-1.5">
                  {(programDetails?.requiredMaterials && programDetails.requiredMaterials.length > 0
                    ? programDetails.requiredMaterials
                    : ['Class Notebook & Ballpoint Pen', 'Standard Textbook', 'Scientific Calculator / Formula Sheet']
                  ).map((item: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Classroom Bottom Controls */}
      <ClassroomControlsBar
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        isScreenSharing={isScreenSharing}
        isHost={Boolean(isHost)}
        participantCount={participants.length + 1}
        unreadChatCount={0}
        isChatOpen={isChatOpen}
        isParticipantListOpen={isParticipantsOpen}
        isSmartBoardOpen={smartboardState === 'open'}
        isAssessmentOpen={isTasksOpen}
        activeAssessmentCount={activeAssessments.length}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onToggleParticipantList={() => setIsParticipantsOpen(!isParticipantsOpen)}
        onToggleSmartBoard={() => setSmartboardState(smartboardState === 'open' ? 'closed' : 'open')}
        onToggleAssessment={() => setIsTasksOpen(!isTasksOpen)}
        onLeaveClass={handleExit}
        onEndClass={handleTeacherEndClass}
      />

      {/* 15-Minute Idle Auto-Logout Compliance Modal */}
      {isIdleAutoLoggedOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-amber-500/40 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Idle Timeout Compliance Logout</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {idleLogoutReason ||
                  'Your session has been terminated after 15 minutes of inactivity in compliance with Tuition Security Policies.'}
              </p>
            </div>
            <button
              onClick={() => {
                tuitionService.exitTuitionMode();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
            >
              Return to Tuition Directory
            </button>
          </div>
        </div>
      )}

      {/* Post-Class Summary Modal */}
      {showSummaryModal && sessionSummaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Classroom Session Ended</h3>
              <p className="text-xs text-slate-300 mt-1">
                The session has concluded. Attendance logs and whiteboard derivations have been archived.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Duration:</span>
                <span className="font-bold text-white">{sessionSummaryData.durationMinutes} mins</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Attendees:</span>
                <span className="font-bold text-emerald-400">{sessionSummaryData.totalAttendees}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSummaryModal(false);
                navigate(returnUrl);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
            >
              Close &amp; Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NativeLiveClassroom;
