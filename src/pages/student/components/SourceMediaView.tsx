import React, { useState, useEffect } from 'react';
import {
  Mic,
  Video,
  Play,
  Square,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Presentation,
  Volume2,
} from 'lucide-react';
import { SourceItem, AudioScriptTurn, VideoSlide, TimelineEvent } from '../../../types/source';
import { sourceService } from '../../../services/sourceService';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';

interface SourceMediaViewProps {
  source: SourceItem;
  mode: 'audio' | 'video' | 'timeline';
}

export const SourceMediaView: React.FC<SourceMediaViewProps> = ({ source, mode }) => {
  const toast = useToast();
  const [audioScript, setAudioScript] = useState<AudioScriptTurn[]>([]);
  const [videoSlides, setVideoSlides] = useState<VideoSlide[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMedia = async (forceRegenerate = false) => {
    setIsLoading(true);
    try {
      if (mode === 'audio') {
        const res = await sourceService.triggerAIAction(source._id, 'audio', { forceRegenerate });
        if (Array.isArray(res.data)) setAudioScript(res.data);
      } else if (mode === 'video') {
        const res = await sourceService.triggerAIAction(source._id, 'video', { forceRegenerate });
        if (Array.isArray(res.data)) setVideoSlides(res.data);
      } else if (mode === 'timeline') {
        const res = await sourceService.triggerAIAction(source._id, 'timeline', { forceRegenerate });
        if (Array.isArray(res.data)) setTimelineEvents(res.data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to load ${mode} view`;
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Stop any active speech on mode or source change
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
    setCurrentTurnIndex(null);
    fetchMedia(false);

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [source._id, mode]);

  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      toast.info('Audio synthesis not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentTurnIndex(null);
      return;
    }

    if (audioScript.length === 0) return;

    setIsPlayingAudio(true);
    let idx = 0;

    const playNextTurn = () => {
      if (idx >= audioScript.length) {
        setIsPlayingAudio(false);
        setCurrentTurnIndex(null);
        return;
      }

      setCurrentTurnIndex(idx);
      const turn = audioScript[idx];
      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.rate = 1.0;
      utterance.pitch = turn.speaker.includes('Alex') ? 1.15 : 0.95;

      utterance.onend = () => {
        idx += 1;
        playNextTurn();
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setCurrentTurnIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNextTurn();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-3">
        <Loader size="lg" />
        <h4 className="text-sm font-extrabold text-[#111827]">Generating AI {mode.toUpperCase()}...</h4>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Synthesizing content into engaging multi-modal format for "{source.originalName}".
        </p>
      </div>
    );
  }

  // 1. Audio Mode
  if (mode === 'audio') {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                  <span>AI Audio Tutor Podcast</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700">
                    Dialogue Script
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Dr. Taylor (Mentor) & Alex (Student) breakdown</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayAudio}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isPlayingAudio
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[#0091ff] hover:bg-[#0080e6] text-white'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Podcast</span>
                  </>
                )}
              </button>

              <button
                onClick={() => fetchMedia(true)}
                className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors p-1"
                title="Regenerate Script"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {audioScript.map((turn, idx) => {
              const isCurrent = currentTurnIndex === idx;
              const isTaylor = turn.speaker.toLowerCase().includes('taylor') || turn.speaker.toLowerCase().includes('mentor');

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/80 border-[#0091ff] shadow-xs ring-1 ring-[#0091ff]/30'
                      : isTaylor
                      ? 'bg-[#f8fbfe] border-[#e2ebf4]'
                      : 'bg-[#fafcff] border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px] font-extrabold">
                    <span className={isTaylor ? 'text-[#0091ff]' : 'text-purple-600'}>
                      {turn.speaker}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] text-[#0091ff] animate-pulse">
                        <Volume2 className="w-3 h-3" />
                        <span>Speaking now</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{turn.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Speech synthesizes natural audio dialogue</span>
          <span>{audioScript.length} dialogue turns</span>
        </div>
      </div>
    );
  }

  // 2. Video Slides Mode
  if (mode === 'video') {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                  <span>AI Video & Presentation Slide Deck</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-100 text-teal-700">
                    {videoSlides.length} Slides
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Classroom slide outline with presenter speaker notes</p>
              </div>
            </div>

            <button
              onClick={() => fetchMedia(true)}
              className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
            {videoSlides.map((slide) => (
              <div
                key={slide.slideNumber}
                className="p-4 rounded-2xl bg-[#f8fbfe] border border-[#e2ebf4] space-y-3 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#0091ff]">
                    <span>Slide {slide.slideNumber}</span>
                    <Presentation className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <h4 className="text-xs font-extrabold text-[#111827]">{slide.title}</h4>
                  <ul className="space-y-1 pl-3 text-xs text-slate-600 list-disc font-medium">
                    {slide.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-medium">
                  <strong className="text-slate-700">Speaker Notes:</strong> {slide.notes}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          Ready for student presentations or teacher classroom lectures
        </div>
      </div>
    );
  }

  // 3. Timeline Mode
  return (
    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <span>Concept Progression Timeline</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-orange-100 text-orange-700">
                  Chronological
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Sequential milestones and procedural roadmap</p>
            </div>
          </div>

          <button
            onClick={() => fetchMedia(true)}
            className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>

        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 pl-4 border-l-2 border-orange-200">
          {timelineEvents.map((evt, idx) => (
            <div key={idx} className="relative pl-6 space-y-1">
              <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white ring-2 ring-orange-200" />
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-[#111827]">{evt.title}</h4>
                {evt.tag && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-800">
                    {evt.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{evt.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        Milestone progression synthesized from document events
      </div>
    </div>
  );
};
