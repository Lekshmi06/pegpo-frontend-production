import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  MessageSquare,
  Users,
  PhoneOff,
  AlertTriangle,
  X,
  Presentation,
} from 'lucide-react';

interface ClassroomControlsBarProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  participantCount: number;
  unreadChatCount?: number;
  isChatOpen: boolean;
  isParticipantListOpen: boolean;
  isSmartBoardOpen?: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleParticipantList: () => void;
  onToggleSmartBoard?: () => void;
  onLeaveClass: () => void;
  onEndClass: (logoutTuition?: boolean) => void;
}

export const ClassroomControlsBar: React.FC<ClassroomControlsBarProps> = ({
  isAudioMuted,
  isVideoMuted,
  isScreenSharing,
  isHost,
  participantCount,
  unreadChatCount = 0,
  isChatOpen,
  isParticipantListOpen,
  isSmartBoardOpen = false,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipantList,
  onToggleSmartBoard,
  onLeaveClass,
  onEndClass,
}) => {
  const [showEndModal, setShowEndModal] = useState(false);
  const [logoutTuition, setLogoutTuition] = useState(true);

  return (
    <>
      <div className="h-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 sm:px-8 flex items-center justify-between z-30 select-none">
        {/* Left segment: Session info / Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 hidden sm:inline">
              Live Classroom
            </span>
          </div>
        </div>

        {/* Center segment: Core A/V & Screen Share controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Microphone */}
          <button
            onClick={onToggleAudio}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            className={`min-h-[44px] min-w-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
              isAudioMuted
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40'
                : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            onClick={onToggleVideo}
            title={isVideoMuted ? 'Turn on Camera' : 'Turn off Camera'}
            className={`min-h-[44px] min-w-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
              isVideoMuted
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40'
                : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={onToggleScreenShare}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            className={`min-h-[44px] min-w-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
              isScreenSharing
                ? 'bg-sky-500 text-white ring-2 ring-sky-400/50 shadow-md'
                : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Chat Toggle */}
          <button
            onClick={onToggleChat}
            title="Classroom Chat"
            className={`relative min-h-[44px] min-w-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
              isChatOpen
                ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40'
                : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900">
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
            )}
          </button>

          {/* Participants Toggle */}
          <button
            onClick={onToggleParticipantList}
            title="Participants List"
            className={`relative min-h-[44px] min-w-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
              isParticipantListOpen
                ? 'bg-sky-500/20 text-sky-400 border border-sky-400/40'
                : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="ml-1 text-xs font-bold text-slate-300 hidden md:inline">
              {participantCount}
            </span>
          </button>

          {/* SmartBoard Split-Screen Toggle */}
          {onToggleSmartBoard && (
            <button
              onClick={onToggleSmartBoard}
              title={isSmartBoardOpen ? "Close SmartBoard Split" : "Open SmartBoard Split"}
              className={`min-h-[44px] min-w-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 ${
                isSmartBoardOpen
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Presentation className="w-5 h-5 text-amber-400" />
            </button>
          )}
        </div>

        {/* Right segment: Leave / End buttons */}
        <div className="flex items-center gap-2">
          {/* Leave Button */}
          <button
            onClick={onLeaveClass}
            title="Leave Classroom"
            className="min-h-[44px] min-w-[44px] px-3 sm:px-4 h-11 sm:h-12 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>

          {/* End Class for All (Host only) */}
          {isHost && (
            <button
              onClick={() => setShowEndModal(true)}
              title="End Class for All Participants"
              className="min-h-[44px] min-w-[44px] px-3 sm:px-4 h-11 sm:h-12 rounded-2xl bg-red-800 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 border border-red-600/40"
            >
              <AlertTriangle className="w-4 h-4 text-red-300" />
              <span className="hidden md:inline">End Class</span>
            </button>
          )}
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowEndModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">End Class for Everyone?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This will immediately disconnect all students and finalize attendance for this live session.
              </p>
            </div>

            <div className="flex items-center gap-2 py-1 px-1 bg-slate-950 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="clearTuition"
                checked={logoutTuition}
                onChange={(e) => setLogoutTuition(e.target.checked)}
                className="w-4 h-4 ml-2 accent-amber-500 rounded"
              />
              <label htmlFor="clearTuition" className="text-xs text-slate-300 font-medium cursor-pointer">
                Exit and log out of Tuition Mode
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  onEndClass(logoutTuition);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                End Class
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

