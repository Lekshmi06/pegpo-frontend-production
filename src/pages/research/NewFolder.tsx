import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FolderPlus,
  Folder,
  FolderOpen,
  Plus,
  Search,
  Filter,
  FileText,
  UploadCloud,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowLeft,
  Download,
  Eye,
  Check,
  X,
  AlertCircle,
  Database,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import { ResearchFolder, ResearchDocument } from '../../types/research';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';

const FOLDER_COLORS = [
  { name: 'Royal Blue', hex: '#1c75bc' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Teal', hex: '#0d9488' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'literature', label: 'Literature & Papers' },
  { id: 'datasets', label: 'Datasets & Tables' },
  { id: 'manuscripts', label: 'Manuscripts & Drafts' },
  { id: 'notes', label: 'Notes & Findings' },
  { id: 'general', label: 'General' },
];

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function NewFolder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { allProjects, activeProjectId } = useResearchActiveProject();

  const [folders, setFolders] = useState<ResearchFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  // Active / Selected Folder View
  const [activeFolder, setActiveFolder] = useState<ResearchFolder | null>(null);
  const [folderDocuments, setFolderDocuments] = useState<ResearchDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<ResearchFolder | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#1c75bc',
    category: 'general' as ResearchFolder['category'],
    projectId: '',
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteConfirmFolder, setDeleteConfirmFolder] = useState<ResearchFolder | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Folders
  const fetchFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await researchService.listFolders();
      setFolders(data);
    } catch (err: any) {
      console.error('Failed to load folders:', err);
      setError(err?.message || 'Failed to fetch folders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Check URL query parameters for create=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true' || params.get('new') === 'true') {
      handleOpenCreate();
    }
    const folderIdParam = params.get('folderId');
    if (folderIdParam && folders.length > 0) {
      const target = folders.find((f) => (f._id || f.id) === folderIdParam);
      if (target) {
        handleOpenFolder(target);
      }
    }
  }, [location.search, folders]);

  // Load documents when activeFolder changes
  const loadFolderDocuments = async (folder: ResearchFolder) => {
    setLoadingDocs(true);
    try {
      const fId = folder._id || folder.id;
      const docs = await researchService.listDocuments({ folderId: fId });
      setFolderDocuments(docs);
    } catch (err) {
      console.error('Failed to load folder documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleOpenFolder = (folder: ResearchFolder) => {
    setActiveFolder(folder);
    loadFolderDocuments(folder);
  };

  const handleBackToFolders = () => {
    setActiveFolder(null);
    setFolderDocuments([]);
    fetchFolders();
  };

  const handleOpenCreate = () => {
    setEditingFolder(null);
    setFormData({
      name: '',
      description: '',
      color: '#1c75bc',
      category: 'general',
      projectId: activeProjectId || '',
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (folder: ResearchFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    const pId = typeof folder.projectId === 'object' && folder.projectId !== null
      ? (folder.projectId as any)._id
      : folder.projectId || '';
    setFormData({
      name: folder.name,
      description: folder.description || '',
      color: folder.color || '#1c75bc',
      category: folder.category || 'general',
      projectId: pId,
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Folder name is required.');
      return;
    }

    setModalSubmitting(true);
    setModalError(null);

    try {
      if (editingFolder) {
        const fId = editingFolder._id || editingFolder.id;
        const updated = await researchService.updateFolder(fId, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          color: formData.color,
          category: formData.category,
          projectId: formData.projectId || undefined,
        });

        setFolders((prev) =>
          prev.map((f) => ((f._id || f.id) === fId ? { ...f, ...updated } : f))
        );
        if (activeFolder && (activeFolder._id || activeFolder.id) === fId) {
          setActiveFolder(updated);
        }
      } else {
        const created = await researchService.createFolder({
          name: formData.name.trim(),
          description: formData.description.trim(),
          color: formData.color,
          category: formData.category,
          projectId: formData.projectId || undefined,
        });

        setFolders((prev) => [created, ...prev]);
      }

      setModalOpen(false);
    } catch (err: any) {
      console.error('Folder save error:', err);
      setModalError(err?.message || 'Failed to save folder. Please try again.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteConfirmFolder) return;
    const fId = deleteConfirmFolder._id || deleteConfirmFolder.id;
    setDeleting(true);

    try {
      await researchService.deleteFolder(fId);
      setFolders((prev) => prev.filter((f) => (f._id || f.id) !== fId));
      if (activeFolder && (activeFolder._id || activeFolder.id) === fId) {
        setActiveFolder(null);
      }
      setDeleteConfirmFolder(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete folder.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered folders
  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || f.category === selectedCategory;

      const pId = typeof f.projectId === 'object' && f.projectId !== null
        ? (f.projectId as any)._id
        : f.projectId;
      const matchesProject =
        filterProject === 'all' || pId === filterProject;

      return matchesSearch && matchesCategory && matchesProject;
    });
  }, [folders, searchQuery, selectedCategory, filterProject]);

  return (
    <div className="min-h-full bg-[#fafbfc] text-slate-800 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          {activeFolder ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <button
                onClick={handleBackToFolders}
                className="hover:text-[#1c75bc] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Folders</span>
              </button>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 font-bold">{activeFolder.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#1c75bc]/10 text-[#1c75bc] flex items-center justify-center shrink-0">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Research Folders</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#1c75bc]/10 text-[#1c75bc]">
                    {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Organize literature, datasets, manuscripts, and project assets into user-specific directories.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {activeFolder ? (
            <>
              <button
                onClick={() =>
                  navigate(
                    `/research/upload?folderId=${activeFolder._id || activeFolder.id}`
                  )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c75bc] hover:bg-[#155a91] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload to Folder</span>
              </button>
              <button
                onClick={(e) => handleOpenEdit(activeFolder, e)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c75bc] hover:bg-[#155a91] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Folder</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Views */}
      {activeFolder ? (
        /* Folder Contents Explorer View */
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Folder Details Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{ backgroundColor: activeFolder.color || '#1c75bc' }}
              >
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {activeFolder.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeFolder.description || 'No description provided for this folder.'}
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    Category: {activeFolder.category}
                  </span>
                  {activeFolder.projectId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1c75bc]/10 text-[#1c75bc]">
                      Project:{' '}
                      {typeof activeFolder.projectId === 'object'
                        ? (activeFolder.projectId as any).title
                        : 'Linked'}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-slate-400">
                    Created on {new Date(activeFolder.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">
                  {folderDocuments.length} {folderDocuments.length === 1 ? 'file' : 'files'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Inside this folder</p>
              </div>
            </div>
          </div>

          {/* Files List Inside Folder */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1c75bc]" />
                <span>Folder Documents</span>
              </h3>
              <button
                onClick={() =>
                  navigate(
                    `/research/upload?folderId=${activeFolder._id || activeFolder.id}`
                  )
                }
                className="text-xs font-bold text-[#1c75bc] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Documents</span>
              </button>
            </div>

            {loadingDocs ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium">
                Loading folder documents...
              </div>
            ) : folderDocuments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">This folder is empty</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload research papers, datasets, slide decks, or proposal drafts directly into this folder.
                </p>
                <button
                  onClick={() =>
                    navigate(
                      `/research/upload?folderId=${activeFolder._id || activeFolder.id}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c75bc] hover:bg-[#155a91] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Files Here</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {folderDocuments.map((doc) => {
                  const docId = doc._id || doc.id;
                  return (
                    <div
                      key={docId}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-[#1c75bc]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate" title={doc.title}>
                            {doc.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                            <span className="uppercase font-extrabold text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {doc.docType}
                            </span>
                            <span>{formatBytes(doc.fileSize)}</span>
                            <span>&bull;</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Download / View File"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={async () => {
                            if (confirm(`Remove "${doc.title}" from this folder?`)) {
                              await researchService.updateDocument(docId, { folderId: null });
                              loadFolderDocuments(activeFolder);
                            }
                          }}
                          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove from Folder"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Folders Grid View */
        <>
          {/* Search, Filter & Tabs Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search folders by title or description..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] transition-all shadow-2xs"
              />
            </div>

            {/* Project Filter */}
            {allProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold shrink-0">Project:</span>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] cursor-pointer shadow-2xs"
                >
                  <option value="all">All Projects</option>
                  {allProjects.map((p) => {
                    const pid = p.id || (p as any)._id;
                    return (
                      <option key={pid} value={pid}>
                        {p.title}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#1c75bc] text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Folders Grid */}
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500 font-medium">
              Loading your research folders...
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1c75bc]/10 text-[#1c75bc] mx-auto flex items-center justify-center">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {searchQuery ? 'No matching folders found' : 'No research folders created yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try clearing your search query or switching category filters.'
                  : 'Folders help organize your literature reviews, experimental findings, datasets, and writing files.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c75bc] hover:bg-[#155a91] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Folder</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFolders.map((folder) => {
                const folderId = folder._id || folder.id;
                const folderColor = folder.color || '#1c75bc';
                const docCount = folder.documentCount || 0;

                return (
                  <div
                    key={folderId}
                    onClick={() => handleOpenFolder(folder)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    {/* Color Top Banner */}
                    <div
                      className="h-2 w-full transition-all group-hover:h-2.5"
                      style={{ backgroundColor: folderColor }}
                    />

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Header icon + actions */}
                        <div className="flex items-center justify-between">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: folderColor }}
                          >
                            <Folder className="w-5 h-5" />
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEdit(folder, e)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Edit Folder"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmFolder(folder);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete Folder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4
                            className="text-sm font-bold text-slate-900 group-hover:text-[#1c75bc] transition-colors truncate"
                            title={folder.name}
                          >
                            {folder.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {folder.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>

                      {/* Footer Metadata */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {folder.category}
                        </span>
                        <span className="font-bold text-slate-600 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{docCount} {docCount === 1 ? 'file' : 'files'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Create / Edit Folder Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingFolder ? 'Edit Research Folder' : 'Create Research Folder'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Folder Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Folder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Brain Imaging Benchmarks, Literature Reviews"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] focus:bg-white transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the research materials or purpose of this directory..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Category & Project */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ResearchFolder['category'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] cursor-pointer"
                  >
                    <option value="general">General</option>
                    <option value="literature">Literature & Papers</option>
                    <option value="datasets">Datasets</option>
                    <option value="manuscripts">Manuscripts</option>
                    <option value="notes">Notes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Link Project</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] cursor-pointer"
                  >
                    <option value="">None (Personal)</option>
                    {allProjects.map((p) => {
                      const pid = p.id || (p as any)._id;
                      return (
                        <option key={pid} value={pid}>
                          {p.title}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Color Code Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Folder Accent Color</label>
                <div className="flex items-center gap-2.5">
                  {FOLDER_COLORS.map((c) => {
                    const isSelected = formData.color === c.hex;
                    return (
                      <button
                        type="button"
                        key={c.hex}
                        onClick={() => setFormData({ ...formData, color: c.hex })}
                        title={c.name}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-xs' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1c75bc] hover:bg-[#155a91] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {modalSubmitting ? 'Saving...' : editingFolder ? 'Update Folder' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Delete "{deleteConfirmFolder.name}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this folder? Any files inside will not be deleted, but will become unorganized.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmFolder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteFolder}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Folder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
