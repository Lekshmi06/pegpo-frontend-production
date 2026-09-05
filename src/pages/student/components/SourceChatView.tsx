import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Mic,
  MicOff,
  Lightbulb,
} from 'lucide-react';
import { SourceItem, ChatMessage } from '../../../types/source';
import { sourceService } from '../../../services/sourceService';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';

interface SourceChatViewProps {
  source: SourceItem;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

function renderFormattedMessage(text: string) {
  // Simple, clean markdown-like renderer for chat responses
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Bold formatting inline helper
        const renderInline = (str: string) => {
          const parts = str.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-extrabold text-[#0f2942]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });
        };

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0091ff] shrink-0 mt-1.5" />
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)$/);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-bold text-[#0091ff] text-[11px] shrink-0">{match?.[1]}.</span>
              <span>{renderInline(match?.[2] || '')}</span>
            </div>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={idx} className="font-extrabold text-xs text-[#0f2942] pt-1">
              {trimmed.slice(4)}
            </h5>
          );
        }

        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h4 key={idx} className="font-extrabold text-sm text-[#0f2942] pt-1">
              {trimmed.replace(/^#+\s/, '')}
            </h4>
          );
        }

        return <p key={idx}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

export const SourceChatView: React.FC<SourceChatViewProps> = ({
  source,
  initialQuery,
  onClearInitialQuery,
}) => {
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting & suggested prompts
  useEffect(() => {
    const greeting: ChatMessage = {
      id: 'greeting',
      role: 'model',
      text: `Hello! I've processed **"${source.originalName}"** with Gemini. You can ask me to explain concepts, clarify formulas, find definitions, or test your comprehension!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([greeting]);
  }, [source._id, source.originalName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputQuery).trim();
    if (!textToSend || isSending) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsSending(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'greeting')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await sourceService.chatWithSource(source._id, textToSend, history);

      const botMessage: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: res.citations,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to query Gemini';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  // Handle passed-in initial query
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
      onClearInitialQuery?.();
    }
  }, [initialQuery]);

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening... Speak your question.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice input error. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      toast.info('Voice input could not start.');
    }
  };

  const suggestedQuestions =
    source.aiOverview?.suggestedQuestions && source.aiOverview.suggestedQuestions.length > 0
      ? source.aiOverview.suggestedQuestions
      : [
          'What are the core principles covered here?',
          'Give me 3 key exam questions with answers from this text.',
          'Summarize the main formulas or definitions.',
        ];

  return (
    <div className="flex flex-col h-[560px] bg-white rounded-3xl border border-[#e2ebf4] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 px-6 bg-[#f8fbfe] border-b border-[#e2ebf4] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0091ff] to-[#60a5fa] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
              <span>Chat with Source</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-700">
                Gemini
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 truncate max-w-sm">
              Grounded exclusively in: {source.originalName}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const greeting: ChatMessage = {
              id: 'greeting',
              role: 'model',
              text: `Chat reset! What would you like to explore in **"${source.originalName}"**?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([greeting]);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Reset Chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested prompts pills */}
      <div className="px-6 py-2 bg-[#fafcff] border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="flex items-center gap-1 text-slate-400 font-bold shrink-0 text-[10px] uppercase">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Ask:</span>
        </span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="shrink-0 px-2.5 py-1 bg-white hover:bg-[#eef6fc] text-[#1c3352] border border-[#cbd5e1] hover:border-[#0091ff] rounded-full text-[11px] font-medium transition-colors shadow-2xs cursor-pointer truncate max-w-[280px]"
            title={q}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-[#0091ff] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 space-y-2 shadow-2xs ${
                  isUser
                    ? 'bg-[#0091ff] text-white rounded-tr-xs font-medium'
                    : 'bg-[#f8fbfe] text-slate-800 border border-[#e2ebf4] rounded-tl-xs'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  renderFormattedMessage(msg.text)
                )}

                <div
                  className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isUser
                      ? 'border-white/20 text-white/70'
                      : 'border-slate-200/60 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyMessage(msg.id, msg.text)}
                        className="hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                        title="Copy text"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() =>
                          setLikedMap((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                        }
                        className={`transition-colors p-0.5 cursor-pointer ${
                          likedMap[msg.id] ? 'text-[#0091ff]' : 'hover:text-slate-700'
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-3 text-xs justify-start items-center">
            <div className="w-7 h-7 rounded-xl bg-[#0091ff] text-white flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#f8fbfe] border border-[#e2ebf4] rounded-2xl p-3 px-4 shadow-2xs flex items-center gap-2 text-slate-500">
              <Loader size="sm" />
              <span className="text-[11px] font-semibold">Gemini is reasoning through the document...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 px-6 bg-[#f8fbfe] border-t border-[#e2ebf4]">
        <div className="border border-[#cbd5e1] focus-within:border-[#0091ff] focus-within:ring-2 focus-within:ring-[#0091ff]/20 bg-white rounded-2xl p-2 px-3 flex items-center gap-2 transition-all shadow-2xs">
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={`Ask Gemini about "${source.originalName}"...`}
            className="flex-1 bg-transparent text-xs font-semibold text-[#1c3352] outline-none placeholder:text-slate-400"
          />

          <button
            onClick={toggleVoice}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isListening ? 'Stop Listening' : 'Voice Query'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isSending}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-2xs ${
              inputQuery.trim() && !isSending
                ? 'bg-[#0091ff] text-white hover:bg-[#0080e6] cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Send"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
