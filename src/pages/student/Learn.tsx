import React, { useState } from 'react';
import {
  Search,
  Clock,
  TrendingUp, Mic, Video,
  Plus, MessageSquare, Brain, FileText, CheckCircle2, Layers,
  RotateCcw, NotebookPen, Bookmark, Upload as UploadIcon, Send,
  Globe, Trophy, ArrowLeft, Pause, BookOpen
} from 'lucide-react';

import userImg from '../../assets/user.png';
import subjectPhysics from '../../assets/subject-physics.jpg';
import subjectChem from '../../assets/subject-chem.jpg';
import subjectMaths from '../../assets/subject-maths.jpg';
import subjectBiology from '../../assets/subject-biology.jpg';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface QuizState {
  title: string;
  stage: 'intro' | 'active' | 'completed' | 'review';
  currentQuestionIdx: number;
  answers: Record<number, string>;
  statusByQuestion: Record<number, 'attempted' | 'revise' | 'skipped'>;
  attempted: number;
  reviseLater: number;
  skipped: number;
}

export default function Learn() {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState('Subject');
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<{ id: number; name: string; lessons: number; videos: number; img: string; tag: string } | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizState | null>(null);
  const [board, setBoard] = useState('CBSE');
  const [cbseClass, setCbseClass] = useState('Class 9');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [activeModal, setActiveModal] = useState<'upload' | 'chat' | 'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'user' | 'ai'; text: string }[]>([
    { id: 'msg-1', sender: 'ai', text: 'Hello! What topic would you like to analyse or study today?' }
  ]);

  const quizQuestions = [
    {
      id: 1,
      title: 'A car accelerates from 0 to 20 m/s in 5 seconds. What is its acceleration?',
      sidebarTitle: 'A car accelerates from 0 to 20 m/s in 5 seconds. What is its acceleration?',
      options: [
        { id: 'A', text: '2 m/s²' },
        { id: 'B', text: '3 m/s²' },
        { id: 'C', text: '4 m/s²' },
        { id: 'D', text: '5 m/s²' },
      ],
      correct: 'C'
    },
    {
      id: 2,
      title: 'A car accelerates from 0 to 20 m/s in 5 seconds. What is its acceleration?',
      sidebarTitle: 'What is acceleration ?',
      options: [
        { id: 'A', text: '2 m/s²' },
        { id: 'B', text: '3 m/s²' },
        { id: 'C', text: '4 m/s²' },
        { id: 'D', text: '5 m/s²' },
      ],
      correct: 'C'
    },
    {
      id: 3,
      title: 'A car accelerates from 0 to 20 m/s in 5 seconds. What is its acceleration?',
      sidebarTitle: 'Unit of Acceleration',
      options: [
        { id: 'A', text: '2 m/s²' },
        { id: 'B', text: '3 m/s²' },
        { id: 'C', text: '4 m/s²' },
        { id: 'D', text: '5 m/s²' },
      ],
      correct: 'C'
    },
  ];

  const handleSelectOption = (optId: string) => {
    if (!activeQuiz) return;
    const qIdx = activeQuiz.currentQuestionIdx;
    const prevStatus = activeQuiz.statusByQuestion[qIdx];
    const newAnswers = { ...activeQuiz.answers, [qIdx]: optId };
    const newStatus = { ...activeQuiz.statusByQuestion, [qIdx]: 'attempted' as const };
    
    let attempted = activeQuiz.attempted;
    let reviseLater = activeQuiz.reviseLater;
    let skipped = activeQuiz.skipped;
    
    if (prevStatus === 'revise') reviseLater = Math.max(0, reviseLater - 1);
    if (prevStatus === 'skipped') skipped = Math.max(0, skipped - 1);
    if (prevStatus !== 'attempted') attempted += 1;

    setActiveQuiz(prev => prev ? ({
      ...prev,
      answers: newAnswers,
      statusByQuestion: newStatus,
      attempted,
      reviseLater,
      skipped
    }) : null);
  };

  const handleAttemptLater = () => {
    if (!activeQuiz) return;
    const qIdx = activeQuiz.currentQuestionIdx;
    const prevStatus = activeQuiz.statusByQuestion[qIdx];
    const newStatus = { ...activeQuiz.statusByQuestion, [qIdx]: 'revise' as const };

    let attempted = activeQuiz.attempted;
    let reviseLater = activeQuiz.reviseLater;
    let skipped = activeQuiz.skipped;

    if (prevStatus === 'attempted') attempted = Math.max(0, attempted - 1);
    if (prevStatus === 'skipped') skipped = Math.max(0, skipped - 1);
    if (prevStatus !== 'revise') reviseLater += 1;

    setActiveQuiz(prev => prev ? ({
      ...prev,
      statusByQuestion: newStatus,
      attempted,
      reviseLater,
      skipped,
      currentQuestionIdx: Math.min(quizQuestions.length - 1, qIdx + 1)
    }) : null);
    toast.info('Marked for Revise Later');
  };

  const handleSkip = () => {
    if (!activeQuiz) return;
    const qIdx = activeQuiz.currentQuestionIdx;
    const prevStatus = activeQuiz.statusByQuestion[qIdx];
    const newStatus = { ...activeQuiz.statusByQuestion, [qIdx]: 'skipped' as const };

    let attempted = activeQuiz.attempted;
    let reviseLater = activeQuiz.reviseLater;
    let skipped = activeQuiz.skipped;

    if (prevStatus === 'attempted') attempted = Math.max(0, attempted - 1);
    if (prevStatus === 'revise') reviseLater = Math.max(0, reviseLater - 1);
    if (prevStatus !== 'skipped') skipped += 1;

    setActiveQuiz(prev => prev ? ({
      ...prev,
      statusByQuestion: newStatus,
      attempted,
      reviseLater,
      skipped,
      currentQuestionIdx: Math.min(quizQuestions.length - 1, qIdx + 1)
    }) : null);
  };

  const subSidebarItems = [
    'Subject',
    'Practice',
    'Test',
    'Quiz',
    'History',
    'Search',
    'Game',
    'Home Work',
    'Assignment',
    'Tuition',
    'Combine Study',
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

  const subjectsList = [
    { id: 1, name: 'Physics', lessons: 10, videos: 10, img: subjectPhysics, tag: 'Science' },
    { id: 2, name: 'Chemistry', lessons: 10, videos: 10, img: subjectChem, tag: 'Science' },
    { id: 3, name: 'Chemistry', lessons: 10, videos: 10, img: subjectChem, tag: 'Organic' },
    { id: 4, name: 'Maths', lessons: 10, videos: 10, img: subjectMaths, tag: 'Mathematics' },
    { id: 5, name: 'Biology', lessons: 10, videos: 10, img: subjectBiology, tag: 'Life Science' },
    { id: 6, name: 'Chemistry', lessons: 10, videos: 10, img: subjectChem, tag: 'Inorganic' },
  ];

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now() + 1}`;
    setChatMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: userMsg }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { id: aiMsgId, sender: 'ai', text: `Here is a comprehensive breakdown for "${userMsg}":\n• Core Concept: Key foundational principles and definitions.\n• Formula: Important relations and derivations.\n• Exam Tips: 3 high-yield questions often tested in CBSE Class 9.` }
      ]);
    }, 800);
  };

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
        {activeModal === 'upload' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Upload syllabus PDFs, textbook scans, or lecture documents to automatically generate interactive study cards.
            </p>
            <div className="border-2 border-dashed border-[#5faee3] rounded-2xl p-6 bg-[#f0f6fc] text-center space-y-2 cursor-pointer hover:bg-[#e4effa] transition-colors">
              <UploadIcon className="w-8 h-8 text-[#0091ff] mx-auto" />
              <p className="text-xs font-bold text-[#1c3352]">Drag & drop file here or click to browse</p>
              <p className="text-[10px] text-slate-400 font-semibold">PDF, DOCX, PPTX (Up to 50MB)</p>
            </div>
            <Button
              onClick={() => {
                toast.success('Curriculum uploaded and indexed successfully!');
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Process File
            </Button>
          </div>
        )}

        {activeModal === 'chat' && (
          <div className="space-y-4 flex flex-col h-80">
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#f8fafc] rounded-2xl border border-slate-100">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#1c3352] text-white' 
                      : 'bg-white text-[#1c3352] border border-slate-200 shadow-2xs'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Type any topic e.g. Newton's laws..."
                className="flex-1 px-4 py-2.5 bg-[#f0f6fc] border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#1c3352] focus:outline-none focus:ring-2 focus:ring-[#0091ff]/30"
              />
              <Button size="sm" onClick={handleSendChat}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your active syllabus topic.
            </p>
            <div className="bg-[#f0f6fc] p-4 rounded-xl space-y-2 border border-[#d8eaf8]">
              <label className="text-xs font-bold text-[#1c3352]">Select Chapter / Topic:</label>
              <select className="w-full bg-white border border-[#cbd5e1] rounded-lg p-2 text-xs font-semibold text-[#1c3352] outline-none">
                <option>Physics - 01 Light Reflection & Refraction</option>
                <option>Chemistry - 02 Structure of Atom</option>
                <option>Maths - 01 Number Systems</option>
                <option>Biology - 01 Fundamental Unit of Life</option>
              </select>
            </div>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} created successfully!`);
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

      {activeQuiz && activeQuiz.stage !== 'review' ? (
        <aside className="w-56 bg-white flex flex-col flex-shrink-0 border-r border-[#e2ebf4] select-none overflow-y-auto p-4 space-y-6">
          <div>
            <button 
              onClick={() => setActiveQuiz(null)}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-[#1c3352]"
              title="Exit Quiz"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-[#111827]">Test summery</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#22c55e]"></span>
                  <span>Attempted</span>
                </div>
                <span>{activeQuiz.attempted}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#eab308]"></span>
                  <span>Revise Later</span>
                </div>
                <span>{activeQuiz.reviseLater}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#94a3b8]"></span>
                  <span>Skipped</span>
                </div>
                <span>{activeQuiz.skipped}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold text-[#111827]">Question List</h3>
            <div className="space-y-2">
              {quizQuestions.map((q, idx) => {
                const isCurrent = activeQuiz.currentQuestionIdx === idx && activeQuiz.stage === 'active';
                return (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuiz(prev => prev ? ({ ...prev, currentQuestionIdx: idx, stage: 'active' }) : null)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 text-[11px] font-semibold leading-snug ${
                      isCurrent 
                        ? 'bg-[#dbeafe] text-[#1c3352]' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-xs flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isCurrent ? 'bg-[#bfdbfe] text-[#1c3352]' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="line-clamp-3">{q.sidebarTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      ) : !activeQuiz ? (
        <aside className="w-44 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto hidden sm:flex">
          <div className="h-14 flex items-center px-4 flex-shrink-0">
            <span className="text-xs font-extrabold text-[#1c3352] tracking-wide">
              Learn
            </span>
          </div>

          <div className="px-2 space-y-1.5 pb-4">
            {subSidebarItems.map((item) => {
              const isActive = activeSubTab === item;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setActiveSubTab(item);
                    if (item === 'Subject') setSelectedSubjectDetail(null);
                  }}
                  className={`h-9 w-full text-left px-3 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-[#0091ff] shadow-xs'
                      : 'text-[#1c3352] hover:bg-white/40'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </aside>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeQuiz && activeQuiz.stage === 'review' && (
              <button 
                onClick={() => setActiveQuiz(null)}
                className="mr-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-[#1c3352]"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            <div className="relative">
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="bg-[#d8eaf8] text-[#1c3352] text-xs font-extrabold px-3.5 py-2 rounded-xl border-none outline-none cursor-pointer appearance-none pr-7 shadow-2xs"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State">State Board</option>
              </select>
              <span className="absolute right-2.5 top-2.5 text-[10px] text-[#1c3352] pointer-events-none font-bold">∨</span>
            </div>

            <div className="relative">
              <select
                value={cbseClass}
                onChange={(e) => setCbseClass(e.target.value)}
                className="bg-[#d8eaf8] text-[#1c3352] text-xs font-extrabold px-3.5 py-2 rounded-xl border-none outline-none cursor-pointer appearance-none pr-7 shadow-2xs"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
              <span className="absolute right-2.5 top-2.5 text-[10px] text-[#1c3352] pointer-events-none font-bold">∨</span>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={() => toast.info('Language switched to English')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
            >
              <Globe className="w-6 h-6 text-[#1c3352] stroke-[2.2]" />
            </button>

            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button
              onClick={() => toast.info('Viewing Achievements')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
            >
              <Trophy className="w-6 h-6 text-[#1c3352] stroke-[2.2]" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img 
                  src={userImg} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#d0e3f7] hover:border-[#1c3352] transition-all shadow-2xs cursor-pointer"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-3xl p-3 shadow-2xl space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {['Help & Tools', 'Feed Back', 'Quick Guide', 'Extension', 'Discord', 'Invited ERN', 'Settings'].map((pill) => (
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

              {activeQuiz ? (
                activeQuiz.stage === 'intro' ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">{activeQuiz.title}</h1>
                    <div className="bg-white/80 rounded-3xl p-8 border border-slate-100 shadow-2xs space-y-2 text-xs font-semibold text-slate-700 leading-relaxed">
                      <p>Total Questions: 20 multiple-choice questions</p>
                      <p>Time Limit: 30 minutes</p>
                      <p>Each question has only one correct answer.</p>
                    </div>
                    <div className="flex justify-center pt-2">
                      <Button onClick={() => setActiveQuiz(prev => prev ? ({ ...prev, stage: 'active' }) : null)} className="px-10 py-3">
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                ) : activeQuiz.stage === 'active' ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">{activeQuiz.title}</h1>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#0091ff] transition-all duration-300"
                            style={{ width: `${Math.round(((activeQuiz.currentQuestionIdx) / quizQuestions.length) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                          {Math.round(((activeQuiz.currentQuestionIdx) / quizQuestions.length) * 100)}% Completed
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>00.00.00</span>
                        </div>
                        <button
                          onClick={handleAttemptLater}
                          className="px-4 py-2 bg-[#fef9c3] hover:bg-[#fef08a] text-[#ca8a04] font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          Attempt Later
                        </button>
                        <button
                          onClick={() => toast.info('Quiz paused')}
                          className="p-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1c3352] rounded-xl transition-colors cursor-pointer"
                          title="Pause Quiz"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs space-y-6">
                      <h2 className="text-sm font-bold text-[#0091ff]">
                        {activeQuiz.currentQuestionIdx + 1}. {quizQuestions[activeQuiz.currentQuestionIdx].title}
                      </h2>

                      <div className="space-y-3">
                        {quizQuestions[activeQuiz.currentQuestionIdx].options.map((opt) => {
                          const isSelected = activeQuiz.answers[activeQuiz.currentQuestionIdx] === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleSelectOption(opt.id)}
                              className={`p-3.5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-150 ${
                                isSelected
                                  ? 'bg-[#eff6ff] border-2 border-[#0091ff] shadow-xs'
                                  : 'bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#93c5fd]'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-[#0091ff] text-white' : 'bg-[#e2e8f0] text-[#1c3352]'
                              }`}>
                                {opt.id}
                              </span>
                              <span className="text-xs font-bold text-[#1c3352]">{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        {activeQuiz.currentQuestionIdx > 0 ? (
                          <button
                            onClick={() => setActiveQuiz(prev => prev ? ({ ...prev, currentQuestionIdx: prev.currentQuestionIdx - 1 }) : null)}
                            className="px-6 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-500 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Previous
                          </button>
                        ) : <div />}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSkip}
                          className="px-6 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-500 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Skip
                        </button>

                        {activeQuiz.currentQuestionIdx < quizQuestions.length - 1 ? (
                          <button
                            onClick={() => setActiveQuiz(prev => prev ? ({ ...prev, currentQuestionIdx: prev.currentQuestionIdx + 1 }) : null)}
                            className="px-6 py-2.5 bg-[#c5dff2] hover:bg-[#b0d2eb] text-[#1c3352] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Next
                          </button>
                        ) : (
                          <Button onClick={() => setActiveQuiz(prev => prev ? ({ ...prev, stage: 'completed' }) : null)}>
                            Finish
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeQuiz.stage === 'completed' ? (
                  <div className="flex items-center justify-center py-8 animate-in zoom-in-95 duration-200">
                    <div className="bg-[#fef3c7]/60 border border-[#fde68a] rounded-3xl p-10 max-w-lg w-full text-center shadow-xs space-y-6">
                      <div>
                        <h2 className="text-xl font-extrabold text-[#111827]">Tests Completed</h2>
                        <p className="text-sm font-bold text-[#0091ff] mt-1">Scored : 20/18</p>
                      </div>

                      <div className="flex items-center justify-center gap-4 pt-2">
                        <Button onClick={() => setActiveQuiz(null)}>
                          Back to Home
                        </Button>
                        <Button variant="outline" onClick={() => setActiveQuiz(prev => prev ? ({ ...prev, stage: 'review' }) : null)}>
                          Detailed Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8 py-2 animate-in fade-in duration-200">
                    <div className="text-center space-y-2.5">
                      <h1 className="text-2xl font-extrabold text-[#111827]">Tests Completed</h1>
                      <p className="text-sm font-bold text-[#0091ff]">Scored : 20/18</p>
                      <Button onClick={() => setActiveQuiz(null)} className="mt-4">
                        Back to Home
                      </Button>
                    </div>
                  </div>
                )
              ) : selectedSubjectDetail ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <button
                    onClick={() => setSelectedSubjectDetail(null)}
                    className="text-xs font-bold text-[#0091ff] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    &larr; Back to Subject
                  </button>

                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">{selectedSubjectDetail.name}</h1>
                      <p className="text-xs text-slate-500 font-semibold mt-1">5 Chapters • 10 Video Lessons</p>
                    </div>
                  </div>
                </div>
              ) : activeSubTab === 'Subject' ? (
                <>
                  <div>
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Subject</h1>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {subjectsList.map((subj) => (
                      <div
                        key={subj.id}
                        className="bg-white rounded-3xl border border-[#e2ebf4] p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-200 group relative cursor-pointer"
                        onClick={() => setSelectedSubjectDetail(subj)}
                      >
                        <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50/50">
                          <img 
                            src={subj.img} 
                            alt={subj.name} 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 pl-3 pr-6 space-y-1">
                          <h3 className="text-xl font-extrabold text-[#111827] tracking-tight group-hover:text-[#0091ff] transition-colors">
                            {subj.name}
                          </h3>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`Subject "${subj.name}" added to custom study deck!`);
                          }}
                          className="absolute top-3.5 right-3.5 w-6 h-6 rounded-md bg-[#5faee3] hover:bg-[#469cd4] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                          title="Add to study queue"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">{activeSubTab}</h1>
                  </div>
                </div>
              )}

            </div>
          </div>

          {!activeQuiz && (
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
          )}
        </div>
      </div>
    </div>
  );
}
