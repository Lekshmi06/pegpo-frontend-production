import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Quote,
  Search,
  Download,
  Copy,
  Check,
  FolderKanban,
  Library,
  ExternalLink,
  BookOpen,
  Filter,
  ArrowUpDown,
  Sparkles,
  FileText,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { researchService } from '../../services/researchService';
import { ResearchPaper } from '../../types/research';
import { useResearchActiveProject } from '../../context/ResearchActiveProjectContext';
import {
  CitationStyle,
  formatCitation,
  formatBibliography,
  downloadFile,
  CitationPaperInput,
} from '../../utils/citationUtils';
import CitePaperModal from '../../components/research/CitePaperModal';

const STYLES: Array<{ id: CitationStyle; label: string; desc: string }> = [
  { id: 'APA', label: 'APA 7th', desc: 'Author-date format for psychology, sciences, social science' },
  { id: 'IEEE', label: 'IEEE', desc: 'Numeric bracketed format for engineering, CS, technical papers' },
  { id: 'MLA', label: 'MLA 9th', desc: 'Author-page format for humanities, arts, and literature' },
  { id: 'Harvard', label: 'Harvard', desc: 'Author-date standard widely used in UK and international universities' },
  { id: 'Chicago', label: 'Chicago', desc: 'Author-date system for scientific and academic publishing' },
  { id: 'BibTeX', label: 'BibTeX (.bib)', desc: 'Standard bibliographic database format for LaTeX documents' },
  { id: 'RIS', label: 'RIS (.ris)', desc: 'Interchange format for Zotero, Mendeley, and EndNote' },
];

export default function Citations() {
  const navigate = useNavigate();
  const { activeProject, activeProjectId, allProjects, setActiveProjectId } = useResearchActiveProject();

  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('APA');
  const [scope, setScope] = useState<'project' | 'library'>('project');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'author' | 'year' | 'title'>('author');

  // Copy feedback states
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedItemKey, setCopiedItemKey] = useState<string | null>(null);

  // Single paper Cite Modal
  const [activeModalPaper, setActiveModalPaper] = useState<CitationPaperInput | null>(null);

  // Fetch papers based on scope and active project
  const loadPapers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (scope === 'project' && activeProjectId) {
        // Fetch project-specific papers
        const projectPapers = await researchService.getLibraryPapers({
          projectId: activeProjectId,
        });
        setPapers(projectPapers);
      } else {
        // Fetch all library papers
        const allLibrary = await researchService.getLibraryPapers();
        setPapers(allLibrary);
      }
    } catch (err: any) {
      console.error('Failed to load papers for citations:', err);
      setError(err?.message || 'Failed to load papers from research database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, [scope, activeProjectId]);

  // Filtered & Sorted Papers
  const filteredPapers = useMemo(() => {
    let result = [...papers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.authors?.some((a) => a.toLowerCase().includes(q)) ||
          p.venue?.toLowerCase().includes(q) ||
          p.year?.toString().includes(q) ||
          p.doi?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'author') {
      result.sort((a, b) => {
        const aAuth = (a.authors?.[0] || '').toLowerCase();
        const bAuth = (b.authors?.[0] || '').toLowerCase();
        return aAuth.localeCompare(bAuth);
      });
    } else if (sortBy === 'year') {
      result.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [papers, searchQuery, sortBy]);

  // Copy Entire Bibliography
  const handleCopyBibliography = async () => {
    if (filteredPapers.length === 0) return;
    const text = formatBibliography(filteredPapers, selectedStyle);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy bibliography', err);
    }
  };

  // Download Batch BibTeX (.bib)
  const handleDownloadBibTeX = () => {
    if (filteredPapers.length === 0) return;
    const bibContent = formatBibliography(filteredPapers, 'BibTeX');
    const filename = `${activeProject?.title ? activeProject.title.replace(/[^a-z0-9]/gi, '_') : 'research'}_citations.bib`;
    downloadFile(bibContent, filename, 'application/x-bibtex');
  };

  // Download Batch RIS (.ris) for Zotero/EndNote
  const handleDownloadRIS = () => {
    if (filteredPapers.length === 0) return;
    const risContent = formatBibliography(filteredPapers, 'RIS');
    const filename = `${activeProject?.title ? activeProject.title.replace(/[^a-z0-9]/gi, '_') : 'research'}_citations.ris`;
    downloadFile(risContent, filename, 'application/x-research-info-systems');
  };

  // Copy Single Reference
  const handleCopySingle = async (paper: ResearchPaper, key: string) => {
    const formatted = formatCitation(paper);
    let textToCopy = formatted.apa;
    if (selectedStyle === 'IEEE') textToCopy = formatted.ieee;
    else if (selectedStyle === 'MLA') textToCopy = formatted.mla;
    else if (selectedStyle === 'Harvard') textToCopy = formatted.harvard;
    else if (selectedStyle === 'Chicago') textToCopy = formatted.chicago;
    else if (selectedStyle === 'BibTeX') textToCopy = formatted.bibtex;
    else if (selectedStyle === 'RIS') textToCopy = formatted.ris;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedItemKey(key);
      setTimeout(() => setCopiedItemKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy citation', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#0091ff] text-white flex items-center justify-center shadow-xs">
              <Quote className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Citation & Bibliography Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Format, verify, and batch-export publication-grade references across APA, IEEE, MLA, Harvard, Chicago, BibTeX, and RIS.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyBibliography}
            disabled={filteredPapers.length === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer ${
              copiedAll
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0091ff] hover:bg-[#007cdb] text-white'
            }`}
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4" />
                <span>Bibliography Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Full Bibliography ({selectedStyle})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadBibTeX}
            disabled={filteredPapers.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 bg-white text-xs font-bold text-slate-700 transition-colors shadow-2xs disabled:opacity-40 cursor-pointer"
            title="Download .bib file for LaTeX"
          >
            <Download className="w-4 h-4 text-[#0091ff]" />
            <span>.bib</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadRIS}
            disabled={filteredPapers.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 bg-white text-xs font-bold text-slate-700 transition-colors shadow-2xs disabled:opacity-40 cursor-pointer"
            title="Download .ris file for Zotero / Mendeley"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>.ris</span>
          </button>
        </div>
      </div>

      {/* Scope & Active Project Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Scope Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Scope:</span>
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setScope('project')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scope === 'project'
                  ? 'bg-white text-[#006bbd] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#0091ff]" />
              <span>Active Project</span>
            </button>
            <button
              onClick={() => setScope('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scope === 'library'
                  ? 'bg-white text-[#006bbd] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Library className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Library</span>
            </button>
          </div>
        </div>

        {/* Active Project Information */}
        {scope === 'project' && activeProject && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 truncate">
            <span className="text-slate-400">Project Context:</span>
            <strong className="text-slate-800 truncate">{activeProject.title}</strong>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#006bbd] font-bold text-[10px] shrink-0 border border-blue-200/60">
              {papers.length} citations
            </span>
          </div>
        )}

        {/* Link to Writing Workspace */}
        <Link
          to="/research/write"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0091ff] hover:text-[#007cdb] shrink-0"
        >
          <span>Use in Manuscript Writing</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Citation Style Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Selected Citation Standard
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Instant live re-formatting across entire bibliography
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                selectedStyle === style.id
                  ? 'bg-blue-50/80 border-[#0091ff] text-[#006bbd] shadow-xs ring-1 ring-[#0091ff]/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">{style.label}</span>
                {selectedStyle === style.id && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0091ff]" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                {style.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, venue, year, or DOI..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0091ff] transition-all"
          />
        </div>

        {/* Sort and Count */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#0091ff] cursor-pointer"
            >
              <option value="author">Author (A-Z)</option>
              <option value="year">Year (Newest First)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {filteredPapers.length} references
          </span>
        </div>
      </div>

      {/* Paper References List */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
          <div className="w-6 h-6 border-2 border-[#0091ff] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">
            Loading bibliographic references from research database...
          </p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
          <Quote className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No References Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No citations match query "${searchQuery}". Try a different search.`
              : scope === 'project'
              ? 'This project does not have literature attached yet. Attach papers from the Discover search or Research Library.'
              : 'Your Research Library does not have saved papers yet.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/research/discover"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0091ff] text-white text-xs font-bold hover:bg-[#007cdb] transition-all shadow-xs"
            >
              <span>Discover Literature</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/research/library"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
            >
              <span>Open Library</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPapers.map((paper, idx) => {
            const formatted = formatCitation(paper, idx + 1);
            let displayCitation = formatted.apa;
            if (selectedStyle === 'IEEE') displayCitation = formatted.ieee;
            else if (selectedStyle === 'MLA') displayCitation = formatted.mla;
            else if (selectedStyle === 'Harvard') displayCitation = formatted.harvard;
            else if (selectedStyle === 'Chicago') displayCitation = formatted.chicago;
            else if (selectedStyle === 'BibTeX') displayCitation = formatted.bibtex;
            else if (selectedStyle === 'RIS') displayCitation = formatted.ris;

            const isCopied = copiedItemKey === `item_${idx}`;

            return (
              <div
                key={paper.id || (paper as any)._id || idx}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3"
              >
                {/* Top Reference Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                        REF #{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#006bbd] font-mono">
                        {formatted.citationKey}
                      </span>
                      {paper.doi && (
                        <a
                          href={`https://doi.org/${paper.doi.replace(/^https?:\/\/doi\.org\//i, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-semibold text-[#0091ff] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>DOI</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    {/* Primary Formatted Citation */}
                    <div
                      className={`text-xs leading-relaxed ${
                        selectedStyle === 'BibTeX' || selectedStyle === 'RIS'
                          ? 'p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap'
                          : 'text-slate-800 font-serif'
                      }`}
                    >
                      {displayCitation}
                    </div>
                  </div>

                  {/* Action Buttons for this reference */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopySingle(paper, `item_${idx}`)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title="Copy reference entry"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalPaper(paper)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0091ff]/10 hover:bg-[#0091ff]/20 text-[#006bbd] text-xs font-bold transition-colors cursor-pointer border border-[#0091ff]/20"
                      title="Inspect all citation formats & in-text keys"
                    >
                      <Quote className="w-3.5 h-3.5" />
                      <span>Cite Details</span>
                    </button>
                  </div>
                </div>

                {/* In-Text Quick Copy Chips */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    In-Text:
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formatted.inTextNarrative);
                      setCopiedItemKey(`narrative_${idx}`);
                      setTimeout(() => setCopiedItemKey(null), 1500);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-600 hover:text-slate-900 font-serif cursor-pointer transition-colors"
                    title="Click to copy narrative citation"
                  >
                    {copiedItemKey === `narrative_${idx}` ? '✓ Copied!' : formatted.inTextNarrative}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formatted.inTextParenthetical);
                      setCopiedItemKey(`paren_${idx}`);
                      setTimeout(() => setCopiedItemKey(null), 1500);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-600 hover:text-slate-900 font-serif cursor-pointer transition-colors"
                    title="Click to copy parenthetical citation"
                  >
                    {copiedItemKey === `paren_${idx}` ? '✓ Copied!' : formatted.inTextParenthetical}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(formatted.latexCite);
                      setCopiedItemKey(`latex_${idx}`);
                      setTimeout(() => setCopiedItemKey(null), 1500);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-blue-50/70 hover:bg-blue-100 border border-blue-200/70 text-[#006bbd] font-mono text-[10px] cursor-pointer transition-colors"
                    title="Click to copy LaTeX cite command"
                  >
                    {copiedItemKey === `latex_${idx}` ? '✓ Copied!' : formatted.latexCite}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cite Paper Modal */}
      <CitePaperModal
        isOpen={Boolean(activeModalPaper)}
        onClose={() => setActiveModalPaper(null)}
        paper={activeModalPaper}
      />
    </div>
  );
}
