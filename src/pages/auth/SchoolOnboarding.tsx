import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School as SchoolIcon,
  ChevronDown,
  Upload,
  FileCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { sourceService } from '../../services/sourceService';
import { useToast } from '../../hooks/useToast';

const COMMON_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'General Science',
  'Social Studies',
  'History',
  'Geography',
  'English Literature',
  'Computer Science',
  'Economics',
  'Hindi',
  'Custom',
];

const CURRICULUM_BOARDS = [
  'CBSE',
  'ICSE',
  'State Board',
  'Cambridge (IGCSE)',
  'IB (International Baccalaureate)',
  'Other',
];

const CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

export default function SchoolOnboarding() {
  const navigate = useNavigate();
  const toast = useToast();

  const [schoolName, setSchoolName] = useState('Delhi Public School');
  const [classLevel, setClassLevel] = useState('Class 10');
  const [board, setBoard] = useState('CBSE');
  const [studyMode, setStudyMode] = useState<'full_syllabus' | 'specific_subject'>('full_syllabus');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [customSubject, setCustomSubject] = useState('');
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [textbookFile, setTextbookFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syllabusInputRef = useRef<HTMLInputElement>(null);
  const textbookInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'syllabus' | 'textbook'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'syllabus') {
      setSyllabusFile(file);
      toast.success(`Selected syllabus: ${file.name}`);
    } else {
      setTextbookFile(file);
      toast.success(`Selected textbook/syllabus: ${file.name}`);
    }
  };

  const handleFinish = async () => {
    if (!schoolName.trim()) {
      toast.error('Please enter your school name');
      return;
    }

    setIsSubmitting(true);
    try {
      const schoolDetails = {
        schoolName: schoolName.trim(),
        classLevel,
        board,
        studyMode,
        selectedSubject: studyMode === 'specific_subject' ? selectedSubject : undefined,
        customSubject:
          studyMode === 'specific_subject' && selectedSubject === 'Custom'
            ? customSubject.trim()
            : undefined,
        syllabusFileName: syllabusFile ? syllabusFile.name : undefined,
        textbookFileName: textbookFile ? textbookFile.name : undefined,
      };

      await authService.saveSchoolDetails(schoolDetails);

      const currentUser = authService.getCurrentUser();
      const email = currentUser?.email || 'student@edupye.com';
      const name = currentUser?.name || 'Student';

      let studentProfileId: string | null = null;
      try {
        const profileResult = await studentService.createProfile({
          email,
          name,
          goal: 'School Curriculum Mastery',
          schoolDetails,
          education: {
            level: 'school',
            institution: schoolName.trim(),
            board,
            classLevel,
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
            await studentService.updateProfile(existing._id, {
              schoolDetails,
              education: {
                level: 'school',
                institution: schoolName.trim(),
                board,
                classLevel,
              },
            });
          }
        } catch {
          // Continue
        }
      }

      const fileToUpload = studyMode === 'full_syllabus' ? syllabusFile : textbookFile;
      if (fileToUpload && studentProfileId) {
        try {
          await sourceService.uploadSource(studentProfileId, fileToUpload);
        } catch (uploadErr) {
          console.warn('File upload warning:', uploadErr);
        }
      }

      toast.success('School profile configured! Welcome to your learning area.');
      navigate('/student/home');
    } catch {
      navigate('/student/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 sm:p-8 font-sans">
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between pt-2 pb-4">
        <EdupyeLogo className="scale-105" />
        <button
          onClick={() => navigate('/student/home')}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center py-6">
        <div className="max-w-xl w-full space-y-6 text-center animate-in fade-in duration-200">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              School Learning Setup
            </h1>
            <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
              Configure your school information and select whether to import your full curriculum or a specific subject.
            </p>
          </div>

          <div className="space-y-4 text-left pt-2">
            <Input
              label="School Name *"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Delhi Public School"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-700">Class / Grade *</label>
                <div className="relative">
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-700">Curriculum / Board *</label>
                <div className="relative">
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
                  >
                    {CURRICULUM_BOARDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={syllabusInputRef}
              onChange={(e) => handleFileChange(e, 'syllabus')}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            <input
              type="file"
              ref={textbookInputRef}
              onChange={(e) => handleFileChange(e, 'textbook')}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />

            {/* Scope Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-extrabold text-[#111827] uppercase tracking-wider">
                Study Materials & Scope
              </label>

              {/* Option A */}
              <div
                onClick={() => setStudyMode('full_syllabus')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  studyMode === 'full_syllabus'
                    ? 'border-[#0091ff] bg-[#f0f7ff] ring-2 ring-[#0091ff]/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      studyMode === 'full_syllabus'
                        ? 'border-[#0091ff] bg-[#0091ff]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {studyMode === 'full_syllabus' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#111827]">
                      Upload Full Syllabus
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Import complete grade curriculum covering all subjects.
                    </p>
                  </div>
                </div>

                {studyMode === 'full_syllabus' && (
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        syllabusInputRef.current?.click();
                      }}
                      className="border-2 border-dashed border-[#b8daf6] hover:border-[#0091ff] bg-white rounded-xl p-3 text-center cursor-pointer transition-colors"
                    >
                      {syllabusFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span>{syllabusFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1c3352]">
                          <Upload className="w-4 h-4 text-[#0091ff]" />
                          <span>Click to Upload Full Syllabus (PDF, Word)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                  OR
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Option B */}
              <div
                onClick={() => setStudyMode('specific_subject')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  studyMode === 'specific_subject'
                    ? 'border-[#0091ff] bg-[#f0f7ff] ring-2 ring-[#0091ff]/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      studyMode === 'specific_subject'
                        ? 'border-[#0091ff] bg-[#0091ff]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {studyMode === 'specific_subject' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#111827]">
                      Learn only a specific subject
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Select a focus subject and attach its textbook or syllabus.
                    </p>
                  </div>
                </div>

                {studyMode === 'specific_subject' && (
                  <div className="mt-3 pt-3 border-t border-blue-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Subject</label>
                        <div className="relative">
                          <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-[#111827] outline-none cursor-pointer focus:border-[#0091ff]"
                          >
                            {COMMON_SUBJECTS.map((s) => (
                              <option key={s} value={s}>
                                {s === 'Custom' ? '+ Add Custom Subject' : s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {selectedSubject === 'Custom' && (
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">Custom Subject Name</label>
                          <input
                            type="text"
                            value={customSubject}
                            onChange={(e) => setCustomSubject(e.target.value)}
                            placeholder="e.g. Environmental Studies"
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-[#111827] outline-none focus:border-[#0091ff]"
                          />
                        </div>
                      )}
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        textbookInputRef.current?.click();
                      }}
                      className="border-2 border-dashed border-[#b8daf6] hover:border-[#0091ff] bg-white rounded-xl p-3 text-center cursor-pointer transition-colors"
                    >
                      {textbookFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span>{textbookFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1c3352]">
                          <Upload className="w-4 h-4 text-[#0091ff]" />
                          <span>Upload Subject Textbook or Subject Syllabus</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                onClick={handleFinish}
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full py-3.5"
              >
                Complete Setup & Enter Classroom
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full text-center text-xs font-bold text-slate-400 py-2">
        © 2026 EDUPYE. All rights reserved.
      </footer>
    </div>
  );
}
