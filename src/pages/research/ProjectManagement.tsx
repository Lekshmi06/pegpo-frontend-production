import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  BookOpen,
  ArrowRight,
  Filter,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  X,
  Target,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import { ResearchProjectSummary } from '../../types/research';

const STATUS_OPTIONS = [
  'All',
  'Active',
  'Exploring',
  'Literature review',
  'Proposal',
  'Completed',
  'Archived',
];

const DOMAIN_OPTIONS = [
  'Computer Science',
  'Artificial Intelligence & ML',
  'Biomedical Engineering',
  'Neuroscience',
  'Robotics & Control Systems',
  'Data Science & Analytics',
  'Natural Language Processing',
  'Other',
];

export default function ProjectManagement() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ResearchProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    researchQuestion: '',
    description: '',
    domain: 'Computer Science',
    objectivesText: '',
    status: 'Active',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchService.listProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to load projects from MongoDB:', err);
      setError(err?.message || 'Failed to fetch research projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true' || params.get('new') === 'true') {
      setIsCreateOpen(true);
    }
  }, [location.search]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setCreateError('Project title is required.');
      return;
    }

    setCreateSubmitting(true);
    setCreateError(null);

    const objectives = formData.objectivesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const newProj = await researchService.createProject({
        title: formData.title.trim(),
        researchQuestion: formData.researchQuestion.trim(),
        description: formData.description.trim(),
        domain: formData.domain,
        objectives,
        status: formData.status as any,
      });

      setIsCreateOpen(false);
      setFormData({
        title: '',
        researchQuestion: '',
        description: '',
        domain: 'Computer Science',
        objectivesText: '',
        status: 'Active',
      });

      const projId = newProj.id || (newProj as any)._id;
      if (projId) {
        navigate(`/research/projects/${projId}`);
      } else {
        await fetchProjects();
      }
    } catch (err: any) {
      console.error('Project creation failed:', err);
      setCreateError(err?.message || 'Failed to create research project. Check connection.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.problemStatement && proj.problemStatement.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (proj.researchQuestion && proj.researchQuestion.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proj.domain.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' ||
      (proj.status || proj.currentStage || '').toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Exploring':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Literature review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Proposal':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Archived':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-5 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <FolderKanban className="w-4 h-4 text-slate-600" />
              <span>Research Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Research Projects
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize literature, ground project-scoped AI analysis, and manage study objectives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Research Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Controls: Search and Status Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title, domain, or research question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5 shrink-0" />
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-transparent'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchProjects}
              className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-100 rounded-md" />
                  <div className="h-5 w-16 bg-slate-100 rounded-md" />
                </div>
                <div className="h-6 w-3/4 bg-slate-100 rounded-md" />
                <div className="h-14 w-full bg-slate-50 rounded-md" />
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="h-4 w-20 bg-slate-100 rounded-md" />
                  <div className="h-8 w-24 bg-slate-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-300 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
              <FolderKanban className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {searchQuery || selectedStatus !== 'All'
                ? 'No matching research projects found'
                : 'No research projects yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
              {searchQuery || selectedStatus !== 'All'
                ? 'Try adjusting your search query or status filter to see other projects.'
                : 'Create your first project to organize papers, define your research question, and activate project-scoped AI analysis.'}
            </p>
            {searchQuery || selectedStatus !== 'All' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('All');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Research Project</span>
              </button>
            )}
          </div>
        )}

        {/* Project Cards Grid */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const currentStatus = project.status || project.currentStage || 'Active';
              const projId = project.id || (project as any)._id;

              return (
                <div
                  key={projId}
                  className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all duration-150 flex flex-col justify-between shadow-xs hover:shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Status & Domain Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/80 truncate max-w-[160px]">
                        {project.domain}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                          currentStatus
                        )}`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      onClick={() => navigate(`/research/projects/${projId}`)}
                      className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
                    >
                      {project.title}
                    </h2>

                    {/* Research Question */}
                    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 tracking-wider">
                        Research Question
                      </span>
                      <p className="text-slate-700 line-clamp-2 italic">
                        {project.researchQuestion ||
                          project.problemStatement ||
                          project.description ||
                          'No formal research question specified yet.'}
                      </p>
                    </div>
                  </div>

                  {/* Footer Metrics & Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5" title="Attached Papers">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">
                          {project.paperCount || 0}
                        </span>
                        <span className="text-[11px]">papers</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Last Updated">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px]">{project.lastUpdated}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/research/projects/${projId}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-all group/btn cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Create Research Project</h3>
                  <p className="text-xs text-slate-500">
                    Define study scope, literature parameters, and research objectives.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Transformer-Based Segmentation of High-Resolution Glioblastoma MRI"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Research Question */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Research Question
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., How do hybrid self-attention skip connections mitigate boundary vanishing gradients in volumetric medical scans?"
                  value={formData.researchQuestion}
                  onChange={(e) => setFormData({ ...formData, researchQuestion: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Domain & Status row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Research Domain
                  </label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-slate-400 transition-colors"
                  >
                    {DOMAIN_OPTIONS.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-slate-400 transition-colors"
                  >
                    {STATUS_OPTIONS.filter((s) => s !== 'All').map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Research Objectives (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={`1. Benchmark Swin-UNETR against conventional nnU-Net.\n2. Analyze performance impact on Dice score across multi-scanner datasets.\n3. Evaluate inference latency for edge deployment.`}
                  value={formData.objectivesText}
                  onChange={(e) => setFormData({ ...formData, objectivesText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide background, scope, and anticipated outcomes for this study..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {createSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
