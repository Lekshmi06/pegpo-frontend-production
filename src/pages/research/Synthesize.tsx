import React from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function Synthesize() {
  const toast = useToast();
  const synthesisTypes = [
    {
      id: 1,
      title: 'Systematic Review',
      desc: 'Comprehensive assessment of all relevant studies on a specific question with quality evaluation',
      tag: 'Review'
    },
    {
      id: 2,
      title: 'Meta-Analysis',
      desc: 'Statistical combination of results from multiple studies to increase precision and power',
      tag: 'Analysis'
    },
    {
      id: 3,
      title: 'Scoping Review',
      desc: 'Map the extent of evidence and identify research gaps in a broad topic area',
      tag: 'Mapping'
    },
    {
      id: 4,
      title: 'Narrative Review',
      desc: 'Comprehensive overview providing broad perspective on established topics',
      tag: 'Overview'
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-1.5 py-2">
        <h1 className="text-2xl font-extrabold text-slate-800">Choose Your Synthesis</h1>
        <p className="text-xs text-slate-500 font-semibold">Select the type of evidence synthesis that best fits your research Needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {synthesisTypes.map((item) => (
          <div 
            key={item.id}
            onClick={() => toast.info(`Started ${item.title}`)}
            className="bg-[#e3effa] hover:bg-[#d5e6f5] border border-slate-200/50 rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#264973] flex-shrink-0" />
                <h3 className="text-sm font-bold text-[#264973]">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-normal pl-6">
                {item.desc}
              </p>
            </div>
            <div className="pl-6">
              <span className="inline-block px-3 py-1 bg-white text-[#264973] text-[10px] font-bold rounded-lg border border-slate-200/60 shadow-2xs">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex-1 h-px bg-sky-200"></div>
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest px-2">OR</span>
        <div className="flex-1 h-px bg-sky-200"></div>
      </div>

      <div className="text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-800">Select A Session</h2>
          <p className="text-xs text-slate-500 font-semibold">Continue working on your existing synthesis projects</p>
        </div>

        <div className="max-w-xl mx-auto p-6 bg-white border border-[#e2edf7] rounded-3xl shadow-sm text-left space-y-3">
          <div 
            onClick={() => toast.info('Opened Calculus Meta-Analysis')}
            className="p-3 bg-[#e3edf7] rounded-2xl flex justify-between items-center hover:bg-[#d5e6f5] cursor-pointer transition-colors"
          >
            <div>
              <h4 className="text-xs font-bold text-[#264973]">Calculus Adaptive Learning Meta-Analysis</h4>
              <p className="text-[10px] text-slate-500 font-semibold">Last edited 2 hours ago • 14 papers included</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#264973]" />
          </div>

          <div 
            onClick={() => toast.info('Opened Dual-Coding Review')}
            className="p-3 bg-[#e3edf7] rounded-2xl flex justify-between items-center hover:bg-[#d5e6f5] cursor-pointer transition-colors"
          >
            <div>
              <h4 className="text-xs font-bold text-[#264973]">Dual-Coding Cognitive Load Scoping Review</h4>
              <p className="text-[10px] text-slate-500 font-semibold">Last edited Yesterday • 8 papers included</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#264973]" />
          </div>
        </div>
      </div>
    </div>
  );
}
