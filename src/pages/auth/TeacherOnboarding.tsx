import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Building2,
  Users,
  Briefcase,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { TeacherType } from '../../types/teacher';

const COMMON_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Computer Science',
  'English',
  'Social Science',
  'History',
  'Economics',
  'Commerce',
  'Accountancy',
];

const COMMON_CLASSES = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Undergraduate',
  'Postgraduate',
];

const COMMON_BOARDS = [
  'CBSE',
  'ICSE',
  'State Board',
  'Cambridge (IGCSE)',
  'IB',
  'University',
];

const DEPARTMENTS = [
  'Science',
  'Mathematics',
  'Humanities & Social Sciences',
  'Computer Science & IT',
  'Commerce & Management',
  'Languages & Literature',
];

export default function TeacherOnboarding() {
  const navigate = useNavigate();
  const toast = useToast();

  const [teacherType, setTeacherType] = useState<TeacherType>('institution');

  // Institution details
  const [institution, setInstitution] = useState('St. Xavier High School');
  const [department, setDepartment] = useState('Science');
  const [designation, setDesignation] = useState('Senior Faculty');

  // Tuition details
  const [tuitionCentre, setTuitionCentre] = useState('');

  // Teaching scope
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Physics']);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['Class 10', 'Class 11', 'Class 12']);
  const [selectedBoards, setSelectedBoards] = useState<string[]>(['CBSE']);
  const [experienceYears, setExperienceYears] = useState<number>(5);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const addCustomSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (trimmed && !selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
      setCustomSubjectInput('');
    }
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const toggleBoard = (b: string) => {
    setSelectedBoards((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (teacherType === 'institution' && !institution.trim()) {
      toast.error('Please specify your institution or school name');
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject you teach');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.saveTeacherDetails({
        teacherType,
        institution: teacherType === 'institution' ? institution.trim() : undefined,
        tuitionCentre: teacherType === 'tuition' ? tuitionCentre.trim() : undefined,
        department: teacherType === 'institution' ? department : undefined,
        designation: teacherType === 'institution' ? designation.trim() : 'Tutor',
        subjects: selectedSubjects,
        classesTaught: selectedClasses,
        boards: selectedBoards,
        experienceYears: Number(experienceYears) || 0,
      });

      toast.success('Teacher workspace configured successfully!');
      navigate('/teacher');
    } catch {
      toast.error('Failed to save teacher setup. Continuing to dashboard...');
      navigate('/teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await authService.saveTeacherDetails({
        teacherType: 'institution',
        institution: 'School / Institution',
        department: 'Science',
        designation: 'Faculty',
        subjects: ['Science'],
        classesTaught: ['Class 10'],
        boards: ['CBSE'],
        experienceYears: 1,
      });
    } catch (err) {
      console.warn('Could not save default teacher details on skip:', err);
    }
    navigate('/teacher');
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] flex flex-col justify-between p-4 sm:p-8 font-sans">
      <header className="w-full flex items-center justify-between pl-2 pt-2 max-w-4xl mx-auto">
        <EdupyeLogo className="scale-110" />
        <button
          onClick={handleSkip}
          className="text-xs font-bold text-slate-400 hover:text-[#0091ff] transition-colors cursor-pointer"
        >
          Skip for now &rarr;
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center py-8">
        <div className="max-w-2xl w-full bg-white border border-[#e2ebf4] rounded-3xl p-6 sm:p-10 shadow-sm space-y-7 animate-in fade-in duration-200">
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] font-extrabold px-3 py-1 bg-[#d8ecfc] text-[#006bbd] rounded-full uppercase tracking-wider">
              Teacher Profile Setup
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight pt-1">
              Configure Your Teaching Space
            </h1>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
              Tell us what you teach so we can tailor lesson plans, question banks, and class workspaces for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. What type of teacher are you? */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                What type of teacher are you? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTeacherType('institution')}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    teacherType === 'institution'
                      ? 'border-[#0091ff] bg-[#f0f7ff] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      teacherType === 'institution'
                        ? 'bg-[#0091ff] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111827]">
                      Institution Teacher
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      School, College, University, or Department faculty member.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTeacherType('tuition')}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    teacherType === 'tuition'
                      ? 'border-[#0091ff] bg-[#f0f7ff] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      teacherType === 'tuition'
                        ? 'bg-[#0091ff] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111827]">
                      Tuition Teacher
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Tuition center, coaching academy, or private tutor.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Institutional details or Tuition Centre details */}
            {teacherType === 'institution' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f9fcfe] border border-[#e5f0fa] rounded-2xl">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    School / College / University Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. St. Xavier High School, IIT Madras, etc."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-[#111827] outline-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Faculty, PGT, HOD"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#f9fcfe] border border-[#e5f0fa] rounded-2xl space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Tuition Centre / Coaching Academy (Optional)
                </label>
                <input
                  type="text"
                  value={tuitionCentre}
                  onChange={(e) => setTuitionCentre(e.target.value)}
                  placeholder="e.g. Apex Learning Center, Self-Employed Tutor"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20"
                />
              </div>
            )}

            {/* 3. Subjects Taught */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Subjects Taught (Select all that apply) *
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SUBJECTS.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0091ff] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {sub}
                    </button>
                  );
                })}
              </div>

              {/* Custom Subject Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSubject();
                    }
                  }}
                  placeholder="Add other subject..."
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff] w-48"
                />
                <button
                  type="button"
                  onClick={addCustomSubject}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* 4. Classes / Grades Taught */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Classes / Grades Taught
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CLASSES.map((cls) => {
                  const isSelected = selectedClasses.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#254b73] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Curriculum Boards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Curriculum Boards / Syllabi
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_BOARDS.map((b) => {
                  const isSelected = selectedBoards.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBoard(b)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Experience */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Years of Teaching Experience
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-[#111827] outline-none focus:border-[#0091ff]"
                />
                <span className="text-xs font-semibold text-slate-500">years</span>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex items-center gap-3">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1 py-3.5"
              >
                Complete Setup & Enter Workspace
              </Button>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full text-center text-xs font-bold text-slate-400 py-2">
        © 2026 EDUPYE. All rights reserved.
      </footer>
    </div>
  );
}
