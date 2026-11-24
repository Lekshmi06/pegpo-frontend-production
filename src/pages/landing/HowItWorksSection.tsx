import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  Sparkles, 
  UserCheck, 
  Tv, 
  LineChart,
  UserPlus,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import type { HowItWorksStep } from '../../services/contentService';

interface HowItWorksSectionProps {
  dynamicSteps?: HowItWorksStep[];
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ dynamicSteps }) => {
  const navigate = useNavigate();

  const defaultSteps = [
    {
      stepNumber: 1,
      title: 'Free Diagnostic & Academic Baseline',
      role: 'Step 01',
      description:
        'We assess your child\'s conceptual baseline, school syllabus, and learning pace through a quick diagnostic quiz to match them with the right subject specialist.',
      icon: UserCheck,
      badge: 'Step 01 • Diagnostic',
    },
    {
      stepNumber: 2,
      title: 'Live 1-on-1 Interactive SmartBoard Classes',
      role: 'Step 02',
      description:
        'Students join live sessions via their permanent code. The mentor conducts real-time whiteboard derivations, solves textbook questions, and clarifies doubts on the spot.',
      icon: Tv,
      badge: 'Step 02 • Live Class',
    },
    {
      stepNumber: 3,
      title: 'Continuous Mastery, 24/7 AI LMS & Recordings',
      role: 'Step 03',
      description:
        'Every class is recorded for revision. Students access split-screen practice quizzes, PYQ archives, and AI assistance with weekly progress reports sent to parents.',
      icon: LineChart,
      badge: 'Step 03 • Mastery',
    },
  ];

  const stepsToRender = dynamicSteps && dynamicSteps.length > 0 ? dynamicSteps : defaultSteps;

  return (
    <section id="how-it-works" className="py-20 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Simple 3-Step Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            How EduPye Online Tuition Works
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            A seamless path from diagnostic baseline to top academic scores.
          </p>
        </div>

        {/* 3-Step Cards (Strictly Non-Moving Static Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stepsToRender.map((s: any, idx: number) => {
            const stepNum = s.stepNumber || idx + 1;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-2xs relative"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center">
                      0{stepNum}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Phase {stepNum}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated "Become an EduPye Tutor" Recruitment Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
              <UserPlus className="w-3.5 h-3.5" />
              Tutor Recruitment Open
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Passionate Educator? Teach with EduPye.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Enjoy flexible scheduling, transparent per-class payouts, verified student batches, and our proprietary interactive SmartBoard classroom.
            </p>
          </div>

          <Link
            to="/become-a-tutor"
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Apply as Tutor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
