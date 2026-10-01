import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  Sparkles,
  BookOpen,
  FolderPlus,
  Check,
  Calendar,
  Layers,
  Globe,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import { AcademicSearchResultItem, ResearchPaper } from '../../types/research';
import { AddToProjectModal } from '../../components/research/AddToProjectModal';
import { PaperReaderModal } from '../../components/research/PaperReaderModal';

export default function Discover() {
  const [query, setQuery] = useState('medical image segmentation');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AcademicSearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [providerName, setProviderName] = useState('Crossref (Live Academic Index)');
  const [isDemo, setIsDemo] = useState(false);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [venueFilter, setVenueFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);

  // Modals & Actions
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [activeProjectPaper, setActiveProjectPaper] = useState<{ id: string; title: string } | null>(null);
  const [readingPaper, setReadingPaper] = useState<ResearchPaper | null>(null);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);

    try {
      const year = selectedYear !== 'all' ? parseInt(selectedYear, 10) : undefined;
      const response = await researchService.searchAcademicLiterature(searchQuery, {
        year,
        venue: venueFilter.trim() || undefined,
        author: authorFilter.trim() || undefined,
        limit: 15,
      });

      setResults(response.papers);
      setTotalCount(response.total);
      setProviderName(response.provider);
      setIsDemo(response.isDemo);
    } catch (err) {
      console.warn('Academic search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch('medical image segmentation');
  }, []);

  const handleSaveToLibrary = async (paper: AcademicSearchResultItem, index: number) => {
    const key = paper.doi || paper.title || String(index);
    setSavingIds((prev) => ({ ...prev, [key]: true }));

    try {
      await researchService.savePaperToLibrary({
        title: paper.title,
        authors: paper.authors,
        year: paper.year || new Date().getFullYear(),
        venue: paper.venue || 'Academic Index',
        doi: paper.doi,
        abstract: paper.abstract,
        methodology: paper.methodology,
        datasets: paper.datasets,
        sourceProvider: paper.sourceProvider,
        tags: paper.tags || ['Discovered'],
      });

      setSavedIds((prev) => ({ ...prev, [key]: true }));
    } catch (err) {
      console.warn('Save paper failed:', err);
    } finally {
      setSavingIds((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleReadPaper = (item: AcademicSearchResultItem) => {
    const p: ResearchPaper = {
      id: item.id || item.doi || `disc-${Date.now()}`,
      title: item.title,
      authors: item.authors,
      year: item.year || new Date().getFullYear(),
      venue: item.venue || 'Academic Literature',
      doi: item.doi,
      abstract: item.abstract,
      methodology: item.methodology,
      datasets: item.datasets,
      tags: item.tags || [],
      sourceProvider: item.sourceProvider,
      isDemo: item.isDemo,
      citationCount: item.citationCount,
      externalUrl: item.externalUrl,
    };
    setReadingPaper(p);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Research Discovery
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-medium">
              Academic Literature Search
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search peer-reviewed papers across global registries, query methodologies, and ground your literature review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Index: <strong className="text-slate-200">{providerName}</strong></span>
          </div>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(query);
          }}
          className="flex flex-col sm:flex-row items-center gap-2.5"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='What are you researching? (e.g. "recent approaches to medical image segmentation")'
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md transition-all shrink-0"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search Papers</span>
              </>
            )}
          </button>
        </form>

        {/* Filter Toolbar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Filters:</span>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-hidden focus:border-sky-500"
            >
              <option value="all">All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-500" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-hidden focus:border-sky-500"
            >
              <option value="all">All Domains</option>
              <option value="cs">Computer Science & AI</option>
              <option value="med">Medicine & Biomedical</option>
              <option value="eng">Engineering</option>
            </select>
          </div>

          {/* Venue input */}
          <input
            type="text"
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            placeholder="Filter by venue (e.g. TMI, CVPR)"
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-300 placeholder:text-slate-600 focus:outline-hidden focus:border-sky-500"
          />

          {/* Open Access Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto text-slate-400 hover:text-slate-300">
            <input
              type="checkbox"
              checked={openAccessOnly}
              onChange={(e) => setOpenAccessOnly(e.target.checked)}
              className="rounded-sm bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
            />
            <span>Open Access Only</span>
          </label>
        </div>
      </div>

      {/* Demo Data Disclaimer Banner (Mandatory if demo fallback is active) */}
      {isDemo && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-200 text-[10px] uppercase">
              Demo Data
            </span>
            <span>
              Live external academic provider connection is offline or rate-limited. Results shown are strictly labeled test literature.
            </span>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <strong className="text-slate-200">{results.length}</strong> papers for query: <em className="text-sky-300">"{query}"</em>
        </div>
        <button
          onClick={() => {
            if (results.length > 0) handleReadPaper(results[0]);
          }}
          className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Research AI about these results</span>
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((paper, idx) => {
          const itemKey = paper.doi || paper.title || String(idx);
          const isSaving = savingIds[itemKey];
          const isSaved = savedIds[itemKey];

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/90 hover:border-slate-700 transition-all shadow-md space-y-3.5"
            >
              {/* Top row: Title + Actions */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      onClick={() => handleReadPaper(paper)}
                      className="text-base font-semibold text-slate-100 hover:text-sky-400 cursor-pointer transition-colors"
                    >
                      {paper.title}
                    </h3>
                    {paper.isDemo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Demo
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    {paper.authors?.slice(0, 5).join(', ')}
                    {paper.authors?.length > 5 ? ' et al.' : ''}
                  </p>
                </div>

                {/* Primary Paper Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReadPaper(paper)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read</span>
                  </button>

                  <button
                    onClick={() => handleReadPaper(paper)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ask AI</span>
                  </button>

                  <button
                    disabled={isSaving || isSaved}
                    onClick={() => handleSaveToLibrary(paper, idx)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      isSaved
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setActiveProjectPaper({
                        id: paper.id || paper.doi || `paper-${idx}`,
                        title: paper.title,
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Add to Project"
                  >
                    <FolderPlus className="w-4 h-4 text-sky-400" />
                  </button>
                </div>
              </div>

              {/* Metadata tags */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="font-medium text-slate-300">{paper.venue}</span>
                <span>•</span>
                <span>{paper.year || 'N/A'}</span>
                {paper.doi && (
                  <>
                    <span>•</span>
                    <a
                      href={paper.externalUrl || `https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>DOI: {paper.doi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
                {paper.citationCount !== undefined && (
                  <>
                    <span>•</span>
                    <span>{paper.citationCount.toLocaleString()} Citations</span>
                  </>
                )}
              </div>

              {/* Abstract excerpt */}
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                {paper.abstract}
              </p>

              {/* Methodology & Dataset badges if available */}
              {(paper.methodology || paper.datasets?.length) && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  {paper.methodology && (
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      Method: {paper.methodology}
                    </span>
                  )}
                  {paper.datasets?.map((ds, dIdx) => (
                    <span
                      key={dIdx}
                      className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      Dataset: {ds}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Project Attachment Modal */}
      {activeProjectPaper && (
        <AddToProjectModal
          isOpen={Boolean(activeProjectPaper)}
          paperId={activeProjectPaper.id}
          paperTitle={activeProjectPaper.title}
          onClose={() => setActiveProjectPaper(null)}
        />
      )}

      {/* Paper Reader Modal */}
      {readingPaper && (
        <PaperReaderModal
          isOpen={Boolean(readingPaper)}
          paper={readingPaper}
          onClose={() => setReadingPaper(null)}
          onAddToProject={(p) =>
            setActiveProjectPaper({ id: p.id || (p as any)._id, title: p.title })
          }
        />
      )}
    </div>
  );
}
