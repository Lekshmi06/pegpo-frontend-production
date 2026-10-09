import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  School, 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';

export default function CollegePlaceholder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to Login"
            aria-label="Back to Login"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <EdupyeLogo className="scale-105 cursor-pointer" />
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
            <span 
              onClick={() => navigate('/institution')}
              className="hover:text-slate-800 cursor-pointer transition-colors"
            >
              Institution
            </span>
            <span>/</span>
            <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              College Management
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            EduPye Login
          </button>
          <button
            onClick={() => navigate('/institution/school')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <School className="w-3.5 h-3.5" />
            <span>School Portal</span>
          </button>
        </div>
      </header>

      {/* Main Informational Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 space-y-8 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm relative overflow-hidden space-y-8">
          {/* Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-indigo-100">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Phase 2 • Upcoming Integration</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Status: In Planning & Specification
            </span>
          </div>

          {/* Title & Overview */}
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              College Management System
            </h1>
            <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
              Integration for higher education institutions, degree programs, departments, and semester accreditations has not started yet and is scheduled for <strong>Phase 2</strong>.
            </p>
          </div>

          {/* Architecture & Roadmap Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Department & Faculty Chair Management</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                Dedicated administration for academic departments, dean offices, and professorship allocations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Semester Credits & Electives</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                Flexible credit management, prerequisite validations, and student course enrollments.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Transcripts & GPA Calculations</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                Automated cumulative grade point averages, transcript verification, and graduation audit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Strict Database & Session Isolation</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                Will follow the proven Phase 1 architectural model with isolated collections and decoupled authentication.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Back to EduPye Login
              </button>
              <button
                onClick={() => navigate('/institution')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Institution Hub
              </button>
            </div>

            <button
              onClick={() => navigate('/institution/school')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all hover:gap-3 cursor-pointer"
            >
              <span>Access Active School Management</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
