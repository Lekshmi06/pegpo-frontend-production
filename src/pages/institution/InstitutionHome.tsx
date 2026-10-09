import React from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Building2, GraduationCap, ArrowRight, ShieldCheck, Users, CheckCircle2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { EdupyeLogo } from '../../components/common/EdupyeLogo';

export default function InstitutionHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-6">
          <EdupyeLogo className="scale-105 cursor-pointer" />
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <nav className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Institution Portal
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/home')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Student Portal
          </button>
          <button
            onClick={() => navigate('/teacher')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Teacher Portal
          </button>
          <button
            onClick={() => navigate('/research')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Researcher Hub
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> EduPye Institutional Systems
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            Institutional Management Hub
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Enterprise administration, multi-tier school management, academic scheduling, and institutional metrics integrated into EduPye.
          </p>
        </div>

        {/* Native EduPye Institution Workspace Banner */}
        <div className="bg-gradient-to-r from-[#0f243d] via-[#1a385f] to-[#142d4d] rounded-3xl p-7 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-500/20">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-[#5da9f6] text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              EduPye Native Module (Active)
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Enterprise & Training Institutions Hub
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multi-tenant administration for companies, corporate training, coaching centres, and colleges. Manage employee trainees, trainers, and structured learning cohorts natively within EduPye.
            </p>
          </div>
          <button
            onClick={() => navigate('/institution/portal')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition-all hover:gap-3.5 cursor-pointer shrink-0"
          >
            <span>Open Institution Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Active: School Management System */}
          <div className="bg-white rounded-3xl border-2 border-blue-500/30 p-7 shadow-lg shadow-blue-500/5 relative overflow-hidden flex flex-col justify-between hover:border-blue-500 transition-all duration-200">
            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-700 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active System (Phase 1)
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <School className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#111827]">School Management System</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Complete school administration engine with dedicated portals for Administrators, Teachers, and Students.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Admin Dashboard: Classes, subjects, teachers & student registries</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Teacher Portal: Class tracking, daily attendance, exam mark entries</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Student Portal: Subject overviews, attendance charts, results & notices</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Database Isolation: Dedicated <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">edupye_school</code> MongoDB</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Isolated Authentication</span>
              </div>
              <button
                onClick={() => navigate('/institution/school')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:gap-3 cursor-pointer"
              >
                <span>Open School System</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Phase 2: College Management System */}
          <div className="bg-white rounded-3xl border-2 border-indigo-500/30 p-7 shadow-lg shadow-indigo-500/5 relative overflow-hidden flex flex-col justify-between hover:border-indigo-500 transition-all duration-200">
            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-700 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active System (Phase 2)
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#111827]">College Management System</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Higher education administration engine for degree programs, departments, semester courses, and campus AI intelligence.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Admin & Faculty Hub: Departments, courses, student enrollment & approvals</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Academic Tracking: Attendance records, timetable schedules & notices</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Campus AI Tools: Context-aware campus assistant powered by LLM</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Database Isolation: Dedicated <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">edupye_college</code> MongoDB</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Isolated Authentication</span>
              </div>
              <button
                onClick={() => navigate('/institution/college')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:gap-3 cursor-pointer"
              >
                <span>Open College System</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Strict Multi-Tenant DB</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                School collections are logically partitioned into <code className="text-blue-600 font-mono">edupye_school</code> with zero cross-contamination.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Independent Authentication</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                School user sessions use dedicated namespaces, preserving active EduPye student/teacher accounts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Complete Feature Parity</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All classes, subjects, attendance tracking, exam marks, and notices are fully preserved.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
