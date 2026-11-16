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
} from 'lucide-react';
import { useWebRTCClassroom } from '../../hooks/useWebRTCClassroom';
import { liveClassService } from '../../services/liveClassService';
import { LiveClassSession, LiveClassRole } from '../../types/webrtc';
import { VideoParticipantCard } from './VideoParticipantCard';
import { ClassroomControlsBar } from './ClassroomControlsBar';
import { ParticipantListDrawer } from './ParticipantListDrawer';
import { ClassroomChatDrawer } from './ClassroomChatDrawer';

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
  const routeParams = useParams<{ sessionId: string }>();
  const activeSessionId = propSessionId || routeParams.sessionId || '';

  const [session, setSession] = useState<LiveClassSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionFetchError, setSessionFetchError] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  // Retrieve current user info from localStorage
  let currentUserId = '';
  let currentUserName = 'Student';
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      currentUserId = parsed.id || parsed._id || '';
      currentUserName = parsed.name || 'User';
    }
  } catch (e) {
    console.warn('Failed to parse current user from localStorage:', e);
  }

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
          // If 404 or ad-hoc, build a fallback session object so classroom can still connect
          setSession({
            _id: activeSessionId,
            title: 'Live Classroom Session',
            hostId: currentUserId,
            hostRole: 'teacher',
            status: 'live',
            sessionType: 'smartboard_ad_hoc',
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
  });

  const handleExit = () => {
    leaveClass();
    if (onExit) {
      onExit();
    } else {
      navigate(-1);
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
        <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
        <p className="text-sm font-bold tracking-wide">Connecting to Live Classroom...</p>
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
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Ended state screen
  if (isClassEnded) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black">Class Concluded</h2>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          {endReason || 'The teacher has concluded this live classroom session.'}
        </p>
        <button
          onClick={handleExit}
          className="mt-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>{participants.length + 1} Present</span>
          </div>

          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-950/60 text-sky-400 border border-sky-800/40">
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

      {/* Main Classroom Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid Canvas */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto flex flex-col justify-center items-center">
          {/* Screen Share View (if active) */}
          {screenStream && (
            <div className="w-full max-w-5xl mb-4 rounded-3xl overflow-hidden bg-black border border-sky-500/40 shadow-2xl aspect-video relative flex items-center justify-center">
              <video
                autoPlay
                playsInline
                ref={(el) => {
                  if (el && screenStream) el.srcObject = screenStream;
                }}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-sky-500/80 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Screen Share Stream</span>
              </div>
            </div>
          )}

          {/* Participant Grid */}
          <div
            className={`w-full max-w-6xl grid gap-3 sm:gap-4 ${
              participants.length === 0
                ? 'grid-cols-1 max-w-2xl'
                : participants.length === 1
                ? 'grid-cols-1 sm:grid-cols-2'
                : participants.length <= 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3'
            }`}
          >
            {/* Local User Card */}
            <VideoParticipantCard
              participant={localParticipant}
              isLocal
              className="w-full h-full min-h-[220px]"
            />

            {/* Remote Participants */}
            {participants.map((p) => (
              <VideoParticipantCard
                key={p.peerId}
                participant={p}
                className="w-full h-full min-h-[220px]"
              />
            ))}
          </div>

          {/* Waiting banner when solo */}
          {participants.length === 0 && (
            <p className="text-xs text-slate-500 mt-4 text-center">
              You are the only participant in this classroom. Waiting for others to join...
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
        onLeaveClass={handleExit}
        onEndClass={endClass}
      />
    </div>
  );
};

export default NativeLiveClassroom;

