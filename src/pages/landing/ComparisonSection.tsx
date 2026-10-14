import React from 'react';
import { CheckCircle2, XCircle, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  const comparisonItems = [
    {
      feature: 'Platform Architecture',
      traditional: '5-8 Disconnected tools (LMS + Whiteboard + ERP + Zoom + AI)',
      edupye: 'One Unified Cloud Ecosystem with native cross-module sync',
    },
    {
      feature: 'Student Learning Experience',
      traditional: 'Static PDFs, recorded links, fragmented homework portals',
      edupye: 'Adaptive AI study companion, PYQ drills & timed Exam Cracker',
    },
    {
      feature: 'Educator Lesson Prep',
      traditional: 'Manual lesson typing & unorganized slide folders',
      edupye: '1-Click AI lesson blueprints & native cloud SmartBoard canvas',
    },
    {
      feature: 'Assessment & Grading',
      traditional: 'Hours of paper grading or basic multiple-choice quizzes',
      edupye: 'Instant AI rubric evaluation with handwriting & diagram support',
    },
    {
      feature: 'Campus Administration & ERP',
      traditional: 'Separate legacy desktop database requiring manual exports',
      edupye: 'Cloud-native SIS, biometric attendance & automated fee gateways',
    },
    {
      feature: 'Corporate & Research Workspaces',
      traditional: 'Not supported or requires expensive enterprise add-ons',
      edupye: 'Integrated literature synthesis, APA citations & corporate cohorts',
    },
    {
      feature: 'Software Licensing Costs',
      traditional: '$120 - $240 / student / year across 6 different software licenses',
      edupye: 'Consolidated SaaS pricing with up to 70% cost savings',
    },
  ];

  return (
    <section className="py-20 bg-slate-900/40 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Why EduPye</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Stop stitching together five different tools.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Compare the legacy fragmented education stack with EduPye’s unified architecture.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-slate-900/90 border-b border-slate-800 p-4 sm:p-6 text-xs sm:text-sm font-bold">
            <div className="col-span-4 text-slate-400">Platform Capability</div>
            <div className="col-span-4 text-slate-400">Traditional Fragmented Tools</div>
            <div className="col-span-4 text-blue-400 flex items-center gap-1.5 font-extrabold">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>EduPye Unified Platform</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-800/80">
            {comparisonItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-4 sm:p-6 text-xs sm:text-sm hover:bg-slate-900/40 transition-colors items-center"
              >
                <div className="col-span-4 font-semibold text-white pr-2">
                  {item.feature}
                </div>
                <div className="col-span-4 text-slate-400 pr-2 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-500/80 shrink-0 mt-0.5" />
                  <span>{item.traditional}</span>
                </div>
                <div className="col-span-4 text-blue-200 font-medium flex items-start gap-2 bg-blue-950/20 p-2.5 rounded-xl border border-blue-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item.edupye}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
