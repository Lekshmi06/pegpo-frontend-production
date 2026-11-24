import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck,
  Video,
  Presentation,
  Star,
  Users,
  Clock,
  BookOpen
} from 'lucide-react';
import type { HeroContent, LandingPageContentData } from '../../services/contentService';

interface HeroSectionProps {
  onOpenDemo: () => void;
  content?: HeroContent | LandingPageContentData['hero'];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDemo, content }) => {
  const navigate = useNavigate();

  const tagBadge = (content as any)?.badgeText || (content as any)?.tagBadge || "Personalized 1-on-1 & Small-Batch Online Tuition";
  const title = (content as any)?.title;
  const headlineLine1 = (content as any)?.headlineLine1 || (title ? title.split('.')[0] + (title.includes('.') ? '.' : '') : "Personalized Learning.");
  const headlineLine2 = (content as any)?.headlineLine2Gradient || (title && title.includes('.') ? title.split('.').slice(1).join('.').trim() : (title ? "" : "Real Academic Results."));
  const subtitle = content?.subtitle || "EduPye connects students with India & GCC's top verified subject mentors for live 1-on-1 and small-batch tuition. Backed by interactive Dual SmartBoard tools, 24/7 adaptive practice, and full-year recorded lectures.";
  const primaryCtaText = content?.primaryCtaText || "Explore Tuition Programs";
  const primaryCtaLink = (content as any)?.primaryCtaLink || "/tuition-mode";
  const secondaryCtaText = content?.secondaryCtaText || "Be Our Tutor";
  const secondaryCtaLink = (content as any)?.secondaryCtaLink || "/become-a-tutor";

  return (
    <section id="hero" className="relative bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-10 pb-16 md:pt-16 md:pb-24 border-b border-slate-100 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Eyebrow Pill */}
        <div className="flex justify-center md:justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>{tagBadge}</span>
            <span className="text-emerald-300 dark:text-emerald-700 hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline font-medium">Individual Attention Guaranteed</span>
          </div>
        </div>

        {/* 2-Column Split: Left Copy & CTAs, Right Static Visual Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
              {headlineLine1}{' '}
              <span className="text-emerald-600 dark:text-emerald-400">
                {headlineLine2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            {/* Key Trust Checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Individualized Pace &amp; Attention</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Top 5% Screened Subject Specialist Mentors</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Dual-Dock SmartBoard &amp; Live Annotation</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>1-Year Class Recordings &amp; AI Practice LMS</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
              <button
                onClick={() => navigate(primaryCtaLink)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate(secondaryCtaLink)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{secondaryCtaText}</span>
              </button>

              <button
                onClick={onOpenDemo}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book Free Demo</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean Static Showcase Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-4">
              {/* Header pill */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live 1:1 SmartBoard Session
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active Classroom
                </span>
              </div>

              {/* Mentor Profile Preview */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                  Dr
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Dr. Priya Sundaram
                    </h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Senior Mathematics Specialist &bull; 9+ Yrs Exp
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                      5.0 (240+ Classes)
                    </span>
                  </div>
                </div>
              </div>

              {/* SmartBoard Derivation Snippet */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-emerald-500" />
                    Topic: Quadratic Equations &amp; Parabolic Trajectories
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono">LaTeX Sync</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-emerald-300 border border-slate-200/60 dark:border-slate-800">
                  f(x) = ax² + bx + c = 0 &rarr; x = (-b &plusmn; &radic;(b² - 4ac)) / 2a
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                    <Video className="w-3 h-3 text-emerald-500" /> HD Two-Way Audio/Video
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                    <BookOpen className="w-3 h-3 text-blue-500" /> Instant LMS Split-Screen
                  </span>
                </div>
              </div>

              {/* Student Feedback Quote */}
              <div className="text-xs text-slate-600 dark:text-slate-400 italic bg-amber-50/60 dark:bg-slate-950 p-3 rounded-xl border border-amber-200/50 dark:border-slate-800">
                &ldquo;My daughter went from 62% to 94% in CBSE Grade 10 Math within 3 months. The 1-on-1 focus and recorded sessions made all the difference.&rdquo;
                <div className="text-[10px] font-bold not-italic text-slate-800 dark:text-slate-300 mt-1">
                  — Rajesh K., Parent (Dubai, UAE)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Impact Stats Strip (Clean 4-Column Static Metric Bar) */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Individual Focus</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">1:1 &amp; Micro-Batch Batches</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Top 5%</div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Verified Mentors</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Rigorous 4-Step Selection</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Zero Lag</div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Dual SmartBoard</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Real-Time Stylus Annotations</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">365 Days</div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Class Recordings &amp; LMS</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Revisit Anytime On Any Device</div>
          </div>
        </div>
      </div>
    </section>
  );
};
