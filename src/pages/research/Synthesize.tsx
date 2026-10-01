import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FolderKanban,
  Info,
  X,
  ChevronRight,
  GitMerge,
  BarChart2,
  BookOpen,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';

export default function Synthesize() {
  const toast = useToast();
  const navigate = useNavigate();
  const { activeProject, allProjects, setActiveProjectId } = useResearchActiveProject();

  // Floating toast indicator
  const [activeToast, setActiveToast] = useState<{ message: string; visible: boolean }>({
    message: 'Started Meta-Analysis',
    visible: true,
  });

  const synthesisTypes = [
    {
      id: 'systematic_review',
      title: 'Systematic Review',
      desc: 'Comprehensive assessment of all relevant studies on a specific question with quality evaluation',
      badge: 'Review',
      action: () => {
        setActiveToast({ message: 'Started Systematic Review', visible: true });
        if (activeProject) {
          navigate(`/research/projects/${activeProject.id}?tab=analysis`);
        } else {
          toast.info('Select a research project session below to begin.');
        }
      },
    },
    {
      id: 'meta_analysis',
      title: 'Meta-Analysis',
      desc: 'Statistical combination of results from multiple studies to increase precision and power',
      badge: 'Analysis',
      action: () => {
        setActiveToast({ message: 'Started Meta-Analysis', visible: true });
        if (activeProject) {
          navigate(`/research/projects/${activeProject.id}?tab=analysis`);
        } else {
          toast.info('Select a research project session below to begin.');
        }
      },
    },
    {
      id: 'scoping_review',
      title: 'Scoping Review',
      desc: 'Map the extent of evidence and identify research gaps in a broad topic area',
      badge: 'Mapping',
      action: () => {
        setActiveToast({ message: 'Started Scoping Review', visible: true });
        if (activeProject) {
          navigate(`/research/discover`);
        } else {
          toast.info('Select a research project session below to begin.');
        }
      },
    },
    {
      id: 'narrative_review',
      title: 'Narrative Review',
      desc: 'Comprehensive overview providing broad perspective on established topics',
      badge: 'Overview',
      action: () => {
        setActiveToast({ message: 'Started Narrative Review', visible: true });
        if (activeProject) {
          navigate(`/research/write`);
        } else {
          toast.info('Select a research project session below to begin.');
        }
      },
    },
  ];

  return (
    <div className="min-h-full bg-slate-50/50 p-6 lg:p-10 max-w-5xl mx-auto space-y-8 relative">
      {/* 1. Header with minimal typography */}
      <div className="text-center space-y-1.5 pt-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Choose Your Synthesis
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          Select the type of evidence synthesis that best fits your research needs
        </p>
      </div>

      {/* 2. 4 Synthesis Option Cards (2x2 Grid) - Minimal White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {synthesisTypes.map((item) => (
          <div
            key={item.id}
            onClick={item.action}
            className="bg-white hover:bg-slate-50/60 border border-slate-200 rounded-2xl p-6 shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-5 hover:border-slate-300 hover:shadow-sm group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors shrink-0" />
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>

            <div>
              <span className="inline-block px-4 py-1 bg-slate-100 group-hover:bg-slate-200/70 text-slate-700 text-xs font-medium rounded-full border border-slate-200/80 transition-colors">
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Minimal Clean Divider */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase px-2 select-none">
          OR
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* 4. Select A Session Section */}
      <div className="text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Select A Session
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Continue working on your existing synthesis projects
          </p>
        </div>

        {/* Sessions / Projects Container */}
        <div className="max-w-2xl mx-auto p-4 bg-white border border-slate-200 rounded-2xl shadow-xs text-left space-y-2">
          {allProjects.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <FolderKanban className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                No existing synthesis sessions found. Create a project to start.
              </p>
              <button
                onClick={() => navigate('/research/projects')}
                className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                + New Research Project
              </button>
            </div>
          ) : (
            allProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setActiveProjectId(p.id);
                  setActiveToast({ message: `Session Selected: ${p.title}`, visible: true });
                  navigate(`/research/projects/${p.id}?tab=analysis`);
                }}
                className={`p-3.5 rounded-xl flex justify-between items-center cursor-pointer transition-all ${
                  activeProject?.id === p.id
                    ? 'bg-slate-50 border border-slate-300'
                    : 'bg-white hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 pt-0.5 truncate">
                    Stage: {p.currentStage} • {p.paperCount} papers attached
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-slate-600">
                  <span className="text-xs font-medium">
                    Resume
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Minimal Toast Notification in Bottom Right */}
      {activeToast.visible && (
        <div className="fixed bottom-5 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div className="bg-white border border-slate-200 shadow-md rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-slate-800 font-medium">
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <span>{activeToast.message}</span>
            <button
              onClick={() => setActiveToast({ ...activeToast, visible: false })}
              className="ml-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
