import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Video,
  KeyRound,
  MessageSquareShare,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Award,
  Users,
  Star
} from 'lucide-react';
import { tuitionService } from '../../services/tuitionService';
import type { TuitionBannerContent } from '../../services/contentService';

interface TuitionSectionProps {
  content?: TuitionBannerContent;
}

export const TuitionSection: React.FC<TuitionSectionProps> = ({ content }) => {
  const navigate = useNavigate();
  const [quickCode, setQuickCode] = useState('');
  const [quickName, setQuickName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const badge = content?.badge || "Interval-Inspired Online Tuition";
  const title = content?.title || "Structured Programs for Every Grade & Goal";
  const subtitle = content?.subtitle || "From primary school foundations to board exam toppers and competitive entrance coaching — choose the exact live program matched to your child's syllabus.";

  const handleQuickCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) {
      setErrorMsg('Please enter your Student or Teacher Code.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await tuitionService.codeLogin({
        code: quickCode.trim().toUpperCase(),
        name: quickName.trim() || undefined,
      });

      if (res.success && res.token) {
        tuitionService.setTuitionModeSession(res.token, res.programContext, res.user);
        navigate('/tuition-mode');
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please verify your code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or unregistered code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const programs = [
    {
      level: 'Grades 1 – 5',
      title: 'Primary Foundation & Confidence',
      badge: 'Individual 1:1',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
      curriculum: 'CBSE • ICSE • State • Cambridge',
      highlights: [
        'Activity-based Mathematics & Mental Math',
        'Phonics, Reading Fluency & Vocabulary',
        'Curiosity Science & Daily Homework Help',
      ],
      mentorType: 'Child Psychology Trained Primary Specialists',
    },
    {
      level: 'Grades 6 – 8',
      title: 'Middle School Conceptual Mastery',
      badge: '1:1 or Small Batch',
      badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300',
      curriculum: 'CBSE • ICSE • State Board',
      highlights: [
        'Foundation Physics, Chemistry & Biology',
        'Algebraic Thinking & Geometry Derivations',
        'Junior Olympiad & NTSE Diagnostics',
      ],
      mentorType: 'Senior Graduate Subject Mentors',
    },
    {
      level: 'Grades 9 & 10',
      title: 'Board Exam Preparation & Scoring',
      badge: 'Board Specialist',
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
      curriculum: '10th CBSE & ICSE Boards',
      highlights: [
        '10-Year Previous Question Papers (PYQs)',
        'Live SmartBoard Step-by-Step Derivations',
        'Formula Sheet Mastery & Weekly Mock Tests',
      ],
      mentorType: 'Senior Board Examiners & Rank Holders',
    },
    {
      level: 'Grades 11 & 12',
      title: 'Senior Secondary & Competitive Prep',
      badge: 'Intensive Coaching',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300',
      curriculum: 'Physics • Chemistry • Math • Biology',
      highlights: [
        'JEE Main/Advanced & NEET-UG Foundations',
        'Deep Numerical Problem Solving',
        '1-on-1 Dedicated Doubt Clearance Docks',
      ],
      mentorType: 'Top University Alumni & Exam Specialists',
    },
  ];

  return (
    <section id="tuition" className="py-20 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        </div>

        {/* 4 Clean Academic Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {programs.map((prog, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                    {prog.level}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prog.badgeColor}`}>
                    {prog.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {prog.title}
                </h3>

                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {prog.curriculum}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {prog.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  Mentor: {prog.mentorType}
                </div>
                <button
                  onClick={() => navigate('/tuition-mode')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-500 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Enroll in Program</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Permanent Code Gateway Card */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left explanation */}
            <div className="md:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700">
                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Permanent User Code Gate
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Already Have a Student or Teacher Code?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Enter your permanent <span className="font-mono font-bold text-slate-900 dark:text-white">STU-XXXXXX</span> or <span className="font-mono font-bold text-slate-900 dark:text-white">TCH-XXXXXX</span> code to instantly unlock your assigned classroom workspaces, study stream, and live SmartBoard without passwords.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Protected by 15-minute post-class idle auto-logout security</span>
              </div>
            </div>

            {/* Right Form */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <form onSubmit={handleQuickCodeSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student or Teacher Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                    placeholder="e.g. STU-101010 or TCH-202020"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Unlock Classroom'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
