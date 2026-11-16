import React from 'react';
import { Users, X, Mic, MicOff, VideoOff, ShieldCheck } from 'lucide-react';
import { ICallParticipant } from '../../types/webrtc';

interface ParticipantListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  participants: ICallParticipant[];
  localParticipant?: ICallParticipant;
}

export const ParticipantListDrawer: React.FC<ParticipantListDrawerProps> = ({
  isOpen,
  onClose,
  participants,
  localParticipant,
}) => {
  if (!isOpen) return null;

  const allParticipants = localParticipant
    ? [localParticipant, ...participants]
    : participants;

  return (
    <aside className="w-80 max-w-full bg-slate-900 border-l border-slate-800 flex flex-col h-full z-40 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
        <div className="flex items-center gap-2 text-white font-extrabold text-sm">
          <Users className="w-4 h-4 text-sky-400" />
          <span>Participants ({allParticipants.length})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {allParticipants.map((p, idx) => (
          <div
            key={p.peerId || idx}
            className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-3 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-700/50 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/10 uppercase">
                {p.name ? p.name.charAt(0) : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {p.name} {p.isLocal && '(You)'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {p.role === 'host' ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-sky-400">
                      <ShieldCheck className="w-3 h-3" />
                      Host
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Student</span>
                  )}
                </div>
              </div>
            </div>

            {/* Media status indicators */}
            <div className="flex items-center gap-1.5 shrink-0">
              {p.isVideoMuted && (
                <div className="p-1 rounded-md bg-slate-700 text-slate-400" title="Camera off">
                  <VideoOff className="w-3.5 h-3.5" />
                </div>
              )}
              {p.isMicMuted ? (
                <div className="p-1 rounded-md bg-rose-500/20 text-rose-400" title="Muted">
                  <MicOff className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400" title="Speaking/Unmuted">
                  <Mic className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

