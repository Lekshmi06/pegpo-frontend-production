import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  Trophy,
  Sparkles,
  BookOpen,
  Brain,
  FileText,
  Upload,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  School,
  Building2,
  Compass,
  FileCheck,
  Check,
  Video,
  Network,
  Clock,
  Layers,
  X
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { useToast } from '../../hooks/useToast';
import { StudyPreferences } from '../../types/student';

const DRAFT_STORAGE_KEY = 'edupye_exam_onboarding_draft';

// Step definitions (1 to 6)
const TOTAL_STEPS = 6;

export default function ExamPrepQuickOnboarding() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Form State
  const [category, setCategory] = useState<string>('school');
  const [schoolClass, setSchoolClass] = useState<string>('Class 10');
  const [schoolBoard, setSchoolBoard] = useState<string>('CBSE');
  const [schoolName, setSchoolName] = useState<string>('');

  const [collegeDegree, setCollegeDegree] = useState<string>('B.Tech');
  const [collegeInstitution, setCollegeInstitution] = useState<string>('');
  const [collegeYear, setCollegeYear] = useState<string>('2nd Year');

  const [targetExam, setTargetExam] = useState<string>('JEE Main');
  const [targetExamYear, setTargetExamYear] = useState<string>('2026');

  const [customCategoryDetails, setCustomCategoryDetails] = useState<string>('');

  // Step 2: Goal
  const [selectedGoal, setSelectedGoal] = useState<string>('Prepare for an upcoming exam');
  const [customGoal, setCustomGoal] = useState<string>('');

  // Step 3: Current performance
  const [currentScore, setCurrentScore] = useState<string>('');
  const [hasTakenExam, setHasTakenExam] = useState<boolean | null>(null);

  // Step 4: Target outcome
  const [targetOutcome, setTargetOutcome] = useState<string>('Score 90%+ / Grade A+');
  const [customTarget, setCustomTarget] = useState<string>('');

  // Step 5: Preferred study tools
  const [preferredTools, setPreferredTools] = useState<string[]>([
    'Quizzes',
    'Practice papers',
    'Summary notes',
    'Exam-preparation plan',
  ]);

  // Step 6: Study material
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(parsed.step);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.schoolClass) setSchoolClass(parsed.schoolClass);
        if (parsed.schoolBoard) setSchoolBoard(parsed.schoolBoard);
        if (parsed.schoolName) setSchoolName(parsed.schoolName);
        if (parsed.collegeDegree) setCollegeDegree(parsed.collegeDegree);
        if (parsed.collegeInstitution) setCollegeInstitution(parsed.collegeInstitution);
        if (parsed.collegeYear) setCollegeYear(parsed.collegeYear);
        if (parsed.targetExam) setTargetExam(parsed.targetExam);
        if (parsed.targetExamYear) setTargetExamYear(parsed.targetExamYear);
        if (parsed.selectedGoal) setSelectedGoal(parsed.selectedGoal);
        if (parsed.currentScore) setCurrentScore(parsed.currentScore);
        if (parsed.hasTakenExam !== undefined) setHasTakenExam(parsed.hasTakenExam);
        if (parsed.targetOutcome) setTargetOutcome(parsed.targetOutcome);
        if (parsed.preferredTools) setPreferredTools(parsed.preferredTools);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save draft to localStorage on change
  useEffect(() => {
    try {
      const draftData = {
        step,
        category,
        schoolClass,
        schoolBoard,
        schoolName,
        collegeDegree,
        collegeInstitution,
        collegeYear,
        targetExam,
        targetExamYear,
        selectedGoal,
        currentScore,
        hasTakenExam,
        targetOutcome,
        preferredTools,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch {
      // Ignore quota issues
    }
  }, [
    step,
    category,
    schoolClass,
    schoolBoard,
    schoolName,
    collegeDegree,
    collegeInstitution,
    collegeYear,
    targetExam,
    targetExamYear,
    selectedGoal,
    currentScore,
    hasTakenExam,
    targetOutcome,
    preferredTools,
  ]);

  const handleNextStep = () => {
    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleComplete();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleTool = (tool: string) => {
    setPreferredTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt|jpg|jpeg|png|webp)$/i)) {
      toast.error('Supported formats: PDF, DOCX, TXT, JPEG, PNG, WebP');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size cannot exceed 25MB');
      return;
    }

    setIsUploadingFile(true);
    setTimeout(() => {
      setUploadedFile(file);
      setUploadedFileName(file.name);
      setIsUploadingFile(false);
      toast.success(`Study material "${file.name}" attached successfully!`);
    }, 400);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const finalGoal = selectedGoal === 'Other' && customGoal.trim() ? customGoal.trim() : selectedGoal;
      const finalTarget = targetOutcome === 'Custom target outcome' && customTarget.trim() ? customTarget.trim() : targetOutcome;

      const studyPrefs: StudyPreferences = {
        category,
        goal: finalGoal,
        currentScore: hasTakenExam === false ? 'No exam taken yet' : currentScore || undefined,
        hasTakenExam: hasTakenExam ?? undefined,
        targetScore: finalTarget || undefined,
        preferredTools,
        uploadedMaterialFileName: uploadedFileName || undefined,
      };

      const currentUser = authService.getCurrentUser();
      const profileId = currentUser?.id || localStorage.getItem('studentProfileId') || 'local_profile_id';

      // Build academic payload
      const payload: any = {
        goal: finalGoal,
        learningPath: category === 'college' ? 'undergraduate' : category === 'competitive' ? 'competitive' : 'school',
        studyPreferences: studyPrefs,
      };

      if (category === 'school') {
        payload.schoolDetails = {
          schoolName: schoolName.trim() || undefined,
          board: schoolBoard,
          classLevel: schoolClass,
        };
        payload.education = {
          level: 'school',
          institution: schoolName.trim() || undefined,
          board: schoolBoard,
          classLevel: schoolClass,
        };
      } else if (category === 'college') {
        payload.undergraduateDetails = {
          institution: collegeInstitution.trim() || undefined,
          degree: collegeDegree,
          year: collegeYear,
        };
        payload.education = {
          level: 'undergraduate',
          institution: collegeInstitution.trim() || undefined,
          degree: collegeDegree,
        };
      } else if (category === 'competitive') {
        payload.competitiveExamDetails = {
          targetExam,
          targetYear: targetExamYear,
        };
        payload.education = {
          level: 'competitive_exam',
          institution: targetExam,
        };
      }

      await studentService.updateProfile(profileId, payload);

      // Update authService session
      authService.updateCurrentUser({
        goal: finalGoal,
        learningPath: payload.learningPath,
      });

      // Clear draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      setIsComplete(true);
      toast.success('Your personalized study preferences have been configured!');
    } catch (err: any) {
      console.warn('Could not save to backend, using local session state:', err);
      setIsComplete(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipToDashboard = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    navigate('/student/dashboard');
  };

  // If completed, render the celebratory completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between p-4 sm:p-8 font-sans">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
          <EdupyeLogo className="h-7 sm:h-8" />
          <button
            onClick={handleSkipToDashboard}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
          >
            Skip to Dashboard
          </button>
        </header>

        <main className="max-w-xl mx-auto w-full my-auto py-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-stone-200/80 text-center space-y-6">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl mx-auto flex items-center justify-center border border-orange-100 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800">
                Setup Complete
              </span>
              <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                You're ready to study!
              </h1>
              <p className="text-sm font-medium text-stone-500 max-w-md mx-auto leading-relaxed">
                Your diagnostic exam plan and study tools have been tailored to your goals.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-left space-y-2.5 text-xs text-stone-700">
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-500 font-semibold">Primary Goal:</span>
                <span className="font-bold text-stone-900">{selectedGoal}</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-500 font-semibold">Active Category:</span>
                <span className="font-bold text-stone-900 capitalize">{category.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold">Study Tools Selected:</span>
                <span className="font-bold text-orange-600">{preferredTools.length} tools</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        <footer className="max-w-4xl mx-auto w-full text-center py-4 text-xs text-stone-400">
          EduPye Adaptive Learning Platform &copy; 2026. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-4">
        <EdupyeLogo className="h-7 sm:h-8" />
        <button
          onClick={handleSkipToDashboard}
          className="text-xs font-bold text-stone-500 hover:text-orange-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Skip setup</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Multi-Step Container */}
      <main className="max-w-2xl mx-auto w-full my-auto py-6">
        {/* Progress Indicator Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span className="text-orange-600 uppercase tracking-wider font-extrabold">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span>
              {step === 1 && 'About You'}
              {step === 2 && 'Your Study Goal'}
              {step === 3 && 'Recent Score (Optional)'}
              {step === 4 && 'Target Outcome (Optional)'}
              {step === 5 && 'Preferred Study Tools'}
              {step === 6 && 'Study Material (Optional)'}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-stone-200/80 space-y-6 animate-in fade-in duration-200">
          {/* ======================================================== */}
          {/* STEP 1: ABOUT YOU */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  Which student category best describes you?
                </h2>
                <p className="text-xs font-semibold text-stone-500">
                  Select your current learning stage so we can tailor the right syllabus.
                </p>
              </div>

              {/* Category Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'school',
                    title: 'School Student',
                    desc: 'Classes 6–12, CBSE, ICSE, or State Board',
                    icon: School,
                  },
                  {
                    id: 'college',
                    title: 'College / University',
                    desc: 'Undergraduate or Postgraduate degree',
                    icon: Building2,
                  },
                  {
                    id: 'competitive',
                    title: 'Competitive Exam Aspirant',
                    desc: 'JEE, NEET, UPSC, GATE, Banking, etc.',
                    icon: Trophy,
                  },
                  {
                    id: 'other',
                    title: 'Other / Lifelong Learner',
                    desc: 'Self-paced or professional test prep',
                    icon: Compass,
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCategory(opt.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                      category === opt.id
                        ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        category === opt.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-stone-900">{opt.title}</div>
                      <div className="text-[11px] text-stone-500 leading-snug">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Conditional Minimal Academic Fields */}
              {category === 'school' && (
                <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Class Level</label>
                    <select
                      value={schoolClass}
                      onChange={(e) => setSchoolClass(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                    >
                      {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Board / Curriculum</label>
                    <select
                      value={schoolBoard}
                      onChange={(e) => setSchoolBoard(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                    >
                      {['CBSE', 'ICSE', 'State Board', 'Cambridge / IGCSE', 'IB', 'Other'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">
                      School Name <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Delhi Public School"
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {category === 'college' && (
                <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Degree / Program</label>
                    <input
                      type="text"
                      value={collegeDegree}
                      onChange={(e) => setCollegeDegree(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science, B.Com, MBBS"
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Year of Study <span className="text-stone-400 font-normal">(Optional)</span></label>
                    <select
                      value={collegeYear}
                      onChange={(e) => setCollegeYear(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                    >
                      {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year / Intern', 'Graduated'].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">College / University Name <span className="text-stone-400 font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      value={collegeInstitution}
                      onChange={(e) => setCollegeInstitution(e.target.value)}
                      placeholder="e.g. National Institute of Technology"
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {category === 'competitive' && (
                <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Target Competitive Exam</label>
                    <select
                      value={targetExam}
                      onChange={(e) => setTargetExam(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                    >
                      {[
                        'JEE Main & Advanced',
                        'NEET UG',
                        'UPSC Civil Services',
                        'GATE',
                        'CAT / MBA Entrance',
                        'SSC CGL / CHSL',
                        'Banking / IBPS PO',
                        'CUET',
                        'State PSC / Government Exams',
                        'Other',
                      ].map((ex) => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-700">Target Year</label>
                    <select
                      value={targetExamYear}
                      onChange={(e) => setTargetExamYear(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                    >
                      {['2026', '2027', '2028', '2029'].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {category === 'other' && (
                <div className="pt-2 border-t border-stone-100 text-left space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">What subject or exam are you studying for? <span className="text-stone-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={customCategoryDetails}
                    onChange={(e) => setCustomCategoryDetails(e.target.value)}
                    placeholder="e.g. Data Structures, Professional Certification, English Grammar"
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: YOUR GOAL */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  What is your main study goal right now?
                </h2>
                <p className="text-xs font-semibold text-stone-500">
                  We will prioritize practice questions and study plans aligned with this objective.
                </p>
              </div>

              <div className="space-y-2.5 text-left">
                {[
                  {
                    title: 'Prepare for an upcoming exam',
                    desc: 'Full-syllabus mock tests, previous year papers, and high-yield questions.',
                    icon: Target,
                  },
                  {
                    title: 'Improve semester-exam performance',
                    desc: 'Boost conceptual understanding, GPA, and subject test scores.',
                    icon: Trophy,
                  },
                  {
                    title: 'Understand difficult topics',
                    desc: 'Break down complex derivations and concepts with AI guidance.',
                    icon: Brain,
                  },
                  {
                    title: 'Complete assignments faster',
                    desc: 'Instant reference summaries and step-by-step problem solvers.',
                    icon: FileText,
                  },
                  {
                    title: 'Build a consistent study routine',
                    desc: 'Structured daily targets, streak tracking, and smart reminders.',
                    icon: Clock,
                  },
                  {
                    title: 'Other',
                    desc: 'Custom target or specialized study objectives.',
                    icon: Sparkles,
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setSelectedGoal(item.title)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      selectedGoal === item.title
                        ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedGoal === item.title
                            ? 'bg-orange-500 text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-stone-900">{item.title}</div>
                        <div className="text-[11px] text-stone-500 hidden sm:block">{item.desc}</div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedGoal === item.title
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {selectedGoal === item.title && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                ))}
              </div>

              {selectedGoal === 'Other' && (
                <div className="text-left space-y-1 animate-in fade-in">
                  <label className="text-[11px] font-bold text-stone-700">Describe your primary study goal</label>
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="e.g. Master Organic Chemistry nomenclature in 2 weeks"
                    className="w-full p-3 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: CURRENT PERFORMANCE (OPTIONAL) */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                    What was your recent exam score?
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                    Optional
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-500">
                  This establishes a realistic baseline for your diagnostic analysis. If you haven't taken an exam recently, you can skip this step.
                </p>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Recent Exam Score or Percentage</label>
                  <input
                    type="text"
                    disabled={hasTakenExam === false}
                    value={hasTakenExam === false ? '' : currentScore}
                    onChange={(e) => {
                      setCurrentScore(e.target.value);
                      setHasTakenExam(true);
                    }}
                    placeholder="e.g. 74% or 580/720 or 8.2 CGPA"
                    className={`w-full p-3.5 rounded-2xl border text-xs font-semibold outline-none transition-all ${
                      hasTakenExam === false
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-white text-stone-900 border-stone-200 focus:border-orange-500 shadow-2xs'
                    }`}
                  />
                </div>

                {/* Haven't taken an exam button */}
                <button
                  type="button"
                  onClick={() => {
                    setHasTakenExam(hasTakenExam === false ? null : false);
                    if (hasTakenExam !== false) setCurrentScore('');
                  }}
                  className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    hasTakenExam === false
                      ? 'border-orange-500 bg-orange-50 text-orange-800 font-extrabold'
                      : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <span>I haven't taken a mock or board exam yet</span>
                  {hasTakenExam === false && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-left flex items-start gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Strict privacy guarantee:</strong> We never assign an arbitrary score or share academic performance. You can always take an initial diagnostic quiz on your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: TARGET OUTCOME (OPTIONAL) */}
          {/* ======================================================== */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                    What is your target outcome?
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                    Optional
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-500">
                  Select a realistic target milestone that fits your preparation timetable.
                </p>
              </div>

              <div className="space-y-2.5 text-left">
                {[
                  'Score 90%+ / Grade A+ in Board Exams',
                  'Top 1% Percentile in Competitive Exam',
                  'Clear cutoff & secure admission rank',
                  'Achieve 8.5+ CGPA this academic semester',
                  'Gain deep conceptual mastery across all chapters',
                  'Custom target outcome',
                ].map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => setTargetOutcome(target)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs sm:text-sm font-bold ${
                      targetOutcome === target
                        ? 'border-orange-500 bg-orange-50/40 text-stone-900 ring-1 ring-orange-500'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <span>{target}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        targetOutcome === target
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {targetOutcome === target && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                ))}
              </div>

              {targetOutcome === 'Custom target outcome' && (
                <div className="text-left space-y-1 animate-in fade-in">
                  <label className="text-[11px] font-bold text-stone-700">Enter your specific target outcome</label>
                  <input
                    type="text"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    placeholder="e.g. Score 680+ in NEET or 99.5 percentile in JEE Main"
                    className="w-full p-3 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <p className="text-[11px] text-stone-400 text-left">
                Notice: Learning outcomes depend on individual consistent practice, syllabus coverage, and revision cadence.
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: PREFERRED STUDY TOOLS */}
          {/* ======================================================== */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  Which study tools do you prefer?
                </h2>
                <p className="text-xs font-semibold text-stone-500">
                  Select your favorite study formats. We will pin these to your quick-access dashboard.
                </p>
              </div>

              {/* Selectable Tools List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {[
                  {
                    name: 'Quizzes',
                    desc: 'Timed chapter drills & instant solution checks',
                    icon: Brain,
                  },
                  {
                    name: 'Practice papers',
                    desc: 'Previous year question papers & mock exams',
                    icon: FileCheck,
                  },
                  {
                    name: 'Summary notes',
                    desc: 'High-yield revision sheets & formula summaries',
                    icon: FileText,
                  },
                  {
                    name: 'Mind maps',
                    desc: 'Visual concept diagrams & interconnecting links',
                    icon: Network,
                  },
                  {
                    name: 'Ask an AI question',
                    desc: '24/7 syllabus tutor for instant doubts solving',
                    icon: Sparkles,
                  },
                  {
                    name: 'Videos',
                    desc: 'Curated video lectures and animated explanations',
                    icon: Video,
                  },
                  {
                    name: 'Exam-preparation plan',
                    desc: 'Structured weekly milestones & topic timetables',
                    icon: Target,
                  },
                ].map((tool) => {
                  const isSelected = preferredTools.includes(tool.name);
                  return (
                    <button
                      key={tool.name}
                      type="button"
                      onClick={() => toggleTool(tool.name)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-orange-500 text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        <tool.icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-stone-900">{tool.name}</span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-stone-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-snug">{tool.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {preferredTools.length === 0 && (
                <p className="text-xs font-semibold text-rose-500 text-left">
                  Please select at least one study tool to personalize your workspace.
                </p>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6: ADD STUDY MATERIAL (OPTIONAL) */}
          {/* ======================================================== */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                    Add study material to get started
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                    Optional
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-500">
                  Upload your syllabus PDF, chapter notes, or photos of your textbook. You can also skip this and upload material later.
                </p>
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-stone-200 rounded-3xl p-6 sm:p-8 bg-stone-50/50 hover:bg-orange-50/20 hover:border-orange-300 transition-all text-center relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-3 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>

                  {uploadedFileName ? (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="truncate max-w-xs">{uploadedFileName}</span>
                      </div>
                      <p className="text-[11px] text-stone-500">Click or drop another file to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-stone-800">
                        Drop your notes, PDF, or photos here, or <span className="text-orange-600 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Supports PDF, DOCX, TXT, and JPG/PNG photos (up to 25MB)
                      </p>
                    </div>
                  )}

                  {isUploadingFile && (
                    <p className="text-xs font-bold text-orange-600 animate-pulse">
                      Processing file...
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-100 text-stone-700 text-left text-xs space-y-1">
                <p className="font-bold text-stone-900">What happens after upload?</p>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  EduPye's AI assistant indexes your uploaded materials to generate chapter practice questions, formula sheets, and diagnostic test recommendations.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls Matrix */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="py-3 px-5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkipToDashboard}
                  className="py-3 px-4 text-stone-400 hover:text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Skip all
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Optional steps allow explicit skip */}
              {(step === 3 || step === 4 || step === 6) && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="py-3 px-4 text-stone-500 hover:text-stone-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Skip
                </button>
              )}

              <button
                type="button"
                disabled={isSaving || (step === 5 && preferredTools.length === 0)}
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSaving ? 'Saving...' : step === TOTAL_STEPS ? 'Finish & Launch' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto w-full text-center py-4 text-xs text-stone-400">
        EduPye Exam Preparation Quick-Entry &bull; Adaptive Learning Platform
      </footer>
    </div>
  );
}
