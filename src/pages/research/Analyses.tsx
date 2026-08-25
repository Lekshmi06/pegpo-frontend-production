import React from 'react';
import { TrendingUp, Star } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function Analyses() {
  const toast = useToast();
  const tools = [
    {
      id: 1,
      title: 'Identify strategic research gaps',
      desc: 'Synthesize findings across studies to identify novel and fundable research opportunites',
      tag: 'analysis',
      starred: true
    },
    {
      id: 2,
      title: 'Extract high-impact citations',
      desc: 'Extract and prioritize the most cited and influential papers relevant to your field',
      tag: 'Department',
      starred: true
    },
    {
      id: 3,
      title: 'Compare competing hypotheses',
      desc: "Compare prevailing hypotheses and models to inform your lab's research direction",
      tag: 'Department',
      starred: true
    },
    {
      id: 4,
      title: 'Create literature review table',
      desc: 'Organize studies in a comprehensive table with key methods, findings, and citations for systematic review',
      tag: 'Department',
      starred: true
    },
    {
      id: 5,
      title: 'Build a strategic research timeline',
      desc: 'Synthesize findings across studies to identify novel and fundable research opportunites',
      tag: 'Department',
      starred: true
    },
    {
      id: 6,
      title: 'Extract methodological best practices',
      desc: 'Synthesize findings across studies to identify novel and fundable research opportunites',
      tag: 'Department',
      starred: true
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-1.5 py-2">
        <h1 className="text-2xl font-extrabold text-slate-800">All Available Tools</h1>
        <p className="text-xs text-slate-500 font-semibold">Choose from curated synthesis task (suggestions for your role shown first)</p>
      </div>

      <div className="flex items-center gap-2 text-amber-500 font-bold text-xs pl-1">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="text-slate-700">Suggested for your role</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((t) => (
          <div 
            key={t.id}
            onClick={() => toast.info(`Launched tool: ${t.title}`)}
            className="bg-[#e3effa] hover:bg-[#d5e6f5] border border-slate-200/50 rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#264973] flex-shrink-0" />
                  <h3 className="text-sm font-bold text-[#264973] leading-snug">{t.title}</h3>
                </div>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
              </div>
              <p className="text-xs text-slate-600 leading-normal pl-6">
                {t.desc}
              </p>
            </div>
            
            <div className="pl-6">
              <span className="inline-block px-3 py-1 bg-white text-[#264973] text-[10px] font-bold rounded-lg border border-slate-200/60 shadow-2xs">
                {t.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
