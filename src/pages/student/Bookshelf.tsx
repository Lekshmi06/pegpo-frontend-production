import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronLeft, ChevronRight, Globe, Trophy,
  Palette, Castle, Globe2, Magnet, FlaskConical, Dna,
  MessageSquare, BookOpen, Mic, Video, Brain, FileText,
  CheckCircle2, Layers, TrendingUp, RotateCcw, NotebookPen, Bookmark
} from 'lucide-react';
import userImg from '../../assets/user.png';
import bookVanGogh from '../../assets/book-van-gogh.jpg';
import bookKlimt from '../../assets/book-klimt.jpg';
import bookArtSpirit from '../../assets/book-art-spirit.jpg';
import bookHistoryArt from '../../assets/book-history-art.jpg';
import bookHistoryBeauty from '../../assets/book-history-beauty.jpg';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export default function Bookshelf() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const subjectCategories = [
    { name: 'Art', books: '516 Books', icon: Palette },
    { name: 'History', books: '516 Books', icon: Castle },
    { name: 'Geography', books: '516 Books', icon: Globe2 },
    { name: 'Physics', books: '516 Books', icon: Magnet },
    { name: 'Chemistry', books: '516 Books', icon: FlaskConical },
    { name: 'Biology', books: '516 Books', icon: Dna },
    { name: 'Biotech', books: '516 Books', icon: Dna },
  ];

  const artBooks = [
    { id: 1, title: 'Van Gogh: The Life', author: 'Steven Naifeh', cover: bookVanGogh },
    { id: 2, title: 'Klimt', author: 'Klimt', cover: bookKlimt },
    { id: 3, title: 'The Art Spirit', author: 'Robert Henri', cover: bookArtSpirit },
    { id: 4, title: 'History of Art', author: 'H.W. Janson', cover: bookHistoryArt },
    { id: 5, title: 'Klimt', author: 'Klimt', cover: bookHistoryBeauty },
  ];

  const historyBooks = [
    { id: 101, title: 'Van Gogh: The Life', author: 'Steven Naifeh', cover: bookVanGogh },
    { id: 102, title: 'Klimt', author: 'Klimt', cover: bookKlimt },
    { id: 103, title: 'The Art Spirit', author: 'Robert Henri', cover: bookArtSpirit },
    { id: 104, title: 'History of Art', author: 'H.W. Janson', cover: bookHistoryArt },
    { id: 105, title: 'Klimt', author: 'Klimt', cover: bookKlimt },
  ];

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
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your selected bookshelf reference.
            </p>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} created!`);
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
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Select Language"
            >
              <Globe className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <button
              onClick={() => toast.info('Viewing Achievements & Badges')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
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
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              <div>
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Book shelf</h1>
              </div>

              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#0091ff]" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookshelf..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#d0e3f7] rounded-xl text-xs text-[#1c3352] font-semibold outline-none focus:ring-2 focus:ring-[#0091ff]/30 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.info('Previous category')}
                  className="w-10 h-16 sm:w-12 sm:h-20 bg-[#1c3352] hover:bg-[#2b4d7a] text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-xs"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 overflow-hidden">
                  {subjectCategories.map((cat, idx) => {
                    const CatIcon = cat.icon;
                    return (
                      <div
                        key={`${cat.name}-${idx}`}
                        onClick={() => toast.info(`Filtered by ${cat.name}`)}
                        className="bg-[#dbeafe] hover:bg-[#cbe2fc] p-3 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-2xs group"
                      >
                        <CatIcon className="w-6 h-6 text-[#1c3352] stroke-[2] group-hover:scale-110 transition-transform mb-1.5" />
                        <h4 className="text-xs font-extrabold text-[#1c3352] leading-tight">{cat.name}</h4>
                        <span className="text-[9px] font-semibold text-[#2563eb] mt-0.5">{cat.books}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => toast.info('Next category')}
                  className="w-10 h-16 sm:w-12 sm:h-20 bg-[#1c3352] hover:bg-[#2b4d7a] text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-xs"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">Art</h2>
                  <div className="flex items-center gap-1.5">
                    <button className="w-7 h-7 bg-[#dbeafe] text-[#1c3352] hover:bg-[#cbe2fc] rounded-md flex items-center justify-center cursor-pointer transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 bg-[#dbeafe] text-[#1c3352] hover:bg-[#cbe2fc] rounded-md flex items-center justify-center cursor-pointer transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {artBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => {
                        toast.info(`Opened ${book.title}`);
                        navigate('/student/upload');
                      }}
                      className="group cursor-pointer space-y-2"
                    >
                      <div className="aspect-3/4 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all bg-slate-100">
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#0091ff] transition-colors line-clamp-1">{book.title}</h4>
                        <p className="text-[10px] font-medium text-slate-500 line-clamp-1">{book.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">History</h2>
                  <div className="flex items-center gap-1.5">
                    <button className="w-7 h-7 bg-[#dbeafe] text-[#1c3352] hover:bg-[#cbe2fc] rounded-md flex items-center justify-center cursor-pointer transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 bg-[#dbeafe] text-[#1c3352] hover:bg-[#cbe2fc] rounded-md flex items-center justify-center cursor-pointer transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {historyBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => {
                        toast.info(`Opened ${book.title}`);
                        navigate('/student/upload');
                      }}
                      className="group cursor-pointer space-y-2"
                    >
                      <div className="aspect-3/4 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all bg-slate-100">
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#0091ff] transition-colors line-clamp-1">{book.title}</h4>
                        <p className="text-[10px] font-medium text-slate-500 line-clamp-1">{book.author}</p>
                      </div>
                    </div>
                  ))}
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
                  <span className="text-[11px] font-extrabold text-[#111827] max-w-[100px] leading-tight">{card.title}</span>
                  <img src={card.img} alt={card.title} className="w-14 h-10 object-contain group-hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
