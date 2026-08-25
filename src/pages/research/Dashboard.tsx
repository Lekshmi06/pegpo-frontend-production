import React, { useState } from 'react';
import { Clock, ArrowUp, ChevronDown } from 'lucide-react';
import { useResearchData } from '../../hooks/useResearchData';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';

export default function ResearchDashboard() {
  const toast = useToast();
  const { data, addGoal } = useResearchData();

  const [activeSubTab, setActiveSubTab] = useState<'Topics' | 'Recent' | 'Notes'>('Topics');
  const [researchGoal, setResearchGoal] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [outputResult, setOutputResult] = useState<{ summary: string; relatedNotes: string[] } | null>(null);

  const handleAddSource = () => {
    const mockSource = `lit_review_source_${sources.length + 1}.pdf`;
    setSources([...sources, mockSource]);
    toast.info(`Added source: ${mockSource}`);
  };

  const handleStartAnalysis = () => {
    if (!researchGoal.trim() && sources.length === 0) {
      toast.error('Please enter a research goal or upload a source first.');
      return;
    }

    if (researchGoal.trim()) {
      addGoal(researchGoal);
    }

    setStatus('Analyzing literature sources and synthesizing research hypothesis...');
    setOutputResult(null);

    setTimeout(() => {
      setStatus('');
      setOutputResult({
        summary: `AI generated hypothesis for "${researchGoal || 'Advanced Literature Synthesis'}": Implementing dual-coding systems reduces average learner cognitive load metrics by 18.2%.`,
        relatedNotes: [
          'Calculus study datasets Q2',
          'Cognitive load measurements in dual-coding theory',
        ],
      });
      toast.success('Literature synthesis complete!');
    }, 1500);
  };

  return (
    <div className="flex h-full min-h-[550px] -m-6 bg-[#f8fafc]">
      <div className="w-52 bg-[#e9f2fb] border-r border-[#e2edf7] py-6 px-4 flex flex-col gap-3 flex-shrink-0 hidden sm:flex">
        {(['Topics', 'Recent', 'Notes'] as const).map((subTab) => (
          <button
            key={subTab}
            onClick={() => setActiveSubTab(subTab)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer ${
              activeSubTab === subTab
                ? 'bg-[#3f88c5] text-white shadow-sm'
                : 'bg-white text-[#264973] border border-slate-100 hover:bg-[#e2edf7]'
            }`}
          >
            {subTab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50 flex flex-col items-center">
        {activeSubTab === 'Topics' && (
          <div className="w-full max-w-3xl space-y-6">
            <div className="bg-white border border-[#e2edf7] rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                <span className="text-xs font-bold text-[#264973]">Chat</span>
                <ChevronDown className="w-4 h-4 text-[#264973]" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase block pl-1">Research Goal</label>
                <textarea
                  value={researchGoal}
                  onChange={(e) => setResearchGoal(e.target.value)}
                  placeholder="Drop your Research Goal"
                  rows={4}
                  className="w-full text-sm p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#3f88c5] text-slate-800 font-medium"
                />
              </div>

              <div className="text-center pt-2">
                <Button onClick={handleStartAnalysis} className="w-full py-3.5">
                  Start Analysis
                </Button>
              </div>

              <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">OR</div>

              <div
                onClick={handleAddSource}
                className="border border-[#d0e3f7] bg-[#f4f9fd] hover:bg-[#eaf3fb] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 shadow-2xs"
              >
                <ArrowUp className="w-5 h-5 text-[#1c3352] stroke-[2.5]" />
                <h4 className="text-sm font-bold text-[#111827] tracking-tight">Add a source to get started</h4>
                <p className="text-xs text-[#6b7280] font-semibold">Upload a source</p>

                {sources.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {sources.map((src) => (
                      <span key={src} className="px-3 py-1 bg-[#e3edf7] text-[#1c3352] border border-[#d0e3f7] text-[10px] font-bold rounded-lg">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {status && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center text-xs font-semibold text-blue-700 animate-pulse">
                {status}
              </div>
            )}

            {outputResult && (
              <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Synthesis Finished</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {outputResult.summary}
                </p>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Synthesized Notes References</h4>
                  <div className="flex gap-2">
                    {outputResult.relatedNotes.map((note) => (
                      <span key={note} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'Recent' && (
          <div className="w-full max-w-xl space-y-4">
            <h3 className="text-sm font-bold text-[#264973] mb-4">Recent Goals</h3>
            <div className="space-y-2.5">
              {(data?.recentGoals || []).map((g) => (
                <div key={g.id} className="p-4 bg-white border border-[#e2edf7] rounded-2xl flex justify-between items-center shadow-sm hover:shadow transition-all">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{g.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{g.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'Notes' && (
          <div className="w-full max-w-xl space-y-4">
            <h3 className="text-sm font-bold text-[#264973] mb-4">Research Notes Shelf</h3>
            <div className="p-6 bg-white border border-[#e2edf7] rounded-3xl shadow-sm text-center space-y-3">
              <p className="text-xs text-slate-500 leading-normal">
                Notes created during your research sessions will automatically synchronize in this tab folder.
              </p>
              <Button size="sm" onClick={() => toast.info('Opening Notebook')}>
                Open Notebook
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
