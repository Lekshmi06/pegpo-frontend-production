import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, VideoOff, ShieldCheck, User, VolumeX, RotateCcw, AlertCircle } from 'lucide-react';
import { ICallParticipant } from '../../types/webrtc';

interface VideoParticipantCardProps {
  participant: ICallParticipant;
  isLocal?: boolean;
  className?: string;
  isSpeaking?: boolean;
  onRetryMedia?: () => void;
}

export const VideoParticipantCard: React.FC<VideoParticipantCardProps> = ({
  participant,
  isLocal = false,
  className = '',
  isSpeaking = false,
  onRetryMedia,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [, setTrackUpdateCount] = useState(0);

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

      // Re-trigger play on dynamic track additions/removals and mobile mute/unmute
      const handleTrackChange = () => {
        if (videoRef.current) {
          if (videoRef.current.srcObject !== participant.stream) {
            videoRef.current.srcObject = participant.stream || null;
          }
          videoRef.current.play().catch(() => {});
        }
        setTrackUpdateCount((prev) => prev + 1);
      };

      participant.stream.addEventListener('addtrack', handleTrackChange);
      participant.stream.addEventListener('removetrack', handleTrackChange);

      const tracks = participant.stream.getTracks();
      tracks.forEach((track) => {
        track.addEventListener('unmute', handleTrackChange);
        track.addEventListener('mute', handleTrackChange);
        track.addEventListener('ended', handleTrackChange);
      });

      return () => {
        participant.stream?.removeEventListener('addtrack', handleTrackChange);
        participant.stream?.removeEventListener('removetrack', handleTrackChange);
        tracks.forEach((track) => {
          track.removeEventListener('unmute', handleTrackChange);
          track.removeEventListener('mute', handleTrackChange);
          track.removeEventListener('ended', handleTrackChange);
        });
      };
    } else {
      videoEl.srcObject = null;
    }
  }, [participant.stream, isLocal, className]);

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
      participant.stream.getVideoTracks().some((t) => t.enabled && t.readyState !== 'ended')
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
        ref={(el) => {
          videoRef.current = el;
          if (el && participant.stream && el.srcObject !== participant.stream) {
            el.srcObject = participant.stream;
            el.play().catch(() => {});
          }
        }}
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

        <div className="flex items-center gap-1">
          {participant.connectionState && participant.connectionState !== 'connected' && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1 ${
                participant.connectionState === 'connecting'
                  ? 'bg-amber-500/80 text-white'
                  : participant.connectionState === 'disconnected'
                  ? 'bg-orange-600/90 text-white'
                  : 'bg-rose-600/90 text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              {participant.connectionState === 'connecting'
                ? 'Connecting...'
                : participant.connectionState === 'disconnected'
                ? 'Reconnecting...'
                : participant.connectionState}
            </span>
          )}

          {participant.connectionState === 'failed' && onRetryMedia && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetryMedia();
              }}
              className="pointer-events-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 hover:bg-rose-500 shadow-md cursor-pointer transition-colors"
              title="Click to restart WebRTC media connection"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Retry Media</span>
            </button>
          )}

          {participant.connectionState === 'connected' && !hasLiveVideoTrack && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600/80 text-white backdrop-blur-xs flex items-center gap-1">
              <Mic className="w-2.5 h-2.5" />
              Audio Only
            </span>
          )}

          {participant.connectionState === 'connected' && hasLiveVideoTrack && !isLocal && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/80 text-white backdrop-blur-xs">
              HD Live
            </span>
          )}
        </div>
      </div>

      {/* Failed Media Connection Full Overlay & Retry Button */}
      {participant.connectionState === 'failed' && !isLocal && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center select-none">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 border border-rose-500/30">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-white text-xs font-bold mb-1">Media Connection Failed</span>
          <p className="text-[11px] text-slate-300 mb-3 max-w-[210px] leading-relaxed">
            Direct audio/video channel timed out. Click below to re-negotiate media.
          </p>
          {onRetryMedia && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetryMedia();
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 pointer-events-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Media</span>
            </button>
          )}
        </div>
      )}

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

