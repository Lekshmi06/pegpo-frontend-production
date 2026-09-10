import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Pause, Play } from 'lucide-react';

interface TimerBadgeProps {
  mode?: 'countdown' | 'stopwatch';
  durationMinutes?: number;
  initialSeconds?: number;
  isPaused?: boolean;
  onTimeUpdate?: (secondsElapsed: number, secondsRemaining: number) => void;
  onTimeout?: () => void;
  onTogglePause?: () => void;
  showControls?: boolean;
  className?: string;
}

export const TimerBadge: React.FC<TimerBadgeProps> = ({
  mode = 'countdown',
  durationMinutes = 60,
  initialSeconds = 0,
  isPaused = false,
  onTimeUpdate,
  onTimeout,
  onTogglePause,
  showControls = false,
  className = '',
}) => {
  const totalDurationSeconds = durationMinutes * 60;
  const [secondsElapsed, setSecondsElapsed] = useState<number>(initialSeconds);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        const remaining = Math.max(0, totalDurationSeconds - next);

        if (onTimeUpdate) {
          onTimeUpdate(next, remaining);
        }

        if (mode === 'countdown' && remaining <= 0) {
          clearInterval(interval);
          if (onTimeout) {
            onTimeout();
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, mode, totalDurationSeconds, onTimeUpdate, onTimeout]);

  const secondsRemaining = Math.max(0, totalDurationSeconds - secondsElapsed);
  const displaySeconds = mode === 'countdown' ? secondsRemaining : secondsElapsed;

  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = displaySeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const isLowTime = mode === 'countdown' && secondsRemaining <= 300 && secondsRemaining > 60;
  const isCriticalTime = mode === 'countdown' && secondsRemaining <= 60 && secondsRemaining > 0;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all select-none ${
        isCriticalTime
          ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse font-bold'
          : isLowTime
          ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
          : 'bg-[#f1f5f9] border-slate-200 text-slate-700 font-bold'
      } ${className}`}
    >
      {isCriticalTime ? (
        <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce shrink-0" />
      ) : (
        <Clock className={`w-3.5 h-3.5 shrink-0 ${isLowTime ? 'text-amber-600' : 'text-slate-500'}`} />
      )}

      <span className="font-mono text-xs tracking-wider">{formattedTime}</span>

      {mode === 'countdown' && isCriticalTime && (
        <span className="text-[10px] uppercase font-extrabold tracking-tight text-rose-600">
          Hurry!
        </span>
      )}

      {showControls && onTogglePause && (
        <button
          type="button"
          onClick={onTogglePause}
          className="ml-1 p-1 rounded-md hover:bg-slate-200/60 text-slate-600 transition-colors cursor-pointer"
          title={isPaused ? 'Resume Test' : 'Pause Test'}
        >
          {isPaused ? <Play className="w-3 h-3 fill-slate-700" /> : <Pause className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};
