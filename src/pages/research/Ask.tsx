import React, { useState, FormEvent } from 'react';
import {
  MessageSquare, Paperclip, Plus, Smile, Mic, Scan, MoreVertical
} from 'lucide-react';
import userImg from '../../assets/user.png';

interface MessageItem {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

export default function Ask() {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-initial',
      sender: 'bot',
      text: "Hi! I'm your writing assistant. I'm here to help you create a full-length research document through our conversation. What are you writing today?"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const onlineUsers = [
    { id: 'user-1', name: 'Karthika' },
    { id: 'user-2', name: 'Karthika' },
    { id: 'user-3', name: 'Karthika' },
    { id: 'user-4', name: 'Karthika' },
    { id: 'user-5', name: 'Karthika' },
    { id: 'user-6', name: 'Karthika' },
  ];

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setMessages([...messages, { id: `msg-${Date.now()}`, sender: 'user', text: inputVal }]);
    setInputVal('');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white border border-[#e2edf7] rounded-3xl p-5 shadow-sm flex flex-col h-[560px] justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-extrabold text-[#264973]">
              <MessageSquare className="w-4 h-4 text-[#264973]" />
              <span>Ask</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img src={userImg} alt="Karthika" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                <span className="text-xs font-bold text-slate-800">Karthika</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Scan className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
                <MoreVertical className="w-4 h-4 hover:text-slate-600 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="flex-1 py-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-[#1c3352] text-white flex items-center justify-center flex-shrink-0 text-xs">
                    🤖
                  </div>
                )}
                <div className={`p-3.5 rounded-2xl text-xs font-medium max-w-md leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#d8e7f5] text-[#264973] rounded-tr-none font-semibold'
                    : 'bg-[#e3edf7] text-[#264973] rounded-tl-none font-semibold'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
            <Smile className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
            <input 
              type="text"
              placeholder="Message......"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs px-2 focus:outline-none text-slate-800 placeholder-slate-400 font-semibold"
            />
            <Paperclip className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
            <Plus className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-[#e3edf7] hover:bg-[#d5e6f5] flex items-center justify-center cursor-pointer transition-colors">
              <Mic className="w-4 h-4 text-[#264973]" />
            </div>
          </form>
        </div>

        <div className="bg-white border border-[#e2edf7] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-extrabold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>

          <div className="space-y-3">
            {onlineUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <img src={userImg} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                <span className="text-xs font-bold text-slate-700">{u.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
