import React from 'react';
import { 
  Workflow, 
  GraduationCap, 
  Layers, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Database, 
  ShieldCheck, 
  GitMerge, 
  Network
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Individuals Learn',
      role: 'Adaptive Student Experience',
      icon: GraduationCap,
      color: 'from-blue-600 to-cyan-500',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description:
        'Learners begin with diagnostic assessments that pinpoint exact conceptual gaps. EduPye AI maps an adaptive study pathway, schedules spaced-repetition drills, solves Previous Year Questions (PYQs), and provides real-time tutoring whenever confusion strikes.',
      highlights: [
        'Personalized diagnostic learning baseline',
        '24/7 AI tutor with syllabus-aligned explanations',
        'Interactive mock exams & exam cracker analytics',
        'Verifiable skills and academic milestone badges',
      ],
      flowOutput: 'Outputs verified learner competency & study habits',
    },
    {
      step: '02',
      title: 'Educators Teach',
      role: 'Smart Instructional Command',
      icon: Layers,
      color: 'from-purple-600 to-indigo-500',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description:
        'Educators generate structured, standards-aligned lesson blueprints in minutes. During class, they command a zero-lag cloud SmartBoard with LaTeX formulas and interactive simulations, followed by automated rubric-based grading that returns instant diagnostic feedback.',
      highlights: [
        '1-Click AI lesson pacing & objective drafting',
        'Interactive cloud smartboard with student screen sync',
        'Automated multi-format assessment grading',
        'Classroom comprehension analytics & attendance tracking',
      ],
      flowOutput: 'Feeds real-time mastery diagnostics into institution records',
    },
    {
      step: '03',
      title: 'Institutions Manage Operations',
      role: 'Unified Campus Governance',
      icon: Building2,
      color: 'from-indigo-600 to-blue-600',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description:
        'Campuses run all operational touchpoints on one synchronized system. Leadership manages student records from admission to alumni, automates fee billing and payment collections, tracks faculty workloads, and generates audit-ready compliance reports.',
      highlights: [
        'Multi-tenant Student Information System (SIS)',
        'Automated tuition invoicing & payment gateway',
        'Biometric & RFID campus attendance integration',
        'Statutory accreditation & audit readiness dashboards',
      ],
      flowOutput: 'Coordinates institutional governance & regulatory audit compliance',
    },
    {
      step: '04',
      title: 'Companies Train Employees',
      role: 'Enterprise Talent Acceleration',
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description:
        'Corporate organizations scale workforce capability using cohort-based upskilling programs. Managers track departmental completion rates, verify employee skill mastery with simulated practical assessments, and integrate learning directly via single sign-on (SSO).',
      highlights: [
        'Structured corporate onboarding & upskilling cohorts',
        'Departmental skill matrices and progress tracking',
        'Embedded learning workspaces with enterprise SSO',
        'Verifiable industry credentials & certificates of mastery',
      ],
      flowOutput: 'Yields measurable workforce upskilling & verified competencies',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-950 relative border-t border-slate-900 overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
            <Workflow className="w-3.5 h-3.5 text-blue-400" />
            <span>Connected Operating System</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How EduPye works.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            One interconnected architecture powering every stage of knowledge acquisition and delivery. Learn, teach, manage, and train—without data silos.
          </p>
        </div>

        {/* Unified Data Spine Banner */}
        <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                <Network className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                  The EduPye Data & Intelligence Spine
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Universal Identity & Synchronized Academic Graph
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Unlike traditional setups where LMS, ERP, whiteboard, and grading tools operate as separate disconnected products, EduPye runs on a single unified cloud fabric. Student progress automatically informs teacher lesson pacing, updates institutional records, and verifies corporate credentials in real time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Bi-Directional Sync</span>
            </div>
          </div>
        </div>

        {/* 4 Connected Pillars Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative rounded-3xl bg-slate-900/60 border border-slate-800 p-8 hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-400 font-bold">STAGE {item.step}</div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${item.badgeColor}`}>
                      {item.role}
                    </span>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Core Operations:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {item.highlights.map((hl, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Flow Output Banner */}
                <div className="pt-6 mt-6 border-t border-slate-800/80">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">{item.flowOutput}</span>
                    <GitMerge className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
