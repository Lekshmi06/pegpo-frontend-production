import React, { useState, FormEvent } from 'react';
import {
  RotateCcw, MessageSquare, Paperclip, Plus, Lightbulb, Check, ArrowRight
} from 'lucide-react';

interface MessageItem {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

export default function WritePaper() {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-initial',
      sender: 'bot',
      text: "Hi! I'm your writing assistant. I'm here to help you create a full-length research document through our conversation. What are you writing today?"
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages([...messages, { id: `msg-${Date.now()}`, sender: 'user', text: inputText }]);
    setInputText('');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-xl font-extrabold text-slate-800">Document Creation Assistant</h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Tell us what kind of document you'd like to create, We'll guide you step by step to gather all the necessary information. Once everything is complete, we'll generate a full draft for you.
          </p>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#264973] rounded-xl text-xs font-bold transition-all border border-slate-200/50 shadow-2xs cursor-pointer"
        >
          <span>Start over</span>
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#e2edf7] rounded-3xl p-5 shadow-sm flex flex-col h-[520px] justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-extrabold text-[#264973]">
            <MessageSquare className="w-4 h-4 text-[#264973]" />
            <span>Conversation</span>
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
                    ? 'bg-[#1c3352] text-white rounded-tr-none'
                    : 'bg-[#e3edf7] text-[#264973] rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex items-center gap-2">
            <input 
              type="text"
              placeholder="Message......"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs px-3 focus:outline-none text-slate-800 placeholder-slate-400 font-semibold"
            />
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600">
              <Paperclip className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600">
              <Plus className="w-4 h-4" />
            </button>
            <button type="submit" className="p-2.5 bg-[#3f88c5] hover:bg-[#2e74af] text-white rounded-xl transition-all cursor-pointer">
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="bg-white border border-[#e2edf7] rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-extrabold text-[#264973]">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Document Progress</span>
            </div>

            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-semibold max-w-[180px] mx-auto">
                Start the conversation to see progress
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Tip:</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              The more information you provide, the better your document will be. You can always build early if needed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
