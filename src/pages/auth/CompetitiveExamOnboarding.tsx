import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  ChevronDown,
  Upload,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { sourceService } from '../../services/sourceService';
import { useToast } from '../../hooks/useToast';
import { CompetitiveExamAcademicInfo } from '../../types/auth';

const TARGET_EXAMS = [
  'JEE Main & Advanced (IIT JEE)',
  'NEET UG (Medical Entrance)',
  'SSC CGL & CHSL (Staff Selection)',
  'UPSC Civil Services (IAS/IPS/IFS)',
  'GATE (Graduate Aptitude Test in Engineering)',
  'Banking (IBPS PO / Clerk, SBI PO)',
  'Railway Recruitment (RRB NTPC & Group D)',
  'CAT & MBA Entrances',
  'State PSC (Public Service Commission)',
  'CBSE Class 10 & 12 Board Mocks',
  'Other Competitive Exam',
];

const TARGET_YEARS = ['2025', '2026', '2027', '2028'];

const CATEGORIES = [
  'Engineering Entrance',
  'Medical Entrance',
  'Civil & Government Services',
  'Banking & Insurance',
  'Management & Aptitude',
  'Board Examination Boost',
];

const PREPARATION_MODES = [
  'Full Syllabus Mastery & Timed CBT Tests',
  'Previous Year Solved Papers (PYQs) Intensive',
  'Speed Drills & Formula Revision Only',
];

export default function CompetitiveExamOnboarding() {
  const navigate = useNavigate();
  const toast = useToast();

  const [targetExam, setTargetExam] = useState(TARGET_EXAMS[0]);
  const [customExam, setCustomExam] = useState('');
  const [targetYear, setTargetYear] = useState(TARGET_YEARS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [preparationMode, setPreparationMode] = useState(PREPARATION_MODES[0]);
  const [targetScore, setTargetScore] = useState('');
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syllabusInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSyllabusFile(file);
      toast.success(`Selected file: ${file.name}`);
    }
  };

  const handleFinish = async () => {
    const finalExam =
      targetExam === 'Other Competitive Exam'
        ? customExam.trim() || 'Competitive Exam'
        : targetExam;

    setIsSubmitting(true);
    try {
      const compDetails: CompetitiveExamAcademicInfo = {
        targetExam: finalExam,
        targetYear,
        category,
        preparationMode,
        syllabusFileName: syllabusFile ? syllabusFile.name : undefined,
      };

      authService.updateCurrentUser({
        role: 'student',
        learningPath: 'competitive_exam',
        goal: 'Prepare for Exam',
        competitiveExamDetails: compDetails,
      });

      const currentUser = authService.getCurrentUser();
      const email = currentUser?.email || 'student@edupye.com';
      const name = currentUser?.name || 'Aspirant';

      let studentProfileId: string | null = null;
      try {
        const profileResult = await studentService.createProfile({
          email,
          name,
          goal: `Acing ${finalExam}`,
          learningPath: 'competitive_exam',
          competitiveExamDetails: compDetails,
          education: {
            level: 'competitive_exam',
            specialization: finalExam,
          },
        });
        if (profileResult?.studentProfile?._id) {
          studentProfileId = profileResult.studentProfile._id;
          localStorage.setItem('studentProfileId', studentProfileId);
        }
      } catch {
        try {
          const existing = await studentService.getProfileByEmail(email);
          if (existing?._id) {
            studentProfileId = existing._id;
            localStorage.setItem('studentProfileId', existing._id);
            await studentService.updateCompetitiveExamProfile(existing._id, compDetails);
          }
        } catch {
          // Continue with local storage
        }
      }

      // Ingest syllabus if attached
      if (syllabusFile && studentProfileId) {
        try {
          toast.info('Ingesting exam syllabus...');
          await sourceService.uploadSource(studentProfileId, syllabusFile);
          toast.success('Exam syllabus indexed by EduPye AI!');
        } catch {
          console.warn('Syllabus upload fallback to local storage');
        }
      }

      toast.success(`${finalExam} target configured! Opening Exam Cracker.`);
      navigate('/student/exam-cracker');
    } catch (err) {
      console.error(err);
      toast.error('Failed to configure exam. Redirecting to workspace.');
      navigate('/student/exam-cracker');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] flex flex-col justify-between p-4 sm:p-8 font-sans">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <EdupyeLogo className="scale-105" />
        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
          Step 2 of 2: Exam Goal Setup
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center py-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-[#e2ebf4] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
              <Target className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
              Competitive Exam Target Setup
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Select your examination target, preparation timeline, and strategy mode.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {/* Target Exam */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Target Examination <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                >
                  {TARGET_EXAMS.map((exam) => (
                    <option key={exam} value={exam}>
                      {exam}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {targetExam === 'Other Competitive Exam' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Specify Examination</label>
                <Input
                  value={customExam}
                  onChange={(e) => setCustomExam(e.target.value)}
                  placeholder="e.g. State Judiciary, Defence NDA/CDS"
                  className="rounded-2xl"
                />
              </div>
            )}

            {/* Target Year & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Target Year</label>
                <div className="relative">
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {TARGET_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Exam Discipline</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Preparation Strategy Mode */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Preparation Focus</label>
              <div className="relative">
                <select
                  value={preparationMode}
                  onChange={(e) => setPreparationMode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                >
                  {PREPARATION_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Target Score / AIR Goal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Target Score / Percentile Goal (optional)
              </label>
              <Input
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                placeholder="e.g. 99+ Percentile / All India Rank < 500"
                className="rounded-2xl"
              />
            </div>

            {/* Syllabus / Notes Upload */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Upload Exam Syllabus or PYQ PDF (optional)
              </label>
              <div
                onClick={() => syllabusInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
                  syllabusFile
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-[#0091ff] bg-slate-50/50'
                }`}
              >
                <input
                  ref={syllabusInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  {syllabusFile ? (
                    <>
                      <FileCheck className="w-6 h-6 text-emerald-600" />
                      <span className="text-xs font-extrabold text-emerald-700 truncate max-w-xs">
                        {syllabusFile.name}
                      </span>
                      <span className="text-[10px] text-emerald-600">Click to replace file</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">
                        Upload Official Syllabus or PYQ Collection
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, DOCX up to 30MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <Button
                onClick={handleFinish}
                isLoading={isSubmitting}
                className="w-full py-3 text-sm font-bold shadow-md rounded-2xl bg-[#0091ff] hover:bg-[#007fe0]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Exam Cracker Mocks
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
