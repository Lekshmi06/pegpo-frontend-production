import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Trophy, Search, ChevronDown, Plus, Bold, Italic, Underline, Link, AlignLeft,
  AlignCenter, CheckSquare, List, Pencil, Eraser, Trash2, CheckCircle2,
  MessageSquare, BookOpen, Mic, Video, Brain, FileText, Layers, TrendingUp, RotateCcw, NotebookPen, Bookmark
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { workspaceService, ProjectItem } from '../../services/workspaceService';

export default function Projects() {
  const navigate = useNavigate();
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectContent, setProjectContent] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectItem['status']>('in_progress');
  const [isSaving, setIsSaving] = useState(false);

  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      try {
        const list = await workspaceService.getProjects();
        if (mounted && list && list.length > 0) {
          setProjectsList(list);
          setSelectedProjectId(list[0]._id);
          setProjectName(list[0].name);
          setProjectTitle(list[0].title || '');
          setProjectContent(list[0].content || '');
          setProjectStatus(list[0].status || 'in_progress');
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };
    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectProject = (p: ProjectItem) => {
    setSelectedProjectId(p._id);
    setProjectName(p.name);
    setProjectTitle(p.title || '');
    setProjectContent(p.content || '');
    setProjectStatus(p.status || 'in_progress');
  };

  // Debounced Autosave
  useEffect(() => {
    if (!selectedProjectId) return;
    const current = projectsList.find((p) => p._id === selectedProjectId);
    if (!current) return;

    if (
      current.name === projectName &&
      current.title === projectTitle &&
      current.content === projectContent &&
      current.status === projectStatus
    ) {
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(async () => {
      try {
        const updated = await workspaceService.updateProject(selectedProjectId, {
          name: projectName,
          title: projectTitle,
          content: projectContent,
          status: projectStatus,
        });
        setProjectsList((prev) =>
          prev.map((p) => (p._id === selectedProjectId ? updated : p))
        );
      } catch (err) {
        console.error('Autosave project failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [projectName, projectTitle, projectContent, projectStatus, selectedProjectId]);

  const handleAddNewProject = async () => {
    try {
      const created = await workspaceService.createProject({
        name: `Project ${projectsList.length + 1}`,
        title: '',
        content: '',
        status: 'planning',
      });
      setProjectsList((prev) => [created, ...prev]);
      setSelectedProjectId(created._id);
      setProjectName(created.name);
      setProjectTitle('');
      setProjectContent('');
      setProjectStatus('planning');
      toast.success('Created new project entry');
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await workspaceService.deleteProject(id);
      const remaining = projectsList.filter((p) => p._id !== id);
      setProjectsList(remaining);
      if (selectedProjectId === id) {
        if (remaining.length > 0) {
          handleSelectProject(remaining[0]);
        } else {
          setSelectedProjectId('');
          setProjectName('');
          setProjectTitle('');
          setProjectContent('');
        }
      }
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const insertFormatting = (prefix: string, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = projectContent.substring(start, end) || placeholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent =
      projectContent.substring(0, start) +
      replacement +
      projectContent.substring(end);

    setProjectContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const createActions = [
    { label: 'Chat', icon: MessageSquare },
    { label: 'Chapter', icon: BookOpen },
    { label: 'Audio', icon: Mic },
    { label: 'Video', icon: Video },
    { label: 'Mind Map', icon: Brain },
    { label: 'Summery', icon: FileText },
    { label: 'Quiz', icon: CheckCircle2 },
    { label: 'Flash Card', icon: Layers },
    { label: 'Time Line', icon: TrendingUp },
    { label: 'Analyse', icon: RotateCcw },
    { label: 'Notes', icon: NotebookPen },
    { label: 'Book Mark', icon: Bookmark },
  ];

  const lowerGraphicCards = [
    { id: 'smartboard', title: 'Smart Bord /Projects', img: cardSmartboard, desc: 'Interactive digital chalkboard for group project simulations.' },
    { id: 'combine', title: 'Combine Study', img: cardCombine, desc: 'Collaborative live study rooms with peers and tutors.' },
    { id: 'slide', title: 'Slide', img: cardSlide, desc: 'AI-generated presentation decks for key syllabus concepts.' },
    { id: 'infographics', title: 'Info Graphics', img: cardInfographics, desc: 'Visual flowcharts, diagrams, and memory maps.' },
  ];

  const handleCreateActionClick = (label: string) => {
    setModalTitle(`Create ${label}`);
    setSelectedActionLabel(label);
    setActiveModal('action');
  };

  const handleGraphicCardClick = (card: { title: string; img: string; desc: string }) => {
    setModalTitle(card.title);
    setSelectedGraphicCard(card);
    setActiveModal('graphic');
  };

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your active project.
            </p>
            <Button
              onClick={() => {
                const promptSnippet = `\n\n### [Project ${selectedActionLabel}]\n- Objective: Detailed research and milestone review.\n- Deliverable: Documented findings.\n`;
                setProjectContent((prev) => prev + promptSnippet);
                toast.success(`${selectedActionLabel} added to project!`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Generate {selectedActionLabel}
            </Button>
          </div>
        )}

        {activeModal === 'graphic' && selectedGraphicCard && (
          <div className="space-y-4">
            <div className="h-40 bg-[#eef6fc] rounded-2xl flex items-center justify-center p-4">
              <img src={selectedGraphicCard.img} alt={selectedGraphicCard.title} className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedGraphicCard.desc}</p>
            <Button
              onClick={() => {
                toast.info(`Launched ${selectedGraphicCard.title}!`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Launch Workspace
            </Button>
          </div>
        )}
      </Modal>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-end px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info('Language switched to English')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Select Language"
            >
              <Globe className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button
              onClick={() => toast.info('Viewing Achievements & Badges')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Achievements"
            >
              <Trophy className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative">
              <button
                onClick={() => navigate('/student/profile')}
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs hover:ring-2 hover:ring-[#0091ff]/30 transition-all cursor-pointer block"
                title="Student Profile"
              >
                <img src={userImg} alt="Profile" className="w-full h-full object-cover" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-52 bg-[#f0f6fc] border border-[#d8eaf8] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                  {['Help & Tools', 'Feed Back', 'Quick Guide', 'Extension', 'Discord', 'Settings'].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3.5 py-2 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold transition-colors"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Student Projects</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Track your science models, presentations, and team assignments {isSaving && <span className="text-[#0091ff] font-bold ml-2 animate-pulse">Saving...</span>}
                  </p>
                </div>
                <Button onClick={handleAddNewProject} size="sm" leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}>
                  New Project
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[500px]">
                {/* Project List Sidebar */}
                <div className="lg:col-span-4 bg-[#dbeafe]/40 border border-[#bfdbfe]/50 rounded-3xl p-4 shadow-xs space-y-2.5 overflow-y-auto max-h-[640px]">
                  {projectsList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-medium">
                      No projects yet. Click "New Project" to start.
                    </div>
                  ) : (
                    projectsList.map((p) => {
                      const isSelected = selectedProjectId === p._id;
                      return (
                        <div
                          key={p._id}
                          onClick={() => handleSelectProject(p)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all relative group ${
                            isSelected
                              ? 'bg-[#dbeafe] text-[#1c3352] shadow-2xs border border-[#93c5fd]'
                              : 'bg-white/70 hover:bg-white text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-extrabold text-[#111827] truncate">{p.name}</h3>
                            <button
                              onClick={(e) => handleDeleteProject(p._id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                            {p.title || p.content || 'Draft project outline'}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-2">
                            <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                              {p.status || 'planning'}
                            </span>
                            <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Active'}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Active Project Editor */}
                <div className="lg:col-span-8 bg-white border border-[#e2ebf4] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    {/* Status & Name bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Project Label / Name"
                        className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 outline-none w-56"
                      />

                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-slate-400">Status:</span>
                        <select
                          value={projectStatus}
                          onChange={(e) => setProjectStatus(e.target.value as any)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 outline-none cursor-pointer border border-slate-200"
                        >
                          <option value="planning">Planning</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 text-slate-600 text-xs font-semibold">
                      <button onClick={() => insertFormatting('**', '**', 'bold')} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><Bold className="w-3.5 h-3.5" /></button>
                      <button onClick={() => insertFormatting('*', '*', 'italic')} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><Italic className="w-3.5 h-3.5" /></button>
                      <button onClick={() => insertFormatting('<u>', '</u>', 'underlined')} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><Underline className="w-3.5 h-3.5" /></button>
                      <button onClick={() => insertFormatting('[', '](https://)', 'resource link')} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><Link className="w-3.5 h-3.5" /></button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => insertFormatting('\n- ', '', 'Milestone task')} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><List className="w-3.5 h-3.5" /></button>
                      <button onClick={() => insertFormatting('\n- [ ] ', '', 'Checklist item')} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><CheckSquare className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="space-y-3 pt-1">
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="Project Title (e.g. Demonstration of Faraday's Law)"
                        className="text-2xl font-extrabold text-[#111827] outline-none w-full placeholder:text-slate-300"
                      />

                      <textarea
                        ref={textareaRef}
                        rows={14}
                        value={projectContent}
                        onChange={(e) => setProjectContent(e.target.value)}
                        placeholder="Detail your project hypothesis, methodology, materials required, and observation notes here..."
                        className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none resize-none placeholder:text-slate-400 leading-relaxed min-h-[360px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="w-64 bg-[#d8eaf8] p-4 flex flex-col space-y-4 border-l border-[#cbd5e1]/50 shrink-0 select-none overflow-y-auto hidden lg:flex">
            <h2 className="flex items-center justify-start gap-1.5 text-xl font-extrabold text-[#111827] tracking-tight pl-2">
              <span className="text-[#2f78c4] font-extrabold">&gt;&gt;</span>
              <span>Create</span>
            </h2>

            <div className="bg-white rounded-3xl p-3 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                {createActions.map((act) => {
                  const ActionIcon = act.icon;
                  return (
                    <button
                      key={act.label}
                      onClick={() => handleCreateActionClick(act.label)}
                      className="flex flex-col items-center justify-center h-[54px] bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-xl text-[#214d7d] transition-colors p-1 cursor-pointer group shadow-2xs"
                      title={`Create ${act.label}`}
                    >
                      <ActionIcon className="w-4 h-4 text-[#214d7d] stroke-[2.2] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold mt-1 text-[#1c3352]">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-3 shadow-xs space-y-2.5">
              {lowerGraphicCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleGraphicCardClick(card)}
                  className="flex items-center justify-between p-3 bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-2xl cursor-pointer transition-all group shadow-2xs"
                >
                  <span className="text-[11px] font-extrabold text-[#111827] max-w-[100px] leading-tight">
                    {card.title}
                  </span>
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-14 h-10 object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
