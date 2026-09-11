import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Check,
  Copy,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ExternalLink,
  BookOpen,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { sendAIChatMessage, PYQQuestionData } from '../../services/aiService';
import { useStudentProfile } from '../../hooks/useStudentProfile';

export interface PageContextInfo {
  title: string;
  description: string;
  suggestions: string[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  pyq?: PYQQuestionData;
}

interface EduPyeAIChatProps {
  customContext?: Partial<PageContextInfo>;
  className?: string;
}

// Clean academic context helper (routes and paths are never displayed to students)
function getPageContext(pathname: string, custom?: Partial<PageContextInfo>): PageContextInfo {
  if (custom && custom.title) {
    return {
      title: custom.title,
      description: custom.description || 'Academic study session.',
      suggestions: custom.suggestions || ['Give me 2023 Science PYQ', 'Explain core formulas', 'How can I score higher?'],
    };
  }

  if (pathname.includes('/student/tests') || pathname.includes('/student/test')) {
    return {
      title: 'Tests & Assessments',
      description: 'Exam practice, Previous Year Questions, and timed evaluations.',
      suggestions: [
        'Give me 2023 CBSE Science PYQ',
        'Give me 2022 Math PYQ',
        'How can I improve my test score?',
      ],
    };
  }

  if (pathname.includes('/student/learn')) {
    return {
      title: 'Learn & Curriculum',
      description: 'Subject syllabus modules, chapter breakdown, and concept study.',
      suggestions: [
        'Give me 2023 Science PYQ',
        'Explain double displacement reaction',
        'Summarize core formulas',
      ],
    };
  }

  if (pathname.includes('/student/home')) {
    return {
      title: 'Explore Hub',
      description: 'Courses, subject categories, and educational materials.',
      suggestions: [
        'Give me 2023 CBSE Science PYQ',
        'Recommend top subjects for board prep',
        'What topics should I revise today?',
      ],
    };
  }

  if (pathname.includes('/student/practice') || pathname.includes('/student/quiz')) {
    return {
      title: 'Practice Drills',
      description: 'Targeted drills and rapid assessment quizzes.',
      suggestions: [
        'Give me 2023 CBSE Science PYQ',
        'Give me 2022 Math PYQ',
        'Give me 2024 Respiration question',
      ],
    };
  }

  // Default clean title
  return {
    title: 'Academic Companion',
    description: 'Smart curriculum study and previous year board exam questions.',
    suggestions: [
      'Give me 2023 CBSE Science PYQ',
      'Give me 2022 Math PYQ',
      'Explain key formulas for exam',
    ],
  };
}

// Clean LaTeX / math symbols into readable Unicode
function cleanMathString(expr: string): string {
  return expr
    .replace(/\\cdot/g, ' · ')
    .replace(/\\times/g, ' × ')
    .replace(/\\implies/g, ' ⇒ ')
    .replace(/\\propto/g, ' ∝ ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\neq/g, '≠')
    .replace(/\\pm/g, '±')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\xrightarrow\[(.*?)\]\{(.*?)\}/g, '──($1, $2)──>')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\quad/g, '  ')
    .replace(/\\\\/g, ' ')
    .replace(/[\$\\]/g, '')
    .trim();
}

interface FormattedMessageTextProps {
  text: string;
  isUser: boolean;
  onLaunchTest?: (testId: string) => void;
  navigate: (path: string) => void;
}

function renderInlineMarkdown(
  text: string,
  isUser: boolean,
  onLaunchTest?: (testId: string) => void,
  navigate?: (path: string) => void
): React.ReactNode[] {
  const regex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\$\$?([^$]+)\$\$?)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.substring(lastIdx, match.index));
    }

    const [, isLink, linkText, linkUrl, isBold, boldText, isItalic, italicText, isCode, codeText, isMath, mathText] = match;

    if (isLink) {
      const testIdMatch = linkUrl.match(/testId=([a-zA-Z0-9_-]+)/);
      nodes.push(
        <button
          key={`link-${match.index}`}
          onClick={(e) => {
            e.preventDefault();
            if (testIdMatch && onLaunchTest) {
              onLaunchTest(testIdMatch[1]);
            } else if (navigate && linkUrl.startsWith('/')) {
              navigate(linkUrl);
            } else {
              window.open(linkUrl, '_blank');
            }
          }}
          className="inline-flex items-center gap-1 font-bold text-[#0080ff] hover:text-[#0055b3] underline cursor-pointer"
        >
          {linkText}
        </button>
      );
    } else if (isBold) {
      nodes.push(
        <strong
          key={`bold-${match.index}`}
          className={isUser ? 'font-bold text-white' : 'font-extrabold text-[#0f243e]'}
        >
          {boldText}
        </strong>
      );
    } else if (isItalic) {
      nodes.push(
        <em key={`italic-${match.index}`} className="italic">
          {italicText}
        </em>
      );
    } else if (isCode) {
      nodes.push(
        <code
          key={`code-${match.index}`}
          className={`px-1 py-0.5 rounded font-mono text-[11px] ${
            isUser ? 'bg-white/20 text-cyan-200' : 'bg-slate-100 text-slate-800'
          }`}
        >
          {codeText}
        </code>
      );
    } else if (isMath) {
      nodes.push(
        <span
          key={`math-${match.index}`}
          className={`px-1 py-0.2 rounded font-mono font-bold text-[11px] ${
            isUser ? 'bg-white/20 text-cyan-200' : 'bg-blue-50 text-[#0066cc]'
          }`}
        >
          {cleanMathString(mathText)}
        </span>
      );
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(text.substring(lastIdx));
  }

  return nodes.length > 0 ? nodes : [text];
}

function FormattedMessageText({ text, isUser, onLaunchTest, navigate }: FormattedMessageTextProps) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1 text-xs">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Horizontal divider
        if (/^([-*_]){3,}$/.test(trimmed)) {
          return <hr key={idx} className="my-2 border-slate-200" />;
        }

        // 2. Heading 3 (###)
        if (line.startsWith('### ')) {
          const heading = line.slice(4).trim();
          return (
            <h4
              key={idx}
              className={`font-bold text-xs sm:text-[13px] mt-2 mb-0.5 flex items-center gap-1 ${
                isUser ? 'text-cyan-200' : 'text-[#1c3352]'
              }`}
            >
              {renderInlineMarkdown(heading, isUser, onLaunchTest, navigate)}
            </h4>
          );
        }

        // 3. Heading 2 (##)
        if (line.startsWith('## ')) {
          const heading = line.slice(3).trim();
          return (
            <h3
              key={idx}
              className={`font-extrabold text-sm mt-2.5 mb-1 ${
                isUser ? 'text-cyan-100' : 'text-[#1c3352]'
              }`}
            >
              {renderInlineMarkdown(heading, isUser, onLaunchTest, navigate)}
            </h3>
          );
        }

        // 4. Heading 1 (#)
        if (line.startsWith('# ')) {
          const heading = line.slice(2).trim();
          return (
            <h2
              key={idx}
              className={`font-black text-sm mt-2.5 mb-1 ${
                isUser ? 'text-white' : 'text-[#1c3352]'
              }`}
            >
              {renderInlineMarkdown(heading, isUser, onLaunchTest, navigate)}
            </h2>
          );
        }

        // 5. Blockquote (> ...)
        if (line.startsWith('> ')) {
          const quote = line.slice(2).trim();
          return (
            <div
              key={idx}
              className={`my-1.5 p-2 rounded-r-xl border-l-3 text-[11px] leading-relaxed ${
                isUser
                  ? 'border-cyan-300 bg-white/10 text-white'
                  : 'border-[#0091ff] bg-blue-50/70 text-slate-800'
              }`}
            >
              {renderInlineMarkdown(quote, isUser, onLaunchTest, navigate)}
            </div>
          );
        }

        // 6. Display math block ($$ ... $$)
        if (trimmed.startsWith('$$') || trimmed.endsWith('$$')) {
          const cleanedFormula = cleanMathString(trimmed);
          return (
            <div
              key={idx}
              className={`my-1.5 p-1.5 rounded-xl text-center font-mono font-bold text-[11px] ${
                isUser
                  ? 'bg-white/10 text-cyan-200'
                  : 'bg-slate-50 border border-slate-200 text-[#0066cc]'
              }`}
            >
              {cleanedFormula}
            </div>
          );
        }

        // 7. Bullet list item (- ... or * ...)
        const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 my-0.5 ml-1 text-xs">
              <span className={`font-bold select-none ${isUser ? 'text-cyan-300' : 'text-[#0091ff]'}`}>
                •
              </span>
              <span className="flex-1">
                {renderInlineMarkdown(bulletMatch[1], isUser, onLaunchTest, navigate)}
              </span>
            </div>
          );
        }

        // 8. Numbered list item (1. ... or 2. ...)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 my-0.5 ml-1 text-xs">
              <span className={`font-bold select-none ${isUser ? 'text-cyan-300' : 'text-[#0070cc]'}`}>
                {numMatch[1]}.
              </span>
              <span className="flex-1">
                {renderInlineMarkdown(numMatch[2], isUser, onLaunchTest, navigate)}
              </span>
            </div>
          );
        }

        // 9. Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // 10. Standard line
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineMarkdown(line, isUser, onLaunchTest, navigate)}
          </p>
        );
      })}
    </div>
  );
}

export default function EduPyeAIChat({ customContext, className = '' }: EduPyeAIChatProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useStudentProfile();
  const studentName = profile?.name ? profile.name.split(' ')[0] : '';

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // In-chat interactive PYQ selection state { [messageId]: selectedOptionId }
  const [pyqAnswers, setPyqAnswers] = useState<Record<string, string>>({});

  // Voice Command (Speech-to-Text) state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const context = getPageContext(location.pathname, customContext);

  // Initialize Speech Recognition API if supported by browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputValue(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Welcome message - clean, focused, without raw route URLs or context banners
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I'm **EduPye AI**, your smart study companion. 🎓\n\nAsk me any concept, formula, or ask for a **Previous Year Question (PYQ)** with a specific year (e.g. *"Give me a 2023 CBSE Science question"*). You can also tap the microphone to speak!`,
      timestamp: 'Just now',
    },
  ]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isAiThinking]);

  // Toggle Voice Recognition
  const toggleVoiceListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }
  };

  // Text to Speech (TTS) Read Aloud
  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown asterisks and hash tags for clean speech
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Send message to backend AI assistant
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsAiThinking(true);

    try {
      // Connect directly to backend AI endpoint with student name
      const aiResult = await sendAIChatMessage(text, context.title, studentName);

      const aiMessageId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          sender: 'ai',
          text: aiResult.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pyq: aiResult.pyq,
        },
      ]);
    } catch (err) {
      const aiMessageId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          sender: 'ai',
          text: 'I encountered an issue connecting to the academic engine. Please try asking again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Handle clicking "Solve in Test Mode" (Untimed self-paced mode)
  const handleLaunchTest = (testId: string) => {
    // Store in active session storage
    sessionStorage.setItem(
      'edupye_active_test_session',
      JSON.stringify({ testId, attemptId: undefined, isUntimed: true })
    );

    // Close chat window so the student immediately sees the test view
    setIsOpen(false);

    // Redirect user to the tests page with query parameter and untimed flag
    navigate(`/student/tests?testId=${testId}&untimed=true`);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: `Chat cleared. Ready for your study questions or PYQ requests!`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 select-none ${className}`}>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#1c3352] via-[#244673] to-[#0091ff] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          title="Open EduPye AI Assistant"
        >
          {/* Animated Glow Pill */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d2ff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00d2ff]"></span>
          </span>

          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="text-xs font-black tracking-wide">EduPye AI</span>
          </div>

          <span className="hidden sm:inline-block bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs text-white/90">
            Ask AI
          </span>
        </button>
      )}

      {/* Chat Popup Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#cbd5e1]/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Sleek Header - Clean, without Active Page Context banner */}
          <div className="bg-gradient-to-r from-[#1c3352] to-[#254b77] text-white px-4 py-3.5 flex items-center justify-between shadow-xs flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black tracking-wide text-white">EduPye AI</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Smart Academic Companion</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fbfe]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeaking = speakingMsgId === msg.id;

              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isUser ? 'You' : 'EduPye AI'}
                    </span>
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`relative group max-w-[92%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#1c3352] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-[#1c3352] border border-[#e2ebf4] rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <FormattedMessageText
                      text={msg.text}
                      isUser={isUser}
                      onLaunchTest={handleLaunchTest}
                      navigate={navigate}
                    />

                    {/* Direct Clickable Link Banner for solving question / quiz */}
                    {msg.pyq && (
                      <div className="my-2.5 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-xl border border-blue-200/90 shadow-2xs">
                        <button
                          onClick={() => handleLaunchTest(msg.pyq!.testId)}
                          className="text-[#0066cc] hover:text-[#004c99] font-extrabold text-xs flex items-center justify-between w-full group/link cursor-pointer text-left"
                        >
                          <span className="flex items-center gap-1.5 underline decoration-2 underline-offset-2">
                            <span>👉 Click here to solve this question / quiz in untimed mode</span>
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 group-hover/link:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    )}

                    {/* Interactive PYQ Card (when AI provides a previous year question) */}
                    {msg.pyq && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80">
                        {/* PYQ Header Badges */}
                        <div className="flex items-center justify-between gap-1.5 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#0091ff]/15 text-[#0070cc] font-extrabold text-[10px]">
                              {msg.pyq.board} {msg.pyq.year}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                              {msg.pyq.subject}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">
                            {msg.pyq.marks} Mark
                          </span>
                        </div>

                        {/* Question Text */}
                        <p className="font-bold text-[#1c3352] mb-3 leading-snug">
                          {msg.pyq.question}
                        </p>

                        {/* Interactive Options list */}
                        <div className="space-y-1.5 mb-3">
                          {msg.pyq.options.map((opt) => {
                            const isSelected = pyqAnswers[msg.id] === opt.id;
                            const isCorrect = opt.id === msg.pyq!.correctAnswer;
                            const hasAnswered = Boolean(pyqAnswers[msg.id]);

                            let btnStyle = 'bg-slate-50 hover:bg-[#eaf4ff] border-slate-200 text-[#1c3352]';
                            if (hasAnswered) {
                              if (isSelected && isCorrect) {
                                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                              } else if (isSelected && !isCorrect) {
                                btnStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-bold';
                              } else if (isCorrect) {
                                btnStyle = 'bg-emerald-50/50 border-emerald-300 text-emerald-700';
                              }
                            }

                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  if (!hasAnswered) {
                                    setPyqAnswers((prev) => ({ ...prev, [msg.id]: opt.id }));
                                  }
                                }}
                                className={`w-full text-left p-2 rounded-xl border text-[11px] flex items-center gap-2 transition-all cursor-pointer ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-lg bg-white/90 border border-slate-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                  {opt.id}
                                </span>
                                <span className="flex-1">{opt.text}</span>
                                {hasAnswered && isSelected && isCorrect && (
                                  <span className="text-[10px] text-emerald-600 font-bold">✓ Correct</span>
                                )}
                                {hasAnswered && isSelected && !isCorrect && (
                                  <span className="text-[10px] text-rose-600 font-bold">✗ Incorrect</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation reveal if student clicked an option in chat */}
                        {pyqAnswers[msg.id] && (
                          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-700 mb-3">
                            <p className="font-bold text-[#0070cc] mb-1">Pedagogical Explanation:</p>
                            <p>{msg.pyq.explanation}</p>
                          </div>
                        )}

                        {/* Prominent Action Button: Redirect to Tests Page */}
                        <button
                          onClick={() => handleLaunchTest(msg.pyq!.testId)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0091ff] to-[#0066cc] text-white font-black text-xs hover:from-[#0080e6] hover:to-[#0055b3] shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                        >
                          <span>🚀 Solve Question (Untimed Practice Mode)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* AI Message Action Buttons: Read Aloud & Copy */}
                    {!isUser && (
                      <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            isSpeaking
                              ? 'bg-cyan-100 text-cyan-800 animate-pulse'
                              : 'text-slate-400 hover:text-[#0091ff] hover:bg-slate-100'
                          }`}
                          title={isSpeaking ? 'Stop speaking' : 'Read aloud with voice'}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3 h-3 text-cyan-700" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-[#0091ff] hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Thinking / Generating indicator */}
            {isAiThinking && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">EduPye AI</span>
                </div>
                <div className="bg-white border border-[#e2ebf4] p-3 rounded-2xl rounded-bl-xs shadow-2xs flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff] animate-bounce"></span>
                  </div>
                  <span>EduPye AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-[#e2ebf4]/60 flex-shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1.5">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Quick Actions & PYQs:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {context.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-2.5 py-1 rounded-xl bg-[#f0f6fc] hover:bg-[#e1effe] text-[#1c3352] text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer border border-[#d8eaf8] flex items-center gap-1 active:scale-95"
                >
                  <span>{suggestion}</span>
                  <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                </button>
              ))}
            </div>
          </div>

          {/* Voice Listening Active Wave Bar */}
          {isListening && (
            <div className="bg-gradient-to-r from-[#1c3352] to-[#0091ff] text-white px-4 py-2 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></div>
                <span className="text-[11px] font-bold tracking-wide">
                  🎙️ Listening... Speak your question now!
                </span>
              </div>
              <button
                onClick={toggleVoiceListening}
                className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-0.5 rounded-md cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Input & Voice Command Controls */}
          <div className="p-3 bg-white border-t border-[#e2ebf4] flex items-center gap-2 flex-shrink-0">
            {/* Voice Command Microphone Button */}
            <button
              onClick={toggleVoiceListening}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-bounce scale-105'
                  : speechSupported
                  ? 'bg-[#f0f6fc] hover:bg-[#e2ebf4] text-[#1c3352] border border-[#d8eaf8]'
                  : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
              }`}
              title={
                isListening
                  ? 'Stop Voice Input'
                  : speechSupported
                  ? 'Click to speak your question'
                  : 'Voice recognition not supported in this browser'
              }
              disabled={!speechSupported}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input Text Field */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Ask anything or request a PYQ..."
              className="flex-1 bg-[#f0f6fc] border border-[#d8eaf8] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#1c3352] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isAiThinking}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                inputValue.trim() && !isAiThinking
                  ? 'bg-[#0091ff] text-white hover:bg-[#007acc] shadow-xs hover:scale-105 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
