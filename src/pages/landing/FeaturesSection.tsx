import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Brain, 
  ShoppingBag, 
  Calendar, 
  Layers, 
  FileCheck2, 
  Microscope, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Database,
  Cpu,
  BookOpen,
  FolderGit2,
  BarChart3,
  Flame,
  Search,
  Code
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'all' | 'learning' | 'teaching' | 'operations' | 'research'>('all');

  const features = [
    {
      id: 'ai-learning',
      category: 'learning',
      badge: 'Cognitive AI',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: Brain,
      title: 'AI-Powered Learning Companion',
      subtitle: '24/7 academic tutor trained specifically on official syllabi and competitive exam question banks.',
      description: 'Learners can ask deep academic questions, obtain step-by-step mathematical proofs, practice Previous Year Questions (PYQs), and receive instant conceptual clarifications tailored to their learning speed.',
      metrics: '24/7 Availability • 0.4s Response Time • Zero Hallucination Guardrails',
      preview: {
        type: 'ai-chat',
        prompt: 'Explain the difference between inductive and capacitive reactance in AC circuits.',
        response: 'Inductive reactance XL = 2πfL opposes AC current and increases with frequency, while capacitive reactance XC = 1/(2πfC) decreases as frequency rises...',
      },
      actionText: 'Experience AI Study Hub',
      actionLink: '/student/quiz',
    },
    {
      id: 'course-marketplace',
      category: 'learning',
      badge: 'Creator & Global LMS',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: ShoppingBag,
      title: 'Course Marketplace & Video Player',
      subtitle: 'A vibrant ecosystem of curated academic programs, masterclasses, and certified micro-degrees.',
      description: 'Learners can enroll in verified courses from top educators and publishing houses, complete interactive module quizzes, and stream high-definition lectures with synchronized bookmarks and resource downloads.',
      metrics: '1,200+ Video Courses • Instant Enrollment • Verified Certificates',
      preview: {
        type: 'course-card',
        courseName: 'Organic Chemistry Masterclass: Reaction Mechanisms',
        instructor: 'Dr. Sarah Lin (MIT & EduPye Fellow)',
        lessons: '28 Interactive Lectures • 4 Diagnostic Mock Tests',
      },
      actionText: 'Browse Course Marketplace',
      actionLink: '/marketplace',
    },
    {
      id: 'lesson-planning',
      category: 'teaching',
      badge: 'Pedagogical Engineering',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: Calendar,
      title: 'Intelligent Lesson Planning',
      subtitle: 'Automated curriculum mapping that produces aligned pacing guides and learning objectives in seconds.',
      description: 'Educators input subject standards and time constraints to generate multi-week lesson blueprints, Bloom’s taxonomy objectives, differentiated instruction strategies, and formative assessment prompts.',
      metrics: '4.8 Hours Saved Per Week • Curriculum Aligned • Export to PDF & Classroom',
      preview: {
        type: 'timeline',
        title: 'Weekly Pacing Blueprint: Quantum Mechanics Introduction',
        steps: ['Warm-up: Photoelectric Effect recap', 'Interactive Simulation: Double-slit interference', 'Exit Slip: De Broglie wavelength calculation'],
      },
      actionText: 'Explore Lesson Planner',
      actionLink: '/teacher/lesson-plan',
    },
    {
      id: 'smart-board',
      category: 'teaching',
      badge: 'Cloud Classroom',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      icon: Layers,
      title: 'Full-Screen Interactive Smart Board',
      subtitle: 'A zero-latency digital canvas engineered for modern interactive projection and remote lecturing.',
      description: 'Features infinite canvas zooming, LaTeX mathematical equation rendering, multi-color highlighters, geometric shape snapping, and direct synchronization with connected student screens.',
      metrics: '60 FPS Canvas Rendering • LaTeX Native • Multi-Screen Student Sync',
      preview: {
        type: 'smartboard-preview',
        formula: 'iℏ ∂/∂t Ψ(r, t) = [ -ℏ²/2m ∇² + V(r, t) ] Ψ(r, t)',
        label: 'Schrödinger Wave Equation with Live Annotation Canvas',
      },
      actionText: 'Launch Smart Board Studio',
      actionLink: '/teacher/smartboard/standard',
    },
    {
      id: 'assessments',
      category: 'teaching',
      badge: 'Diagnostic & Rubric Studio',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: FileCheck2,
      title: 'Comprehensive Assessment Studio',
      subtitle: 'End-to-end examination engine with AI-assisted grading rubrics and deep learning diagnostics.',
      description: 'Create multi-format exams combining MCQs, subjective essays, coding questions, and diagram labeling. EduPye evaluates student submissions instantly, flags learning misconceptions, and compiles grade distribution analytics.',
      metrics: '99.4% Grading Accuracy • Anti-Cheating Logs • Automated Class Diagnostic Reports',
      preview: {
        type: 'assessment-preview',
        exam: 'Mid-Term Advanced Calculus & Differential Equations',
        status: '42 Submissions Graded in 18 Seconds • Class Average: 84.6%',
      },
      actionText: 'View Assessment Studio',
      actionLink: '/teacher/assessment',
    },
    {
      id: 'research-tools',
      category: 'research',
      badge: 'Academic Synthesis',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      icon: Microscope,
      title: 'Advanced Research & Synthesis Suite',
      subtitle: 'Accelerate scholarly discovery with AI paper summarization and citation automation.',
      description: 'Researchers and postgraduate scholars can discover pre-prints and peer-reviewed journals, synthesize findings across dozens of papers simultaneously, generate verified APA/IEEE/BibTeX citations, and manage projects via Kanban boards.',
      metrics: '100M+ Academic Papers Indexed • 1-Click BibTeX Export • Collaborative Paper Workspace',
      preview: {
        type: 'research-preview',
        synthesis: 'Cross-Paper Meta Analysis: Generative Transformers in Biomedical Diagnosis',
        citations: '38 Peer-Reviewed References Formatted to IEEE & Nature Guidelines',
      },
      actionText: 'Explore Researcher Hub',
      actionLink: '/research',
    },
    {
      id: 'institutional-erp',
      category: 'operations',
      badge: 'Enterprise Campus OS',
      badgeColor: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
      icon: Building2,
      title: 'Institutional ERP & Campus Governance',
      subtitle: 'Multi-branch school and college ERP unifying admissions, attendance, fees, and academic records.',
      description: 'Consolidates all campus workflows into an audit-ready system: student lifecycle management (SIS), automated fee invoicing with payment gateways, biometric attendance tracking, faculty timetables, and statutory compliance reporting.',
      metrics: 'Multi-Tenant Architecture • Biometric Sync • 100% Audit Readiness',
      preview: {
        type: 'erp-preview',
        campus: 'Apex University System • 3 Campuses Synchronized',
        metrics: 'Admissions: 98% Filled | Attendance: 96.8% | Fee Collection: 94.5%',
      },
      actionText: 'Tour Institutional ERP',
      actionLink: '/institution',
    },
  ];

  const filteredFeatures = activeCategory === 'all' 
    ? features 
    : features.filter((f) => f.category === activeCategory);

  return (
    <section id="features" className="py-24 bg-slate-900/60 relative border-t border-slate-800/80 overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unified Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Explore EduPye features.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Engineered from first principles to replace fragmented third-party tools with one unified, high-performance platform.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { key: 'all', label: 'All 7 Pillars' },
              { key: 'learning', label: 'AI & Learning' },
              { key: 'teaching', label: 'Classrooms & Smart Board' },
              { key: 'operations', label: 'Institutional ERP' },
              { key: 'research', label: 'Research & Synthesis' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group rounded-3xl bg-slate-950/80 border border-slate-800 p-7 sm:p-8 hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-1">
                      {feat.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {/* Live Interactive Preview Visual */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2 text-xs">
                    {feat.preview.type === 'ai-chat' && (
                      <div className="space-y-2">
                        <div className="text-[11px] text-slate-400 font-mono">Q: {feat.preview.prompt}</div>
                        <div className="text-[11px] text-cyan-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                          🤖 {feat.preview.response}
                        </div>
                      </div>
                    )}

                    {feat.preview.type === 'course-card' && (
                      <div className="space-y-1.5">
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>{feat.preview.courseName}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Enrolled</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{feat.preview.instructor}</div>
                        <div className="text-[10px] text-blue-400 font-medium">{feat.preview.lessons}</div>
                      </div>
                    )}

                    {feat.preview.type === 'timeline' && feat.preview.steps && (
                      <div className="space-y-1.5">
                        <div className="font-bold text-purple-300 text-[11px]">{feat.preview.title}</div>
                        <div className="space-y-1 pl-2 border-l border-purple-500/30 text-[10px] text-slate-300">
                          {feat.preview.steps.map((st: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {feat.preview.type === 'smartboard-preview' && (
                      <div className="space-y-2">
                        <div className="font-mono text-cyan-300 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                          {feat.preview.formula}
                        </div>
                        <div className="text-[10px] text-slate-400 text-right">{feat.preview.label}</div>
                      </div>
                    )}

                    {feat.preview.type === 'assessment-preview' && (
                      <div className="space-y-1">
                        <div className="font-bold text-amber-300 text-[11px]">{feat.preview.exam}</div>
                        <div className="text-[11px] text-slate-300">{feat.preview.status}</div>
                      </div>
                    )}

                    {feat.preview.type === 'research-preview' && (
                      <div className="space-y-1">
                        <div className="font-bold text-cyan-300 text-[11px]">{feat.preview.synthesis}</div>
                        <div className="text-[10px] text-slate-400">{feat.preview.citations}</div>
                      </div>
                    )}

                    {feat.preview.type === 'erp-preview' && (
                      <div className="space-y-1">
                        <div className="font-bold text-indigo-300 text-[11px]">{feat.preview.campus}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{feat.preview.metrics}</div>
                      </div>
                    )}

                    {/* Metrics Banner */}
                    <div className="pt-1 text-[10px] font-semibold text-slate-400 border-t border-slate-800/80 flex items-center justify-between">
                      <span>{feat.metrics}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Included in EduPye Core</span>
                  <button
                    onClick={() => navigate(feat.actionLink)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 group-hover:gap-2.5 transition-all cursor-pointer"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
