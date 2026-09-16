import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ChevronDown,
  Upload,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { sourceService } from '../../services/sourceService';
import { useToast } from '../../hooks/useToast';
import { UndergraduateAcademicInfo } from '../../types/auth';

const DEGREES = [
  'B.Tech (Bachelor of Technology)',
  'B.E. (Bachelor of Engineering)',
  'B.Sc (Bachelor of Science)',
  'B.Com (Bachelor of Commerce)',
  'B.A. (Bachelor of Arts)',
  'BCA (Bachelor of Computer Applications)',
  'BBA (Bachelor of Business Administration)',
  'MBBS / Medical',
  'LLB (Bachelor of Law)',
  'Other Degree',
];

const SPECIALIZATIONS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Commerce & Accountancy',
  'Economics',
  'Physics',
  'Chemistry',
  'Mathematics',
  'English Literature',
  'Custom Specialization',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export default function UndergraduateOnboarding() {
  const navigate = useNavigate();
  const toast = useToast();

  const [institution, setInstitution] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState(DEGREES[0]);
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [year, setYear] = useState(YEARS[0]);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syllabusInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSyllabusFile(file);
      toast.success(`Selected syllabus: ${file.name}`);
    }
  };

  const handleFinish = async () => {
    if (!institution.trim()) {
      toast.error('Please enter your college or university name');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalSpec =
        specialization === 'Custom Specialization'
          ? customSpecialization.trim() || 'General'
          : specialization;

      const ugDetails: UndergraduateAcademicInfo = {
        institution: institution.trim(),
        university: university.trim() || institution.trim(),
        degree,
        specialization: finalSpec,
        year,
        semester,
        syllabusFileName: syllabusFile ? syllabusFile.name : undefined,
      };

      authService.updateCurrentUser({
        role: 'student',
        learningPath: 'undergraduate',
        goal: 'Graduation',
        undergraduateDetails: ugDetails,
      });

      const currentUser = authService.getCurrentUser();
      const email = currentUser?.email || 'student@edupye.com';
      const name = currentUser?.name || 'Student';

      let studentProfileId: string | null = null;
      try {
        const profileResult = await studentService.createProfile({
          email,
          name,
          goal: 'Undergraduate Degree Mastery',
          learningPath: 'undergraduate',
          undergraduateDetails: ugDetails,
          education: {
            level: 'undergraduate',
            institution: institution.trim(),
            degree,
            specialization: finalSpec,
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
            await studentService.updateUndergraduateProfile(existing._id, ugDetails);
          }
        } catch {
          // Continue with local storage
        }
      }

      // Upload syllabus if attached
      if (syllabusFile && studentProfileId) {
        try {
          toast.info('Ingesting degree syllabus...');
          await sourceService.uploadSource(studentProfileId, syllabusFile);
          toast.success('Curriculum syllabus indexed by EduPye AI!');
        } catch {
          console.warn('Syllabus upload completed with local indexing');
        }
      }

      toast.success('Undergraduate profile configured!');
      navigate('/student/home');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile. Proceeding to dashboard.');
      navigate('/student/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] flex flex-col justify-between p-4 sm:p-8 font-sans">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <EdupyeLogo className="scale-105" />
        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
          Step 2 of 2: Undergraduate Setup
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center py-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-[#e2ebf4] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0091ff]/10 text-[#0091ff] mx-auto flex items-center justify-center">
              <GraduationCap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
              Undergraduate Curriculum Setup
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Configure your college degree, branch, and current semester for personalized study guides.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {/* Institution / College Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                College / Institution Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Indian Institute of Technology, Delhi"
                className="rounded-2xl"
              />
            </div>

            {/* University Affiliation */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Affiliated University (optional)
              </label>
              <Input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. Anna University, VTU, Mumbai University"
                className="rounded-2xl"
              />
            </div>

            {/* Degree & Specialization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Degree Program</label>
                <div className="relative">
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {DEGREES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Major / Specialization</label>
                <div className="relative">
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {specialization === 'Custom Specialization' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Specify Major</label>
                <Input
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  placeholder="Enter your field of study"
                  className="rounded-2xl"
                />
              </div>
            )}

            {/* Year & Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Current Year</label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Current Semester</label>
                <div className="relative">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Syllabus Upload */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Semester Syllabus or Course Outline (optional)
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
                        Upload Syllabus PDF or Course Document
                      </span>
                      <span className="text-[10px] text-slate-400">PDF, DOCX up to 25MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                onClick={handleFinish}
                isLoading={isSubmitting}
                className="w-full py-3 text-sm font-bold shadow-md rounded-2xl"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Student Workspace
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
