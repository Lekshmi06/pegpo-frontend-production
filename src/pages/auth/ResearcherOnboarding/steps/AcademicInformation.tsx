import React, { useState } from 'react';
import { GraduationCap, Building2, BookOpen, Calendar, Hash, Award } from 'lucide-react';
import {
  AcademicInformationData,
  ACADEMIC_STATUS_OPTIONS,
} from '../../../../types/researcher';

interface AcademicInformationProps {
  initialData: AcademicInformationData;
  onSave: (data: AcademicInformationData) => void;
}

const QUALIFICATIONS = [
  "Bachelor's Degree (B.Tech / B.Sc / B.A / MBBS)",
  "Master's Degree (M.Tech / M.Sc / M.A / MS / MBA)",
  'Doctor of Philosophy (PhD / D.Phil)',
  'Post-Doctorate Fellowship',
  'Secondary / High School',
  'Other Professional Certification',
];

const YEARS_OF_STUDY = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year+',
  'Thesis/Dissertation Stage',
  'Graduated / Completed',
];

export const AcademicInformation: React.FC<AcademicInformationProps> = ({
  initialData,
  onSave,
}) => {
  const [currentStatus, setCurrentStatus] = useState(
    initialData.currentStatus || ACADEMIC_STATUS_OPTIONS[1]
  );
  const [highestQualification, setHighestQualification] = useState(
    initialData.highestQualification || QUALIFICATIONS[0]
  );
  const [institution, setInstitution] = useState(initialData.institution || '');
  const [department, setDepartment] = useState(initialData.department || '');
  const [currentCourse, setCurrentCourse] = useState(initialData.currentCourse || '');
  const [yearOfStudy, setYearOfStudy] = useState(initialData.yearOfStudy || YEARS_OF_STUDY[0]);
  const [graduationYear, setGraduationYear] = useState(initialData.graduationYear || '');
  const [researcherId, setResearcherId] = useState(initialData.researcherId || '');

  const [errors, setErrors] = useState<{ institution?: string; department?: string }>({});

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { institution?: string; department?: string } = {};

    if (!institution.trim()) {
      newErrors.institution = 'Institution/University is required';
    }
    if (!department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave({
      currentStatus,
      highestQualification,
      institution: institution.trim(),
      department: department.trim(),
      currentCourse: currentCourse.trim(),
      yearOfStudy,
      graduationYear: graduationYear.trim(),
      researcherId: researcherId.trim(),
    });
  };

  return (
    <form id="step-form" onSubmit={handleNext} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Academic Background & Affiliation
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Helps calibrate recommendations for peer papers, publication criteria, and faculty collaboration.
        </p>
      </div>

      {/* Academic Status Selector Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Current Academic Status <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ACADEMIC_STATUS_OPTIONS.map((status) => {
            const isSelected = currentStatus === status;
            return (
              <button
                type="button"
                key={status}
                onClick={() => setCurrentStatus(status)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between min-h-[70px] ${
                  isSelected
                    ? 'border-[#0091ff] bg-[#0091ff]/5 ring-2 ring-[#0091ff]/20'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <GraduationCap
                    className={`w-4 h-4 ${
                      isSelected ? 'text-[#0091ff]' : 'text-slate-400'
                    }`}
                  />
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-[#0091ff] bg-[#0091ff]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold leading-tight ${
                    isSelected ? 'text-[#006bbd]' : 'text-slate-700'
                  }`}
                >
                  {status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highest Qualification */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Highest Qualification
          </label>
          <div className="relative">
            <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={highestQualification}
              onChange={(e) => setHighestQualification(e.target.value)}
              className="w-full pl-10 pr-9 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            >
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>

        {/* Institution / University */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Institution / University <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={institution}
              onChange={(e) => {
                setInstitution(e.target.value);
                if (errors.institution) setErrors({ ...errors, institution: undefined });
              }}
              placeholder="e.g. Stanford University or IIT Madras"
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.institution ? 'border-rose-400' : 'border-blue-200'
              } rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs`}
            />
          </div>
          {errors.institution && (
            <p className="text-[11px] font-semibold text-rose-500 pl-1">{errors.institution}</p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Department / Faculty <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                if (errors.department) setErrors({ ...errors, department: undefined });
              }}
              placeholder="e.g. Computer Science & Engineering"
              className={`w-full pl-10 pr-4 py-3 border ${
                errors.department ? 'border-rose-400' : 'border-blue-200'
              } rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs`}
            />
          </div>
          {errors.department && (
            <p className="text-[11px] font-semibold text-rose-500 pl-1">{errors.department}</p>
          )}
        </div>

        {/* Current Course / Program */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Current Course / Program <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={currentCourse}
              onChange={(e) => setCurrentCourse(e.target.value)}
              placeholder="e.g. M.Tech Artificial Intelligence"
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            />
          </div>
        </div>

        {/* Year of Study */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Year of Study
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full pl-10 pr-9 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            >
              {YEARS_OF_STUDY.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>
        </div>

        {/* Graduation Year */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Graduation / Completion Year <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="e.g. 2026 or 2027"
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            />
          </div>
        </div>

        {/* Student / Researcher ID */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-bold text-slate-700">
            Student / Researcher ID / ORCID <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={researcherId}
              onChange={(e) => setResearcherId(e.target.value)}
              placeholder="e.g. 0000-0002-1825-0097 or Inst ID: RES-8491"
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-2xl bg-white text-xs font-bold text-[#111827] outline-none placeholder:text-slate-400 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
