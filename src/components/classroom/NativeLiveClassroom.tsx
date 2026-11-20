import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Users,
  Video,
  Radio,
  CheckCircle,
  ExternalLink,
  Presentation,
  MonitorUp,
  Clock,
  ShieldAlert,
  X,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useWebRTCClassroom } from '../../hooks/useWebRTCClassroom';
import { liveClassService } from '../../services/liveClassService';
import { tuitionService } from '../../services/tuitionService';
import { authService } from '../../services/authService';
import { LiveClassSession, LiveClassRole } from '../../types/webrtc';
import { VideoParticipantCard } from './VideoParticipantCard';
import { ClassroomControlsBar } from './ClassroomControlsBar';
import { ParticipantListDrawer } from './ParticipantListDrawer';
import { ClassroomChatDrawer } from './ClassroomChatDrawer';
import { InMeetingAssessmentDrawer } from './InMeetingAssessmentDrawer';
import { WhiteboardCanvas } from '../../pages/teacher/smartboard/WhiteboardCanvas';

interface NativeLiveClassroomProps {
  sessionId?: string;
  forcedRole?: LiveClassRole;
  onExit?: () => void;
}

export const NativeLiveClassroom: React.FC<NativeLiveClassroomProps> = ({
  sessionId: propSessionId,
  forcedRole,
  onExit,
}) => {
  const navigate = useNavigate();
  const routeParams = useParams<{ sessionId?: string; programId?: string }>();
  const activeSessionId = propSessionId || routeParams.sessionId || routeParams.programId || '';

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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSmartBoardOpen, setIsSmartBoardOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isClassInfoOpen, setIsClassInfoOpen] = useState(false);
  const [programDetails, setProgramDetails] = useState<any | null>(null);
  const [whiteboardElements, setWhiteboardElements] = useState<any[]>([]);

  // Auto-logout compliance state (15-min idle rule)
  const [isIdleAutoLoggedOut, setIsIdleAutoLoggedOut] = useState(false);
  const [idleLogoutReason, setIdleLogoutReason] = useState<string | null>(null);

  // Retrieve current user info from localStorage or session
  const currentUser = authService.getCurrentUser();
  const { token: tuitionToken } = tuitionService.getTuitionModeSession();
  const authToken = authService.getToken();

  const userRole = (currentUser?.role || currentUser?.activeRole || (currentUser as any)?.userType || '').toLowerCase();
  const isTeacherRole = Boolean(
    userRole === 'teacher' ||
    userRole === 'tuition_provider' ||
    userRole === 'institution' ||
    userRole === 'admin' ||
    userRole === 'super_admin' ||
    Boolean(currentUser?.teacherCode)
  );

  // Tuition Mode Authorization Gate: Enforce active session or code verification
  useEffect(() => {
    if (!currentUser && !tuitionToken && !authToken) {
      navigate('/tuition-mode', {
        replace: true,
        state: {
          message:
            'Tuition Mode authorization required. Please select your program and enter your Student or Teacher Code.',
        },
      });
    }
  }, [currentUser, tuitionToken, authToken, navigate]);

  let currentUserId = currentUser?.id || '';
  let currentUserName = currentUser?.name || 'Student';

  // Fetch Session Details
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
        const data = await liveClassService.getLiveClassDetails(activeSessionId);
        const progLookupId = (data.session as any)?.batchId || (data.session as any)?.tuitionSessionId || activeSessionId;
        if (progLookupId && isMounted) {
          tuitionService.getProgramRoster(progLookupId).then((r) => {
            if (r.success && isMounted) {
              setProgramDetails(r.program || r);
            }
          }).catch(() => {});
        }
        if (data.session && data.session.status === 'live' && !data.isWaiting) {
          if (isMounted) {
            setSession(data.session);
            setIsWaitingForTeacher(false);
            setSessionFetchError(null);
          }
        } else if (data.isWaiting || !data.session || data.session.status !== 'live') {
          if (!isTeacherRole) {
            // Student: Wait for instructor to launch live class
            if (isMounted) {
              setIsWaitingForTeacher(true);
              setSession(data.session || null);
              setSessionFetchError(null);
            }
          } else {
            // Teacher: Initialize or launch host session
            if (isMounted) {
              setSession(data.session || {
                _id: activeSessionId,
                title: 'Live Classroom Session',
                hostId: currentUserId,
                hostRole: 'teacher',
                status: 'live',
                sessionType: 'tuition',
                authorizedStudentIds: [],
                settings: {
                  allowMicrophone: true,
                  allowCamera: true,
                  allowScreenShare: true,
                  allowChat: true,
                },
              });
              setIsWaitingForTeacher(false);
              setSessionFetchError(null);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[NativeLiveClassroom] Failed to fetch session info:', err?.message);
          if (!isTeacherRole) {
            // If student receives 404 or error, teacher has not started yet
            setIsWaitingForTeacher(true);
            setSession(null);
            setSessionFetchError(null);
          } else {
            // Teacher role fallback for ad-hoc or direct room launches
            setSession({
              _id: activeSessionId,
              title: 'Live Classroom Session',
              hostId: currentUserId,
              hostRole: 'teacher',
              status: 'live',
              sessionType: 'tuition',
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

  const isHost =
    isTeacherRole &&
    (forcedRole === 'host' ||
      (session && typeof session.hostId === 'string'
        ? session.hostId === currentUserId
        : (session?.hostId as any)?._id === currentUserId));

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
    connectionStatus,
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
      setWhiteboardElements(elements);
    },
    onWhiteboardDraw: (element) => {
      setWhiteboardElements((prev) => [...prev, element]);
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
      // Pop open drawer automatically for students when teacher launches a test/quiz
      if (!isHost) {
        setIsAssessmentOpen(true);
      }
    },
    onForceLogout: (reason) => {
      setIsIdleAutoLoggedOut(true);
      setIdleLogoutReason(
        reason ||
          'Session automatically terminated: 15-minute post-session idle compliance limit exceeded.'
      );
      tuitionService.clearTuitionModeSession();
    },
  });

  // Client-side 15-minute post-session idle rule check
  useEffect(() => {
    if (!session?.scheduledEndTime) return;

    const checkPostSessionIdle = () => {
      if (session?.scheduledEndTime) {
        const scheduledEnd = new Date(session.scheduledEndTime).getTime();
        const now = Date.now();
        const diffMinutes = (now - scheduledEnd) / (1000 * 60);

        if (diffMinutes >= 15 && !isIdleAutoLoggedOut) {
          setIsIdleAutoLoggedOut(true);
          setIdleLogoutReason(
            'In accordance with EduPye Centralized Tuition compliance rules, this session has automatically closed after 15 minutes of post-class inactivity.'
          );
          tuitionService.clearTuitionModeSession();
          leaveClass();
        }
      }
    };

    const interval = setInterval(checkPostSessionIdle, 10000);
    checkPostSessionIdle();

    return () => clearInterval(interval);
  }, [session, isIdleAutoLoggedOut, leaveClass]);

  const handleExit = () => {
    leaveClass();
    if (onExit) {
      onExit();
    } else {
      navigate(-1);
    }
  };

  const handleTeacherEndClass = async (logoutTuition?: boolean) => {
    try {
      const durationMinutes = Math.max(
        1,
        Math.round((Date.now() - new Date(session?.startedAt || session?.createdAt || Date.now()).getTime()) / 60000)
      );
      const attendeeList = [
        { name: `${currentUserName} (Host)`, role: 'Instructor' },
        ...participants.map((p) => ({ name: p.name, role: 'Student' })),
      ];

      setSessionSummaryData({
        durationMinutes,
        totalAttendees: attendeeList.length,
        attendees: attendeeList,
      });

      await endClass();
      if (logoutTuition) {
        tuitionService.clearTuitionModeSession();
      }
      setShowSummaryModal(true);
    } catch (e) {
      console.error('Error during end class:', e);
      setShowSummaryModal(true);
    }
  };

  const localParticipant = {
    peerId: 'local-self',
    name: currentUserName,
    role: (isHost ? 'host' : 'student') as LiveClassRole,
    stream: localStream || undefined,
    isMicMuted: isAudioMuted,
    isVideoMuted: isVideoMuted,
    isLocal: true,
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-sm font-bold tracking-wide">Connecting to Tuition Classroom...</p>
      </div>
    );
  }

  // Student Waiting Room: Waiting for Instructor to launch live session
  if (isWaitingForTeacher && !isTeacherRole) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white gap-6 p-6 select-none animate-fadeIn">
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-amber-500/10 border border-amber-500/20 animate-ping absolute" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 z-10 shadow-xl shadow-amber-500/10">
            <Radio className="w-10 h-10 animate-pulse text-amber-400" />
          </div>
        </div>

        <div className="text-center max-w-md space-y-2.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Live Classroom Waiting Room
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Waiting for Instructor to Start Session
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The instructor has not launched this live classroom yet. Please stay on this screen—your connection will automatically enter the classroom the moment your instructor goes live.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Polling live status (checking every 5s)...</span>
        </div>

        <button
          onClick={() => navigate('/tuition-mode')}
          className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          Exit Waiting Room
        </button>
      </div>
    );
  }

  if (sessionFetchError && !session) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold">Classroom Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm text-center">{sessionFetchError}</p>
        <button
          onClick={() => navigate('/tuition-mode')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Return to Tuition Hub
        </button>
      </div>
    );
  }

  // 15-Minute Post-Session Idle Auto-Logout Screen
  if (isIdleAutoLoggedOut || isForceLoggedOut) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white gap-5 p-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
        <div className="text-center max-w-md space-y-2">
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Compliance Policy Enforced
          </span>
          <h2 className="text-2xl font-black text-white">Session Auto-Logged Out</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {idleLogoutReason ||
              '15-Minute post-session idle limit exceeded. Under EduPye Centralized Tuition compliance rules, participants have been logged out to safeguard classroom privacy.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/tuition-mode')}
          className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          Return to Tuition Portal
        </button>
      </div>
    );
  }

  // Ended state screen / Post-Class Session Completed Summary
  if (isClassEnded || showSummaryModal) {
    const durationMinutes = sessionSummaryData?.durationMinutes || Math.max(
      1,
      Math.round((Date.now() - new Date(session?.startedAt || session?.createdAt || Date.now()).getTime()) / 60000)
    );
    const totalAttendees = sessionSummaryData?.totalAttendees || (participants.length + 1);
    const attendees = sessionSummaryData?.attendees || [
      { name: isTeacherRole ? `${currentUserName} (Host)` : 'Instructor', role: 'Instructor' },
      ...participants.map((p) => ({ name: p.name, role: 'Student' })),
      ...(!isTeacherRole ? [{ name: `${currentUserName} (You)`, role: 'Student' }] : []),
    ];

    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white p-4 sm:p-6 select-none animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Session Completed
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {session?.title || 'Live Classroom Session'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {endReason || 'The live classroom session has successfully concluded. Attendance logs and session analytics have been securely archived.'}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Class Duration</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {durationMinutes} <span className="text-xs font-sans text-slate-400 font-bold">mins</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Attendees Logged</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalAttendees} <span className="text-xs font-sans text-slate-400 font-bold">present</span>
              </div>
            </div>
          </div>

          {/* Attendance Log List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>Attendance Log</span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs">
              {attendees.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/40 last:border-0">
                  <span className="font-medium text-slate-200 truncate">{a.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    a.role === 'Instructor' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {a.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Archive Notice */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Recording & attendance securely stored under 1-year compliance policy.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/tuition-mode')}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer text-center"
            >
              Return to Tuition Hub
            </button>
            {isTeacherRole && (
              <button
                onClick={() => navigate('/teacher/tuition-earnings')}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                View Earnings
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-white font-sans">
      {/* Top Header Bar */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Leave classroom"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h1 className="text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
              {session?.title || 'Live Classroom'}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Tuition Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Class Brief & People Toggle */}
          <button
            onClick={() => setIsClassInfoOpen(!isClassInfoOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isClassInfoOpen
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30'
            }`}
            title="Toggle Class Brief, Topic & People"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isClassInfoOpen ? 'Close Brief' : 'Class Info & People'}
            </span>
          </button>

          {/* SmartBoard Split Toggle */}
          <button
            onClick={() => setIsSmartBoardOpen(!isSmartBoardOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSmartBoardOpen
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
            title="Toggle Split-Screen SmartBoard"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSmartBoardOpen ? 'Close SmartBoard' : 'Split SmartBoard'}
            </span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{participants.length + 1} Present</span>
          </div>

          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
            {isHost ? 'Teacher / Host' : 'Student Mode'}
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

      {/* Main Classroom Body (Split View & Persistent Chat) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: SmartBoard Canvas (when split enabled) */}
        {isSmartBoardOpen && (
          <div className="w-full md:w-3/5 lg:w-2/3 h-full flex flex-col bg-white border-r border-slate-800 overflow-hidden relative shadow-2xl">
            <div className="h-9 bg-slate-900 text-white px-3 flex items-center justify-between border-b border-slate-800 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Presentation className="w-3.5 h-3.5" />
                Dual-Dock Interactive SmartBoard
              </span>
              <button
                onClick={() => setIsSmartBoardOpen(false)}
                className="text-slate-400 hover:text-white p-0.5"
                title="Hide SmartBoard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <WhiteboardCanvas
                className="w-full h-full"
                remoteElements={whiteboardElements}
                onDrawStroke={(el) => broadcastWhiteboardDraw(el)}
                onClearBoard={() => broadcastWhiteboardClear()}
                onUndoBoard={(remaining) => broadcastWhiteboardUndo(remaining)}
                onSyncState={(allEls) => broadcastWhiteboardData(allEls)}
              />
            </div>
          </div>
        )}

        {/* Center / Right: Video Grid Canvas */}
        <main
          className={`flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col justify-center items-center transition-all ${
            isSmartBoardOpen ? 'bg-slate-950/90' : ''
          }`}
        >
          {/* Screen Share View (if active) */}
          {screenStream && (
            <div className="w-full max-w-4xl mb-4 rounded-3xl overflow-hidden bg-black border border-amber-500/40 shadow-2xl aspect-video relative flex items-center justify-center">
              <video
                autoPlay
                playsInline
                ref={(el) => {
                  if (el && screenStream) el.srcObject = screenStream;
                }}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Screen Share Stream</span>
              </div>
            </div>
          )}

          {/* Participant Grid (Split View Responsive) */}
          <div
            className={`w-full grid gap-3 ${
              isSmartBoardOpen
                ? 'grid-cols-1 max-w-sm'
                : participants.length === 0
                ? 'grid-cols-1 max-w-2xl'
                : participants.length === 1
                ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl'
                : participants.length <= 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 max-w-6xl'
                : 'grid-cols-2 sm:grid-cols-3 max-w-6xl'
            }`}
          >
            {/* Local User Card */}
            <VideoParticipantCard
              participant={localParticipant}
              isLocal
              className={`w-full ${isSmartBoardOpen ? 'min-h-[160px]' : 'min-h-[220px]'}`}
            />

            {/* Remote Participants */}
            {participants.map((p) => (
              <VideoParticipantCard
                key={p.peerId}
                participant={p}
                className={`w-full ${isSmartBoardOpen ? 'min-h-[160px]' : 'min-h-[220px]'}`}
              />
            ))}
          </div>

          {/* Waiting banner when solo */}
          {participants.length === 0 && !screenStream && (
            <p className="text-xs text-slate-500 mt-4 text-center">
              You are the only participant in this classroom. Waiting for other batch members to join...
            </p>
          )}
        </main>

        {/* Slide-out Drawers */}
        <ParticipantListDrawer
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          participants={participants}
          localParticipant={localParticipant}
        />

        {/* Class Brief & People Drawer */}
        {isClassInfoOpen && (
          <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-40 animate-slideLeft shadow-2xl">
            {/* Header */}
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

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Program & Session Topic */}
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

              {/* Required Materials Checklist */}
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

              {/* Syllabus Highlights */}
              {programDetails?.syllabusTopics && programDetails.syllabusTopics.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Syllabus Topics
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {programDetails.syllabusTopics.map((topic: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/50 text-[11px] text-slate-300"
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[9px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="truncate">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* People in Room (Live Attendees & Profiles) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Participants in Room ({participants.length + 1})
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Local User */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
                        {currentUserName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white truncate block">
                          {currentUserName} (You)
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {isHost ? 'Instructor / Host' : 'Student'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                      {isHost ? 'Host' : 'Member'}
                    </span>
                  </div>

                  {/* Remote Participants */}
                  {participants.map((p) => (
                    <div
                      key={p.peerId}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                          {p.name[0]?.toUpperCase() || 'P'}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white truncate block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {p.role === 'host' ? 'Instructor' : 'Student'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        p.role === 'host' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.role === 'host' ? 'Host' : 'Student'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Persistent Classroom Chat Drawer (Docked Side-by-Side) */}
        <ClassroomChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={sendChatMessage}
          currentUserId={currentUserId}
          alternateUserId={(currentUser as any)?._id}
        />

        {/* In-Meeting Tests, Quizzes & Tasks Drawer */}
        <InMeetingAssessmentDrawer
          isOpen={isAssessmentOpen}
          onClose={() => setIsAssessmentOpen(false)}
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
        />
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
        isSmartBoardOpen={isSmartBoardOpen}
        isAssessmentOpen={isAssessmentOpen}
        activeAssessmentCount={activeAssessments.filter((a) => a.status === 'active').length}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) {
            setIsParticipantsOpen(false);
            setIsAssessmentOpen(false);
          }
        }}
        onToggleParticipantList={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (!isParticipantsOpen) {
            setIsChatOpen(false);
            setIsAssessmentOpen(false);
          }
        }}
        onToggleSmartBoard={() => setIsSmartBoardOpen(!isSmartBoardOpen)}
        onToggleAssessment={() => {
          setIsAssessmentOpen(!isAssessmentOpen);
          if (!isAssessmentOpen) {
            setIsChatOpen(false);
            setIsParticipantsOpen(false);
          }
        }}
        onLeaveClass={handleExit}
        onEndClass={handleTeacherEndClass}
      />
    </div>
  );
};

export default NativeLiveClassroom;
