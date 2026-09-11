import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Globe, Trophy, Search, ChevronDown, MessageSquare, BookOpen, Video, Brain, FileText,
  CheckCircle2, Layers, TrendingUp, RotateCcw, NotebookPen, Bookmark, Paperclip,
  Clock, Plus, ArrowUpDown
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export default function Record() {
  const navigate = useNavigate();
  const toast = useToast();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('0.00');
  const [leftTab, setLeftTab] = useState<'Chapter' | 'Transcripts'>('Chapter');
  const [rightTab, setRightTab] = useState<'Chat' | 'Flashcards' | 'Quiz' | 'Notes' | 'Summery'>('Chat');
  const [chatQuery, setChatQuery] = useState('');

  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime('0.14');
      toast.info('Recording started... Microphone active');
    } else {
      setIsRecording(false);
      setRecordingTime('1.45');
      toast.success('Recording saved & transcribed!');
    }
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
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> from recorded lecture audio.
            </p>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} generated from recording!`);
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-end px-4 md:px-8 z-10 flex-shrink-0">
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
                placeholder="Search recordings..."
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
              <div>
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Record</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Recording session active</p>
              </div>

              <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={toggleRecording}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-[#1c3352] hover:bg-[#2b4d7a] text-white'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>

                  <div className="flex-1 w-full bg-[#f8fbfe] border border-[#e2ebf4] rounded-full px-6 py-2 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-1 h-6">
                      {[...Array(42)].map((_, i) => (
                        <span
                          key={`wave-${i}`}
                          className={`w-0.5 bg-slate-300 rounded-full transition-all duration-300 ${
                            isRecording && i % 3 === 0 ? 'bg-[#0091ff] h-5' : 'h-3'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#1c3352] pl-4">{recordingTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#111827] px-1">
                  <Mic className="w-4 h-4 text-[#1c3352]" />
                  <span>Allow Microphone Access</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-stretch">
                  <div className="lg:col-span-5 border-r border-slate-100 pr-4 flex flex-col justify-between min-h-[380px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-[#f0f6fc] p-1 rounded-2xl border border-[#d8eaf8]">
                          <button
                            onClick={() => setLeftTab('Chapter')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              leftTab === 'Chapter'
                                ? 'bg-[#d8eaf8] text-[#0091ff] shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            • Chapter
                          </button>
                          <button
                            onClick={() => setLeftTab('Transcripts')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              leftTab === 'Transcripts'
                                ? 'bg-[#d8eaf8] text-[#0091ff] shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Transcripts
                          </button>
                        </div>

                        <button
                          onClick={() => toast.info('Auto Scroll toggled')}
                          className="px-3 py-1.5 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>Auto Scroll</span>
                        </button>
                      </div>

                      {leftTab === 'Chapter' ? (
                        <div className="py-20 text-center">
                          <p className="text-xs text-slate-400 font-semibold">
                            {isRecording ? 'Analyzing chapters live...' : 'Start recording to view chapters'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4 text-xs font-medium text-slate-600 leading-relaxed">
                          <p className="bg-[#f8fbfe] p-3 rounded-xl border border-slate-100">
                            <strong>[00:00 - 00:15]</strong> Teacher: Welcome class, today we examine electric circuits and current flow.
                          </p>
                          <p className="bg-[#f8fbfe] p-3 rounded-xl border border-slate-100">
                            <strong>[00:15 - 00:40]</strong> Teacher: Ohm's law relates voltage, current, and resistance: V = I × R.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <div className="w-1.5 h-32 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-full bg-[#0091ff] h-1/2 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 pl-2 flex flex-col justify-between min-h-[380px] space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {(['Chat', 'Flashcards', 'Quiz', 'Notes', 'Summery'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setRightTab(t)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                rightTab === t
                                  ? 'bg-[#d8eaf8] text-[#0091ff] shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {t === 'Chat' ? '• Chat' : t}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          <button onClick={() => toast.info('New conversation created')} className="hover:text-slate-700 cursor-pointer">
                            <Plus className="w-4 h-4" />
                          </button>
                          <button onClick={() => toast.info('Viewing past recording history')} className="hover:text-slate-700 cursor-pointer">
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="py-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#f0f6fc] flex items-center justify-center mx-auto text-[#0091ff] shadow-2xs">
                          <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
                            <path d="M40 15L65 28L40 41L15 28L40 15Z" stroke="#0091ff" strokeWidth="4" strokeLinejoin="round" fill="none" />
                            <path d="M25 35V52C25 58 55 58 55 52V35" stroke="#0091ff" strokeWidth="4" fill="none" />
                          </svg>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                          {['Flashcards', 'Mind Map', 'Search', 'Quiz', 'Timeline', 'Voice Mode'].map((pill) => (
                            <button
                              key={pill}
                              onClick={() => toast.info(`Triggered ${pill} mode`)}
                              className="px-3 py-1 bg-white border border-[#cbd5e1]/60 hover:bg-slate-50 text-[#1c3352] rounded-full text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
                            >
                              {pill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border border-[#e2ebf4] bg-[#f8fbfe] rounded-2xl p-4 space-y-3 shadow-2xs">
                      <input
                        type="text"
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            toast.info(`Query sent: "${chatQuery}"`);
                            setChatQuery('');
                          }
                        }}
                        placeholder="Learn Anything"
                        className="w-full bg-transparent text-xs font-semibold text-[#1c3352] outline-none placeholder:text-slate-400"
                      />

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-3 font-semibold text-[11px]">
                          <button onClick={() => toast.info('Auto scroll enabled')} className="flex items-center gap-1 hover:text-[#0091ff] cursor-pointer">
                            <span>∨ Auto Scroll</span>
                          </button>
                          <button onClick={() => toast.info('Context attached')} className="flex items-center gap-1 hover:text-[#0091ff] cursor-pointer">
                            <span>@ Add Context</span>
                          </button>
                        </div>

                        <button
                          onClick={() => toast.info('Attachment uploaded')}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Attach document"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
