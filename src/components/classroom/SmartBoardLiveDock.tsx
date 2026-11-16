import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Radio,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { useWebRTCClassroom } from '../../hooks/useWebRTCClassroom';
import { VideoParticipantCard } from './VideoParticipantCard';

interface SmartBoardLiveDockProps {
  sessionId: string;
  sessionTitle: string;
  onClose: () => void;
  onOpenFullClassroom?: () => void;
}

export const SmartBoardLiveDock: React.FC<SmartBoardLiveDockProps> = ({
  sessionId,
  sessionTitle,
  onClose,
  onOpenFullClassroom,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showStudentsGrid, setShowStudentsGrid] = useState(false);

  const {
    localStream,
    isAudioMuted,
    isVideoMuted,
    participants,
    connectionStatus,
    toggleAudio,
    toggleVideo,
    endClass,
  } = useWebRTCClassroom({
    sessionId,
    role: 'host',
    autoJoin: true,
  });

  const localParticipant = {
    peerId: 'local-host',
    name: 'You (Teacher)',
    role: 'host' as const,
    stream: localStream || undefined,
    isMicMuted: isAudioMuted,
    isVideoMuted,
    isLocal: true,
  };

  const handleEndBroadcast = async () => {
    if (window.confirm('End the live broadcast for all connected students?')) {
      await endClass();
      onClose();
    }
  };

  return (
    <div className="fixed top-16 right-4 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* Minimized Pill */}
      {isMinimized ? (
        <div className="pointer-events-auto bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 flex items-center gap-3 animate-in fade-in duration-150 backdrop-blur-md">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-black uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE</span>
          </div>
          <span className="text-xs font-bold text-slate-200">
            {participants.length} Student{participants.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-xl text-xs ${
              isAudioMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-white'
            }`}
          >
            {isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Expand Live Dock"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Expanded Dock Window */
        <div className="pointer-events-auto w-80 bg-slate-900/95 text-white border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md flex flex-col animate-in slide-in-from-top duration-200">
          {/* Header */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                Broadcasting
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[100px]">
                {sessionTitle}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Minimize Dock"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              {onOpenFullClassroom && (
                <button
                  onClick={onOpenFullClassroom}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Open Full Classroom"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleEndBroadcast}
                className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                title="End Broadcast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Teacher's Local Video Feed */}
          <div className="p-3">
            <VideoParticipantCard participant={localParticipant} isLocal className="w-full" />
          </div>

          {/* Connected Students Drawer / Dropdown */}
          <div className="px-3 pb-2 flex items-center justify-between text-xs text-slate-300">
            <button
              onClick={() => setShowStudentsGrid(!showStudentsGrid)}
              className="flex items-center gap-1.5 hover:text-sky-400 transition-colors font-bold cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>{participants.length} Active Student{participants.length === 1 ? '' : 's'}</span>
              {showStudentsGrid ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>
            <span className="text-[10px] text-emerald-400 font-mono">
              {connectionStatus === 'connected' ? '● Connected' : connectionStatus}
            </span>
          </div>

          {showStudentsGrid && (
            <div className="px-3 pb-3 max-h-48 overflow-y-auto space-y-2 border-t border-slate-800 pt-2">
              {participants.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-2">
                  Waiting for students to join...
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {participants.map((p) => (
                    <VideoParticipantCard key={p.peerId} participant={p} className="w-full text-xs" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Dock Action Bar */}
          <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAudio}
                title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
                className={`p-2 rounded-xl text-xs font-bold transition-all ${
                  isAudioMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleVideo}
                title={isVideoMuted ? 'Start Camera' : 'Stop Camera'}
                className={`p-2 rounded-xl text-xs font-bold transition-all ${
                  isVideoMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleEndBroadcast}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-xs"
            >
              End Broadcast
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

