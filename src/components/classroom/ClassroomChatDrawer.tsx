import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Mic,
  Square,
  Play,
  Pause,
  FileText,
  Download,
  Trash2,
  Volume2,
} from 'lucide-react';
import { ClassroomChatMessage } from '../../types/webrtc';
import { tuitionService } from '../../services/tuitionService';
import { API_BASE_URL } from '../../services/apiClient';

const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const cleanBase = API_BASE_URL.replace(/\/api$/, '');
  return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface ClassroomChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ClassroomChatMessage[];
  onSendMessage: (
    text: string,
    metadata?: {
      messageType?: 'text' | 'voice' | 'attachment';
      voiceUrl?: string;
      voiceDuration?: number;
      attachment?: {
        name: string;
        url: string;
        fileType?: string;
        size?: number;
      };
    }
  ) => void;
  currentUserId?: string;
  alternateUserId?: string;
  isDocked?: boolean;
}

// Mini inline audio player component for voice notes
const VoiceNotePlayer: React.FC<{ url: string; duration?: number; isMe: boolean }> = ({
  url,
  duration = 0,
  isMe,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.warn('Audio playback error:', e));
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
        isMe ? 'bg-sky-700/80 text-white' : 'bg-slate-900/90 text-slate-200 border border-slate-700/60'
      }`}
    >
      <audio
        ref={audioRef}
        src={resolveMediaUrl(url)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
      />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shrink-0 ${
          isMe ? 'bg-white text-sky-700' : 'bg-amber-400 text-slate-950'
        }`}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>

      {/* Waveform Visualization Bars */}
      <div className="flex items-center gap-0.5 h-4 flex-1">
        {[40, 75, 55, 90, 60, 100, 45, 80, 65, 85, 50, 70, 95, 60].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className={`w-1 rounded-full transition-all ${
              isPlaying ? (isMe ? 'bg-white' : 'bg-amber-400') : isMe ? 'bg-sky-300/60' : 'bg-slate-500/60'
            }`}
          />
        ))}
      </div>

      <div className="text-[10px] font-mono shrink-0">
        {formatSeconds(isPlaying ? currentTime : duration)}
      </div>
      <Volume2 className="w-3.5 h-3.5 opacity-60 shrink-0" />
    </div>
  );
};

export const ClassroomChatDrawer: React.FC<ClassroomChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
  alternateUserId,
  isDocked = false,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Attachment Staging State
  const [selectedAttachment, setSelectedAttachment] = useState<{
    name: string;
    url: string;
    fileType?: string;
    size?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedVoice, setRecordedVoice] = useState<{ url: string; duration: number } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);

  // File Picker Trigger
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50MB upload limit.');
      return;
    }

    setIsUploadingAttachment(true);
    try {
      const res = await tuitionService.uploadTuitionMedia(file);
      if (res.success && res.url) {
        setSelectedAttachment({
          name: file.name,
          url: res.url,
          fileType: file.type || res.fileType,
          size: file.size || res.size,
        });
      }
    } catch (err: any) {
      console.error('Failed to upload attachment:', err);
      alert('Failed to upload study material: ' + (err?.message || 'Upload error'));
    } finally {
      setIsUploadingAttachment(false);
      e.target.value = '';
    }
  };

  // Start Audio Recording
  const handleStartRecording = async () => {
    try {
      if (recordedVoice) {
        setRecordedVoice(null);
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsUploadingVoice(true);
        try {
          const res = await tuitionService.uploadTuitionMedia(audioBlob, `voice-${Date.now()}.webm`);
          if (res.success && res.url) {
            setRecordedVoice({
              url: res.url,
              duration: recordingSeconds,
            });
          }
        } catch (err: any) {
          console.error('Failed to upload voice note:', err);
          alert('Failed to upload audio voice message.');
        } finally {
          setIsUploadingVoice(false);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      alert('Microphone permission is required to record voice notes.');
    }
  };

  // Stop Audio Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Discard Recording
  const handleDiscardRecording = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setRecordedVoice(null);
    setRecordingSeconds(0);
  };

  // Send Message
  const handleSend = () => {
    const textToSend = inputText.trim();
    if (!textToSend && !selectedAttachment && !recordedVoice) return;

    if (recordedVoice) {
      onSendMessage(textToSend || '🎙️ Voice Note', {
        messageType: 'voice',
        voiceUrl: recordedVoice.url,
        voiceDuration: recordedVoice.duration,
        attachment: selectedAttachment || undefined,
      });
      setRecordedVoice(null);
      setRecordingSeconds(0);
    } else if (selectedAttachment) {
      onSendMessage(textToSend || `📎 ${selectedAttachment.name}`, {
        messageType: 'attachment',
        attachment: selectedAttachment,
      });
      setSelectedAttachment(null);
    } else {
      onSendMessage(textToSend, { messageType: 'text' });
    }

    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const containerClasses = isDocked
    ? 'w-full h-full flex flex-col bg-slate-900 border-t border-slate-800/90 overflow-hidden'
    : 'w-80 sm:w-88 max-w-full bg-slate-900 border-l border-slate-800 flex flex-col h-full z-40 select-none animate-in slide-in-from-right duration-200 shadow-2xl';

  return (
    <aside className={containerClasses}>
      {/* Header */}
      <div className="h-12 px-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/95">
        <div className="flex items-center gap-2 text-white font-extrabold text-xs">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>Classroom Chat</span>
          <span className="font-mono text-[10px] text-slate-400 font-medium">
            ({messages.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Chat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Stream: Teacher Left, Student Right */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold text-slate-400">Classroom Chat is Live</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
              Send questions, share attachments, or record voice notes during the session.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isTeacher =
              m.senderRole === 'host' || m.senderRole === 'teacher';
            const isMe =
              (currentUserId && m.senderId === currentUserId) ||
              (alternateUserId && m.senderId === alternateUserId) ||
              (m.senderId === 'host' && (currentUserId === 'host' || isTeacher));

            // Alignment rule: Teacher messages aligned left, Student messages aligned right
            const alignLeft = isTeacher;

            return (
              <div
                key={m.id}
                className={`flex flex-col ${alignLeft ? 'items-start' : 'items-end'}`}
              >
                {/* Sender Metadata Bar */}
                <div
                  className={`flex items-center gap-1.5 mb-1 px-1 flex-wrap ${
                    alignLeft ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-300">
                    {isMe ? `${m.senderName} (You)` : m.senderName}
                  </span>
                  {isTeacher ? (
                    <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-700/50">
                      Instructor
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/40">
                      Student
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Bubble Container */}
                <div
                  className={`p-2.5 rounded-2xl text-xs font-medium max-w-[260px] sm:max-w-[280px] break-words shadow-md space-y-1.5 ${
                    alignLeft
                      ? 'bg-slate-800 text-slate-100 rounded-tl-xs border border-amber-500/30'
                      : 'bg-sky-600 text-white rounded-tr-xs'
                  }`}
                >
                  {/* Voice Note Bubble */}
                  {m.voiceUrl && (
                    <VoiceNotePlayer
                      url={m.voiceUrl}
                      duration={m.voiceDuration}
                      isMe={!alignLeft}
                    />
                  )}

                  {/* Attachment Card */}
                  {m.attachment && (
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-2 text-xs ${
                        alignLeft ? 'bg-slate-900 border border-slate-700/80' : 'bg-sky-700/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-[11px]">{m.attachment.name}</p>
                          <span className="text-[9px] opacity-70">
                            {formatFileSize(m.attachment.size)}
                          </span>
                        </div>
                      </div>
                      <a
                        href={resolveMediaUrl(m.attachment.url)}
                        download={m.attachment.name}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                        title="Download Attachment"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Text Message */}
                  {m.text &&
                    m.text !== '🎙️ Voice Note' &&
                    !m.text.startsWith('📎 ') && (
                      <p className="leading-relaxed">{m.text}</p>
                    )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Staged Audio & Attachment Preview Strip */}
      {(selectedAttachment || recordedVoice || isRecording) && (
        <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          {isRecording ? (
            <div className="flex items-center gap-2 text-rose-400 animate-pulse font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Recording voice note... ({formatTimer(recordingSeconds)})</span>
            </div>
          ) : recordedVoice ? (
            <div className="flex items-center gap-2 text-amber-300 font-medium truncate">
              <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Voice Note ready ({formatTimer(recordedVoice.duration)})</span>
            </div>
          ) : selectedAttachment ? (
            <div className="flex items-center gap-2 text-sky-300 font-medium truncate">
              <Paperclip className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{selectedAttachment.name}</span>
              <span className="text-[10px] text-slate-400 shrink-0">
                ({formatFileSize(selectedAttachment.size)})
              </span>
            </div>
          ) : null}

          <div className="flex items-center gap-1 shrink-0">
            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
              >
                Stop
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (isRecording) handleStopRecording();
                setRecordedVoice(null);
                setSelectedAttachment(null);
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Remove Staged Media"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input & Multi-Media Composer Bar */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-900/95 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        <div className="flex items-center gap-1.5 bg-slate-800 rounded-2xl px-2.5 py-1.5 border border-slate-700/80 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/30 transition-all">
          {/* + Attachment Button */}
          <button
            type="button"
            onClick={handleAttachmentClick}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer shrink-0"
            title="Attach File or Image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Input Box */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRecording}
            placeholder={
              isRecording
                ? 'Recording in progress...'
                : 'Type message or record audio...'
            }
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 outline-none font-medium py-1 disabled:opacity-50 min-w-0"
          />

          {/* Voice-Over / Audio Recording Button */}
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`p-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : recordedVoice
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record Voice Note'}
          >
            {isRecording ? (
              <Square className="w-4 h-4 fill-current" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Send (>) Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() && !selectedAttachment && !recordedVoice}
            className="p-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:hover:bg-sky-600 text-white transition-colors cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ClassroomChatDrawer;
