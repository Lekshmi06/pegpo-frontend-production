import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, VideoOff, ShieldCheck, User, VolumeX } from 'lucide-react';
import { ICallParticipant } from '../../types/webrtc';

interface VideoParticipantCardProps {
  participant: ICallParticipant;
  isLocal?: boolean;
  className?: string;
  isSpeaking?: boolean;
}

export const VideoParticipantCard: React.FC<VideoParticipantCardProps> = ({
  participant,
  isLocal = false,
  className = '',
  isSpeaking = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (participant.stream) {
      if (videoEl.srcObject !== participant.stream) {
        videoEl.srcObject = participant.stream;
      }
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn('[VideoParticipantCard] Autoplay suspended by browser:', err?.name);
            if (!isLocal) {
              setAutoplayBlocked(true);
            }
          });
      }
    } else {
      videoEl.srcObject = null;
    }
  }, [participant.stream, isLocal]);

  const handleEnableAudio = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setAutoplayBlocked(false);
        })
        .catch(console.error);
    }
  };

  const hasLiveVideoTrack = Boolean(
    participant.stream &&
      participant.stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live')
  );
  const isVideoOff = participant.isVideoMuted || !participant.stream || !hasLiveVideoTrack;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-200 aspect-video flex items-center justify-center shadow-md select-none ${
        isSpeaking ? 'border-sky-400 ring-2 ring-sky-400/40' : 'border-slate-800'
      } ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isVideoOff ? 'opacity-0 absolute pointer-events-none' : 'opacity-100'
        } ${isLocal ? 'scale-x-[-1]' : ''}`}
      />

      {/* Browser Autoplay Blocked Banner */}
      {autoplayBlocked && !isLocal && (
        <button
          onClick={handleEnableAudio}
          className="absolute top-10 inset-x-4 z-30 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform hover:scale-105 cursor-pointer animate-pulse"
          title="Browser autoplay policy requires user interaction to enable remote audio"
        >
          <VolumeX className="w-3.5 h-3.5" />
          <span>Click to Enable Audio</span>
        </button>
      )}

      {/* Avatar Placeholder when video is off */}
      {isVideoOff && (
        <div className="flex flex-col items-center justify-center p-4 text-center z-10 animate-in fade-in duration-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white/20 text-white font-extrabold text-xl sm:text-2xl uppercase tracking-wider mb-2">
            {participant.name ? participant.name.charAt(0) : <User className="w-8 h-8" />}
          </div>
          <span className="text-white text-xs sm:text-sm font-semibold tracking-wide truncate max-w-[140px] drop-shadow-xs">
            {participant.name} {isLocal && '(You)'}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
            <VideoOff className="w-3.5 h-3.5 text-slate-400" />
            <span>Camera Off</span>
          </div>
        </div>
      )}

      {/* Top badges: Role & Connection */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-1.5">
          {participant.role === 'host' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/90 text-white shadow-xs backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3" />
              Host
            </span>
          )}
          {isLocal && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
              You
            </span>
          )}
        </div>

        {participant.connectionState && participant.connectionState !== 'connected' && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/80 text-white backdrop-blur-xs">
            {participant.connectionState}
          </span>
        )}
      </div>

      {/* Bottom overlay bar: Name & Mic status */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-center justify-between text-white z-20">
        <span className="text-xs font-bold truncate max-w-[150px] drop-shadow-xs">
          {participant.name}
        </span>

        <div className="flex items-center gap-1.5">
          {participant.isMicMuted ? (
            <div className="w-6 h-6 rounded-full bg-rose-500/90 flex items-center justify-center text-white shadow-xs" title="Muted">
              <MicOff className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-700/80 flex items-center justify-center text-emerald-400 shadow-xs" title="Unmuted">
              <Mic className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

