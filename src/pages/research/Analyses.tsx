import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Star,
  Layers,
  FolderKanban,
  ArrowRight,
  BookOpen,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { researchService } from '../../services/researchService';
import { ResearchProjectSummary } from '../../types/research';

export default function Analyses() {
  const toast = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ResearchProjectSummary[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const list = await researchService.listProjects();
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id || (list[0] as any)._id);
        }
      } catch (err) {
        console.error('Failed to load projects for analysis:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleLaunchTool = (tool: any) => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id || (projects[0] as any)._id);
    }

    const targetProject = selectedProjectId || (projects[0]?.id || (projects[0] as any)?._id);

    if (targetProject) {
      if (tool.id === 4 || tool.id === 3) {
        // Literature Review Table / Compare competing hypotheses -> Comparative Analysis Matrix
        toast.info(`Launching ${tool.title} for project...`);
        navigate(`/research/projects/${targetProject}?tab=analysis`);
        return;
      }
      if (tool.id === 1) {
        // Strategic Gaps -> Project Overview/AI
        toast.info(`Launching gap synthesis for project...`);
        navigate(`/research/projects/${targetProject}?tab=overview`);
        return;
      }
      // Default to workspace notes or analysis
      navigate(`/research/projects/${targetProject}?tab=notes`);
    } else {
      toast.info(`Create or open a Research Project to run: ${tool.title}`);
      navigate('/research/projects');
    }
  };

  const tools = [
    {
      id: 4,
      title: 'Comparative Literature Review Matrix',
      desc: 'Multidimensional side-by-side analysis of model architectures, benchmark datasets, findings, and trade-offs across project papers.',
      tag: 'Core Synthesis',
      starred: true,
      highlight: true,
      tab: 'analysis',
    },
    {
      id: 1,
      title: 'Identify strategic research gaps',
      desc: 'Synthesize findings across studies to identify novel and fundable research opportunities grounded in your project literature.',
      tag: 'Strategic AI',
      starred: true,
      tab: 'overview',
    },
    {
      id: 3,
      title: 'Compare competing hypotheses & notes',
      desc: "Contrast prevailing hypotheses and empirical critiques documented in your lab's research workspace.",
      tag: 'Hypotheses',
      starred: true,
      tab: 'notes',
    },
    {
      id: 2,
      title: 'Extract high-impact citations',
      desc: 'Extract and prioritize the most cited and influential papers relevant to your specific research objectives.',
      tag: 'Literature',
      starred: false,
    },
    {
      id: 5,
      title: 'Build a strategic research timeline',
      desc: 'Organize study stages, objectives, and methodological milestones for publication and funding applications.',
      tag: 'Planning',
      starred: false,
    },
    {
      id: 6,
      title: 'Extract methodological best practices',
      desc: 'Identify consensus validation protocols, evaluation metrics, and clinical benchmark cohort sizes.',
      tag: 'Methodology',
      starred: false,
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5 py-2">
        <h1 className="text-2xl font-extrabold text-slate-800">Literature Synthesis & Analysis Engine</h1>
        <p className="text-xs text-slate-500 font-semibold">
          Curated cross-literature synthesis pipelines grounded in your active research workspaces
        </p>
      </div>

      {/* Active Project Selector Bar */}
      {projects.length > 0 ? (
        <div className="bg-[#e8f1fa] border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                Target Project Workspace
              </span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-hidden focus:border-blue-500 transition-colors"
              >
                {projects.map((p) => {
                  const pId = p.id || (p as any)._id;
                  return (
                    <option key={pId} value={pId}>
                      {p.title} ({p.paperCount || 0} papers)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              if (selectedProjectId) {
                navigate(`/research/projects/${selectedProjectId}?tab=analysis`);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#264973] hover:bg-[#1d3757] text-white text-xs font-bold transition-colors shadow-xs self-start sm:self-center"
          >
            <Layers className="w-3.5 h-3.5 text-sky-300" />
            <span>Open Comparative Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-800">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Create a Research Project to run automated comparative matrices and cross-paper gap analyses.</span>
          </div>
          <button
            onClick={() => navigate('/research/projects')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0"
          >
            Create Project
          </button>
        </div>
      )}

      {/* Suggested for your role badge */}
      <div className="flex items-center gap-2 text-amber-500 font-bold text-xs pl-1">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="text-slate-700">Recommended Synthesis Pipelines</span>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((t) => (
          <div
            key={t.id}
            onClick={() => handleLaunchTool(t)}
            className={`border rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
              t.highlight
                ? 'bg-gradient-to-br from-[#e0efff] to-[#e8f3fc] border-blue-300 hover:border-blue-400 hover:shadow-md'
                : 'bg-[#e3effa] hover:bg-[#d5e6f5] border-slate-200/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-2">
                  {t.highlight ? (
                    <Layers className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-[#264973] flex-shrink-0" />
                  )}
                  <h3 className="text-sm font-bold text-[#264973] leading-snug">{t.title}</h3>
                </div>
                {t.starred && <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />}
              </div>
              <p className="text-xs text-slate-600 leading-normal pl-6">
                {t.desc}
              </p>
            </div>

            <div className="pl-6 flex items-center justify-between">
              <span className="inline-block px-3 py-1 bg-white text-[#264973] text-[10px] font-bold rounded-lg border border-slate-200/60 shadow-2xs">
                {t.tag}
              </span>
              <span className="text-[11px] font-bold text-blue-700 inline-flex items-center gap-1 group-hover:underline">
                <span>Launch</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

