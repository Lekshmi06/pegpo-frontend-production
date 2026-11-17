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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSmartBoardOpen, setIsSmartBoardOpen] = useState(false);

  // Auto-logout compliance state (15-min idle rule)
  const [isIdleAutoLoggedOut, setIsIdleAutoLoggedOut] = useState(false);
  const [idleLogoutReason, setIdleLogoutReason] = useState<string | null>(null);

  // Retrieve current user info from localStorage or session
  const currentUser = authService.getCurrentUser();
  const { token: tuitionToken } = tuitionService.getTuitionModeSession();
  const authToken = authService.getToken();

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
        const data = await liveClassService.getLiveClass(activeSessionId);
        if (isMounted) {
          setSession(data);
          setSessionFetchError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[NativeLiveClassroom] Failed to fetch session info:', err?.message);
          // Fallback session object for ad-hoc or direct room launches
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
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSession();
    return () => {
      isMounted = false;
    };
  }, [activeSessionId, currentUserId]);

  const isHost =
    forcedRole === 'host' ||
    (session && typeof session.hostId === 'string'
      ? session.hostId === currentUserId
      : (session?.hostId as any)?._id === currentUserId);

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
  } = useWebRTCClassroom({
    sessionId: activeSessionId,
    role: isHost ? 'host' : 'student',
    userName: currentUserName,
    autoJoin: true,
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
      await endClass();
      if (logoutTuition) {
        tuitionService.clearTuitionModeSession();
      }
      navigate(logoutTuition ? '/teacher' : '/tuition-mode');
    } catch (e) {
      console.error('Error during end class:', e);
      navigate('/tuition-mode');
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

  // Ended state screen (standard close)
  if (isClassEnded) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black">Class Concluded</h2>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          {endReason || 'The instructor has concluded this live classroom session.'}
        </p>
        <button
          onClick={handleExit}
          className="mt-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          Back to Sessions
        </button>
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
              <WhiteboardCanvas className="w-full h-full" />
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

        {/* Persistent Classroom Chat Drawer (Docked Side-by-Side) */}
        <ClassroomChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={sendChatMessage}
          currentUserId={currentUserId}
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
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (isParticipantsOpen) setIsParticipantsOpen(false);
        }}
        onToggleParticipantList={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (isChatOpen) setIsChatOpen(false);
        }}
        onToggleSmartBoard={() => setIsSmartBoardOpen(!isSmartBoardOpen)}
        onLeaveClass={handleExit}
        onEndClass={handleTeacherEndClass}
      />
    </div>
  );
};

export default NativeLiveClassroom;
