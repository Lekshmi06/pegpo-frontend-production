import React, { useState, useEffect, useRef, useMemo, ChangeEvent, DragEvent } from 'react';
import {
  Upload as UploadIcon,
  FileText,
  Presentation,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Edit3,
  Globe,
  Users,
  Sparkles,
  AlertCircle,
  Plus,
  RefreshCw,
  Layers,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { materialService } from '../../services/materialService';
import { classSectionService } from '../../services/classSectionService';
import { resolveAssetUrl } from '../../services/apiClient';
import {
  TeacherMaterial,
  MaterialCategory,
  MaterialStatus,
  UploadMaterialPayload
} from '../../types/material';
import { TeacherClassGroup } from '../../types/classSection';

const CATEGORIES: { id: MaterialCategory; label: string; icon: any }[] = [
  { id: 'slides', label: 'Lecture Slides (PPT)', icon: Presentation },
  { id: 'notes', label: 'Study Notes & Handouts', icon: FileText },
  { id: 'textbook', label: 'Textbook & Reading Chapter', icon: BookOpen },
  { id: 'worksheet', label: 'Worksheet / Problem Set', icon: FileSpreadsheet },
  { id: 'syllabus', label: 'Syllabus & Course Guide', icon: Layers },
  { id: 'other', label: 'Reference Document', icon: FileCode },
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(mimeType: string, filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['ppt', 'pptx', 'key'].includes(ext) || mimeType.includes('presentation')) {
    return <Presentation className="w-5 h-5 text-amber-500" />;
  }
  if (['pdf'].includes(ext) || mimeType.includes('pdf')) {
    return <FileText className="w-5 h-5 text-rose-500" />;
  }
  if (['doc', 'docx'].includes(ext) || mimeType.includes('word')) {
    return <FileText className="w-5 h-5 text-blue-500" />;
  }
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || mimeType.includes('image')) {
    return <ImageIcon className="w-5 h-5 text-indigo-500" />;
  }
  return <BookOpen className="w-5 h-5 text-slate-600" />;
}

export default function TeacherUpload() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data state
  const [materials, setMaterials] = useState<TeacherMaterial[]>([]);
  const [classes, setClasses] = useState<TeacherClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload Form
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<MaterialCategory>('slides');
  const [formSubject, setFormSubject] = useState('Physics');
  const [formTargetAudience, setFormTargetAudience] = useState<'all' | 'class_section'>('all');
  const [formClassSectionId, setFormClassSectionId] = useState('');
  const [formPublishImmediately, setFormPublishImmediately] = useState(true);
  const [formAllowDownload, setFormAllowDownload] = useState(true);
  const [formAllowAIChat, setFormAllowAIChat] = useState(true);

  // Edit / Publish Modal State
  const [editingMaterial, setEditingMaterial] = useState<TeacherMaterial | null>(null);
  const [publishModalMaterial, setPublishModalMaterial] = useState<TeacherMaterial | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);

  // Load materials & teacher classes
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedMaterials, fetchedClasses] = await Promise.all([
        materialService.getTeacherMaterials(),
        classSectionService.getTeacherClasses().catch(() => []),
      ]);
      setMaterials(fetchedMaterials);
      setClasses(fetchedClasses);
    } catch (err) {
      console.error('Failed to load teacher uploads:', err);
      toast.error('Failed to load uploads. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = materials.length;
    const published = materials.filter((m) => m.status === 'published').length;
    const drafts = total - published;
    const downloads = materials.reduce((acc, m) => acc + (m.downloadsCount || 0), 0);
    return { total, published, drafts, downloads };
  }, [materials]);

  // Unique subjects for filter
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    materials.forEach((m) => {
      if (m.subject) set.add(m.subject);
    });
    classes.forEach((c) => {
      if (c.subject) set.add(c.subject);
    });
    return Array.from(set);
  }, [materials, classes]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || m.status === statusFilter;

      const matchCat =
        categoryFilter === 'all' || m.category === categoryFilter;

      const matchSub =
        subjectFilter === 'all' || m.subject === subjectFilter;

      return matchSearch && matchStatus && matchCat && matchSub;
    });
  }, [materials, searchQuery, statusFilter, categoryFilter, subjectFilter]);

  // Drag and Drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const validExts = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.txt', '.png', '.jpg', '.jpeg', '.webp'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error(`"${file.name}" has an unsupported format. Supported: PDF, PPT, PPTX, DOCX, TXT, PNG, JPG.`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error(`"${file.name}" exceeds maximum allowed size of 50 MB.`);
      return;
    }

    setSelectedFile(file);
    if (!formTitle) {
      // Auto populate clean title from filename
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setFormTitle(cleanName.replace(/[_-]/g, ' '));
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select or drop a file to upload.');
      return;
    }
    if (!formTitle.trim()) {
      toast.error('Please provide a title for the material.');
      return;
    }

    try {
      setIsUploading(true);
      const payload: UploadMaterialPayload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        subject: formSubject.trim() || 'General',
        classLevel: 'All Classes',
        targetAudience: formTargetAudience,
        classSectionId: formTargetAudience === 'class_section' ? formClassSectionId : undefined,
        status: formPublishImmediately ? 'published' : 'draft',
        allowStudentDownload: formAllowDownload,
        allowAIChat: formAllowAIChat,
      };

      const uploaded = await materialService.uploadMaterial(selectedFile, payload);
      setMaterials((prev) => [uploaded, ...prev]);

      toast.success(
        uploaded.status === 'published'
          ? `Uploaded & published "${uploaded.title}" to students!`
          : `Saved "${uploaded.title}" as draft.`
      );

      // Reset form
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setFormTitle('');
      setFormDescription('');
      setFormClassSectionId('');
      setFormPublishImmediately(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (material: TeacherMaterial) => {
    try {
      const nextStatus: MaterialStatus = material.status === 'published' ? 'draft' : 'published';
      const updated = await materialService.setPublishStatus(material._id || material.id!, nextStatus);

      setMaterials((prev) =>
        prev.map((m) => (m._id === updated._id || m.id === updated.id ? updated : m))
      );

      if (updated.status === 'published') {
        toast.success(`Published "${updated.title}" to students!`);
      } else {
        toast.info(`Moved "${updated.title}" to drafts (hidden from students).`);
      }
    } catch (err) {
      toast.error('Failed to change publish status.');
    }
  };

  // Open Publish Modal with target class selector
  const handleOpenPublishModal = (material: TeacherMaterial) => {
    setPublishModalMaterial(material);
  };

  // Confirm publish with custom audience
  const handleConfirmPublishModal = async (
    targetAudience: 'all' | 'class_section',
    classSectionId?: string
  ) => {
    if (!publishModalMaterial) return;
    try {
      const updated = await materialService.setPublishStatus(
        publishModalMaterial._id || publishModalMaterial.id!,
        'published',
        targetAudience,
        classSectionId
      );

      setMaterials((prev) =>
        prev.map((m) => (m._id === updated._id || m.id === updated.id ? updated : m))
      );
      toast.success(`"${updated.title}" published successfully!`);
      setPublishModalMaterial(null);
    } catch (err) {
      toast.error('Failed to publish material.');
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    try {
      const updated = await materialService.updateMaterial(
        editingMaterial._id || editingMaterial.id!,
        {
          title: editingMaterial.title,
          description: editingMaterial.description,
          category: editingMaterial.category,
          subject: editingMaterial.subject,
          targetAudience: editingMaterial.targetAudience,
          classSectionId:
            typeof editingMaterial.classSectionId === 'string'
              ? editingMaterial.classSectionId
              : (editingMaterial.classSectionId as any)?._id,
          status: editingMaterial.status,
          allowStudentDownload: editingMaterial.allowStudentDownload,
          allowAIChat: editingMaterial.allowAIChat,
        }
      );

      setMaterials((prev) =>
        prev.map((m) => (m._id === updated._id || m.id === updated.id ? updated : m))
      );
      toast.success('Resource details updated successfully!');
      setEditingMaterial(null);
    } catch (err) {
      toast.error('Failed to update resource.');
    }
  };

  // Delete Material
  const handleDelete = async (id: string) => {
    try {
      await materialService.deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m._id !== id && m.id !== id));
      toast.success('Material deleted successfully.');
      setDeletingMaterialId(null);
    } catch (err) {
      toast.error('Failed to delete material.');
    }
  };

  return (
    <div className="min-h-full bg-[#f8fcff] p-4 md:p-8 space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#214d7d] via-[#1a416d] to-[#122e4e] p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold text-blue-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Teacher Content & Curriculum Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Content Uploads & Publishing
            </h1>
            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed">
              Upload lecture slides, textbook documents, question banks, and syllabus PDFs. Keep materials private as drafts or publish directly to all students or specific classes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedFile(null);
                setFormTitle('');
                setFormDescription('');
                setIsUploadModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs md:text-sm font-extrabold text-[#173a62] shadow-sm hover:bg-blue-50 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#0091ff] stroke-[2.5]" />
              <span>Upload New Resource</span>
            </button>
            <button
              onClick={loadData}
              title="Refresh materials"
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Stats Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-[#e1edf7] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Materials</p>
            <h3 className="text-2xl font-extrabold text-[#111827] mt-1">{stats.total}</h3>
            <span className="text-[10px] text-slate-400">All uploaded files</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0091ff] flex items-center justify-center">
            <UploadIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#e1edf7] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Live to Students</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.published}</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Published & Accessible</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#e1edf7] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Drafts (Private)</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats.drafts}</h3>
            <span className="text-[10px] text-amber-600 font-medium">Visible only to you</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#e1edf7] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Student Accesses</p>
            <h3 className="text-2xl font-extrabold text-[#214d7d] mt-1">{stats.downloads}</h3>
            <span className="text-[10px] text-slate-400">Total downloads</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="rounded-2xl bg-white border border-[#e1edf7] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, description, or filename..."
              className="w-full rounded-xl bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium text-slate-700 outline-none border border-slate-200 focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-[#111827] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({materials.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published ({stats.published})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drafts ({stats.drafts})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-[#0091ff]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-[#0091ff]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category & Subject Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {availableSubjects.length > 0 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {(categoryFilter !== 'all' || subjectFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSubjectFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#0091ff] hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Materials Display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-[#e1edf7]">
          <Loader size="lg" />
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading your uploaded course materials...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0091ff] flex items-center justify-center mx-auto">
            <UploadIcon className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {materials.length === 0 ? 'No uploaded materials yet' : 'No matching materials found'}
            </h3>
            <p className="text-xs text-slate-500">
              {materials.length === 0
                ? 'Upload your first slide deck, lecture notes, or syllabus document. You can keep it as a draft or publish directly to your students.'
                : 'Try adjusting your search terms or filters to find what you need.'}
            </p>
          </div>
          {materials.length === 0 && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#214d7d] hover:bg-[#1a416d] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => {
            const isPublished = mat.status === 'published';
            const categoryObj = CATEGORIES.find((c) => c.id === mat.category);
            const classSectionName =
              typeof mat.classSectionId === 'object' && mat.classSectionId?.name
                ? mat.classSectionId.name
                : null;

            return (
              <div
                key={mat._id || mat.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-white border border-[#e1edf7] p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon, Category & Publish Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {getFileIcon(mat.mimeType, mat.originalName)}
                      </div>
                      <div>
                        <span className="inline-block text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {mat.subject}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {categoryObj?.label || mat.category}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Draft (Private)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#0091ff] transition-colors" title={mat.title}>
                      {mat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {mat.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Target Audience Pill & File Info */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        {mat.targetAudience === 'all' ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-[#0091ff]" />
                            <span>All Students</span>
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                            <span>{classSectionName || 'Specific Class'}</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatBytes(mat.fileSize)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>File: {mat.originalName}</span>
                      <span>{mat.downloadsCount || 0} downloads</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* One-Click Publish / Unpublish Toggle */}
                  {isPublished ? (
                    <button
                      onClick={() => handleTogglePublish(mat)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
                      title="Unpublish this resource to move back to draft"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Unpublish</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenPublishModal(mat)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="Publish this resource to make it available to students"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Publish Now →</span>
                    </button>
                  )}

                  {/* Icon Actions */}
                  <div className="flex items-center gap-1">
                    <a
                      href={resolveAssetUrl(mat.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      download={mat.originalName}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#0091ff] hover:bg-blue-50 transition-colors"
                      title="Download / View File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setEditingMaterial(mat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Resource"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMaterialId(mat._id || mat.id!)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-3xl bg-white border border-[#e1edf7] shadow-2xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-4">Resource</th>
                <th className="px-4 py-4">Subject</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Target Audience</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Size</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((mat) => {
                const isPublished = mat.status === 'published';
                const classSectionName =
                  typeof mat.classSectionId === 'object' && mat.classSectionId?.name
                    ? mat.classSectionId.name
                    : null;

                return (
                  <tr key={mat._id || mat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          {getFileIcon(mat.mimeType, mat.originalName)}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-800 truncate" title={mat.title}>
                            {mat.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {mat.originalName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-700">{mat.subject}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 capitalize">{mat.category}</td>
                    <td className="px-4 py-3.5">
                      {mat.targetAudience === 'all' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0091ff]">
                          <Globe className="w-3.5 h-3.5" /> All Students
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600">
                          <GraduationCap className="w-3.5 h-3.5" /> {classSectionName || 'Class Section'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{formatBytes(mat.fileSize)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPublished ? (
                          <button
                            onClick={() => handleTogglePublish(mat)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPublishModal(mat)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        <a
                          href={resolveAssetUrl(mat.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          download={mat.originalName}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0091ff]"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setEditingMaterial(mat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingMaterialId(mat._id || mat.id!)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. UPLOAD NEW MATERIAL MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          if (!isUploading) {
            setIsUploadModalOpen(false);
            setSelectedFile(null);
          }
        }}
        title="Upload Learning Material & Slides"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#0091ff] bg-blue-50/60 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">{formatBytes(selectedFile.size)} • Click to replace file</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0091ff] flex items-center justify-center mx-auto">
                  <UploadIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Drag and drop file here, or <span className="text-[#0091ff] underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports Lecture Slides (PPT/PPTX), PDF Documents, Word (DOCX), Notes (TXT), and Images (Max 50MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Material Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Chapter 4: Thermodynamics Lecture Notes"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MaterialCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Physics, Chemistry, Math..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff]"
                />
              </div>
            </div>

            {/* Target Audience / Publishing Access */}
            <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5">
              <label className="block font-bold text-slate-800">
                Publish Audience Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormTargetAudience('all')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    formTargetAudience === 'all'
                      ? 'border-[#0091ff] bg-white text-[#111827] shadow-2xs font-extrabold'
                      : 'border-transparent bg-white/60 text-slate-600 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#0091ff]" />
                    <span>All My Students</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Public to all students</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormTargetAudience('class_section')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    formTargetAudience === 'class_section'
                      ? 'border-[#0091ff] bg-white text-[#111827] shadow-2xs font-extrabold'
                      : 'border-transparent bg-white/60 text-slate-600 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Specific Class</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Restrict to a section</p>
                </button>
              </div>

              {formTargetAudience === 'class_section' && (
                <div className="pt-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Class Section
                  </label>
                  {classes.length > 0 ? (
                    <select
                      value={formClassSectionId}
                      onChange={(e) => setFormClassSectionId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Class Section --</option>
                      {classes.map((cls) => (
                        <option key={cls.classSectionId} value={cls.classSectionId}>
                          {cls.name} ({cls.subject} • {cls.studentCount || 0} students)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-amber-700 font-medium bg-amber-50 p-2 rounded-lg">
                      No classes found. You can configure classes in the &ldquo;Classes&rdquo; tab.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description / Learning Guidance (Optional)
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Give students a brief summary or key reading objectives..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0091ff]"
              />
            </div>

            {/* Publishing Status & Student AI Permissions */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">Publish Immediately</p>
                  <p className="text-[10px] text-slate-500">Make accessible to students right away</p>
                </div>
                <input
                  type="checkbox"
                  checked={formPublishImmediately}
                  onChange={(e) => setFormPublishImmediately(e.target.checked)}
                  className="w-4 h-4 text-[#0091ff] rounded cursor-pointer"
                />
              </label>

              <div className="flex items-center gap-4 text-[11px] text-slate-600 px-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAllowDownload}
                    onChange={(e) => setFormAllowDownload(e.target.checked)}
                    className="rounded text-[#0091ff]"
                  />
                  <span>Allow Student File Download</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAllowAIChat}
                    onChange={(e) => setFormAllowAIChat(e.target.checked)}
                    className="rounded text-[#0091ff]"
                  />
                  <span>Enable Student AI Studio Grounding</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isUploading || !selectedFile}
              className="bg-[#214d7d] hover:bg-[#173a62]"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader size="sm" />
                  <span>Uploading...</span>
                </div>
              ) : formPublishImmediately ? (
                'Upload & Publish to Students'
              ) : (
                'Upload as Draft'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. EDIT MATERIAL MODAL */}
      {editingMaterial && (
        <Modal
          isOpen={Boolean(editingMaterial)}
          onClose={() => setEditingMaterial(null)}
          title="Edit Resource Details"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={editingMaterial.title}
                onChange={(e) =>
                  setEditingMaterial({ ...editingMaterial, title: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editingMaterial.category}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      category: e.target.value as MaterialCategory,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={editingMaterial.subject}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, subject: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={editingMaterial.targetAudience}
                onChange={(e) =>
                  setEditingMaterial({
                    ...editingMaterial,
                    targetAudience: e.target.value as 'all' | 'class_section',
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Students (Public)</option>
                <option value="class_section">Specific Class Section</option>
              </select>
            </div>

            {editingMaterial.targetAudience === 'class_section' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Class</label>
                <select
                  value={
                    typeof editingMaterial.classSectionId === 'string'
                      ? editingMaterial.classSectionId
                      : (editingMaterial.classSectionId as any)?._id || ''
                  }
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      classSectionId: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="">-- Choose Class Section --</option>
                  {classes.map((cls) => (
                    <option key={cls.classSectionId} value={cls.classSectionId}>
                      {cls.name} ({cls.subject})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingMaterial.description || ''}
                onChange={(e) =>
                  setEditingMaterial({ ...editingMaterial, description: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Publishing Status</label>
              <select
                value={editingMaterial.status}
                onChange={(e) =>
                  setEditingMaterial({
                    ...editingMaterial,
                    status: e.target.value as MaterialStatus,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="published">Published (Visible to Students)</option>
                <option value="draft">Draft (Private to Teacher)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingMaterial(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#214d7d]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. PUBLISH TO STUDENTS CONFIRMATION / AUDIENCE MODAL */}
      {publishModalMaterial && (
        <Modal
          isOpen={Boolean(publishModalMaterial)}
          onClose={() => setPublishModalMaterial(null)}
          title="Publish Resource to Students"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Ready to make this resource available to students?</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                &ldquo;{publishModalMaterial.title}&rdquo; ({publishModalMaterial.originalName})
              </p>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-800">
                Choose Publishing Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPublishModalMaterial({
                      ...publishModalMaterial,
                      targetAudience: 'all',
                    })
                  }
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    publishModalMaterial.targetAudience === 'all'
                      ? 'border-emerald-500 bg-emerald-50/50 font-bold text-slate-800 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>All Students</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Published on student Library & Bookshelf
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPublishModalMaterial({
                      ...publishModalMaterial,
                      targetAudience: 'class_section',
                    })
                  }
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    publishModalMaterial.targetAudience === 'class_section'
                      ? 'border-purple-500 bg-purple-50/50 font-bold text-slate-800 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Specific Class</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Only students in the selected class
                  </p>
                </button>
              </div>

              {publishModalMaterial.targetAudience === 'class_section' && (
                <div className="pt-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Target Class
                  </label>
                  <select
                    value={
                      typeof publishModalMaterial.classSectionId === 'string'
                        ? publishModalMaterial.classSectionId
                        : (publishModalMaterial.classSectionId as any)?._id || ''
                    }
                    onChange={(e) =>
                      setPublishModalMaterial({
                        ...publishModalMaterial,
                        classSectionId: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Class Section --</option>
                    {classes.map((cls) => (
                      <option key={cls.classSectionId} value={cls.classSectionId}>
                        {cls.name} ({cls.subject} • {cls.studentCount || 0} students)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPublishModalMaterial(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  handleConfirmPublishModal(
                    publishModalMaterial.targetAudience,
                    typeof publishModalMaterial.classSectionId === 'string'
                      ? publishModalMaterial.classSectionId
                      : (publishModalMaterial.classSectionId as any)?._id
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Publish to Students
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {deletingMaterialId && (
        <Modal
          isOpen={Boolean(deletingMaterialId)}
          onClose={() => setDeletingMaterialId(null)}
          title="Delete Material"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this material? Students will no longer have access to this document.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingMaterialId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleDelete(deletingMaterialId)}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
