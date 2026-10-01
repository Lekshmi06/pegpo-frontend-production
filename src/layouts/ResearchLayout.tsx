import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import {
  Home,
  Library,
  BookOpen,
  Sparkles,
  Search,
  BarChart2,
  GitMerge,
  Edit3,
  Users,
  Upload,
  Mic,
  FolderPlus,
  Calendar,
  FolderKanban,
  CheckSquare,
  LayoutGrid,
  Trophy,
  Globe,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Video,
  Share2,
  HelpCircle,
  StickyNote,
  Bookmark,
  TrendingUp,
  FileText,
  Layers,
  X,
  Menu,
  Send,
  ExternalLink,
  Bot,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  BadgeAlert,
  Clock,
  ArrowRight,
  Plus,
  Folder,
} from 'lucide-react';
import userImg from '../assets/user.png';
import { EdupyeLogo } from '../components/common/EdupyeLogo';
import { authService } from '../services/authService';
import { researcherProfileService } from '../services/researcherProfileService';
import { researchService } from '../services/researchService';
import { ResearchNavItem, ResearchNoteType, HypothesisStatus } from '../types/research';
import {
  ResearchActiveProjectProvider,
  useResearchActiveProject,
} from '../context/ResearchActiveProjectContext';
import SaveResearchNoteModal from '../components/research/SaveResearchNoteModal';

export interface ResearchLayoutProps {
  children?: ReactNode;
}

interface SidebarNavItem {
  label: string;
  path: string;
  icon: any;
  badge?: string;
}

const SIDEBAR_TOP_ITEMS_BEFORE: SidebarNavItem[] = [
  { label: 'Home', path: '/research', icon: Home },
];

const SIDEBAR_TOP_ITEMS_AFTER: SidebarNavItem[] = [
  { label: 'Library', path: '/research/library', icon: Library },
  { label: 'Note book', path: '/research/notebook', icon: BookOpen },
  { label: 'AI Researchs', path: '/research/ask', icon: Sparkles },
  { label: 'Search', path: '/research/discover', icon: Search },
  { label: 'Analyses', path: '/research/analyses', icon: BarChart2 },
  { label: 'Synthesize', path: '/research/synthesize', icon: GitMerge },
  { label: 'Write', path: '/research/write', icon: Edit3 },
];

const SIDEBAR_GROUP_2: SidebarNavItem[] = [
  { label: 'Collaboration', path: '/research/collaboration', icon: Users },
  { label: 'Upload', path: '/research/upload', icon: Upload },
  { label: 'New Folder', path: '/research/new-folder', icon: FolderPlus },
];

const SIDEBAR_GROUP_3: SidebarNavItem[] = [
  { label: 'Calendar', path: '/research/calendar', icon: Calendar },
  { label: 'Task Management', path: '/research/task-mgmt', icon: CheckSquare },
  { label: 'Kanban Bord', path: '/research/kanban', icon: LayoutGrid },
];

function ResearchLayoutInner({ children }: ResearchLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    activeProject,
    activeProjectId,
    setActiveProjectId,
    allProjects,
    projectDetail,
  } = useResearchActiveProject();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  // Dedicated Projects Menu State
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(true);

  // Keep projects menu open when exploring project routes
  useEffect(() => {
    if (location.pathname.startsWith('/research/projects')) {
      setProjectsMenuOpen(true);
    }
  }, [location.pathname]);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    navigate(`/research/projects/${projectId}`);
    setMobileMenuOpen(false);
  };

  const handleManageProjects = () => {
    navigate('/research/projects');
    setMobileMenuOpen(false);
  };

  const handleCreateProject = () => {
    navigate('/research/projects?create=true');
    setMobileMenuOpen(false);
  };

  // Right Panel Dock Mode: 'create' (tool palette) or 'chat' (AI copilot conversation)
  const [rightDockOpen, setRightDockOpen] = useState(true);
  const [rightDockMode, setRightDockMode] = useState<'create' | 'chat'>('create');

  // Copilot messages & input
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<
    Array<{
      sender: 'ai' | 'user';
      text: string;
      sources?: string[];
      suggestedActions?: string[];
    }>
  >([]);
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Note saving modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedNoteData, setSelectedNoteData] = useState<{
    title: string;
    content: string;
    type: ResearchNoteType;
    hypothesisStatus?: HypothesisStatus;
    paperIds?: string[];
    sourceText?: string;
  }>({
    title: '',
    content: '',
    type: 'general',
  });

  // Researcher profile state
  const [researcherName, setResearcherName] = useState('Researcher');
  const [researcherDomain, setResearcherDomain] = useState('Computer Science');

  useEffect(() => {
    const cached = researcherProfileService.getCachedProfile();
    const user = authService.getCurrentUser();
    if (cached) {
      if (cached.fullName) setResearcherName(cached.fullName);
      if (cached.researchDomains?.[0]) setResearcherDomain(cached.researchDomains[0]);
    } else if (user?.name) {
      setResearcherName(user.name);
    }
  }, []);

  // Update Copilot greetings when active project changes
  useEffect(() => {
    if (activeProject) {
      setAiMessages([
        {
          sender: 'ai',
          text: `Welcome to your Research AI Copilot. I have loaded context from active project: "${activeProject.title}" (${activeProject.paperCount || 0} papers attached). You can interrogate literature, explore hypotheses, compare methodologies, or ask to identify contradictions.`,
          sources:
            activeProject.paperCount > 0
              ? [`${activeProject.paperCount} project papers loaded`]
              : undefined,
        },
      ]);
    } else {
      setAiMessages([
        {
          sender: 'ai',
          text: 'Welcome to your Research AI Copilot. Select or create a Research Project to ground the discussion in your literature, notes, and hypotheses.',
        },
      ]);
    }
  }, [activeProject?.id]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const getContextScopeDescription = () => {
    if (location.pathname.includes('/discover')) return 'Discover: Academic Search';
    if (location.pathname.includes('/library')) return 'Research Library: Saved Literature';
    if (location.pathname.includes('/project'))
      return `Project: ${activeProject?.title || 'Active Study'}`;
    if (location.pathname.includes('/notebook')) return 'Research Notebook: Working Hypotheses';
    if (location.pathname.includes('/analyses'))
      return 'Analyses: Methodology & Dataset Profiler';
    if (location.pathname.includes('/synthesize'))
      return 'Synthesize: Multi-Paper Review Engine';
    if (location.pathname.includes('/write')) return 'Writing Studio: Manuscript Composer';
    if (location.pathname.includes('/citations'))
      return 'Citations: Bibliography & References';
    if (location.pathname.includes('/collaboration'))
      return 'Collaboration: Peer Review & Co-authors';
    if (location.pathname.includes('/kanban'))
      return `Kanban Board: ${activeProject?.title || 'Project Execution'}`;
    if (location.pathname.includes('/calendar'))
      return `Calendar: ${activeProject?.title || 'Research Milestones'}`;
    return activeProject ? `Project: ${activeProject.title}` : 'Global Workspace Context';
  };

  const handleSendAiMessage = async (customQuery?: string) => {
    const q = customQuery || aiInput.trim();
    if (!q) return;

    const userMessage = { sender: 'user' as const, text: q };
    setAiMessages((prev) => [...prev, userMessage]);
    if (!customQuery) setAiInput('');
    setIsAiResponding(true);

    try {
      let contextType: 'researcher' | 'paper' | 'project' | 'selected_text' | 'library' =
        'researcher';
      const paperIds: string[] = [];

      if (projectDetail && projectDetail.paperIds) {
        contextType = 'project';
        projectDetail.paperIds.forEach((p: any) => {
          if (typeof p === 'string') paperIds.push(p);
          else if (p && (p.id || p._id)) paperIds.push(p.id || p._id);
        });
      }

      const res = await researchService.queryResearchAI({
        query: q,
        contextType,
        projectId: activeProjectId || undefined,
        paperIds: paperIds.length > 0 ? paperIds : undefined,
      });

      const sources = (res as any).citedPapers || (res as any).sources || [];

      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          sources: sources.length > 0 ? sources : undefined,
          suggestedActions: res.suggestedActions,
        },
      ]);
    } catch (err: any) {
      console.warn('AI copilot error:', err);
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Notice: Could not contact research reasoning engine (${
            err?.message || 'Network error'
          }). Project evidence is loaded for ${activeProject?.title || 'current workspace'}.`,
        },
      ]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleOpenSaveModal = (
    text: string,
    type: ResearchNoteType,
    sources?: string[],
    hypothesisStatus: HypothesisStatus = 'idea'
  ) => {
    const titlePrefix =
      type === 'hypothesis'
        ? 'Hypothesis'
        : type === 'finding'
        ? 'Finding'
        : type === 'critique'
        ? 'Critique'
        : type === 'methodology'
        ? 'Methodology'
        : 'Note';

    setSelectedNoteData({
      title: `${titlePrefix}: ${text.slice(0, 45).replace(/\n/g, ' ')}...`,
      content: text,
      type,
      hypothesisStatus: type === 'hypothesis' ? hypothesisStatus : undefined,
      paperIds: (projectDetail?.paperIds || []).map((p: any) =>
        typeof p === 'string' ? p : p.id || p._id
      ),
      sourceText: sources && sources.length > 0 ? sources.join(', ') : undefined,
    });
    setNoteModalOpen(true);
  };

  const isActiveRoute = (path: string) => {
    if (path === '/research') {
      return location.pathname === '/research' || location.pathname === '/research/';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavGroup = (items: SidebarNavItem[]) => (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActiveRoute(item.path);

        return (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setMobileMenuOpen(false);
            }}
            title={sidebarCollapsed ? item.label : undefined}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all group cursor-pointer ${
              active
                ? 'bg-[#3c8ecb] text-white shadow-xs font-bold'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-white/80 group-hover:text-white'
                }`}
              />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </div>

            {!sidebarCollapsed && item.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                  active ? 'bg-white/20 text-white' : 'bg-white/15 text-white'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderProjectsMenu = () => {
    if (sidebarCollapsed) {
      return (
        <button
          type="button"
          onClick={handleManageProjects}
          title={`Manage Projects (${allProjects.length})`}
          className={`w-full flex items-center justify-center p-2 rounded-2xl transition-all group cursor-pointer ${
            isActiveRoute('/research/projects')
              ? 'bg-[#3c8ecb] text-white shadow-xs'
              : 'text-white/90 hover:bg-white/10 hover:text-white'
          }`}
        >
          <FolderKanban className="w-4 h-4 text-white" />
        </button>
      );
    }

    return (
      <div className="space-y-1">
        {/* Projects Section Header */}
        <div
          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all group ${
            isActiveRoute('/research/projects') && !projectsMenuOpen
              ? 'bg-[#3c8ecb] text-white shadow-xs font-bold'
              : 'text-white/95 hover:bg-white/10'
          }`}
        >
          <button
            type="button"
            onClick={() => setProjectsMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
          >
            <FolderKanban className="w-4 h-4 shrink-0 text-white/90 group-hover:text-white" />
            <span className="truncate font-bold tracking-tight">Projects</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-extrabold bg-white/20 text-white">
              {allProjects.length}
            </span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateProject();
              }}
              title="Create New Project"
              className="w-5 h-5 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setProjectsMenuOpen((prev) => !prev)}
              className="w-5 h-5 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={projectsMenuOpen ? 'Collapse Projects' : 'Expand Projects'}
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  projectsMenuOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Dedicated Projects Submenu */}
        {projectsMenuOpen && (
          <div className="pl-3 pr-1 pt-1 pb-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Manage All Projects */}
            <button
              type="button"
              onClick={handleManageProjects}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                location.pathname === '/research/projects'
                  ? 'bg-[#3c8ecb] text-white shadow-xs font-bold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="truncate">Manage All Projects</span>
              </div>
              <ArrowRight className="w-3 h-3 shrink-0 opacity-70" />
            </button>

            {/* Active / Recent Studies List */}
            {allProjects.length > 0 && (
              <div className="max-h-44 overflow-y-auto space-y-0.5 scrollbar-none pr-0.5 pt-1">
                {allProjects.map((p) => {
                  const pId = p.id || (p as any)._id;
                  const isCurrentActive = activeProjectId === pId;
                  const isCurrentRoute = location.pathname.includes(`/research/projects/${pId}`);

                  return (
                    <button
                      key={pId}
                      type="button"
                      onClick={() => handleSelectProject(pId)}
                      title={`${p.title} (${p.currentStage || 'Active'})`}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all group cursor-pointer text-left ${
                        isCurrentActive || isCurrentRoute
                          ? 'bg-white/20 text-white font-bold shadow-2xs'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isCurrentActive
                              ? 'bg-emerald-400 ring-2 ring-emerald-300/40 animate-pulse'
                              : 'bg-white/30 group-hover:bg-white/60'
                          }`}
                        />
                        <span className="truncate">{p.title}</span>
                      </div>
                      {isCurrentActive && (
                        <span className="text-[9px] uppercase tracking-wide bg-emerald-400/20 text-emerald-200 font-extrabold px-1.5 py-0.2 rounded shrink-0 ml-1">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Action: + New Project */}
            <button
              type="button"
              onClick={handleCreateProject}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>+ New Project</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f3f7fb] overflow-hidden text-slate-800 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Primary Vibrant Blue Sidebar as in Reference */}
      <aside
        className={`fixed md:relative z-40 h-full bg-[#1c75bc] text-white flex flex-col transition-all duration-300 select-none shadow-xl ${
          sidebarCollapsed ? 'w-20' : 'w-60'
        }`}
      >
        {/* Brand Pill Header */}
        <div className="bg-white rounded-2xl mx-3.5 my-3 p-2.5 flex items-center justify-between shadow-xs">
          <Link
            to="/research"
            className="flex items-center gap-2 overflow-hidden cursor-pointer"
          >
            <EdupyeLogo className={sidebarCollapsed ? 'h-6' : 'h-7'} />
            {!sidebarCollapsed && (
              <span className="font-black text-sm tracking-tight text-[#1c75bc] flex items-center gap-1">
                EDUPYE
              </span>
            )}
          </Link>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-5 h-5 rounded-full bg-[#155a91] hover:bg-[#124b78] text-white flex items-center justify-center transition-colors text-xs shrink-0 cursor-pointer hidden md:flex"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft
              className={`w-3.5 h-3.5 transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Global Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-none">
          {/* Group 1: Core Research (Home, Projects, Library, Note book, AI Researchs, etc.) */}
          <div className="space-y-1">
            {renderNavGroup(SIDEBAR_TOP_ITEMS_BEFORE)}
            {renderProjectsMenu()}
            {renderNavGroup(SIDEBAR_TOP_ITEMS_AFTER)}
          </div>

          {/* Subtle Divider */}
          <div className="border-t border-white/15 mx-1" />

          {/* Group 2: Collaboration & Media */}
          {renderNavGroup(SIDEBAR_GROUP_2)}

          {/* Subtle Divider */}
          <div className="border-t border-white/15 mx-1" />

          {/* Group 3: Execution & Planning */}
          {renderNavGroup(SIDEBAR_GROUP_3)}
        </nav>

        {/* Active Project Card in Sidebar Footer */}
        {!sidebarCollapsed && activeProject && (
          <div
            onClick={() => {
              navigate(`/research/projects/${activeProject.id || (activeProject as any)._id}`);
              setMobileMenuOpen(false);
            }}
            className="p-3 m-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 space-y-1 cursor-pointer transition-colors"
            title="Open active project workspace"
          >
            <div className="flex items-center justify-between text-[10px] font-extrabold text-sky-200 uppercase tracking-wider">
              <span>Active Study</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-white truncate" title={activeProject.title}>
              {activeProject.title}
            </p>
            <div className="flex items-center justify-between text-[10px] text-white/70 font-medium">
              <span>{activeProject.currentStage}</span>
              <span>{activeProject.paperCount} papers</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar as in Reference */}
        <header className="h-16 bg-white border-b border-[#e2edf7] flex items-center justify-between px-4 sm:px-6 z-20 gap-3 shrink-0">
          {/* Left: Mobile Toggle + Department & Subject Pills */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Department Dropdown Pill */}
            <div className="relative">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-[#d6e4f0] text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer">
                <span>Department</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Subject Dropdown Pill */}
            <div className="relative">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-[#d6e4f0] text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer">
                <span>Subject</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Active Project Dropdown Pill */}
            {allProjects.length > 0 && (
              <div className="relative hidden xl:block">
                <button
                  type="button"
                  onClick={() => setShowProjectSelector(!showProjectSelector)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f7fe] hover:bg-[#e4f1fc] border border-[#d2e7fa] text-xs font-bold text-[#006bbd] transition-colors cursor-pointer max-w-[200px]"
                >
                  <FolderKanban className="w-3.5 h-3.5 shrink-0 text-[#1c75bc]" />
                  <span className="truncate">
                    {activeProject ? activeProject.title : 'Select Project'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                </button>

                {showProjectSelector && (
                  <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase text-slate-400">
                        Switch Study
                      </span>
                      <Link
                        to="/research/projects"
                        onClick={() => setShowProjectSelector(false)}
                        className="text-[11px] font-bold text-[#1c75bc] hover:underline"
                      >
                        Manage &rarr;
                      </Link>
                    </div>
                    <div className="space-y-1 py-1 max-h-56 overflow-y-auto">
                      {allProjects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveProjectId(p.id);
                            setShowProjectSelector(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                            activeProjectId === p.id
                              ? 'bg-blue-50 text-[#006bbd] font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="font-bold truncate">{p.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {p.currentStage} • {p.paperCount} papers
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Toolbar: Globe + Pill Search + Trophy + Avatar */}
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 text-slate-600 hover:text-[#1c75bc] transition-colors cursor-pointer"
              title="Global Community & Publications"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Pill Search Bar */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    navigate(`/research/discover?q=${encodeURIComponent(val)}`);
                  }
                }}
                className="w-full pl-8 pr-4 py-1.5 border border-[#d6e4f0] rounded-full bg-[#f0f5fa] text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1c75bc] transition-all"
              />
            </div>

            <button
              className="p-1.5 text-slate-600 hover:text-[#1c75bc] transition-colors cursor-pointer"
              title="Research Milestones & Achievements"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* User Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-200 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                  <img
                    src={userImg}
                    alt="Researcher"
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in duration-100 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800 truncate">{researcherName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{researcherDomain}</p>
                  </div>
                  <Link
                    to="/research/notebook"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Research Notebook</span>
                  </Link>
                  <Link
                    to="/research/projects"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                    <span>All Projects</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl mt-1 font-semibold cursor-pointer"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area + Right ">> Create" Dock Container */}
        <div className="flex-1 flex overflow-hidden relative bg-[#fafbfc]">
          {/* Main Outlet / Children */}
          <main className="flex-1 overflow-y-auto min-w-0 bg-[#fafbfc]">
            {children || <Outlet />}
          </main>

          {/* Right Side ">> Create" Tool Palette & AI Dock */}
          {rightDockOpen ? (
            <aside className="w-64 p-3.5 m-3 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between shrink-0 shadow-xs z-10 transition-all">
              {rightDockMode === 'create' ? (
                /* 12-Tool Palette Grid in Minimal Style */
                <div className="flex flex-col h-full justify-between space-y-3">
                  <div>
                    {/* Header: >> Create + Minimize */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-900 font-bold text-sm tracking-tight flex items-center gap-1.5">
                        <span className="text-blue-600 font-black">&gt;&gt;</span>
                        <span>Create</span>
                      </span>
                      <button
                        onClick={() => setRightDockOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Collapse Dock"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 2-Column Grid of 12 Creation Cards */}
                    <div className="grid grid-cols-2 gap-2 pt-3">
                      {[
                        {
                          title: 'Chat',
                          icon: MessageSquare,
                          action: () => setRightDockMode('chat'),
                        },
                        {
                          title: 'Chapter',
                          icon: BookOpen,
                          action: () => navigate('/research/write'),
                        },
                        {
                          title: 'Audio',
                          icon: Mic,
                          action: () => navigate('/research/record'),
                        },
                        {
                          title: 'Video',
                          icon: Video,
                          action: () => navigate('/research/upload'),
                        },
                        {
                          title: 'Mind Map',
                          icon: Share2,
                          action: () => navigate('/research/synthesize'),
                        },
                        {
                          title: 'Summery',
                          icon: FileText,
                          action: () => {
                            setRightDockMode('chat');
                            handleSendAiMessage('Generate an executive summary of this project.');
                          },
                        },
                        {
                          title: 'Quiz',
                          icon: HelpCircle,
                          action: () => navigate('/research/genius-test'),
                        },
                        {
                          title: 'Flash Card',
                          icon: Layers,
                          action: () => navigate('/research/library'),
                        },
                        {
                          title: 'Time Line',
                          icon: Calendar,
                          action: () => navigate('/research/calendar'),
                        },
                        {
                          title: 'Analyse',
                          icon: TrendingUp,
                          action: () => navigate('/research/analyses'),
                        },
                        {
                          title: 'Notes',
                          icon: StickyNote,
                          action: () => navigate('/research/notebook'),
                        },
                        {
                          title: 'Book Mark',
                          icon: Bookmark,
                          action: () => navigate('/research/bookmarks'),
                        },
                      ].map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.title}
                            onClick={tool.action}
                            className="bg-slate-50/80 hover:bg-slate-100 transition-all rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 border border-slate-200/70 hover:border-slate-300 text-slate-700 hover:text-slate-900 cursor-pointer group"
                          >
                            <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
                            <span className="text-[11px] font-medium tracking-tight text-slate-700 group-hover:text-slate-900 transition-colors">
                              {tool.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom quick switch to Copilot */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setRightDockMode('chat')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Open AI Copilot</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* AI Copilot Conversation View inside Right Dock */
                <div className="flex flex-col h-full justify-between space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      onClick={() => setRightDockMode('create')}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>&lt;&lt; Tools</span>
                    </button>
                    <span className="text-xs font-bold text-slate-900">
                      Research Copilot
                    </span>
                    <button
                      onClick={() => setRightDockOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 p-1 text-xs scrollbar-none">
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-slate-900 text-white ml-2 shadow-2xs'
                            : 'bg-slate-50 border border-slate-200 text-slate-800 mr-2 shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex flex-wrap gap-1">
                            {msg.sources.map((s) => (
                              <span
                                key={s}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-medium"
                              >
                                📄 {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {isAiResponding && (
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 animate-pulse flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-500" />
                        <span>Synthesizing...</span>
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAiMessage();
                    }}
                    className="flex items-center gap-1.5 pt-2 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ask AI..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!aiInput.trim() || isAiResponding}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-40 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </aside>
          ) : (
            /* Collapsed Dock Toggle Tab */
            <button
              onClick={() => setRightDockOpen(true)}
              className="absolute right-0 top-6 z-20 bg-white hover:bg-slate-50 border border-r-0 border-slate-200 shadow-xs rounded-l-xl py-2 px-2.5 text-slate-700 flex items-center gap-1 text-xs font-semibold transition-all cursor-pointer"
              title="Expand Create Dock"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </button>
          )}
        </div>
      </div>

      {/* Note Creation Modal */}
      <SaveResearchNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        projectId={activeProject?.id}
        projectTitle={activeProject?.title}
        initialTitle={selectedNoteData.title}
        initialContent={selectedNoteData.content}
        initialType={selectedNoteData.type}
        initialHypothesisStatus={selectedNoteData.hypothesisStatus}
        initialPaperIds={selectedNoteData.paperIds}
        initialSourceText={selectedNoteData.sourceText}
        availablePapers={projectDetail?.paperIds || []}
        onSaved={() => {}}
      />
    </div>
  );
}

export default function ResearchLayout({ children }: ResearchLayoutProps) {
  return (
    <ResearchActiveProjectProvider>
      <ResearchLayoutInner>{children}</ResearchLayoutInner>
    </ResearchActiveProjectProvider>
  );
}
