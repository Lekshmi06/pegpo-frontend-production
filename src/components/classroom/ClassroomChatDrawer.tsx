import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { ClassroomChatMessage } from '../../types/webrtc';

interface ClassroomChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ClassroomChatMessage[];
  onSendMessage: (text: string) => void;
  currentUserId?: string;
}

export const ClassroomChatDrawer: React.FC<ClassroomChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="w-80 max-w-full bg-slate-900 border-l border-slate-800 flex flex-col h-full z-40 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
        <div className="flex items-center gap-2 text-white font-extrabold text-sm">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>Classroom Chat</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-medium">No messages yet.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Say hello or ask a question during class!
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = currentUserId ? m.senderId === currentUserId : false;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-bold text-slate-300">
                    {m.senderName}
                  </span>
                  {m.senderRole === 'host' && (
                    <span className="text-[9px] font-black uppercase text-sky-400 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/40">
                      Host
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-2xl text-xs font-medium max-w-[240px] break-words shadow-xs ${
                    isMe
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-2 bg-slate-800 rounded-2xl px-3 py-1.5 border border-slate-700 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/40 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type message to class..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 outline-none font-medium py-1.5"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:hover:bg-sky-600 text-white transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

