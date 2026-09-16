import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookMarked,
  ChevronDown,
  Upload,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { sourceService } from '../../services/sourceService';
import { useToast } from '../../hooks/useToast';
import { PostgraduateAcademicInfo } from '../../types/auth';

const PG_DEGREES = [
  'M.Tech (Master of Technology)',
  'M.E. (Master of Engineering)',
  'M.Sc (Master of Science)',
  'MBA (Master of Business Administration)',
  'M.Com (Master of Commerce)',
  'M.A. (Master of Arts)',
  'MCA (Master of Computer Applications)',
  'Ph.D. / Research Scholar',
  'Post-Doctoral Fellowship',
  'Other Postgraduate Program',
];

const PG_SPECIALIZATIONS = [
  'Artificial Intelligence & Machine Learning',
  'Data Science & Big Data Systems',
  'VLSI & Embedded Systems',
  'Structural Engineering',
  'Thermal & Fluid Sciences',
  'Finance & Corporate Strategy',
  'Marketing & Business Analytics',
  'Applied Physics & Quantum Tech',
  'Organic Chemistry',
  'Molecular Biology & Genetics',
  'Macroeconomics & Public Policy',
  'Custom Specialization',
];

const PG_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year+'];

export default function PostgraduateOnboarding() {
  const navigate = useNavigate();
  const toast = useToast();

  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState(PG_DEGREES[0]);
  const [specialization, setSpecialization] = useState(PG_SPECIALIZATIONS[0]);
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [thesisTopic, setThesisTopic] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [year, setYear] = useState(PG_YEARS[0]);
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
    if (!institution.trim()) {
      toast.error('Please enter your university or research institute name');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalSpec =
        specialization === 'Custom Specialization'
          ? customSpecialization.trim() || 'General Research'
          : specialization;

      const pgDetails: PostgraduateAcademicInfo = {
        institution: institution.trim(),
        degree,
        specialization: finalSpec,
        thesisTopic: thesisTopic.trim() || undefined,
        researchArea: researchArea.trim() || undefined,
        year,
        syllabusFileName: syllabusFile ? syllabusFile.name : undefined,
      };

      authService.updateCurrentUser({
        role: 'student',
        learningPath: 'postgraduate',
        goal: 'Post Graduation',
        postgraduateDetails: pgDetails,
      });

      const currentUser = authService.getCurrentUser();
      const email = currentUser?.email || 'student@edupye.com';
      const name = currentUser?.name || 'Scholar';

      let studentProfileId: string | null = null;
      try {
        const profileResult = await studentService.createProfile({
          email,
          name,
          goal: 'Postgraduate & Research Specialization',
          learningPath: 'postgraduate',
          postgraduateDetails: pgDetails,
          education: {
            level: 'postgraduate',
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
            await studentService.updatePostgraduateProfile(existing._id, pgDetails);
          }
        } catch {
          // Continue with local storage
        }
      }

      // Ingest document if provided
      if (syllabusFile && studentProfileId) {
        try {
          toast.info('Ingesting research documentation...');
          await sourceService.uploadSource(studentProfileId, syllabusFile);
          toast.success('Research documents indexed by EduPye AI!');
        } catch {
          console.warn('Document indexing fallback to local session');
        }
      }

      toast.success('Postgraduate profile saved!');
      navigate('/student/home');
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete onboarding. Redirecting to workspace.');
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
          Step 2 of 2: Postgraduate Setup
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center py-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-[#e2ebf4] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0091ff]/10 text-[#0091ff] mx-auto flex items-center justify-center">
              <BookMarked className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
              Postgraduate & Research Track Setup
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Configure your master's degree, research specialization, and thesis direction.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {/* University / Institute */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                University / Research Institute <span className="text-rose-500">*</span>
              </label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Indian Institute of Science (IISc), Bangalore"
                className="rounded-2xl"
              />
            </div>

            {/* Degree & Specialization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Degree / Program</label>
                <div className="relative">
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {PG_DEGREES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Department / Major</label>
                <div className="relative">
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {PG_SPECIALIZATIONS.map((s) => (
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
                <label className="text-xs font-bold text-slate-700 block">Specify Department</label>
                <Input
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  placeholder="Enter your field of research"
                  className="rounded-2xl"
                />
              </div>
            )}

            {/* Thesis Topic & Research Focus */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Thesis / Project Title or Focus (optional)
              </label>
              <Input
                value={thesisTopic}
                onChange={(e) => setThesisTopic(e.target.value)}
                placeholder="e.g. Transformer Architectures for Multimodal Diagnostics"
                className="rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Primary Domain</label>
                <Input
                  value={researchArea}
                  onChange={(e) => setResearchArea(e.target.value)}
                  placeholder="e.g. Deep Learning, Macroeconomics"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Academic Year</label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff]"
                  >
                    {PG_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Research Paper / Syllabus Upload */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Upload Syllabus, Research Proposal, or Base Papers (optional)
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
                        Upload Thesis Proposal or Paper Draft (PDF/DOCX)
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
                className="w-full py-3 text-sm font-bold shadow-md rounded-2xl"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Postgraduate Workspace
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
