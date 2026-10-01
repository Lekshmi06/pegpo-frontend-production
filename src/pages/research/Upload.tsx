import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Folder,
  FolderPlus,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  X,
  Star,
  RefreshCw,
  Database,
  BookOpen,
  Presentation,
  FileSpreadsheet,
  FileArchive,
  FileCode,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import {
  ResearchDocument,
  ResearchFolder,
  ResearchDocType,
} from '../../types/research';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';

const DOC_TYPES: { id: ResearchDocType; label: string; icon: any }[] = [
  { id: 'paper', label: 'Research Paper', icon: BookOpen },
  { id: 'dataset', label: 'Dataset / Table', icon: Database },
  { id: 'manuscript', label: 'Manuscript Draft', icon: FileText },
  { id: 'proposal', label: 'Research Proposal', icon: Sparkles },
  { id: 'slides', label: 'Slide Deck', icon: Presentation },
  { id: 'notes', label: 'Field / Lab Notes', icon: FileCode },
  { id: 'other', label: 'Other Document', icon: FileText },
];

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(extension: string, docType?: string) {
  const ext = extension.toLowerCase();
  if (['csv', 'xlsx', 'xls', 'tsv'].includes(ext) || docType === 'dataset') {
    return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
  }
  if (['pptx', 'ppt'].includes(ext) || docType === 'slides') {
    return <Presentation className="w-5 h-5 text-amber-500" />;
  }
  if (['zip', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className="w-5 h-5 text-purple-500" />;
  }
  if (['json', 'sql', 'py', 'r'].includes(ext)) {
    return <FileCode className="w-5 h-5 text-indigo-500" />;
  }
  return <FileText className="w-5 h-5 text-[#1c75bc]" />;
}

export default function Upload() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { allProjects, activeProjectId } = useResearchActiveProject();

  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [folders, setFolders] = useState<ResearchFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDocType, setUploadDocType] = useState<ResearchDocType>('paper');
  const [uploadFolderId, setUploadFolderId] = useState<string>('');
  const [uploadProjectId, setUploadProjectId] = useState<string>(activeProjectId || '');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Move document modal
  const [movingDoc, setMovingDoc] = useState<ResearchDocument | null>(null);
  const [targetMoveFolder, setTargetMoveFolder] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  // Delete confirmation
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<ResearchDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch documents and folders
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsData, foldersData] = await Promise.all([
        researchService.listDocuments(),
        researchService.listFolders(),
      ]);
      setDocuments(docsData);
      setFolders(foldersData);
    } catch (err: any) {
      console.error('Failed to load upload center data:', err);
      setError(err?.message || 'Failed to fetch user documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync target folder from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const folderParam = params.get('folderId');
    if (folderParam) {
      setUploadFolderId(folderParam);
      setSelectedFolderFilter(folderParam);
    }
    const projectParam = params.get('projectId');
    if (projectParam) {
      setUploadProjectId(projectParam);
      setSelectedProjectFilter(projectParam);
    }
  }, [location.search]);

  // Handle file selection
  const handleFileChosen = (file: File) => {
    setSelectedFile(file);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setUploadTitle(nameWithoutExt);

    // Auto-detect doc type from extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['csv', 'xlsx', 'xls', 'json', 'tsv'].includes(ext || '')) {
      setUploadDocType('dataset');
    } else if (['pptx', 'ppt'].includes(ext || '')) {
      setUploadDocType('slides');
    } else if (['docx', 'doc', 'md'].includes(ext || '')) {
      setUploadDocType('manuscript');
    } else if (ext === 'pdf') {
      setUploadDocType('paper');
    } else {
      setUploadDocType('other');
    }

    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChosen(e.dataTransfer.files[0]);
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please choose or drop a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const created = await researchService.uploadDocument(selectedFile, {
        title: uploadTitle.trim() || selectedFile.name,
        docType: uploadDocType,
        folderId: uploadFolderId || undefined,
        projectId: uploadProjectId || undefined,
        description: uploadDescription.trim(),
        tags: uploadTags ? uploadTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });

      setDocuments((prev) => [created, ...prev]);
      setUploadSuccess(`"${created.title}" successfully uploaded and saved.`);
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadTags('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  // Move document
  const handleExecuteMove = async () => {
    if (!movingDoc) return;
    const docId = movingDoc._id || movingDoc.id;
    setIsMoving(true);

    try {
      const updated = await researchService.updateDocument(docId, {
        folderId: targetMoveFolder || null,
      });

      setDocuments((prev) =>
        prev.map((d) => ((d._id || d.id) === docId ? updated : d))
      );
      setMovingDoc(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to move document');
    } finally {
      setIsMoving(false);
    }
  };

  // Delete document
  const handleExecuteDelete = async () => {
    if (!deleteConfirmDoc) return;
    const docId = deleteConfirmDoc._id || deleteConfirmDoc.id;
    setIsDeleting(true);

    try {
      await researchService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => (d._id || d.id) !== docId));
      setDeleteConfirmDoc(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.originalFileName.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesType =
        selectedTypeFilter === 'all' || doc.docType === selectedTypeFilter;

      const fId =
        typeof doc.folderId === 'object' && doc.folderId !== null
          ? (doc.folderId as any)._id
          : doc.folderId;
      const matchesFolder =
        selectedFolderFilter === 'all' ||
        (selectedFolderFilter === 'unorganized' && !fId) ||
        fId === selectedFolderFilter;

      const pId =
        typeof doc.projectId === 'object' && doc.projectId !== null
          ? (doc.projectId as any)._id
          : doc.projectId;
      const matchesProject =
        selectedProjectFilter === 'all' || pId === selectedProjectFilter;

      return matchesSearch && matchesType && matchesFolder && matchesProject;
    });
  }, [
    documents,
    searchQuery,
    selectedTypeFilter,
    selectedFolderFilter,
    selectedProjectFilter,
  ]);

  // Aggregate stats
  const totalStorageBytes = useMemo(() => {
    return documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
  }, [documents]);

  return (
    <div className="min-h-full bg-[#fafbfc] text-slate-800 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1c75bc]/10 text-[#1c75bc] flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Document Upload Center</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#1c75bc]/10 text-[#1c75bc]">
                {documents.length} {documents.length === 1 ? 'file' : 'files'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Upload papers, datasets, manuscripts, and slides. Stored user-specifically with folder organization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Storage</p>
            <p className="text-xs font-black text-slate-800">{formatBytes(totalStorageBytes)}</p>
          </div>
          <button
            onClick={() => navigate('/research/new-folder')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#1c75bc]" />
            <span>Manage Folders</span>
          </button>
        </div>
      </div>

      {/* Upload Zone & Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-[#1c75bc]" />
          <span>Upload New Research File</span>
        </h2>

        {/* Drag & Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#1c75bc] bg-[#1c75bc]/5 scale-[0.99]'
              : selectedFile
              ? 'border-emerald-300 bg-emerald-50/40'
              : 'border-slate-200 hover:border-[#1c75bc]/60 hover:bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChosen(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {formatBytes(selectedFile.size)} &bull; Ready to upload
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="mt-1 text-[11px] text-red-500 hover:underline font-bold cursor-pointer"
              >
                Change File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#1c75bc]/10 text-[#1c75bc] flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                <span className="text-[#1c75bc]">Click to upload</span> or drag and drop files here
              </p>
              <p className="text-[11px] text-slate-400 font-medium max-w-sm">
                PDF, CSV, JSON, XLSX, DOCX, PPTX, TXT, MD, ZIP (Max: 100MB per file)
              </p>
            </div>
          )}
        </div>

        {/* Selected File Metadata Form */}
        {selectedFile && (
          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter a clean descriptive title..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] focus:bg-white transition-all"
                />
              </div>

              {/* Document Category / Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Document Type</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value as ResearchDocType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] cursor-pointer"
                >
                  {DOC_TYPES.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Folder */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Destination Folder</label>
                <select
                  value={uploadFolderId}
                  onChange={(e) => setUploadFolderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] cursor-pointer"
                >
                  <option value="">Unorganized (Root)</option>
                  {folders.map((f) => {
                    const fid = f._id || f.id;
                    return (
                      <option key={fid} value={fid}>
                        📁 {f.name} ({f.category})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Target Project */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Link to Research Project</label>
                <select
                  value={uploadProjectId}
                  onChange={(e) => setUploadProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] cursor-pointer"
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

            {/* Description & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description / Abstract</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Key findings, methodology or dataset notes..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="AI, EEG, Neuroimaging, Benchmark"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1c75bc] hover:bg-[#155a91] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Save & Upload Document'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Uploads Explorer Section */}
      <div className="space-y-4">
        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploaded files by name, tags, or description..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] transition-all shadow-2xs"
            />
          </div>

          {/* Folder & Project Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Folder Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">Folder:</span>
              <select
                value={selectedFolderFilter}
                onChange={(e) => setSelectedFolderFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] cursor-pointer shadow-2xs"
              >
                <option value="all">All Folders</option>
                <option value="unorganized">Unorganized Only</option>
                {folders.map((f) => {
                  const fid = f._id || f.id;
                  return (
                    <option key={fid} value={fid}>
                      {f.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Project Dropdown */}
            {allProjects.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold">Project:</span>
                <select
                  value={selectedProjectFilter}
                  onChange={(e) => setSelectedProjectFilter(e.target.value)}
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
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTypeFilter === 'all'
                ? 'bg-[#1c75bc] text-white shadow-xs font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            All Types ({documents.length})
          </button>
          {DOC_TYPES.map((dt) => {
            const count = documents.filter((d) => d.docType === dt.id).length;
            const active = selectedTypeFilter === dt.id;
            return (
              <button
                key={dt.id}
                onClick={() => setSelectedTypeFilter(dt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1c75bc] text-white shadow-xs font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                {dt.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Documents Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500 font-medium">
              Loading your uploaded documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {searchQuery ? 'No matching documents found' : 'No documents uploaded yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try clearing your search query or adjusting your filters.'
                  : 'Use the upload zone above to add your first research paper, dataset, or notes.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDocuments.map((doc) => {
                const docId = doc._id || doc.id;
                const folderObj =
                  typeof doc.folderId === 'object' && doc.folderId !== null
                    ? (doc.folderId as any)
                    : null;
                const projectObj =
                  typeof doc.projectId === 'object' && doc.projectId !== null
                    ? (doc.projectId as any)
                    : null;

                return (
                  <div
                    key={docId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Left: Icon & Info */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        {getFileIcon(doc.fileExtension || '', doc.docType)}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className="text-xs font-bold text-slate-900 truncate max-w-md"
                            title={doc.title}
                          >
                            {doc.title}
                          </h4>
                          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {doc.docType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium flex-wrap">
                          <span>{doc.originalFileName}</span>
                          <span>&bull;</span>
                          <span>{formatBytes(doc.fileSize)}</span>
                          <span>&bull;</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>

                          {/* Folder Pill */}
                          {folderObj ? (
                            <span
                              className="px-2 py-0.2 rounded-md text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: folderObj.color || '#1c75bc' }}
                            >
                              📁 {folderObj.name}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                              Unorganized
                            </span>
                          )}

                          {/* Project Pill */}
                          {projectObj && (
                            <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-[#1c75bc]/10 text-[#1c75bc]">
                              🎯 {projectObj.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {/* Move to folder */}
                      <button
                        type="button"
                        onClick={() => {
                          setMovingDoc(doc);
                          setTargetMoveFolder(folderObj?._id || '');
                        }}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Move to Folder"
                      >
                        <Folder className="w-4 h-4" />
                      </button>

                      {/* Download file */}
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl hover:bg-slate-100 text-[#1c75bc] transition-colors cursor-pointer"
                          title="Download / View File"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      {/* Delete file */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmDoc(doc)}
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Move Document Modal */}
      {movingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#1c75bc]" />
                <span>Move to Folder</span>
              </h3>
              <button
                onClick={() => setMovingDoc(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select destination folder for <span className="font-bold text-slate-800">"{movingDoc.title}"</span>:
            </p>

            <select
              value={targetMoveFolder}
              onChange={(e) => setTargetMoveFolder(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1c75bc] cursor-pointer"
            >
              <option value="">Unorganized (No Folder)</option>
              {folders.map((f) => {
                const fid = f._id || f.id;
                return (
                  <option key={fid} value={fid}>
                    📁 {f.name} ({f.category})
                  </option>
                );
              })}
            </select>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMovingDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isMoving}
                onClick={handleExecuteMove}
                className="px-5 py-2 rounded-xl bg-[#1c75bc] hover:bg-[#155a91] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isMoving ? 'Moving...' : 'Move Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Delete "{deleteConfirmDoc.title}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this document and remove its file? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
