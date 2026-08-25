import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, Globe, Trophy,
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

interface BookItem {
  id: number;
  title: string;
  author: string;
  img: string;
  category: string;
  lastRead?: string;
}

export default function Library() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'Recommended' | 'Recently Read'>('Recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Category');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const categories = ['All Categories', 'Art & Design', 'History & Culture', 'Science & Physics', 'Literature', 'Philosophy'];

  const recommendedBooks: BookItem[] = [
    { id: 1, title: 'Van Gogh: The Life', author: 'Steven Naifeh', img: bookVanGogh, category: 'Art & Design' },
    { id: 2, title: 'Klimt', author: 'Klimt', img: bookKlimt, category: 'Art & Design' },
    { id: 3, title: 'The Art Spirit', author: 'Robert Henri', img: bookArtSpirit, category: 'Art & Design' },
    { id: 4, title: 'History of Art', author: 'H.W. Janson', img: bookHistoryArt, category: 'History & Culture' },
    { id: 5, title: 'Klimt', author: 'Klimt', img: bookHistoryBeauty, category: 'Art & Design' },
  ];

  const recentlyReadBooks: BookItem[] = [
    { id: 1, title: 'Van Gogh: The Life', author: 'Steven Naifeh', img: bookVanGogh, category: 'Art & Design', lastRead: 'Today, 2:30 PM' },
    { id: 2, title: 'Klimt', author: 'Klimt', img: bookKlimt, category: 'Art & Design', lastRead: 'Yesterday' },
    { id: 3, title: 'The Art Spirit', author: 'Robert Henri', img: bookArtSpirit, category: 'Art & Design', lastRead: '3 days ago' },
    { id: 4, title: 'History of Art', author: 'H.W. Janson', img: bookHistoryArt, category: 'History & Culture', lastRead: 'Last week' },
    { id: 5, title: 'Klimt', author: 'Klimt', img: bookHistoryBeauty, category: 'Art & Design', lastRead: '2 weeks ago' },
  ];

  const currentBooks = activeTab === 'Recommended' ? recommendedBooks : recentlyReadBooks;

  const filteredBooks = currentBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'Category' || selectedCategory === 'All Categories' || book.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your selected library book.
            </p>
            <div className="bg-[#f0f6fc] p-4 rounded-xl space-y-2 border border-[#d8eaf8]">
              <label className="text-xs font-bold text-[#1c3352]">Select Book:</label>
              <select className="w-full bg-white border border-[#cbd5e1] rounded-lg p-2 text-xs font-semibold text-[#1c3352] outline-none">
                <option>Van Gogh: The Life (Steven Naifeh)</option>
                <option>Klimt (Gustav Klimt Monograph)</option>
                <option>The Art Spirit (Robert Henri)</option>
                <option>History of Art (H.W. Janson)</option>
              </select>
            </div>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} generated successfully!`);
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
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Library</h1>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full flex-1 max-w-xl bg-white border border-[#cbd5e1]/60 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xs">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for books"
                    className="w-full bg-transparent text-xs font-semibold text-[#1c3352] outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="w-full bg-white border border-[#cbd5e1]/60 rounded-2xl px-5 py-2.5 flex items-center justify-between gap-8 text-xs font-semibold text-[#1c3352] shadow-2xs hover:border-[#0091ff] transition-colors cursor-pointer min-w-[160px]"
                  >
                    <span>{selectedCategory}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute right-0 top-12 w-52 bg-white border border-[#e2ebf4] rounded-2xl shadow-xl p-2 z-30 space-y-1 animate-in fade-in duration-100">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                            selectedCategory === cat ? 'bg-[#d8eaf8] text-[#0091ff]' : 'text-[#1c3352] hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-[#cbd5e1]/40 pb-2">
                <div className="flex items-center gap-8">
                  <button
                    onClick={() => setActiveTab('Recommended')}
                    className={`text-xs font-bold transition-colors cursor-pointer pb-2 ${
                      activeTab === 'Recommended'
                        ? 'text-[#0091ff] border-b-2 border-[#0091ff]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Recommended
                  </button>
                  <button
                    onClick={() => setActiveTab('Recently Read')}
                    className={`text-xs font-bold transition-colors cursor-pointer pb-2 ${
                      activeTab === 'Recently Read'
                        ? 'text-[#0091ff] border-b-2 border-[#0091ff]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Recently Read
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.info('Previous page')}
                    className="w-7 h-7 rounded-xl bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toast.info('Next page')}
                    className="w-7 h-7 rounded-xl bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 pt-2">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => toast.info(`Opening "${book.title}"...`)}
                    className="flex flex-col cursor-pointer group"
                  >
                    <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-200 border border-[#cbd5e1]/40 bg-white">
                      <img
                        src={book.img}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="mt-3">
                      <h3 className="text-xs font-extrabold text-[#111827] group-hover:text-[#0091ff] transition-colors leading-tight line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {book.author}
                      </p>
                      {activeTab === 'Recently Read' && book.lastRead && (
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          {book.lastRead}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
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
