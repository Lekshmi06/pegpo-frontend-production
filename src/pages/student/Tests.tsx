import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Lock,
  Zap,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Clock,
  EyeOff,
} from 'lucide-react';
import userImg from '../../assets/user.png';
import { testService } from '../../services/testService';
import { TestItem, TestResult, QuestionStatus } from '../../types/test';
import TestTakingView from '../../components/student/tests/TestTakingView';
import TestAnalysisView from '../../components/student/tests/TestAnalysisView';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { useToast } from '../../hooks/useToast';
import { useStudentProfile } from '../../hooks/useStudentProfile';

const ACTIVE_TEST_STORAGE_KEY = 'edupye_active_test_session';

function parseTimeString(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 0, minutes: 0 };
  const trimmed = timeStr.trim();
  const isPM = /pm/i.test(trimmed);
  const isAM = /am/i.test(trimmed);
  const clean = trimmed.replace(/[^\d:]/g, '');
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return { hours: h, minutes: m };
}

function computeClientWindowStatus(testItem: TestItem): 'upcoming' | 'active' | 'closed' | 'open' {
  if (!testItem.usages?.scheduledTest || !testItem.schedule) {
    return 'open';
  }

  const now = new Date();

  // 1. Explicit ISO startDate/endDate
  if (testItem.schedule.startDate) {
    const start = new Date(testItem.schedule.startDate);
    const end = testItem.schedule.endDate
      ? new Date(testItem.schedule.endDate)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    if (now < start) return 'upcoming';
    if (now > end) return 'closed';
    return 'active';
  }

  // 2. Parse scheduledDate and startTime/endTime in student's local browser timezone
  if (testItem.schedule.scheduledDate) {
    const rawDateStr =
      typeof testItem.schedule.scheduledDate === 'string'
        ? testItem.schedule.scheduledDate.split('T')[0]
        : new Date(testItem.schedule.scheduledDate).toISOString().split('T')[0];

    const [yr, mo, dy] = rawDateStr.split('-').map(Number);
    const startParsed = parseTimeString(testItem.schedule.startTime || '00:00');
    const endParsed = parseTimeString(testItem.schedule.endTime || '23:59');

    const startWindow = new Date(yr, mo - 1, dy, startParsed.hours, startParsed.minutes, 0, 0);
    const endWindow = new Date(yr, mo - 1, dy, endParsed.hours, endParsed.minutes, 59, 999);

    if (now < startWindow) return 'upcoming';
    if (now > endWindow) return 'closed';
    return 'active';
  }

  return testItem.windowStatus || 'open';
}

export default function Tests() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTestId = searchParams.get('testId');
  const toast = useToast();
  const { profile } = useStudentProfile();

  const [activeSubTab, setActiveSubTab] = useState('Test');

  const [tests, setTests] = useState<TestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTest, setActiveTest] = useState<TestItem | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const autoStartedTestIdRef = React.useRef<string | null>(null);
  const [clockTick, setClockTick] = useState<number>(0);

  // Dynamic 15-second clock tick to automatically refresh scheduled exam window status
  useEffect(() => {
    const interval = setInterval(() => setClockTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedLockedTitle, setSelectedLockedTitle] = useState('');

  const subSidebarItems = [
    { label: 'Subject', path: '/student/learn' },
    { label: 'Practice', path: '/student/practice' },
    { label: 'Test', path: '/student/tests' },
    { label: 'Games', path: '/student/tests' },
    { label: 'Quiz', path: '/student/quiz' },
    { label: 'Combine Study', path: '/student/learn' },
  ];

  // Restore active test session on page refresh if one exists
  useEffect(() => {
    const saved = sessionStorage.getItem(ACTIVE_TEST_STORAGE_KEY);
    if (saved && !activeTest && !testResult) {
      try {
        const { testId, attemptId } = JSON.parse(saved);
        if (testId) {
          testService
            .fetchTestById(testId, 'take')
            .then((fullTest) => {
              setActiveTest(fullTest);
              setActiveAttemptId(attemptId);
            })
            .catch(() => {
              sessionStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
            });
        }
      } catch {
        sessionStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
      }
    }
  }, [activeTest, testResult]);

  // Fetch tests from backend API matching student's board and class
  const loadTests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const studentBoard = profile?.education?.board || profile?.schoolDetails?.board;
      const studentClass = profile?.education?.classLevel || profile?.schoolDetails?.classLevel;

      const data = await testService.fetchTests({
        board: studentBoard,
        classLevel: studentClass,
      });

      setTests(data);
    } catch (err) {
      console.error('Failed to load tests from backend:', err);
      setError(err instanceof Error ? err.message : 'Unable to connect to tests service');
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handleSubTabClick = (item: { label: string; path: string }) => {
    setActiveSubTab(item.label);
    if (item.label === 'Subject') {
      navigate('/student/learn');
    } else if (item.label === 'Practice') {
      navigate('/student/practice');
    } else if (item.label === 'Quiz') {
      navigate('/student/quiz');
    } else if (item.label === 'Combine Study') {
      navigate('/student/learn');
    } else {
      // Reset active views
      sessionStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
      setActiveTest(null);
      setTestResult(null);
      setActiveAttemptId(undefined);
    }
  };

  const handleStartTest = async (testItem: TestItem) => {
    if (testItem.isLocked) {
      setSelectedLockedTitle(testItem.title);
      setShowSubscribeModal(true);
      return;
    }

    // 1. If already submitted / finished, prevent re-attempt
    if (testItem.hasAttempted) {
      if (testItem.isResultPublished && testItem.studentAttemptId) {
        try {
          const analysis = await testService.fetchAttemptAnalysis(testItem.studentAttemptId);
          const fullTest = await testService.fetchTestById(testItem.id || testItem._id!, 'preview');
          setActiveTest(fullTest);
          setTestResult(analysis);
        } catch {
          toast.info('Results published. Loading full analysis report...');
        }
        return;
      }

      toast.info('You have already submitted this scheduled exam. Results and explanations will appear once published by your teacher.');
      return;
    }

    // 2. Dynamic time window validation against local clock
    if (testItem.usages?.scheduledTest) {
      const windowStatus = computeClientWindowStatus(testItem);

      if (windowStatus === 'upcoming') {
        const timeStr = testItem.schedule?.startTime ? ` at ${testItem.schedule.startTime}` : '';
        const dateStr = testItem.schedule?.scheduledDate
          ? ` on ${new Date(testItem.schedule.scheduledDate).toLocaleDateString()}`
          : '';
        toast.error(`This scheduled exam has not started yet. Exam opens${dateStr}${timeStr}.`);
        return;
      }
      if (windowStatus === 'closed') {
        toast.error('This scheduled exam is now closed. Submissions are no longer accepted.');
        return;
      }
    }

    const testId = testItem.id || testItem._id!;
    try {
      // 1. Fetch complete questions with answer masking for student taking mode (if not already full)
      let fullTest = testItem;
      if (!testItem.questions || testItem.questions.length === 0) {
        fullTest = await testService.fetchTestById(testId, 'take');
      }

      // Check if untimed mode requested
      const isUntimed = searchParams.get('untimed') === 'true' || fullTest.durationMinutes === 0;
      if (isUntimed) {
        fullTest.durationMinutes = 0;
        fullTest.isUntimed = true;
      }

      // 2. Start or resume attempt session in backend
      const attemptMode: 'practice' | 'scheduled_test' =
        fullTest.usages?.practice && !fullTest.usages?.scheduledTest ? 'practice' : 'scheduled_test';

      const session = await testService.startTest(testId, attemptMode);

      // Store in session storage for refresh recovery
      sessionStorage.setItem(
        ACTIVE_TEST_STORAGE_KEY,
        JSON.stringify({ testId, attemptId: session.attemptId, isUntimed, test: fullTest, attemptMode })
      );

      setActiveAttemptId(session.attemptId);
      setActiveTest(fullTest);
      setTestResult(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to launch test session');
    }
  };

  // Automatically start test if testId query param is present (e.g. from EduPye AI PYQ link)
  useEffect(() => {
    if (!urlTestId) {
      autoStartedTestIdRef.current = null;
      return;
    }
    if (
      autoStartedTestIdRef.current !== urlTestId &&
      (!activeTest || (activeTest.id !== urlTestId && activeTest._id !== urlTestId))
    ) {
      autoStartedTestIdRef.current = urlTestId;
      handleStartTest({ _id: urlTestId, title: 'Previous Year Question Test', isLocked: false } as any);
    }
  }, [urlTestId, activeTest]);

  const handleFinishTest = async (results: {
    attemptId?: string;
    answers: Record<number | string, string>;
    statusByQuestion: Record<number | string, QuestionStatus>;
    timeSpentSeconds: number;
  }) => {
    if (!activeTest) return;

    const testId = activeTest.id || activeTest._id!;
    setIsSubmitting(true);

    const attemptMode: 'practice' | 'scheduled_test' =
      activeTest.usages?.practice && !activeTest.usages?.scheduledTest ? 'practice' : 'scheduled_test';

    try {
      // Submit to backend evaluation engine
      const evaluatedResult = await testService.submitTest(testId, {
        attemptId: results.attemptId || activeAttemptId,
        answers: results.answers,
        statusByQuestion: results.statusByQuestion,
        timeSpentSeconds: results.timeSpentSeconds,
        attemptMode,
      });

      sessionStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
      if (evaluatedResult.isResultPublished === false) {
        toast.success('Test submitted successfully! Under review by teacher.');
      } else {
        toast.success('Test submitted and evaluated successfully!');
      }
      setTestResult(evaluatedResult);
      loadTests();
    } catch (err) {
      console.error('Submission failed, falling back to local evaluation:', err);
      toast.error(err instanceof Error ? err.message : 'Error submitting test to server');

      // Local fallback calculation if backend offline
      const questions = activeTest.questions || [];
      let score = 0;
      let correct = 0;
      let incorrect = 0;

      questions.forEach((q, idx) => {
        const chosen = results.answers[idx] || (q.questionId ? results.answers[q.questionId] : undefined);
        if (q.correctAnswer && chosen === q.correctAnswer) {
          score += 1;
          correct += 1;
        } else if (chosen) {
          incorrect += 1;
        }
      });

      const attempted = Object.values(results.statusByQuestion).filter((s) => s === 'attempted').length;
      const reviseLater = Object.values(results.statusByQuestion).filter((s) => s === 'revise').length;
      const skipped = questions.length - attempted;
      const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

      const fallbackResult: TestResult = {
        testId,
        testTitle: activeTest.title,
        score,
        maxScore: questions.length,
        percentage,
        accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
        attempted,
        correct,
        incorrect,
        reviseLater,
        skipped,
        timeSpentSeconds: results.timeSpentSeconds,
        answers: results.answers,
        statusByQuestion: results.statusByQuestion,
        questions,
      };

      sessionStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
      setTestResult(fallbackResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = async () => {
    if (!activeTest) return;
    const testId = activeTest.id || activeTest._id!;
    try {
      const fullTest = await testService.fetchTestById(testId, 'take');
      const session = await testService.startTest(testId).catch(() => ({ attemptId: undefined }));
      setActiveAttemptId(session.attemptId);
      setActiveTest(fullTest);
      setTestResult(null);
    } catch {
      setTestResult(null);
    }
  };

  const handleBackToTests = () => {
    sessionStorage.removeItem(ACTIVE_TEST_STORAGE_KEY);
    if (activeTest) {
      const testIdKey = activeTest.id || activeTest._id;
      if (testIdKey) {
        sessionStorage.removeItem(`edupye_answers_${testIdKey}`);
        sessionStorage.removeItem(`edupye_status_${testIdKey}`);
        sessionStorage.removeItem(`edupye_time_${testIdKey}`);
      }
    }
    setActiveTest(null);
    setTestResult(null);
    setActiveAttemptId(undefined);
    if (searchParams.get('testId')) {
      navigate('/student/tests', { replace: true });
    }
    loadTests();
  };

  // If in active test mode (Image 1)
  if (activeTest && !testResult) {
    return (
      <TestTakingView
        test={activeTest}
        attemptId={activeAttemptId}
        isSubmitting={isSubmitting}
        studentProfile={profile}
        onExit={handleBackToTests}
        onFinish={handleFinishTest}
      />
    );
  }

  // If viewing post-test analysis
  if (activeTest && testResult) {
    // If results are withheld pending teacher review, display dedicated confirmation screen
    if (testResult.isResultPublished === false) {
      return (
        <div className="h-full w-full flex flex-col min-h-0 overflow-y-auto bg-[#f8fbfe] text-slate-800">
          <div className="bg-white border-b border-[#e2ebf4] px-6 md:px-12 py-4 shrink-0 z-10">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={handleBackToTests}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0d9488] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                <span>Return to Tests Dashboard</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[#111827]">
                  Exam Submitted Successfully!
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Your responses for <span className="font-bold text-slate-800">{activeTest.title}</span> have been securely recorded.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Exam Title:</span>
                  <span className="font-bold text-slate-800 text-right">{activeTest.title}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Submission Status:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    Under Teacher Review
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Time Spent:</span>
                  <span className="font-semibold text-slate-700">
                    {testResult.timeSpentSeconds ? `${Math.round(testResult.timeSpentSeconds / 60)} mins` : 'Completed'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-left text-xs text-blue-900 leading-relaxed space-y-1">
                <p className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Results & Answer Explanations:
                </p>
                <p className="text-[11px] text-blue-800 leading-normal">
                  This is a formal teacher-assigned assessment. Detailed results, scores, and question explanations are withheld while your teacher reviews submissions. They will be published here once approved by your teacher.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleBackToTests}
                className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-2.5 shadow-2xs"
              >
                Back to Tests Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <TestAnalysisView
        result={testResult}
        studentProfile={profile}
        canRetake={!activeTest.usages?.scheduledTest}
        onRetake={handleRetake}
        onBackToTests={handleBackToTests}
      />
    );
  }

  const unlocked = tests.filter((t) => !t.isLocked);
  const locked = tests.filter((t) => t.isLocked);

  return (
    <div className="flex h-full w-full bg-[#f8fbfe] overflow-hidden text-slate-800">
      {/* Premium Subscription Modal */}
      <Modal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        title="Subscribe to Unlock Tests"
      >
        <div className="space-y-4 text-center py-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500 shadow-2xs">
            <Sparkles className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#111827]">
              Unlock All Premium Class 10 Mock Papers
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              Get unlimited access to solved board test papers, timed exam drills, and AI-powered performance diagnostics.
            </p>
          </div>

          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>50+ Full-length CBSE Class 10 Model Papers</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Step-by-step verified NCERT solution keys</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Personalized weak-chapter improvement roadmap</span>
            </div>
          </div>

          <Button
            className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl shadow-xs"
            onClick={() => {
              toast.success(`Subscription upgrade requested for ${selectedLockedTitle || 'tests'}! Our team will activate it shortly.`);
              setShowSubscribeModal(false);
            }}
          >
            Upgrade Plan • ₹299 / month
          </Button>
        </div>
      </Modal>

      {/* Sub-Sidebar (Subject, Practice, Test, Games, Quiz, Combine Study) */}
      <aside className="w-44 bg-[#d8eaf8] flex flex-col flex-shrink-0 border-r border-[#cbd5e1]/50 select-none overflow-y-auto hidden sm:flex pt-4">
        <div className="px-2 space-y-2 pb-4">
          {subSidebarItems.map((item) => {
            const isActive = activeSubTab === item.label;
            return (
              <button
                key={item.label}
                onClick={() => handleSubTabClick(item)}
                className={`h-9 w-full text-left px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#28bca6] text-white shadow-xs'
                    : 'text-[#1c3352] hover:bg-white/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Matching Image 2: EN, Search, Profile) */}
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-end px-6 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer hidden sm:block">
              EN
            </span>

            <div className="relative w-44 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-[#f8fafc] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0d9488]"
              />
            </div>

            <div
              onClick={() => navigate('/student/profile')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src={profile?.avatar || userImg}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              <span className="text-xs font-bold text-[#0d9488] hidden md:inline">
                {profile?.name ? profile.name.split(' ')[0] : 'Profile'}
              </span>
            </div>
          </div>
        </header>

        {/* Tests Listing Body (Image 2) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-white">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Title: Tests */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-extrabold text-[#94a3b8] tracking-tight">
                Tests
              </h1>

              <button
                onClick={loadTests}
                className="p-1.5 text-slate-400 hover:text-[#0d9488] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="Refresh tests from server"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0d9488]' : ''}`} />
              </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <Loader label="Loading tests catalog from server..." />
              </div>
            ) : error ? (
              <div className="py-12 text-center space-y-4 bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-lg mx-auto">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-rose-800">Failed to load tests</h3>
                  <p className="text-xs text-rose-600 font-medium">{error}</p>
                </div>
                <Button size="sm" onClick={loadTests} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Retry Connection
                </Button>
              </div>
            ) : tests.length === 0 ? (
              <div className="py-16 text-center text-slate-400 font-medium text-xs">
                No tests found available at this time.
              </div>
            ) : (
              <>
                {/* Row 1: Unlocked Tests */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unlocked.map((test) => (
                    <div
                      key={test.id || test._id}
                      onClick={() => handleStartTest(test)}
                      className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-2xs hover:shadow-md hover:border-[#28bca6]/50 transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 group relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`"${test.title}" added to your revision shelf!`);
                        }}
                        className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Add test to study list"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      {(() => {
                        const currentWindowStatus = computeClientWindowStatus(test);
                        return (
                          <>
                            <div className="space-y-2 pr-6">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {test.hasAttempted ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Finished
                                  </span>
                                ) : test.usages?.scheduledTest && currentWindowStatus === 'upcoming' ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                                    ⏰ Upcoming Exam
                                  </span>
                                ) : test.usages?.scheduledTest && currentWindowStatus === 'active' ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 animate-pulse">
                                    🟢 Exam In Session
                                  </span>
                                ) : test.usages?.scheduledTest && currentWindowStatus === 'closed' ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                    🔒 Closed
                                  </span>
                                ) : test.usages?.scheduledTest ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                                    📅 Scheduled Exam
                                  </span>
                                ) : null}

                                {test.usages?.practice && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                                    ⚡ Practice Mock
                                  </span>
                                )}

                                {test.hasAttempted && !test.isResultPublished && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                                    Review Pending
                                  </span>
                                )}
                                {test.hasAttempted && test.isResultPublished && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                                    Results Available
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-extrabold text-[#111827] group-hover:text-[#0d9488] transition-colors">
                                {test.title}
                              </h3>
                              <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-4">
                                {test.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              {test.hasAttempted ? (
                                test.isResultPublished ? (
                                  <span className="text-[11px] font-bold text-teal-600 group-hover:underline flex items-center gap-1">
                                    View Results &rarr;
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-slate-500">
                                    Finished &bull; Awaiting Results
                                  </span>
                                )
                              ) : test.usages?.scheduledTest && currentWindowStatus === 'upcoming' ? (
                                <span className="text-[11px] font-bold text-blue-600">
                                  Upcoming • {test.schedule?.startTime || 'Starts Soon'}
                                </span>
                              ) : test.usages?.scheduledTest && currentWindowStatus === 'closed' ? (
                                <span className="text-[11px] font-bold text-slate-400">
                                  Closed
                                </span>
                              ) : test.usages?.scheduledTest ? (
                                <span className="text-[11px] font-bold text-emerald-600 group-hover:underline">
                                  Attend Test &rarr;
                                </span>
                              ) : test.usages?.practice ? (
                                <span className="text-[11px] font-bold text-amber-600 group-hover:underline">
                                  Start Practice &rarr;
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-[#0d9488] group-hover:underline">
                                  Start Test &rarr;
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-slate-400">
                                {test.totalQuestions} Questions • {test.durationMinutes} mins
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>

                {/* Section Divider / Prompt */}
                {locked.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-400">
                      Subscribe for more tests.
                    </p>
                  </div>
                )}

                {/* Row 2: Locked Tests */}
                {locked.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locked.map((test) => (
                      <div
                        key={test.id || test._id}
                        onClick={() => handleStartTest(test)}
                        className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 group relative"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLockedTitle(test.title);
                            setShowSubscribeModal(true);
                          }}
                          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Add test"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        <div className="space-y-2 pr-6">
                          <h3 className="text-xl font-extrabold text-[#111827] group-hover:text-amber-600 transition-colors">
                            {test.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-4">
                            {test.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] font-bold text-amber-600">
                            Premium Locked
                          </span>
                          <Lock className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Floating Quick Action Button (⚡ in bottom right) */}
        {unlocked.length > 0 && (
          <div className="fixed bottom-6 right-6 z-20">
            <button
              onClick={() => handleStartTest(unlocked[0])}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0d9488] flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              title={`Quick Start ${unlocked[0].title}`}
            >
              <Zap className="w-5 h-5 fill-slate-800 hover:fill-[#0d9488]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
