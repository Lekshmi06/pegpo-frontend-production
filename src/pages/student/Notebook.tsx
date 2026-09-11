import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Trophy, Search, ChevronDown, Plus, Bold, Italic, Underline, Link, AlignLeft,
  AlignCenter, CheckSquare, List, Pencil, Eraser,
  MessageSquare, BookOpen, Mic, Video, Brain, FileText,
  CheckCircle2, Layers, TrendingUp, RotateCcw, NotebookPen, Bookmark
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface NoteItem {
  id: number;
  title: string;
  preview: string;
  date: string;
  content: string;
}

export default function Notebook() {
  const navigate = useNavigate();
  const toast = useToast();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [notesList, setNotesList] = useState<NoteItem[]>([
    { id: 1, title: 'New Note', preview: 'No text yet', date: 'Today', content: '' },
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState(1);
  const [activeNoteTitle, setActiveNoteTitle] = useState('');
  const [activeNoteContent, setActiveNoteContent] = useState('');

  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const handleAddNewNote = () => {
    const newId = Date.now();
    const newNote: NoteItem = { id: newId, title: 'New Note', preview: 'No text yet', date: 'Today', content: '' };
    setNotesList((prev) => [newNote, ...prev]);
    setSelectedNoteId(newId);
    setActiveNoteTitle('');
    setActiveNoteContent('');
    toast.success('Created new note');
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
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> into your active notebook.
            </p>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} added to active note!`);
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
                placeholder="Search notebook..."
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
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Notebook</h1>
                <Button onClick={handleAddNewNote} size="sm" leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}>
                  Add New
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[500px]">
                <div className="lg:col-span-4 bg-[#dbeafe]/40 border border-[#bfdbfe]/50 rounded-3xl p-5 shadow-xs space-y-3">
                  {notesList.map((n) => {
                    const isSelected = selectedNoteId === n.id;
                    return (
                      <div
                        key={n.id}
                        onClick={() => setSelectedNoteId(n.id)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#dbeafe] text-[#1c3352] shadow-2xs'
                            : 'bg-white/60 hover:bg-white text-slate-700'
                        }`}
                      >
                        <h3 className="text-base font-extrabold text-[#111827]">{n.title}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">{n.preview || 'No text yet'}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{n.date}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="lg:col-span-8 bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-600 text-xs font-semibold">
                      <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 cursor-pointer">
                        <span>Normal Text</span>
                        <ChevronDown className="w-3 h-3" />
                      </div>

                      <span className="text-slate-300">|</span>

                      <button onClick={() => toast.info('Bold formatted')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><Bold className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toast.info('Italic formatted')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><Italic className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toast.info('Underline formatted')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><Underline className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toast.info('Text color selected')} className="p-1 hover:bg-slate-100 rounded cursor-pointer font-extrabold">A</button>
                      <button onClick={() => toast.info('Link inserted')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><Link className="w-3.5 h-3.5" /></button>

                      <span className="text-slate-300">|</span>

                      <button onClick={() => toast.info('Left aligned')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><AlignLeft className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toast.info('Center aligned')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><AlignCenter className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toast.info('Checklist added')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><CheckSquare className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toast.info('List added')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><List className="w-3.5 h-3.5" /></button>

                      <span className="text-slate-300">|</span>

                      <button onClick={() => toast.info('Formula inserted')} className="p-1 hover:bg-slate-100 rounded cursor-pointer font-bold">+</button>
                      <button onClick={() => toast.info('Pencil tool active')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toast.info('Highlighter active')} className="p-1 hover:bg-slate-100 rounded cursor-pointer"><Eraser className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="space-y-4 pt-2">
                      <input
                        type="text"
                        value={activeNoteTitle}
                        onChange={(e) => setActiveNoteTitle(e.target.value)}
                        placeholder="Title"
                        className="text-2xl font-extrabold text-[#111827] outline-none w-full placeholder:text-slate-400"
                      />

                      <textarea
                        rows={14}
                        value={activeNoteContent}
                        onChange={(e) => setActiveNoteContent(e.target.value)}
                        placeholder="Write your text here......"
                        className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none resize-none placeholder:text-slate-400 leading-relaxed"
                      />
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
