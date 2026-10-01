import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  Lightbulb,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronDown,
  Layers,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import {
  teacherAiService,
  TeacherChatMessage,
  TeacherPageContextInfo,
} from '../../services/teacherAiService';
import { useToast } from '../../hooks/useToast';
import {
  speakText,
  stopSpeaking,
  startVoiceListening,
  stopVoiceListening,
  isSpeechSynthesisSupported,
  isSpeechRecognitionSupported,
} from '../../services/speechService';

// Resolve context based on teacher route
function getTeacherPageContext(pathname: string): TeacherPageContextInfo {
  if (pathname.includes('/teacher/assessment') || pathname.includes('/teacher/test')) {
    return {
      pageTitle: 'Assessment Studio',
      pathname,
      topic: 'Test & Question Paper Design',
    };
  }
  if (pathname.includes('/teacher/lesson-planner')) {
    return {
      pageTitle: 'AI Lesson Planner',
      pathname,
      topic: 'Lesson Flow & Pedagogy',
    };
  }
  if (pathname.includes('/teacher/smartboard')) {
    return {
      pageTitle: 'Smart Board Classroom',
      pathname,
      topic: 'Interactive Board & Engagement',
    };
  }
  if (pathname.includes('/teacher/profile')) {
    return {
      pageTitle: 'Teacher Profile',
      pathname,
      topic: 'Teacher Preferences & Contexts',
    };
  }
  return {
    pageTitle: 'Teacher Dashboard',
    pathname,
    topic: 'Classroom Hub & Management',
  };
}

// Preset Quick Categories
const QUICK_PRESETS = [
  {
    icon: Lightbulb,
    label: 'Analogy',
    prompt: 'Give me a student-friendly analogy to explain this concept:',
  },
  {
    icon: AlertTriangle,
    label: 'Misconceptions',
    prompt: 'What are the top 2 common misconceptions students have regarding:',
  },
  {
    icon: HelpCircle,
    label: 'Formative Check',
    prompt: 'Suggest 3 quick check-for-understanding questions with solutions for:',
  },
  {
    icon: BookOpen,
    label: '5-Min Activity',
    prompt: 'Suggest an engaging 5-minute hands-on classroom activity for:',
  },
];

export default function TeacherAIChatBot() {
  const location = useLocation();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pageContext = getTeacherPageContext(location.pathname);

  // Initial welcome message
  const [messages, setMessages] = useState<TeacherChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `### 👋 Welcome to Teacher AI Copilot!

I am your dedicated **Pedagogical Assistant and Subject Mentor**. I'm here to support your daily teaching workflow:

- 🔬 **Clear Concept Doubts**: Get rigorous academic explanations for complex topics across Sciences, Math, Languages, and Social Studies.
- 💡 **Classroom Analogies**: Request relatable real-world metaphors to make abstract formulas or principles click for students.
- ⚠️ **Student Misconceptions**: Identify common errors and traps students make before entering the classroom.
- 📝 **Formative Assessment**: Generate quick check-in questions, rubric guidelines, and active learning exercises.

*Ask any doubt or pick a quick starter below!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Give me an intuitive analogy for Electric Potential vs Current',
        'What are common student mistakes in Quadratic Equations?',
        'Suggest a 5-minute warm-up activity for Photosynthesis',
      ],
    },
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus textarea on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessage: TeacherChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await teacherAiService.sendMessage({
        message: query,
        pageContext,
        history,
      });

      const assistantMessage: TeacherChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions,
        isQuotaExhausted: res.isQuotaExhausted,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (autoSpeak && isSpeechSynthesisSupported()) {
        const cleanToSpeak = res.reply
          .replace(/[#*`_$>]+/g, '')
          .replace(/```[\s\S]*?```/g, '')
          .slice(0, 400);
        speakText(cleanToSpeak, {
          onEnd: () => setSpeakingMsgId(null),
          onError: () => setSpeakingMsgId(null),
        });
        setSpeakingMsgId(assistantMessage.id);
      }
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'AI Copilot failed to respond');
      const errorMessage: TeacherChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ I encountered a temporary connection issue. Please verify your network connection and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Copy text
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Answer copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset conversation
  const handleReset = () => {
    if (window.confirm('Start a fresh conversation? This will clear current chat history.')) {
      stopSpeaking();
      setSpeakingMsgId(null);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: `### 🔄 Fresh Session Started!\n\nHow can I assist your teaching today? Ask me any subject doubt, request an analogy, or get formative check questions.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            'How to teach Newton’s 3rd law without students confusing action-reaction?',
            'Explain the difference between DNA and RNA simply',
            'Suggest rubric guidelines for a 5-mark science question',
          ],
        },
      ]);
    }
  };

  // Voice recognition toggle
  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error('Voice dictation is not supported in this browser.');
      return;
    }

    if (isListening) {
      stopVoiceListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      startVoiceListening({
        onResult: (transcript: string) => {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false),
      });
    }
  };

  // Render Markdown-styled text
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Header 3 / 4
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-[13px] font-bold text-[#1c3352] mt-2 mb-1 flex items-center gap-1.5">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h5 key={idx} className="text-xs font-bold text-slate-800 mt-1.5 mb-0.5">
                {trimmed.replace('#### ', '')}
              </h5>
            );
          }

          // Horizontal rule
          if (trimmed === '---') {
            return <hr key={idx} className="border-slate-200 my-2" />;
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <div
                key={idx}
                className="border-l-2 border-amber-400 bg-amber-50/70 p-2 rounded-r text-[11px] text-amber-900 my-1 font-medium"
              >
                {trimmed.replace('> ', '')}
              </div>
            );
          }

          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const rawText = trimmed.replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-2">
                <span className="text-[#0091ff] font-bold shrink-0 mt-0.5">&bull;</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(rawText) }} />
              </div>
            );
          }

          // Numbered list
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-2">
                <span className="text-[#254b73] font-bold text-[11px] shrink-0 min-w-[16px]">
                  {numMatch[1]}.
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
              </div>
            );
          }

          if (trimmed === '') {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
          );
        })}
      </div>
    );
  };

  // Helper for inline bold, italic, and code
  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 text-[#254b73] font-mono text-[11px] font-semibold">$1</code>')
      .replace(/\$([^\$]+)\$/g, '<code class="px-1.5 py-0.2 rounded bg-blue-50 text-[#0091ff] font-mono text-[11px] font-semibold">$1</code>');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* 1. FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#254b73] via-[#1c395c] to-[#0091ff] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          title="Open Pegpo Teacher AI Copilot"
        >
          {/* Animated Glow Pill */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
          </span>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="text-xs font-black tracking-wide">Teacher AI</span>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-cyan-100 border border-white/30">
            Clear Doubts
          </span>
        </button>
      )}

      {/* 2. FLOATING CHAT WINDOW */}
      {isOpen && (
        <div className="w-[380px] sm:w-[440px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#cbd5e1]/70 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1c3352] to-[#254b73] text-white px-4 py-3 flex items-center justify-between shadow-xs flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <GraduationCap className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black tracking-wide text-white">Teacher AI Copilot</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-cyan-100/80 font-medium">Pedagogical Doubt Clearing</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Audio Toggle */}
              {isSpeechSynthesisSupported() && (
                <button
                  onClick={() => {
                    const next = !autoSpeak;
                    setAutoSpeak(next);
                    if (!next && speakingMsgId) {
                      stopSpeaking();
                      setSpeakingMsgId(null);
                    }
                    toast.info(next ? 'Audio Read Aloud ON' : 'Audio Read Aloud OFF');
                  }}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    autoSpeak
                      ? 'bg-cyan-400 text-[#1c3352] font-bold shadow-xs'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title={autoSpeak ? 'Audio Read Aloud ON' : 'Audio Read Aloud OFF'}
                >
                  {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Reset Session */}
              <button
                onClick={handleReset}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize / Close */}
              <button
                onClick={() => {
                  stopSpeaking();
                  stopVoiceListening();
                  setSpeakingMsgId(null);
                  setIsListening(false);
                  setIsOpen(false);
                }}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-500 font-medium shrink-0">
            <span className="flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff]"></span>
              Active Workspace: <strong className="text-slate-700">{pageContext.pageTitle}</strong>
            </span>
            <span className="text-slate-400 shrink-0">Doubts & Pedagogy</span>
          </div>

          {/* Preset Quick Doubt Chips */}
          <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PRESETS.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMessage(preset.prompt + ' ');
                    textareaRef.current?.focus();
                  }}
                  className="flex items-center gap-1 text-[10px] font-semibold py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0091ff] transition-colors shrink-0 cursor-pointer border border-slate-200/60"
                >
                  <Icon className="w-3 h-3 text-[#0091ff]" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fbfe]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-xs transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#254b73] to-[#1c395c] text-white rounded-br-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div>
                      {renderFormattedText(msg.text)}

                      {/* Message Actions */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          {msg.timestamp}
                          {msg.isQuotaExhausted && (
                            <span className="text-amber-600 font-medium font-sans ml-1">
                              &bull; Curriculum Knowledge Base
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 text-slate-500 hover:text-[#0091ff] font-medium transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  )}
                </div>

                {/* Follow-up Suggestions Chips */}
                {msg.sender === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1 w-full pl-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Suggested Follow-Ups:
                    </p>
                    <div className="flex flex-col gap-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          disabled={isLoading}
                          className="text-left text-[11px] p-2 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-[#0091ff]/40 text-slate-700 hover:text-[#0091ff] transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                        >
                          <span className="truncate pr-2">{sug}</span>
                          <span className="text-slate-300 group-hover:text-[#0091ff] font-bold shrink-0">
                            &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-[#0091ff] animate-spin" />
                    <span>Analyzing pedagogical concept...</span>
                    <span className="inline-flex gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff] animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff] animate-bounce [animation-delay:0.3s]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-[#0091ff] focus-within:ring-1 focus-within:ring-[#0091ff]/20 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask a concept doubt, request an analogy, or lesson tips..."
                className="flex-1 bg-transparent px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none resize-none max-h-24 leading-snug"
              />

              <div className="flex items-center gap-1 pr-2">
                {/* Voice Dictation */}
                {isSpeechRecognitionSupported() && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                    }`}
                    title={isListening ? 'Stop listening' : 'Voice dictation'}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 rounded-xl bg-[#254b73] hover:bg-[#1b3654] disabled:opacity-40 text-white transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              Pegpo Teacher AI &bull; Clear academic doubts with curriculum grounding
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
