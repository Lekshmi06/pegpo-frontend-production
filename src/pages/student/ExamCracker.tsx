import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Trophy,
  Search,
  ChevronDown,
  Plus,
  MessageSquare,
  BookOpen,
  Mic,
  Video,
  Brain,
  FileText,
  CheckCircle2,
  Layers,
  TrendingUp,
  RotateCcw,
  NotebookPen,
  Bookmark,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { mockExamsData } from '../../data/mockExamsData';
import {
  MockExamItem,
  MockExamGoal,
  MockExamSessionResult,
} from '../../types/testTypes';
import { MockExamInstructions } from '../../components/student/exam-cracker/MockExamInstructions';
import { MockExamRunner } from '../../components/student/exam-cracker/MockExamRunner';
import { MockExamAnalysis } from '../../components/student/exam-cracker/MockExamAnalysis';
import { SubscribeModal } from '../../components/student/common/SubscribeModal';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useStudentProfile } from '../../hooks/useStudentProfile';

export default function ExamCracker() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useStudentProfile();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeGoalTab, setActiveGoalTab] = useState<string>('Choose your goal');
  const [examSearch, setExamSearch] = useState('');

  // Exam taking state
  const [activeExamStage, setActiveExamStage] = useState<
    'catalog' | 'instructions' | 'running' | 'analysis'
  >('catalog');
  const [selectedExam, setSelectedExam] = useState<MockExamItem | null>(null);
  const [examResult, setExamResult] = useState<MockExamSessionResult | null>(null);

  // Subscribe modal
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [lockedExamTitle, setLockedExamTitle] = useState('');

  // Right sidebar actions & graphic cards
  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{
    title: string;
    img: string;
    desc: string;
  } | null>(null);

  const goals = [
    'Choose your goal',
    'SSC & Bank Exam',
    'Railway Exam',
    'JEE & NEET',
    'CBSE Board Mocks',
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
    {
      id: 'smartboard',
      title: 'Smart Bord /Projects',
      img: cardSmartboard,
      desc: 'Interactive digital chalkboard for group project simulations.',
    },
    {
      id: 'combine',
      title: 'Combine Study',
      img: cardCombine,
      desc: 'Collaborative live study rooms with peers and tutors.',
    },
    {
      id: 'slide',
      title: 'Slide',
      img: cardSlide,
      desc: 'AI-generated presentation decks for key syllabus concepts.',
    },
    {
      id: 'infographics',
      title: 'Info Graphics',
      img: cardInfographics,
      desc: 'Visual flowcharts, diagrams, and memory maps.',
    },
  ];

  const handleSelectExam = (exam: MockExamItem) => {
    if (exam.isLocked) {
      setLockedExamTitle(exam.title);
      setShowSubscribeModal(true);
      return;
    }
    setSelectedExam(exam);
    setActiveExamStage('instructions');
  };

  const handleStartExam = () => {
    setActiveExamStage('running');
  };

  const handleFinishExam = (result: MockExamSessionResult) => {
    setExamResult(result);
    setActiveExamStage('analysis');
    toast.success('Examination submitted and evaluated successfully!');
  };

  const handleRetakeExam = () => {
    setExamResult(null);
    setActiveExamStage('running');
  };

  const handleBackToCatalog = () => {
    setSelectedExam(null);
    setExamResult(null);
    setActiveExamStage('catalog');
  };

  const handleCreateActionClick = (label: string) => {
    if (label === 'Quiz') {
      navigate('/student/quiz');
      return;
    }
    if (label === 'Flash Card') {
      navigate('/student/practice');
      return;
    }
    setModalTitle(`Create ${label}`);
    setSelectedActionLabel(label);
    setActiveModal('action');
  };

  const handleGraphicCardClick = (card: { title: string; img: string; desc: string }) => {
    setModalTitle(card.title);
    setSelectedGraphicCard(card);
    setActiveModal('graphic');
  };

  // Filter exams by goal and search
  const filteredExams = mockExamsData.filter((exam) => {
    const matchesGoal =
      activeGoalTab === 'Choose your goal' || exam.category === activeGoalTab;
    const matchesSearch =
      !examSearch ||
      exam.title.toLowerCase().includes(examSearch.toLowerCase()) ||
      exam.description.toLowerCase().includes(examSearch.toLowerCase());
    return matchesGoal && matchesSearch;
  });

  // Render Full Screen CBT Runner if in running stage
  if (activeExamStage === 'running' && selectedExam) {
    return (
      <MockExamRunner
        exam={selectedExam}
        studentProfile={profile}
        onExit={handleBackToCatalog}
        onFinishExam={handleFinishExam}
      />
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden text-slate-800">
      {/* Premium Subscription Modal */}
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        title="Unlock All Competitive Mock Exams"
        category={lockedExamTitle || 'Mock Exams'}
      />

      {/* Action/Graphic Modals */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for {activeGoalTab}.
            </p>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} created for Exam Cracker!`);
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
              <img
                src={selectedGraphicCard.img}
                alt={selectedGraphicCard.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {selectedGraphicCard.desc}
            </p>
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

      {/* Left Goals Sidebar */}
      {activeExamStage === 'catalog' && (
        <aside className="w-48 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto pt-4 hidden sm:flex">
          <div className="px-3 pb-3">
            <span className="text-xs font-extrabold text-[#1c3352] uppercase tracking-wider">
              Target Goal
            </span>
          </div>
          <div className="px-2 space-y-2">
            {goals.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGoalTab(g)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeGoalTab === g
                    ? 'bg-white text-[#0091ff] shadow-xs'
                    : 'text-[#1c3352] hover:bg-white/40'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
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
                placeholder="Search mock exams..."
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button
              onClick={() => toast.info('Viewing National Rankings')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Leaderboard & Rankings"
            >
              <Trophy className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative">
              <button
                onClick={() => navigate('/student/profile')}
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs hover:ring-2 hover:ring-[#0091ff]/30 transition-all cursor-pointer block"
                title="Student Profile"
              >
                <img
                  src={profile?.avatar || userImg}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-52 bg-[#f0f6fc] border border-[#d8eaf8] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                  {['Help & Tools', 'Feed Back', 'Quick Guide', 'Settings'].map((pill) => (
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

        {/* Content Flow */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              {/* Instructions View */}
              {activeExamStage === 'instructions' && selectedExam && (
                <MockExamInstructions
                  exam={selectedExam}
                  onBack={handleBackToCatalog}
                  onStartExam={handleStartExam}
                />
              )}

              {/* Analysis View */}
              {activeExamStage === 'analysis' && examResult && (
                <MockExamAnalysis
                  result={examResult}
                  onRetake={handleRetakeExam}
                  onBackToCatalog={handleBackToCatalog}
                />
              )}

              {/* Catalog View */}
              {activeExamStage === 'catalog' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                        Exam Cracker
                      </h1>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        National-level CBT mock examination suite with real-time countdown, negative marking, and performance percentiles.
                      </p>
                    </div>

                    <span className="text-xs font-extrabold text-[#0091ff] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                      Goal: {activeGoalTab}
                    </span>
                  </div>

                  {/* Mock Exams Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {filteredExams.map((exam) => (
                      <div
                        key={exam.id}
                        onClick={() => handleSelectExam(exam)}
                        className={`bg-white rounded-3xl border p-6 shadow-2xs hover:shadow-md transition-all duration-200 relative cursor-pointer flex flex-col justify-between h-56 group ${
                          exam.isLocked
                            ? 'border-amber-200 hover:border-amber-400'
                            : 'border-[#e2ebf4] hover:border-[#0091ff]/50'
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`"${exam.title}" pinned to your revision schedule!`);
                          }}
                          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Pin Exam"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        <div className="space-y-2 pr-6">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase">
                              {exam.category}
                            </span>
                            {exam.negativeMarking && (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                                Negative Marking
                              </span>
                            )}
                          </div>

                          <h3
                            className={`text-base font-extrabold transition-colors leading-snug line-clamp-2 ${
                              exam.isLocked
                                ? 'text-[#111827] group-hover:text-amber-600'
                                : 'text-[#111827] group-hover:text-[#0091ff]'
                            }`}
                          >
                            {exam.title}
                          </h3>

                          <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {exam.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span
                            className={`text-xs font-bold ${
                              exam.isLocked ? 'text-amber-600' : 'text-[#0091ff] group-hover:underline'
                            }`}
                          >
                            {exam.isLocked ? 'Premium Locked' : 'Start CBT Mock &rarr;'}
                          </span>

                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                            {exam.isLocked ? (
                              <Lock className="w-4 h-4 text-amber-500" />
                            ) : (
                              <span>
                                {exam.totalQuestions} Qs • {exam.durationMinutes}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar (Create Actions + Visual Workspaces) */}
          {activeExamStage === 'catalog' && (
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
                        <span className="text-[10px] font-bold mt-1 text-[#1c3352]">
                          {act.label}
                        </span>
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
