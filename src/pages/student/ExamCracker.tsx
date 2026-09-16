import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Trophy,
  Search,
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
  Loader2,
  Calendar,
  Sparkles,
  HelpCircle,
  Award,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { mockExamsData } from '../../data/mockExamsData';
import {
  MockExamItem,
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
import {
  competitiveService,
  CompetitiveExamItem,
  PYQQuestion,
} from '../../services/competitiveService';
import { testService } from '../../services/testService';

export default function ExamCracker() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useStudentProfile();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'mocks' | 'pyqs'>('mocks');
  const [activeGoalTab, setActiveGoalTab] = useState<string>('Choose your goal');
  const [examSearch, setExamSearch] = useState('');

  // Dynamic Catalog State from Phase 3A Backend
  const [dynamicExams, setDynamicExams] = useState<MockExamItem[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState<boolean>(true);

  // Exam taking state
  const [activeExamStage, setActiveExamStage] = useState<
    'catalog' | 'instructions' | 'running' | 'analysis'
  >('catalog');
  const [selectedExam, setSelectedExam] = useState<MockExamItem | null>(null);
  const [isPreparingExam, setIsPreparingExam] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<MockExamSessionResult | null>(null);

  // PYQ Section State
  const [pyqs, setPyqs] = useState<PYQQuestion[]>([]);
  const [isLoadingPYQs, setIsLoadingPYQs] = useState<boolean>(false);
  const [pyqExamFilter, setPyqExamFilter] = useState<string>('');
  const [pyqYearFilter, setPyqYearFilter] = useState<string>('');
  const [pyqSubjectFilter, setPyqSubjectFilter] = useState<string>('');
  const [pyqTypeFilter, setPyqTypeFilter] = useState<string>('');
  const [pyqFacets, setPyqFacets] = useState<{ years: number[]; subjects: string[] }>({
    years: [],
    subjects: [],
  });
  const [expandedSolutionId, setExpandedSolutionId] = useState<string | null>(null);

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
    'Engineering',
    'Medical',
    'Government / Staff Selection',
    'Banking',
    'Civil Services',
    'SSC & Bank Exam',
    'Railway Exam',
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

  // Map backend exam into frontend MockExamItem format
  const mapBackendExamToMockItem = (ex: CompetitiveExamItem): MockExamItem => ({
    id: ex.code,
    examCode: ex.code,
    title: ex.name,
    category: ex.category,
    subtitle: `${ex.conductingBody || 'National Agency'} • ${ex.durationMinutes} mins • ${ex.sections.length} Sections`,
    description: ex.description,
    durationMinutes: ex.durationMinutes,
    totalMarks: ex.maxScore || 100,
    totalQuestions: ex.totalQuestions || 25,
    negativeMarking: (ex.markingScheme?.negativeMarks || 0) > 0,
    isLocked: false,
    passPercentage: ex.markingScheme?.cutOffScore
      ? Math.round((ex.markingScheme.cutOffScore / ex.maxScore) * 100)
      : 40,
    sections: ex.sections.map((sec) => ({
      id: sec.id,
      name: sec.name,
      totalQuestions: sec.totalQuestions,
      marksPerQuestion: sec.marksPerQuestion,
      negativeMarks: sec.negativeMarks,
      questions: [],
    })),
    conductingBody: ex.conductingBody,
    supportedSubjects: ex.supportedSubjects,
    markingScheme: ex.markingScheme,
    questionTypes: ex.questionTypes,
    isRealCompetitiveExam: true,
  });

  // Load available competitive exams from backend catalog
  useEffect(() => {
    let isMounted = true;
    const loadExams = async () => {
      setIsLoadingExams(true);
      try {
        const backendExams = await competitiveService.fetchExams();
        if (isMounted) {
          if (backendExams && backendExams.length > 0) {
            const mapped = backendExams.map(mapBackendExamToMockItem);
            setDynamicExams(mapped);
          } else {
            setDynamicExams(mockExamsData);
          }
        }
      } catch (err) {
        console.warn('Backend exam catalog unreachable, using fallback dataset:', err);
        if (isMounted) setDynamicExams(mockExamsData);
      } finally {
        if (isMounted) setIsLoadingExams(false);
      }
    };

    loadExams();
    return () => {
      isMounted = false;
    };
  }, []);

  // Requirement 8: If student profile has competitiveExamDetails.targetExam, make that the natural default
  useEffect(() => {
    if (profile?.competitiveExamDetails?.targetExam) {
      const target = profile.competitiveExamDetails.targetExam.toUpperCase();
      if (target.includes('JEE')) setActiveGoalTab('Engineering');
      else if (target.includes('NEET')) setActiveGoalTab('Medical');
      else if (target.includes('SSC')) setActiveGoalTab('Government / Staff Selection');
      else if (target.includes('BANK')) setActiveGoalTab('Banking');
      else if (target.includes('UPSC')) setActiveGoalTab('Civil Services');

      setPyqExamFilter(target);
    }
  }, [profile]);

  // Load authentic PYQs when PYQ tab or filters change
  useEffect(() => {
    if (activeCatalogTab !== 'pyqs') return;

    let isMounted = true;
    const loadPYQs = async () => {
      setIsLoadingPYQs(true);
      try {
        const res = await competitiveService.fetchPYQs({
          examCode: pyqExamFilter || undefined,
          year: pyqYearFilter ? Number(pyqYearFilter) : undefined,
          subject: pyqSubjectFilter || undefined,
          questionType: pyqTypeFilter || undefined,
          search: examSearch || undefined,
          limit: 30,
        });

        if (isMounted) {
          setPyqs(res.questions || []);
          if (res.facets) {
            setPyqFacets(res.facets);
          }
        }
      } catch (err) {
        console.error('Failed to load authentic PYQs:', err);
        if (isMounted) setPyqs([]);
      } finally {
        if (isMounted) setIsLoadingPYQs(false);
      }
    };

    loadPYQs();
    return () => {
      isMounted = false;
    };
  }, [activeCatalogTab, pyqExamFilter, pyqYearFilter, pyqSubjectFilter, pyqTypeFilter, examSearch]);

  const handleSelectExam = async (exam: MockExamItem) => {
    if (exam.isLocked) {
      setLockedExamTitle(exam.title);
      setShowSubscribeModal(true);
      return;
    }

    // If real competitive exam, fetch live pattern and sections from backend
    if (exam.isRealCompetitiveExam || exam.examCode) {
      try {
        const details = await competitiveService.fetchExamDetails(exam.examCode || exam.id);
        const enriched = mapBackendExamToMockItem(details);
        setSelectedExam(enriched);
      } catch (err) {
        console.warn('Could not fetch details, using item default:', err);
        setSelectedExam(exam);
      }
    } else {
      setSelectedExam(exam);
    }

    setActiveExamStage('instructions');
  };

  // Requirement 3 & 4: Start mock exam by generating a persistent backend test adhering to official pattern
  const handleStartExam = async () => {
    if (!selectedExam) return;

    setIsPreparingExam(true);
    try {
      if (selectedExam.isRealCompetitiveExam || selectedExam.examCode) {
        toast.info(`Preparing ${selectedExam.title} with official CBT layout...`);

        // 1. Generate persistent mock test in backend
        const generated = await competitiveService.generateMockExam({
          examCode: selectedExam.examCode || selectedExam.id,
        });

        // 2. Start attempt session in backend
        const session = await testService.startTest(generated.testId);

        // 3. Fetch masked test questions in 'take' mode
        const testData = await testService.fetchTestById(generated.testId, 'take');

        // 4. Group questions into exam sections
        const questionsBySection: Record<string, any[]> = {};
        (testData.questions || []).forEach((q: any) => {
          const secId = q.sectionId || 'default';
          if (!questionsBySection[secId]) questionsBySection[secId] = [];
          questionsBySection[secId].push({
            id: q.questionId || q._id,
            text: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer || '',
            explanation: q.explanation || '',
            marks: q.marks || 1,
            negativeMarks:
              q.negativeMarks !== undefined
                ? q.negativeMarks
                : selectedExam.markingScheme?.negativeMarks || 0,
            sectionId: secId,
            sectionName: q.sectionName || q.subject || 'General',
            questionType: q.questionType || 'mcq',
            numericalTolerance: q.numericalTolerance,
            sourceType: q.sourceType,
            sourceYear: q.sourceYear,
            sourceExam: q.sourceExam,
            sourceShift: q.sourceShift,
            sourceReference: q.sourceReference,
          });
        });

        const updatedSections = (generated.sections || []).map((sec: any) => ({
          id: sec.id,
          name: sec.name,
          totalQuestions: sec.totalQuestions,
          marksPerQuestion: sec.marksPerQuestion,
          negativeMarks: sec.negativeMarks,
          questions: questionsBySection[sec.id] || [],
        }));

        // If questions didn't match section ids, fallback to putting all in first section
        const totalSectionQuestions = updatedSections.reduce(
          (sum, s) => sum + s.questions.length,
          0
        );
        if (totalSectionQuestions === 0 && updatedSections.length > 0) {
          updatedSections[0].questions = (testData.questions || []).map((q: any) => ({
            id: q.questionId || q._id,
            text: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer || '',
            explanation: q.explanation || '',
            marks: q.marks || 1,
            negativeMarks:
              q.negativeMarks !== undefined
                ? q.negativeMarks
                : selectedExam.markingScheme?.negativeMarks || 0,
            sectionId: updatedSections[0].id,
            sectionName: updatedSections[0].name,
            questionType: q.questionType || 'mcq',
            numericalTolerance: q.numericalTolerance,
          }));
        }

        setSelectedExam({
          ...selectedExam,
          generatedTestId: generated.testId,
          attemptId: session.attemptId,
          sections: updatedSections,
          totalQuestions: testData.questions?.length || selectedExam.totalQuestions,
        });

        setActiveExamStage('running');
      } else {
        setActiveExamStage('running');
      }
    } catch (err: any) {
      console.error('Failed to prepare mock test:', err);
      toast.error(err?.message || 'Failed to start examination. Please try again.');
    } finally {
      setIsPreparingExam(false);
    }
  };

  const handleFinishExam = (result: MockExamSessionResult) => {
    setExamResult(result);
    setActiveExamStage('analysis');
    toast.success('Examination submitted and evaluated successfully!');
  };

  const handleRetakeExam = () => {
    setExamResult(null);
    handleStartExam();
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

  // Combine dynamic exams with existing mock dataset
  const combinedExams = [...dynamicExams];
  mockExamsData.forEach((mock) => {
    if (!combinedExams.some((e) => e.id === mock.id || e.title === mock.title)) {
      combinedExams.push(mock);
    }
  });

  // Filter exams by goal and search
  const filteredExams = combinedExams.filter((exam) => {
    const matchesGoal =
      activeGoalTab === 'Choose your goal' ||
      exam.category === activeGoalTab ||
      (activeGoalTab === 'SSC & Bank Exam' &&
        (exam.category === 'Government / Staff Selection' || exam.category === 'Banking')) ||
      (activeGoalTab === 'JEE & NEET' &&
        (exam.category === 'Engineering' || exam.category === 'Medical'));

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
        <aside className="w-52 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto pt-4 hidden sm:flex">
          <div className="px-4 pb-3">
            <span className="text-xs font-extrabold text-[#1c3352] uppercase tracking-wider">
              Target Goal
            </span>
          </div>
          <div className="px-2 space-y-1.5">
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
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* View Switcher: Mock Exams vs Authentic PYQs */}
            {activeExamStage === 'catalog' && (
              <div className="flex items-center bg-[#eaf2f8] p-1 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setActiveCatalogTab('mocks')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCatalogTab === 'mocks'
                      ? 'bg-white text-[#0091ff] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎯 CBT Mock Tests
                </button>
                <button
                  onClick={() => setActiveCatalogTab('pyqs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCatalogTab === 'pyqs'
                      ? 'bg-white text-[#0091ff] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📜 Authentic PYQ Bank
                </button>
              </div>
            )}
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
                placeholder={
                  activeCatalogTab === 'mocks'
                    ? 'Search mock exams...'
                    : 'Search previous-year questions...'
                }
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
                  isLoading={isPreparingExam}
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
              {activeExamStage === 'catalog' && activeCatalogTab === 'mocks' && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                        Exam Cracker
                      </h1>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Official national pattern CBT examination suite with real-time countdown, negative marking, and estimated All India Rank.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {profile?.competitiveExamDetails?.targetExam && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          Target: {profile.competitiveExamDetails.targetExam}
                        </span>
                      )}
                      <span className="text-xs font-extrabold text-[#0091ff] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                        Category: {activeGoalTab}
                      </span>
                    </div>
                  </div>

                  {isLoadingExams ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0091ff] animate-spin" />
                      <p className="text-xs text-slate-500 font-medium">
                        Loading national competitive examination catalog...
                      </p>
                    </div>
                  ) : filteredExams.length === 0 ? (
                    <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                      <Award className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-base font-extrabold text-slate-800">
                        No examination mocks found
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        No competitive examinations match the selected category &quot;{activeGoalTab}&quot;. Select &quot;Choose your goal&quot; to view all available national examinations.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setActiveGoalTab('Choose your goal')}
                        className="text-xs font-bold"
                      >
                        Reset Filter
                      </Button>
                    </div>
                  ) : (
                    /* Mock Exams Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      {filteredExams.map((exam) => {
                        const isTargetExam =
                          profile?.competitiveExamDetails?.targetExam &&
                          (exam.examCode === profile.competitiveExamDetails.targetExam ||
                            exam.id === profile.competitiveExamDetails.targetExam);

                        return (
                          <div
                            key={exam.id}
                            onClick={() => handleSelectExam(exam)}
                            className={`bg-white rounded-3xl border p-6 shadow-2xs hover:shadow-md transition-all duration-200 relative cursor-pointer flex flex-col justify-between h-56 group ${
                              isTargetExam
                                ? 'border-[#0091ff] ring-2 ring-[#0091ff]/20 bg-gradient-to-b from-blue-50/20 to-white'
                                : exam.isLocked
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
                                {isTargetExam && (
                                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                    Your Target
                                  </span>
                                )}
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
                                  exam.isLocked
                                    ? 'text-amber-600'
                                    : 'text-[#0091ff] group-hover:underline'
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
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Authentic PYQ Bank View */}
              {activeExamStage === 'catalog' && activeCatalogTab === 'pyqs' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                        Authentic Previous-Year Questions (PYQs)
                      </h1>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Sourced exclusively from verified official national examination papers. Never AI-generated.
                      </p>
                    </div>

                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      100% Verified Authentic Question Bank
                    </span>
                  </div>

                  {/* PYQ Filter Bar */}
                  <div className="bg-white rounded-3xl border border-[#e2ebf4] p-4 shadow-2xs flex flex-wrap items-center gap-3">
                    {/* Exam Filter */}
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                        Examination
                      </label>
                      <select
                        value={pyqExamFilter}
                        onChange={(e) => setPyqExamFilter(e.target.value)}
                        className="w-full text-xs font-bold bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-[#0091ff]"
                      >
                        <option value="">All Exams</option>
                        <option value="JEE_MAIN">JEE Main</option>
                        <option value="NEET_UG">NEET UG</option>
                        <option value="SSC_CGL">SSC CGL</option>
                        <option value="BANKING_IBPS_PO">Banking (IBPS PO)</option>
                        <option value="UPSC_CSE">UPSC Civil Services</option>
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div className="w-28">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                        Year
                      </label>
                      <select
                        value={pyqYearFilter}
                        onChange={(e) => setPyqYearFilter(e.target.value)}
                        className="w-full text-xs font-bold bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-[#0091ff]"
                      >
                        <option value="">All Years</option>
                        {pyqFacets.years.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject Filter */}
                    <div className="flex-1 min-w-[140px]">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                        Subject
                      </label>
                      <select
                        value={pyqSubjectFilter}
                        onChange={(e) => setPyqSubjectFilter(e.target.value)}
                        className="w-full text-xs font-bold bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-[#0091ff]"
                      >
                        <option value="">All Subjects</option>
                        {pyqFacets.subjects.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Question Type Filter */}
                    <div className="w-36">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                        Question Type
                      </label>
                      <select
                        value={pyqTypeFilter}
                        onChange={(e) => setPyqTypeFilter(e.target.value)}
                        className="w-full text-xs font-bold bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-[#0091ff]"
                      >
                        <option value="">All Types</option>
                        <option value="mcq">Multiple Choice (MCQ)</option>
                        <option value="nat">Numerical (NAT)</option>
                      </select>
                    </div>

                    {/* Clear Button */}
                    {(pyqExamFilter || pyqYearFilter || pyqSubjectFilter || pyqTypeFilter) && (
                      <div className="pt-4">
                        <button
                          onClick={() => {
                            setPyqExamFilter('');
                            setPyqYearFilter('');
                            setPyqSubjectFilter('');
                            setPyqTypeFilter('');
                          }}
                          className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PYQ Question List */}
                  {isLoadingPYQs ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0091ff] animate-spin" />
                      <p className="text-xs text-slate-500 font-medium">
                        Fetching authentic previous-year questions...
                      </p>
                    </div>
                  ) : pyqs.length === 0 ? (
                    <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-base font-extrabold text-slate-800">
                        No previous-year questions found
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Try resetting your exam or year filters to view all available official PYQs.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pyqs.map((q, idx) => {
                        const isExpanded = expandedSolutionId === q._id;
                        return (
                          <div
                            key={q._id}
                            className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-2xs hover:shadow-xs transition-all space-y-4"
                          >
                            {/* Card Top Badges */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-extrabold text-[#0091ff]">Q{idx + 1}.</span>
                                <span className="px-2.5 py-0.5 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase">
                                  {q.sourceExam} • {q.sourceYear}
                                </span>
                                {q.sourceShift && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                    {q.sourceShift}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  {q.subject} {q.topic ? `• ${q.topic}` : ''}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold uppercase">
                                  {q.questionType === 'nat' ? 'Numerical Answer (NAT)' : 'MCQ'}
                                </span>
                              </div>

                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Official Paper Item
                              </span>
                            </div>

                            {/* Reference snippet */}
                            {q.sourceReference && (
                              <div className="text-[11px] font-semibold text-slate-400 italic">
                                Sourced from: {q.sourceReference}
                              </div>
                            )}

                            {/* Question Content */}
                            <div className="text-sm sm:text-base font-bold text-[#111827] leading-relaxed whitespace-pre-line">
                              {q.question}
                            </div>

                            {/* Options or NAT view */}
                            {q.questionType === 'nat' ? (
                              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                                <span className="text-slate-500 font-bold">Numerical Question:</span>
                                <span className="text-slate-700 font-semibold italic">
                                  Type calculated integer/decimal response in mock CBT mode
                                </span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {q.options.map((opt) => (
                                  <div
                                    key={opt.id}
                                    className="p-3 bg-[#f8fafc] rounded-xl border border-slate-200 text-xs flex items-center gap-3 text-slate-700"
                                  >
                                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                      {opt.id}
                                    </span>
                                    <span>{opt.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Expand Solution Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <button
                                onClick={() =>
                                  setExpandedSolutionId(isExpanded ? null : q._id)
                                }
                                className="text-xs font-bold text-[#0091ff] hover:underline cursor-pointer flex items-center gap-1.5"
                              >
                                <span>
                                  {isExpanded ? 'Hide Verified Solution' : 'View Verified Solution'}
                                </span>
                                <span>&rarr;</span>
                              </button>

                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <span className="text-emerald-600">+{q.marks} Marks</span>
                                {q.negativeMarks > 0 && (
                                  <span className="text-rose-500">-{q.negativeMarks} Neg</span>
                                )}
                              </div>
                            </div>

                            {/* Verified Solution Section */}
                            {isExpanded && (
                              <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl text-xs space-y-2 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                    Official Answer:
                                  </span>
                                  <span className="font-mono font-extrabold text-emerald-900 bg-white px-2.5 py-0.5 rounded-md border border-emerald-300">
                                    {q.questionType === 'nat'
                                      ? `${q.numericalAnswer ?? q.correctAnswer} (Tolerance: ±${q.numericalTolerance || 0})`
                                      : `Option (${q.correctAnswer})`}
                                  </span>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium">
                                  {q.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
