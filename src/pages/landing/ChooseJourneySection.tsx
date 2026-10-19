import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Layers, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  BookOpen,
  Award,
  Clock,
  Compass
} from 'lucide-react';

interface ChooseJourneySectionProps {
  onOpenDemo: () => void;
}

export const ChooseJourneySection: React.FC<ChooseJourneySectionProps> = ({ onOpenDemo }) => {
  const navigate = useNavigate();

  const journeys = [
    {
      id: 'student',
      title: 'Students & Learners',
      subtitle: 'From foundation school to competitive exams, master concepts with adaptive AI and smart revision tools.',
      badge: 'Adaptive & Personalized',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: GraduationCap,
      accentBorder: 'hover:border-blue-500/60',
      glowColor: 'from-blue-600/20 to-cyan-500/10',
      metric: '+34% Average Score Lift',
      metricSub: 'across mock drills and competitive exam simulations',
      features: [
        '24/7 EduPye AI study companion trained on official syllabi',
        'Previous Year Questions (PYQs) with step-by-step verified solvers',
        'Exam Cracker timed tests with precision weak-area diagnostic insights',
        'Interactive personal bookshelf, smart voice recorder & note sync',
      ],
      primaryCta: 'Start Learning Free',
      primaryAction: () => navigate('/signup'),
      secondaryCta: 'Sign In to Hub',
      secondaryAction: () => navigate('/login'),
    },
    {
      id: 'teacher',
      title: 'Teachers & Educators',
      subtitle: 'Reclaim your time from administrative prep to deliver inspiring, interactive classroom experiences.',
      badge: 'Instructional Mastery',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: Layers,
      accentBorder: 'hover:border-purple-500/60',
      glowColor: 'from-purple-600/20 to-indigo-500/10',
      metric: '4.8 Hours Saved Weekly',
      metricSub: 'with instant AI lesson drafting and auto-grading',
      features: [
        'AI Lesson Planner generates structured pacing, objectives & activities',
        'Full-screen cloud SmartBoard with drawing canvas, formulas & slides',
        'Assessment Studio with multi-format question banks & auto-rubrics',
        'Integrated class rosters, tuition tracking & live stream lecturing',
      ],
      primaryCta: 'Join as Educator',
      primaryAction: () => navigate('/signup'),
      secondaryCta: 'Teacher Sign In',
      secondaryAction: () => navigate('/login'),
    },
    {
      id: 'institution',
      title: 'Schools & Colleges',
      subtitle: 'Modernize your entire campus with an enterprise-grade ERP designed for multi-tier education governance.',
      badge: 'Campus Operations & ERP',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      icon: Building2,
      accentBorder: 'hover:border-indigo-500/60',
      glowColor: 'from-indigo-600/20 to-blue-500/10',
      metric: '70% Cost & Paperwork Reduction',
      metricSub: 'by consolidating disparate point tools into one ERP',
      features: [
        'Unified Student Information System (SIS) from admission to graduation',
        'Automated tuition & fee collection gateway with zero-friction invoicing',
        'Biometric & RFID campus attendance sync with parent instant alerts',
        'Multi-branch oversight with continuous accreditation audit reporting',
      ],
      primaryCta: 'Explore Campus ERP',
      primaryAction: () => navigate('/institution'),
      secondaryCta: 'Book Campus Demo',
      secondaryAction: onOpenDemo,
    },
    {
      id: 'company',
      title: 'Companies & Training Teams',
      subtitle: 'Scale workforce capabilities with structured training cohorts, skill benchmarking, and enterprise SSO.',
      badge: 'Enterprise Workforce',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Briefcase,
      accentBorder: 'hover:border-emerald-500/60',
      glowColor: 'from-emerald-600/20 to-teal-500/10',
      metric: '94% Completion Rate',
      metricSub: 'consistently achieved across enterprise training cohorts',
      features: [
        'Cohort-based employee upskilling with measurable competency metrics',
        'Departmental progress tracking and compliance training verification',
        'Embedded learning workspaces with zero-friction enterprise SSO',
        'Host private corporate academies with custom certificates and badges',
      ],
      primaryCta: 'Institutional Solutions',
      primaryAction: () => navigate('/institution'),
      secondaryCta: 'Request Demo',
      secondaryAction: onOpenDemo,
    },
  ];

  return (
    <section id="journeys" className="py-24 bg-slate-950 relative border-t border-slate-900 overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Dedicated Perspectives</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Choose your journey.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Whether you are mastering advanced formulas, conducting high-engagement lectures, operating a multi-campus university, or training an enterprise team—EduPye provides dedicated, role-optimized entry points without data fragmentation.
          </p>
        </div>

        {/* 4 Journey Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {journeys.map((journey) => {
            const Icon = journey.icon;
            return (
              <div
                key={journey.id}
                className={`group relative rounded-3xl bg-slate-900/60 border border-slate-800 p-8 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl flex flex-col justify-between ${journey.accentBorder}`}
              >
                {/* Subtle Hover Gradient Glow */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${journey.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative space-y-6">
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                      <Icon className="w-7 h-7 text-blue-400 group-hover:text-cyan-300 transition-colors" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${journey.badgeColor}`}
                    >
                      {journey.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">
                      {journey.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      {journey.subtitle}
                    </p>
                  </div>

                  {/* Highlight Metric Pill */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3.5">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white">{journey.metric}</div>
                      <div className="text-xs text-slate-400">{journey.metricSub}</div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Included Capabilities:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {journey.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-normal">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="relative pt-8 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={journey.primaryAction}
                    className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:gap-3 cursor-pointer"
                  >
                    <span>{journey.primaryCta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={journey.secondaryAction}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    {journey.secondaryCta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
