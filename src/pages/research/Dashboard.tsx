import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Compass,
  FileText,
  BarChart2,
  GitMerge,
  Lightbulb,
  ArrowRight,
  BookOpen,
  FolderKanban,
  Bookmark,
  Share2,
  Clock,
  Layers,
  Database,
  FlaskConical,
  Award,
  Plus,
  CheckCircle2,
  CheckSquare,
  Calendar as CalendarIcon,
  ExternalLink,
  ChevronRight,
  Quote,
  Flame,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { researcherProfileService } from '../../services/researcherProfileService';
import { researchService, LiteratureSearchResult } from '../../services/researchService';
import {
  ResearchData,
  ResearchPaper,
  ResearchProjectSummary,
  TaskSummaryCounts,
} from '../../types/research';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';

export default function ResearchDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const { activeProjectId } = useResearchActiveProject();
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [taskSummary, setTaskSummary] = useState<TaskSummaryCounts | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [calendarSummary, setCalendarSummary] = useState<{
    today: number;
    upcoming: number;
    overdue: number;
    nextMilestone: string | null;
  }>({
    today: 0,
    upcoming: 0,
    overdue: 0,
    nextMilestone: null,
  });

  // "What are you researching today?" state
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchResult, setActiveSearchResult] = useState<LiteratureSearchResult | null>(null);

  // Selected papers for multi-paper actions (compare/synthesize)
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);

  useEffect(() => {
    const targetProjectId = activeProjectId || researchData?.activeProjects?.[0]?.id;
    if (!targetProjectId) return;

    let isMounted = true;
    setTasksLoading(true);

    // Fetch tasks summary
    researchService.getProjectTaskSummary(targetProjectId)
      .then((summary) => {
        if (isMounted) setTaskSummary(summary);
      })
      .catch((err) => {
        console.warn('Could not load task summary for dashboard:', err);
      })
      .finally(() => {
        if (isMounted) setTasksLoading(false);
      });

    // Fetch calendar timeline metrics
    researchService.getProjectCalendar(targetProjectId)
      .then((calData) => {
        if (!isMounted) return;
        const now = new Date();
        const todayStr = now.toDateString();
        let todayCount = 0;
        let upcomingCount = 0;
        let overdueCount = 0;
        const milestones: Array<{ title: string; date: Date }> = [];

        (calData.tasks || []).forEach((t) => {
          if (!t.dueDate) return;
          const d = new Date(t.dueDate);
          if (d.toDateString() === todayStr) todayCount++;
          else if (d.getTime() > now.getTime()) upcomingCount++;
          else if (t.status !== 'done') overdueCount++;
        });

        (calData.events || []).forEach((e) => {
          const d = new Date(e.startDate);
          if (d.toDateString() === todayStr) todayCount++;
          else if (d.getTime() > now.getTime()) upcomingCount++;
          if (e.type === 'milestone' && d.getTime() >= now.getTime()) {
            milestones.push({ title: e.title, date: d });
          }
        });

        milestones.sort((a, b) => a.date.getTime() - b.date.getTime());

        setCalendarSummary({
          today: todayCount,
          upcoming: upcomingCount,
          overdue: overdueCount,
          nextMilestone: milestones[0]?.title || null,
        });
      })
      .catch((err) => {
        console.warn('Could not load calendar metrics for dashboard:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeProjectId, researchData?.activeProjects]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const cachedProfile = researcherProfileService.getCachedProfile();
        setProfile(cachedProfile);

        const data = await researchService.getResearchData();
        setResearchData(data);
      } catch (err) {
        console.warn('Error loading research dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleExecutePrompt = async (promptQuery?: string) => {
    const q = promptQuery || searchPrompt.trim();
    if (!q) {
      toast.error('Please enter a research topic or question.');
      return;
    }

    setIsSearching(true);
    try {
      const res = await researchService.searchLiterature(q);
      setActiveSearchResult(res);
      toast.success(`Found and synthesized ${res.papers.length} studies for "${q}"`);
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSelectPaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleBookmark = async (paperId: string) => {
    const bookmarked = await researchService.toggleBookmarkPaper(paperId);
    if (researchData) {
      setResearchData({
        ...researchData,
        recentPapers: researchData.recentPapers.map((p) =>
          p.id === paperId ? { ...p, isBookmarked: bookmarked } : p
        ),
      });
    }
    toast.info(bookmarked ? 'Paper bookmarked in Research Library' : 'Bookmark removed');
  };

  const handleCompareSelected = () => {
    if (selectedPaperIds.length < 2) {
      toast.error('Please select at least 2 papers to compare.');
      return;
    }
    navigate(`/research/analyses?compare=${selectedPaperIds.join(',')}`);
  };

  const handleSynthesizeSelected = () => {
    navigate(`/research/synthesize?papers=${selectedPaperIds.join(',')}`);
  };

  const EXAMPLE_PROMPTS = [
    'Find recent research on medical image segmentation',
    'Compare transformer and CNN approaches for image segmentation',
    'Find potential research gaps in low-shot CT',
    'Analyze Swin-UNETR vs nnU-Net benchmarks',
  ];

  return (
    <div className="p-4 sm:p-7 max-w-7xl mx-auto space-y-7">
      {/* 1. Researcher Identity & Context Banner */}
      <div className="bg-gradient-to-r from-[#0c192c] to-[#162f52] rounded-3xl p-5 sm:p-6 text-white shadow-sm border border-[#1e385c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 tracking-wider">
              {profile?.academicInfo?.currentStatus || 'Postgraduate Researcher'}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {profile?.academicInfo?.institution || 'Academic Institute'} • {profile?.academicInfo?.department || 'Department'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Welcome back, {profile?.fullName || 'Researcher'}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-blue-200 font-bold">
              {profile?.researchDomains?.[0] || 'Computer Science'}:
            </span>
            {(profile?.researchInterests && profile.researchInterests.length > 0
              ? profile.researchInterests
              : ['Computer Vision', 'Medical Imaging', 'Deep Learning', 'Segmentation']
            ).map((interest: string) => (
              <span
                key={interest}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 transition-colors"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-left md:text-right text-xs">
            <span className="text-slate-400 font-medium block text-[11px]">Experience Track</span>
            <span className="text-blue-300 font-bold block">
              {profile?.researchExperience?.level || 'Beginner'} Researcher
            </span>
          </div>
          <button
            onClick={() => navigate('/onboarding/researcher')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition-all cursor-pointer shadow-2xs"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* 2. Prominent AI Research Entry Point: "What are you researching today?" */}
      <div className="bg-white border border-[#e2ebf4] rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0091ff]/10 text-[#0091ff] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                What are you researching today?
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ask a research question, discover peer papers, compare methodologies, or synthesize gaps.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#006bbd] bg-blue-50 px-2.5 py-1 rounded-full hidden sm:inline-block">
            Grounded in Research Corpus
          </span>
        </div>

        {/* Big Search Input with Action Trigger */}
        <div className="relative">
          <textarea
            rows={2}
            value={searchPrompt}
            onChange={(e) => setSearchPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleExecutePrompt();
              }
            }}
            placeholder="e.g. Find recent research on medical image segmentation with shifted window attention..."
            className="w-full p-4 pr-32 border border-blue-200 rounded-2xl bg-[#f8fbfe] text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 shadow-2xs leading-relaxed"
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <Button
              onClick={() => handleExecutePrompt()}
              isLoading={isSearching}
              className="px-4 py-2 text-xs font-bold"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Try asking:</span>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setSearchPrompt(prompt);
                handleExecutePrompt(prompt);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#006bbd] border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Inline Synthesis Result if Prompt was Executed */}
        {activeSearchResult && (
          <div className="mt-4 p-5 rounded-2xl bg-[#f0f7fe] border border-[#cbe3fa] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#006bbd]">
                <Sparkles className="w-4 h-4 text-[#0091ff]" />
                <span>AI Literature Synthesis: {activeSearchResult.query}</span>
              </div>
              <button
                onClick={() => setActiveSearchResult(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeSearchResult.synthesisSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
                  Identified Research Gaps
                </span>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 font-medium">
                  {activeSearchResult.detectedGaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1">
                <span className="text-[10px] font-extrabold text-[#006bbd] uppercase tracking-wider block">
                  Dominant Methodologies
                </span>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 font-medium">
                  {activeSearchResult.recommendedMethodologies.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Quick AI Research Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            title: 'Find Papers',
            desc: 'Search literature corpus',
            icon: Search,
            route: '/research/discover',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            title: 'Analyze Papers',
            desc: 'Extract methods & data',
            icon: BarChart2,
            route: '/research/analyses',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            title: 'Compare Papers',
            desc: 'Cross-paper matrices',
            icon: Layers,
            route: '/research/analyses',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            title: 'Synthesize Literature',
            desc: 'Thematic reviews',
            icon: GitMerge,
            route: '/research/synthesize',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            title: 'Explore Gaps',
            desc: 'Under-explored areas',
            icon: Lightbulb,
            route: '/research/discover',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            title: 'Ask Research AI',
            desc: 'Grounded copilot',
            icon: Sparkles,
            route: '/research/notebook',
            color: 'text-sky-600',
            bg: 'bg-sky-50',
          },
        ].map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={() => navigate(act.route)}
              className="p-3.5 bg-white border border-[#e2ebf4] hover:border-blue-300 rounded-2xl text-left transition-all hover:shadow-xs group cursor-pointer flex flex-col justify-between"
            >
              <div className={`w-8 h-8 rounded-xl ${act.bg} ${act.color} flex items-center justify-center mb-2.5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-[#0091ff] transition-colors leading-tight">
                  {act.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium pt-0.5 truncate">
                  {act.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Research Execution: Tasks & Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Research Tasks Summary */}
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-purple-200 transition-all flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Research Tasks Summary
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Milestones & action items for project execution
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(activeProjectId ? `/research/kanban?projectId=${activeProjectId}` : '/research/kanban')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Open Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3.5">
            <div
              onClick={() => navigate(activeProjectId ? `/research/kanban?projectId=${activeProjectId}&filter=all` : '/research/kanban')}
              className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-100 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-slate-500 block">Active Tasks</span>
              <span className="text-xl font-bold text-slate-900 group-hover:text-purple-600 mt-1 block">
                {tasksLoading ? '...' : (taskSummary?.active ?? 0)}
              </span>
            </div>

            <div
              onClick={() => navigate(activeProjectId ? `/research/kanban?projectId=${activeProjectId}&filter=due_this_week` : '/research/kanban')}
              className="p-3 bg-amber-50/60 hover:bg-amber-100/60 rounded-xl border border-amber-100 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-amber-800 block">Due Soon</span>
              <span className="text-xl font-bold text-amber-700 mt-1 block">
                {tasksLoading ? '...' : (taskSummary?.dueSoon ?? 0)}
              </span>
            </div>

            <div
              onClick={() => navigate(activeProjectId ? `/research/kanban?projectId=${activeProjectId}&filter=overdue` : '/research/kanban')}
              className="p-3 bg-rose-50/60 hover:bg-rose-100/60 rounded-xl border border-rose-100 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-rose-800 block">Overdue</span>
              <span className="text-xl font-bold text-rose-600 mt-1 block">
                {tasksLoading ? '...' : (taskSummary?.overdue ?? 0)}
              </span>
            </div>

            <div
              onClick={() => navigate(activeProjectId ? `/research/kanban?projectId=${activeProjectId}&filter=all` : '/research/kanban')}
              className="p-3 bg-emerald-50/60 hover:bg-emerald-100/60 rounded-xl border border-emerald-100 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-emerald-800 block">Completed</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                {tasksLoading ? '...' : (taskSummary?.completed ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Research Calendar Summary */}
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Research Calendar
                </h3>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                  {calendarSummary.nextMilestone ? `Next: ${calendarSummary.nextMilestone}` : 'Timeline of study dates & meetings'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(activeProjectId ? `/research/calendar?projectId=${activeProjectId}` : '/research/calendar')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Open Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3.5">
            <div
              onClick={() => navigate(activeProjectId ? `/research/calendar?projectId=${activeProjectId}` : '/research/calendar')}
              className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-100 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-slate-500 block">Today</span>
              <span className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 mt-1 block">
                {calendarSummary.today}
              </span>
            </div>

            <div
              onClick={() => navigate(activeProjectId ? `/research/calendar?projectId=${activeProjectId}` : '/research/calendar')}
              className="p-3 bg-sky-50/60 hover:bg-sky-100/60 rounded-xl border border-sky-100 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-sky-800 block">Upcoming</span>
              <span className="text-xl font-bold text-sky-700 mt-1 block">
                {calendarSummary.upcoming}
              </span>
            </div>

            <div
              onClick={() => navigate(activeProjectId ? `/research/calendar?projectId=${activeProjectId}` : '/research/calendar')}
              className="p-3 bg-rose-50/60 hover:bg-rose-100/60 rounded-xl border border-rose-100 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-rose-800 block">Overdue</span>
              <span className="text-xl font-bold text-rose-600 mt-1 block">
                {calendarSummary.overdue}
              </span>
            </div>

            <div
              onClick={() => navigate(activeProjectId ? `/research/calendar?projectId=${activeProjectId}` : '/research/calendar')}
              className="p-3 bg-purple-50/60 hover:bg-purple-100/60 rounded-xl border border-purple-100 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-semibold text-purple-800 block">Next Milestone</span>
              <span className="text-xs font-bold text-purple-700 mt-1.5 block truncate" title={calendarSummary.nextMilestone || 'None scheduled'}>
                {calendarSummary.nextMilestone || 'None set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Research Projects */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#0091ff]" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Active Research Projects
            </h3>
          </div>
          <button
            onClick={() => navigate('/research/projects')}
            className="text-xs font-bold text-[#0091ff] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(researchData?.activeProjects || []).map((project) => (
            <div
              key={project.id}
              className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-3.5 hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#006bbd] uppercase tracking-wider border border-blue-100">
                    {project.currentStage}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Updated {project.lastUpdated}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {project.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium line-clamp-2">
                  {project.problemStatement}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                  <span>📄 {project.paperCount} papers</span>
                  <span>📝 {project.notesCount} notes</span>
                  <span className="text-amber-600 font-bold">💡 {project.gapsCount} gaps</span>
                </div>
                <button
                  onClick={() => navigate(`/research/projects/${project.id || (project as any)._id}`)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#006bbd] text-xs font-bold transition-colors cursor-pointer"
                >
                  Open Workspace &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Papers with Research Metadata & Action Toolbar */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0091ff]" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Recent Papers in Workspace
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              ({researchData?.recentPapers.length || 0} studies)
            </span>
          </div>

          {/* Multi-paper action bar if selected */}
          {selectedPaperIds.length > 0 && (
            <div className="flex items-center gap-2 bg-[#d8ecfc] px-3 py-1.5 rounded-xl animate-in fade-in">
              <span className="text-xs font-bold text-[#006bbd]">
                {selectedPaperIds.length} selected
              </span>
              <button
                onClick={handleCompareSelected}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#006bbd] rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer"
              >
                Compare Cohort
              </button>
              <button
                onClick={handleSynthesizeSelected}
                className="px-2.5 py-1 bg-[#0091ff] text-white rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer"
              >
                Synthesize
              </button>
              <button
                onClick={() => setSelectedPaperIds([])}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {(researchData?.recentPapers || []).map((paper) => {
            const isSelected = selectedPaperIds.includes(paper.id);
            return (
              <div
                key={paper.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-3.5 ${
                  isSelected ? 'border-[#0091ff] ring-1 ring-[#0091ff]/30 bg-blue-50/20' : 'border-[#e2ebf4]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectPaper(paper.id)}
                      className="mt-1 w-4 h-4 rounded text-[#0091ff] focus:ring-[#0091ff] cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          {paper.year} • {paper.venue}
                        </span>
                        {paper.citationCount && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Cited by {paper.citationCount}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {paper.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {paper.authors.join(', ')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookmark(paper.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      paper.isBookmarked
                        ? 'border-amber-200 bg-amber-50 text-amber-600'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={paper.isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Structured Research Extraction Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-[#f8fbfe] p-3 rounded-xl border border-blue-50">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#006bbd] uppercase tracking-wider block">
                      Core Methodology
                    </span>
                    <p className="text-[11px] text-slate-700 font-medium">
                      {paper.methodology}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[#006bbd] uppercase tracking-wider block">
                      Evaluated Dataset
                    </span>
                    <p className="text-[11px] text-slate-700 font-medium">
                      {paper.dataset}
                    </p>
                  </div>
                  <div className="md:col-span-2 pt-1 border-t border-blue-100/60">
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
                      Key Empirical Finding
                    </span>
                    <p className="text-[11px] text-slate-700 font-medium">
                      {paper.keyFindings}
                    </p>
                  </div>
                </div>

                {/* Tags and Inline Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {paper.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate('/research/library')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Read Paper
                    </button>
                    <button
                      onClick={() => navigate(`/research/analyses?paper=${paper.id}`)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#006bbd] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#0091ff]" />
                      <span>Ask AI</span>
                    </button>
                    <button
                      onClick={() => navigate(`/research/analyses?compare=${paper.id}`)}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. AI Research Insights & Potential Gaps Section */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            AI Research Insights & Potential Gaps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {((researchData?.researchInsights || researchData?.aiInsights || []) as any[]).map((ins) => (
            <div
              key={ins.id}
              className="bg-white border border-[#e2ebf4] rounded-2xl p-4 shadow-xs space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                    {ins.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Confidence: {ins.confidence}
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                  {ins.title}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {ins.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Grounding Sources:
                </span>
                <div className="flex flex-wrap gap-1">
                  {(ins.supportingPapers || []).map((sp: string) => (
                    <span
                      key={sp}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-600 rounded border border-slate-200 font-semibold"
                    >
                      📄 {sp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Bottom Grid: Recent Research Notes & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Notes */}
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0091ff]" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Recent Notebook Entries
              </h3>
            </div>
            <button
              onClick={() => navigate('/research/notebook')}
              className="text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
            >
              Open Notebook &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {(researchData?.recentNotes || []).map((note) => {
              const noteProjectId = note.projectId;
              return (
                <div
                  key={note.id || (note as any)._id}
                  onClick={() => {
                    if (noteProjectId) {
                      navigate(`/research/projects/${noteProjectId}?tab=notes`);
                    } else {
                      navigate('/research/notebook');
                    }
                  }}
                  className="p-3 bg-[#f8fbfe] hover:bg-[#edf5fd] border border-blue-50 hover:border-blue-200 rounded-xl space-y-1 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">
                      {note.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {note.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 font-medium">
                    {note.content}
                  </p>
                  {note.paperTitle && (
                    <span className="text-[10px] text-[#006bbd] font-bold block pt-0.5">
                      Linked: {note.paperTitle}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="bg-white border border-[#e2ebf4] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0091ff]" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Research Activity Stream
            </h3>
          </div>

          <div className="space-y-3">
            {((researchData?.recentActivity || researchData?.activityStream || []) as any[]).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#006bbd] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0091ff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-800 block truncate">
                    {act.action}
                  </span>
                  <span className="text-[11px] text-[#006bbd] font-semibold block truncate">
                    {act.target}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {act.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
