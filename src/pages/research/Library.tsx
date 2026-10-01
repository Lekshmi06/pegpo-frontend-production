import React, { useState, useEffect, useRef } from 'react';
import {
  Library as LibraryIcon,
  Search,
  BookOpen,
  Bookmark,
  FolderPlus,
  Sparkles,
  UploadCloud,
  FileText,
  Star,
  Layers,
  Clock,
  Filter,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import { ResearchPaper } from '../../types/research';
import { AddToProjectModal } from '../../components/research/AddToProjectModal';
import { PaperReaderModal } from '../../components/research/PaperReaderModal';

export default function ResearchLibrary() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'starred' | 'projects'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  // Modals
  const [activeProjectPaper, setActiveProjectPaper] = useState<{ id: string; title: string } | null>(null);
  const [readingPaper, setReadingPaper] = useState<ResearchPaper | null>(null);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const isStarred = activeTab === 'starred' ? true : undefined;
      const list = await researchService.getLibraryPapers({
        isStarred,
        search: searchQuery.trim() || undefined,
      });

      if (activeTab === 'recent') {
        setPapers(
          [...list].sort(
            (a, b) =>
              new Date(b.savedAt || b.createdAt || 0).getTime() -
              new Date(a.savedAt || a.createdAt || 0).getTime()
          )
        );
      } else if (activeTab === 'projects') {
        setPapers(list.filter((p) => p.projectIds && p.projectIds.length > 0));
      } else {
        setPapers(list);
      }
    } catch (err) {
      console.warn('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [activeTab, searchQuery]);

  const handleToggleStar = async (paperId: string) => {
    try {
      const isStarred = await researchService.toggleStarPaper(paperId);
      setPapers((prev) =>
        prev.map((p) =>
          p.id === paperId || (p as any)._id === paperId
            ? { ...p, isStarred, isBookmarked: isStarred }
            : p
        )
      );
      if (readingPaper && (readingPaper.id === paperId || (readingPaper as any)._id === paperId)) {
        setReadingPaper((prev) => (prev ? { ...prev, isStarred, isBookmarked: isStarred } : null));
      }
    } catch (err) {
      console.warn('Star toggle failed:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg('Uploading PDF and extracting document text...');

    try {
      const uploaded = await researchService.uploadPaperPdf(file);
      setUploadMsg('Paper extracted and saved to library!');
      setPapers((prev) => [uploaded, ...prev]);
      setTimeout(() => setUploadMsg(null), 3000);
    } catch (err: any) {
      setUploadMsg(err?.message || 'Failed to upload paper');
      setTimeout(() => setUploadMsg(null), 4000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Research Library
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-medium">
              {papers.length} Papers
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage peer-reviewed literature, uploaded research PDFs, extracted methodologies, and project collections.
          </p>
        </div>

        {/* Upload Paper PDF Button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Extracting PDF...' : 'Upload Paper PDF'}</span>
          </button>
        </div>
      </div>

      {uploadMsg && (
        <div className="p-3 bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
          <FileText className="w-4 h-4" />
          <span>{uploadMsg}</span>
        </div>
      )}

      {/* Navigation Filter Tabs + Search bar */}
      <div className="p-3 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
              activeTab === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LibraryIcon className="w-3.5 h-3.5" />
            <span>All Papers</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
              activeTab === 'recent'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recently Added</span>
          </button>

          <button
            onClick={() => setActiveTab('starred')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
              activeTab === 'starred'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Starred</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
              activeTab === 'projects'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Project-Linked</span>
          </button>
        </div>

        {/* Filter / Search within library */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers in library..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading library literature...
        </div>
      ) : papers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f172a] border border-dashed border-slate-800 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No papers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No papers matching "${searchQuery}".`
              : 'Discover papers in Research Discovery or upload a local PDF to start building your library.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map((paper) => {
            const paperId = paper.id || (paper as any)._id;
            const isStarred = paper.isStarred || paper.isBookmarked;

            return (
              <div
                key={paperId}
                className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2">
                  {/* Top row: Venue + Year + Star button */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-300 line-clamp-1">
                        {paper.venue || 'Academic Literature'}
                      </span>
                      <span>•</span>
                      <span>{paper.year}</span>
                    </div>

                    <button
                      onClick={() => handleToggleStar(paperId)}
                      className={`p-1 rounded-md transition-colors ${
                        isStarred
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isStarred ? 'Unstar paper' : 'Star paper'}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setReadingPaper(paper)}
                    className="text-sm font-semibold text-slate-100 hover:text-sky-400 cursor-pointer transition-colors line-clamp-2"
                  >
                    {paper.title}
                  </h3>

                  {/* Authors */}
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {paper.authors?.join(', ') || 'Unknown Authors'}
                  </p>

                  {/* Abstract preview */}
                  <p className="text-xs text-slate-300 line-clamp-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/50 leading-relaxed">
                    {paper.abstract}
                  </p>

                  {/* Tags & Project indicators */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {paper.tags?.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                    {paper.sourceProvider === 'upload' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        Uploaded PDF
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReadingPaper(paper)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </button>

                    <button
                      onClick={() => setReadingPaper(paper)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 rounded-lg transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Ask AI</span>
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      setActiveProjectPaper({ id: paperId, title: paper.title })
                    }
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Add to Project"
                  >
                    <FolderPlus className="w-4 h-4 text-sky-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Attachment Modal */}
      {activeProjectPaper && (
        <AddToProjectModal
          isOpen={Boolean(activeProjectPaper)}
          paperId={activeProjectPaper.id}
          paperTitle={activeProjectPaper.title}
          onClose={() => setActiveProjectPaper(null)}
          onSuccess={fetchLibrary}
        />
      )}

      {/* Paper Reader & Grounded AI Modal */}
      {readingPaper && (
        <PaperReaderModal
          isOpen={Boolean(readingPaper)}
          paper={readingPaper}
          onClose={() => setReadingPaper(null)}
          onToggleStar={handleToggleStar}
          onAddToProject={(p) =>
            setActiveProjectPaper({ id: p.id || (p as any)._id, title: p.title })
          }
        />
      )}
    </div>
  );
}
