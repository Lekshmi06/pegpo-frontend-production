import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Brain, 
  Tv, 
  Presentation, 
  GraduationCap, 
  FileCheck, 
  ShieldCheck, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import type { FeatureItem } from '../../services/contentService';

interface FeaturesSectionProps {
  dynamicFeatures?: FeatureItem[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ dynamicFeatures }) => {
  const navigate = useNavigate();

  const defaultFeatures = [
    {
      id: 'individual-attention',
      title: '1-on-1 & Micro-Batch Focus',
      description: 'Unlike crowded coaching centers with 60+ students, our mentors teach at your child\'s exact pace, ensuring zero hesitation in asking questions.',
      icon: Users,
      badge: 'Personalized Attention',
    },
    {
      id: 'dual-smartboard',
      title: 'Interactive Dual SmartBoard',
      description: 'Both student and teacher write, draw diagrams, solve LaTeX math equations, and annotate textbook problems in real-time with zero lag.',
      icon: Presentation,
      badge: 'Proprietary Tech',
    },
    {
      id: 'verified-mentors',
      title: 'Top 5% Screened Mentors',
      description: 'Rigorous 4-stage screening evaluating subject mastery, student empathy, and curriculum knowledge across CBSE, ICSE, and State boards.',
      icon: ShieldCheck,
      badge: 'Verified Excellence',
    },
    {
      id: 'recordings-archive',
      title: '1-Year Class Recordings',
      description: 'Every live session is automatically recorded and archived in high-definition so students can revise before school tests and exams anytime.',
      icon: Clock,
      badge: 'Unlimited Revision',
    },
    {
      id: 'ai-practice-lms',
      title: 'AI-Powered Practice LMS',
      description: 'Integrated split-screen access to topic-wise quizzes, diagnostic baseline assessments, Previous Year Questions (PYQs), and AI formula assistance.',
      icon: Brain,
      badge: '24/7 Study Studio',
    },
    {
      id: 'parent-reporting',
      title: 'Transparent Parent Updates',
      description: 'Detailed weekly feedback on conceptual retention, homework completion, and attendance directly to parents on WhatsApp and portal.',
      icon: FileCheck,
      badge: 'Progress Visibility',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Why EduPye Tuition</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Designed for Real Concept Clarity &amp; Exam Confidence
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            We combined human instructional mastery with zero-friction classroom technology to create the ideal learning environment.
          </p>
        </div>

        {/* Static Feature Grid (Strictly Non-Moving) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(dynamicFeatures && dynamicFeatures.length > 0 ? dynamicFeatures : defaultFeatures).map((f: any, i: number) => {
            const IconComp = f.icon && typeof f.icon !== 'string' ? f.icon : Brain;
            return (
              <div
                key={f.id || i}
                className="bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <IconComp className="w-6 h-6" />
                  </div>

                  {f.badge && (
                    <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                      {f.badge}
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {f.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
