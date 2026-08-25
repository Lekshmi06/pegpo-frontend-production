import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload as UploadIcon, Mic, ArrowUp, Globe, Trophy, Search, ChevronDown,
  MessageSquare, BookOpen, Video, Brain, FileText,
  CheckCircle2, Layers, TrendingUp, RotateCcw, NotebookPen, Bookmark,
  Plus, Lightbulb, Paperclip, ThumbsUp, ThumbsDown, Copy, Split
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface UploadedFileItem {
  name: string;
  size: string;
}

export default function Upload() {
  const navigate = useNavigate();
  const toast = useToast();

  const [board, setBoard] = useState('CBSE');
  const [cbseClass, setCbseClass] = useState('Class 9');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'empty' | 'chat'>('empty');
  const [sourceInput, setSourceInput] = useState('');
  const [chatQuery, setChatQuery] = useState('sole source provided i');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([
    { name: 'History of Beauty - Umberto Eco.pdf', size: '12.4 MB' },
  ]);
  const [noteSaved, setNoteSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | 'paste' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);
  const [pasteText, setPasteText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = files.map((f) => ({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(1) + ' MB' }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setViewMode('chat');
      toast.success(`Uploaded ${files.length} source file(s) & generated AI notes!`);
    }
  };

  const handleBottomSubmit = () => {
    if (!sourceInput.trim()) {
      setViewMode('chat');
      toast.info('Switched to Source Analysis & Chat view');
      return;
    }
    setUploadedFiles((prev) => [...prev, { name: sourceInput.trim(), size: 'Web Source' }]);
    setViewMode('chat');
    toast.success(`Added "${sourceInput}" & synthesized AI insights!`);
    setSourceInput('');
  };

  const handleSendChat = () => {
    if (!chatQuery.trim()) return;
    toast.info(`AI query submitted: "${chatQuery}"`);
    setChatQuery('');
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp3,.mp4,.wav,.txt"
      />

      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your active uploaded materials.
            </p>
            <div className="bg-[#f0f6fc] p-4 rounded-xl space-y-2 border border-[#d8eaf8]">
              <label className="text-xs font-bold text-[#1c3352]">Select Uploaded Source:</label>
              <select className="w-full bg-white border border-[#cbd5e1] rounded-lg p-2 text-xs font-semibold text-[#1c3352] outline-none">
                <option>History of Beauty Edited by Umberto Eco</option>
                {uploadedFiles.map((f, i) => (
                  <option key={`${f.name}-${i}`}>{f.name}</option>
                ))}
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

        {activeModal === 'paste' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Paste a YouTube URL, web article link, or study text to generate notes & flashcards.
            </p>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or paste text here"
              className="w-full bg-[#f8fbfe] border border-[#cbd5e1] rounded-2xl p-3.5 text-xs font-medium text-[#1c3352] outline-none placeholder:text-slate-400 focus:border-[#0091ff]"
            />
            <Button
              onClick={() => {
                if (pasteText.trim()) {
                  setUploadedFiles((prev) => [...prev, { name: pasteText.trim().substring(0, 30) + '...', size: 'Web Source' }]);
                  setViewMode('chat');
                  toast.success('Source processed & added to workspace!');
                }
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Process Source
            </Button>
          </div>
        )}
      </Modal>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
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
                placeholder="Search uploads..."
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
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Upload</h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode(viewMode === 'empty' ? 'chat' : 'empty')}
                    className="px-3 py-1 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#1c3352] rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Split className="w-3.5 h-3.5 text-[#0091ff]" />
                    <span>{viewMode === 'empty' ? 'View Analysis' : 'Upload Another'}</span>
                  </button>
                </div>
              </div>

              {viewMode === 'empty' ? (
                <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs min-h-[500px] flex flex-col justify-between animate-in fade-in duration-150">
                  <div className="flex-1 flex items-center justify-center py-16">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-[#cbd5e1]/60 hover:border-[#0091ff] rounded-3xl p-10 max-w-sm w-full text-center cursor-pointer transition-all duration-200 hover:shadow-md group bg-white"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#f0f6fc] group-hover:bg-[#d8eaf8] text-[#1c3352] group-hover:text-[#0091ff] flex items-center justify-center mx-auto transition-colors shadow-2xs">
                        <UploadIcon className="w-7 h-7 stroke-[2.2]" />
                      </div>
                      <h3 className="text-sm font-extrabold text-[#111827] mt-4 group-hover:text-[#0091ff] transition-colors">
                        Add a source to get started
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Upload a source
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#e2ebf4] bg-[#f8fbfe] rounded-2xl p-2 px-4 flex items-center justify-between gap-3 shadow-2xs">
                    <input
                      type="text"
                      value={sourceInput}
                      onChange={(e) => setSourceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleBottomSubmit();
                      }}
                      placeholder="Upload a source"
                      className="w-full bg-transparent text-xs font-semibold text-[#1c3352] outline-none placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleBottomSubmit}
                      className="w-8 h-8 rounded-xl bg-[#c5dff2] hover:bg-[#b0d2eb] text-[#1c3352] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                      title="Upload Source"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in duration-150">
                  <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-xs flex flex-col justify-between min-h-[520px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-slate-500">Sources</h3>
                        <button
                          onClick={() => setViewMode('empty')}
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Switch View"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <line x1="9" y1="3" x2="9" y2="21" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-1.5 px-3 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#1c3352] rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#1c3352]" />
                          <span>Add</span>
                        </button>

                        <button
                          onClick={() => toast.info('Searching library archives for related sources...')}
                          className="flex-1 py-1.5 px-3 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#1c3352] rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Search className="w-3.5 h-3.5 text-[#1c3352]" />
                          <span>Discover</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-[#f0f6fc] text-slate-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Saved Sources
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>{uploadedFiles.length} source file active</span>
                      <span className="text-[#0091ff]">Ready for chat</span>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs flex flex-col justify-between min-h-[520px]">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-500">Chat</h3>
                      </div>

                      <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">
                        History of Beauty Edited by Umberto Eco
                      </h2>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        The sole source provided is an image of the book cover for History of Beauty, which was edited by Umberto Eco and published by Rizzoli. The cover art features a portrait of an elegant woman wearing ornate jewellery against a deep blue background. This image clearly indicates the source is a non-fiction text dedicated to exploring the concept and evolution of beauty over time.
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => {
                            setNoteSaved(true);
                            toast.success('Summary saved to your Notes shelf!');
                          }}
                          className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            noteSaved
                              ? 'bg-[#dcfce7] border border-[#86efac] text-[#15803d]'
                              : 'bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#1c3352]'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{noteSaved ? 'Note Saved' : 'Save Note'}</span>
                        </button>

                        <div className="flex items-center gap-3 text-slate-500">
                          <button
                            onClick={() => toast.info('Summary copied to clipboard!')}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-600"
                            title="Copy Summary"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setLiked(!liked);
                              if (!liked) toast.info('Marked as helpful!');
                            }}
                            className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${
                              liked ? 'text-[#0091ff]' : 'text-slate-600'
                            }`}
                            title="Thumbs Up"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setDisliked(!disliked);
                              if (!disliked) toast.info('Feedback recorded.');
                            }}
                            className={`p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${
                              disliked ? 'text-rose-500' : 'text-slate-600'
                            }`}
                            title="Thumbs Down"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border border-[#e2ebf4] bg-[#f8fbfe] rounded-2xl p-3.5 flex flex-col justify-between mt-6 shadow-2xs">
                      <input
                        type="text"
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendChat();
                        }}
                        placeholder="Ask anything about this source..."
                        className="w-full bg-transparent text-xs font-semibold text-[#1c3352] outline-none placeholder:text-slate-400 pb-3"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 text-slate-600">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1 hover:bg-[#d8eaf8] rounded-lg transition-colors cursor-pointer"
                            title="Add Source File"
                          >
                            <Plus className="w-4 h-4 text-[#1c3352]" />
                          </button>

                          <button
                            onClick={() => toast.info('AI generating key concept insights...')}
                            className="p-1 hover:bg-[#d8eaf8] rounded-lg transition-colors cursor-pointer"
                            title="Concept Insights"
                          >
                            <Lightbulb className="w-4 h-4 text-[#1c3352]" />
                          </button>

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1 hover:bg-[#d8eaf8] rounded-lg transition-colors cursor-pointer"
                            title="Attach File"
                          >
                            <Paperclip className="w-4 h-4 text-[#1c3352]" />
                          </button>

                          <button
                            onClick={() => toast.info('Listening to voice prompt...')}
                            className="p-1 hover:bg-[#d8eaf8] rounded-lg transition-colors cursor-pointer"
                            title="Voice Query"
                          >
                            <Mic className="w-4 h-4 text-[#1c3352]" />
                          </button>
                        </div>

                        <button
                          onClick={handleSendChat}
                          className="w-8 h-8 rounded-xl bg-[#c5dff2] hover:bg-[#b0d2eb] text-[#1c3352] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                          title="Submit Prompt"
                        >
                          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
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
