import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Trophy, Search, ChevronDown, Clock, Calendar, Bookmark, Star, AlertTriangle,
  Send, MessageSquare, BookOpen, Mic, Video, Brain, FileText,
  CheckCircle2, Layers, TrendingUp, RotateCcw, NotebookPen, ArrowLeft
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface LiveSession {
  id: number;
  subject: string;
  title: string;
}

export default function LiveClasses() {
  const navigate = useNavigate();
  const toast = useToast();

  const [board, setBoard] = useState('CBSE');
  const [cbseClass, setCbseClass] = useState('Class 9');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState<LiveSession | null>(null);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Student', text: 'Hi' },
    { id: 2, sender: 'Rahul', text: 'Good Moring' },
    { id: 3, sender: 'Anita', text: 'Hi' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const handleSendLiveMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages((prev) => [...prev, { id: Date.now(), sender: 'You', text: msg }]);
    setChatInput('');
    toast.info('Message sent to Live Chat');
  };

  const createActions = [
    { label: 'Chat', icon: MessageSquare },
    { label: 'Chapter', icon: BookOpen },
    { label: 'Audio', icon: Mic },
    { label: 'Video', icon: Video },
    { label: 'Mind Map', icon: Brain },
    { label: 'Summery', icon: FileText },
    { label: 'Quiz', icon: CheckCircle2 },
    { label: 'Flash Card', icon: Layers },
    { label: 'Time Line', icon: TrendingUp },
    { label: 'Analyse', icon: RotateCcw },
    { label: 'Notes', icon: NotebookPen },
    { label: 'Book Mark', icon: Bookmark },
  ];

  const lowerGraphicCards = [
    { id: 'smartboard', title: 'Smart Bord /Projects', img: cardSmartboard, desc: 'Interactive digital chalkboard for group project simulations.' },
    { id: 'combine', title: 'Combine Study', img: cardCombine, desc: 'Collaborative live study rooms with peers and tutors.' },
    { id: 'slide', title: 'Slide', img: cardSlide, desc: 'AI-generated presentation decks for key syllabus concepts.' },
    { id: 'infographics', title: 'Info Graphics', img: cardInfographics, desc: 'Visual flowcharts, diagrams, and memory maps.' },
  ];

  const handleCreateActionClick = (label: string) => {
    setModalTitle(`Create ${label}`);
    setSelectedActionLabel(label);
    setActiveModal('action');
  };

  const handleGraphicCardClick = (card: { title: string; img: string; desc: string }) => {
    setModalTitle(card.title);
    setSelectedGraphicCard(card);
    setActiveModal('graphic');
  };

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your active Live Class.
            </p>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} created for Live Class!`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Generate {selectedActionLabel}
            </Button>
          </div>
        )}

        {activeModal === 'graphic' && selectedGraphicCard && (
          <div className="space-y-4">
            <div className="h-40 bg-[#eef6fc] rounded-2xl flex items-center justify-center p-4">
              <img src={selectedGraphicCard.img} alt={selectedGraphicCard.title} className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedGraphicCard.desc}</p>
            <Button
              onClick={() => {
                toast.info(`Launched ${selectedGraphicCard.title}!`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Launch Workspace
            </Button>
          </div>
        )}
      </Modal>

      <aside className="w-44 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto pt-16 hidden sm:flex">
        <div className="px-2 space-y-1.5">
          <button
            onClick={() => setActiveLiveSession(null)}
            className="h-9 w-full text-left px-3 rounded-lg text-xs font-bold bg-white text-[#0091ff] shadow-xs cursor-pointer"
          >
            Live Class
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeLiveSession && (
              <button
                onClick={() => setActiveLiveSession(null)}
                className="mr-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-[#1c3352]"
                title="Back to Live Classes"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            <div className="relative">
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-3.5 pr-8 py-1.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State">State</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>

            <div className="relative">
              <select
                value={cbseClass}
                onChange={(e) => setCbseClass(e.target.value)}
                className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-3.5 pr-8 py-1.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info('Language switched to English')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Select Language"
            >
              <Globe className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search classes..."
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button
              onClick={() => toast.info('Viewing Achievements & Badges')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Achievements"
            >
              <Trophy className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative">
              <button
                onClick={() => navigate('/student/profile')}
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs hover:ring-2 hover:ring-[#0091ff]/30 transition-all cursor-pointer block"
                title="Student Profile"
              >
                <img src={userImg} alt="Profile" className="w-full h-full object-cover" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-52 bg-[#f0f6fc] border border-[#d8eaf8] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                  {['Help & Tools', 'Feed Back', 'Quick Guide', 'Extension', 'Discord', 'Settings'].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3.5 py-2 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold transition-colors"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              {!activeLiveSession ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Live Class</h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Enrolled Classes</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {[1, 2, 3, 4, 5, 6].map((id) => (
                      <div
                        key={id}
                        className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span className="text-slate-600 font-bold">Physics</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Duration: 1 hour
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-[#111827] tracking-tight pt-1">
                            Electric Circuits – Live Class
                          </h3>

                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            26 Nov, 4:00–5:00 PM
                          </p>

                          <p className="text-xs font-bold text-[#1c3352]">
                            Instructor: Varun Reddy
                          </p>
                        </div>

                        <div className="flex items-end justify-between pt-6">
                          <button
                            onClick={() => {
                              setActiveLiveSession({ id, subject: 'Physics', title: '01 Light - Reflection and Refraction' });
                              toast.success('Joined Live Stream Class!');
                            }}
                            className="px-8 py-2.5 bg-[#1c3352] hover:bg-[#284872] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            Join
                          </button>

                          <div className="w-24 h-24 shrink-0 overflow-hidden flex items-end justify-end -mb-2 -mr-2">
                            <img src={userImg} alt="Instructor" className="w-20 h-20 object-cover rounded-2xl border border-slate-100 shadow-2xs" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">{activeLiveSession.subject}</h1>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="bg-black rounded-3xl overflow-hidden aspect-video relative shadow-lg group">
                        <div className="w-full h-full bg-[#111] flex items-center justify-center relative">
                          <div className="text-center space-y-2 text-white/80">
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20">
                              <Video className="w-8 h-8 text-[#0091ff]" />
                            </div>
                            <span className="text-xs font-bold tracking-wide block">LIVE CLASS STREAM</span>
                          </div>

                          <div className="absolute bottom-4 right-4 w-32 h-24 rounded-2xl overflow-hidden border-2 border-white/40 shadow-xl bg-slate-900">
                            <img src={userImg} alt="Instructor PIP" className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between text-white text-xs font-semibold">
                          <div className="flex items-center gap-3">
                            <button className="hover:text-[#0091ff]">▶</button>
                            <span className="text-[11px] opacity-80">0.04 / 30.15</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-500">LIVE</span>
                          </div>
                        </div>
                      </div>

                      <h2 className="text-base font-extrabold text-[#111827]">
                        {activeLiveSession.title}
                      </h2>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => toast.info('Class bookmarked!')}
                          className="px-4 py-1.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#1c3352] rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Book Mark</span>
                        </button>

                        <button
                          onClick={() => toast.info('Class rated 5 stars!')}
                          className="px-4 py-1.5 border border-[#0091ff] hover:bg-[#eff6ff] text-[#0091ff] rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-[#0091ff]" />
                          <span>Rate</span>
                        </button>

                        <button
                          onClick={() => toast.info('Feedback reported')}
                          className="px-4 py-1.5 border border-[#ef4444] hover:bg-[#fef2f2] text-[#ef4444] rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs flex flex-col justify-between h-[480px]">
                      <div className="space-y-4">
                        <h3 className="text-sm font-extrabold text-[#111827]">Live Chat</h3>

                        <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                          {chatMessages.map((m) => (
                            <div key={m.id} className="bg-[#f8fbfe] border border-slate-100 rounded-2xl p-3 text-xs font-semibold text-[#1c3352] max-w-[200px]">
                              {m.text}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border border-[#e2ebf4] bg-[#f8fbfe] rounded-2xl p-2 px-3 flex items-center justify-between gap-2 shadow-2xs mt-4">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendLiveMessage();
                          }}
                          placeholder="Type message..."
                          className="w-full bg-transparent text-xs font-semibold text-[#1c3352] outline-none"
                        />
                        <button
                          onClick={handleSendLiveMessage}
                          className="w-7 h-7 rounded-xl bg-[#c5dff2] hover:bg-[#b0d2eb] text-[#1c3352] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="w-64 bg-[#d8eaf8] p-4 flex flex-col space-y-4 border-l border-[#cbd5e1]/50 shrink-0 select-none overflow-y-auto hidden lg:flex">
            <h2 className="flex items-center justify-start gap-1.5 text-xl font-extrabold text-[#111827] tracking-tight pl-2">
              <span className="text-[#2f78c4] font-extrabold">&gt;&gt;</span>
              <span>Create</span>
            </h2>

            <div className="bg-white rounded-3xl p-3 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                {createActions.map((act) => {
                  const ActionIcon = act.icon;
                  return (
                    <button
                      key={act.label}
                      onClick={() => handleCreateActionClick(act.label)}
                      className="flex flex-col items-center justify-center h-[54px] bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-xl text-[#214d7d] transition-colors p-1 cursor-pointer group shadow-2xs"
                      title={`Create ${act.label}`}
                    >
                      <ActionIcon className="w-4 h-4 text-[#214d7d] stroke-[2.2] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold mt-1 text-[#1c3352]">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-3 shadow-xs space-y-2.5">
              {lowerGraphicCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleGraphicCardClick(card)}
                  className="flex items-center justify-between p-3 bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-2xl cursor-pointer transition-all group shadow-2xs"
                >
                  <span className="text-[11px] font-extrabold text-[#111827] max-w-[100px] leading-tight">
                    {card.title}
                  </span>
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-14 h-10 object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
