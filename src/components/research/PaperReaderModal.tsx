import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  ExternalLink,
  Bookmark,
  FolderPlus,
  Send,
  CheckCircle2,
  FileText,
  AlertCircle,
  Quote,
} from 'lucide-react';
import { ResearchPaper, ResearchAIResponse } from '../../types/research';
import { researchService } from '../../services/researchService';
import CitePaperModal from './CitePaperModal';

interface PaperReaderModalProps {
  paper: ResearchPaper | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToProject?: (paper: ResearchPaper) => void;
  onToggleStar?: (paperId: string) => void;
  onCreateNote?: (paper: ResearchPaper) => void;
}

export const PaperReaderModal: React.FC<PaperReaderModalProps> = ({
  paper,
  isOpen,
  onClose,
  onAddToProject,
  onToggleStar,
  onCreateNote,
}) => {

  const [activeTab, setActiveTab] = useState<'overview' | 'extracted_text'>('overview');
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<ResearchAIResponse | null>(null);
  const [isCiteModalOpen, setIsCiteModalOpen] = useState(false);

  if (!isOpen || !paper) return null;

  const handleAskAI = async (queryText: string) => {
    const query = queryText.trim();
    if (!query) return;

    setAiLoading(true);
    setAiQuery(query);

    try {
      const response = await researchService.queryResearchAI({
        query,
        contextType: 'paper',
        paperIds: [paper.id || (paper as any)._id],
      });
      setAiResponse(response);
    } catch (err) {
      console.warn('Paper AI query error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const quickQuestions = [
    'What is the main contribution?',
    'What methodology did they use?',
    'What dataset was used for evaluation?',
    'What are the primary limitations reported?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0c1424] border border-slate-800 rounded-2xl w-full max-w-5xl h-[92vh] max-h-[900px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  Research Paper Reader
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {paper.sourceProvider || 'Academic Literature'}
                </span>
                {paper.isDemo && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Demo Data
                  </span>
                )}
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-100 line-clamp-1 mt-0.5">
                {paper.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleStar && (
              <button
                onClick={() => onToggleStar(paper.id || (paper as any)._id)}
                className={`p-2 rounded-lg border transition-colors ${
                  paper.isStarred || paper.isBookmarked
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Star / Bookmark Paper"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            )}

            {onAddToProject && (
              <button
                onClick={() => onAddToProject(paper)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Add to Project</span>
              </button>
            )}

            {onCreateNote && (
              <button
                onClick={() => onCreateNote(paper)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 rounded-lg transition-colors"
                title="Create Research Note on this paper"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Add Note</span>
              </button>
            )}


            {paper.doi && (
              <a
                href={paper.externalUrl || `https://doi.org/${paper.doi}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-xs font-medium text-sky-300 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>DOI</span>
              </a>
            )}

            <button
              onClick={() => setIsCiteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-medium text-emerald-300 rounded-lg transition-colors cursor-pointer"
              title="Cite Paper (APA, IEEE, MLA, BibTeX, RIS)"
            >
              <Quote className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cite</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Workspace Split-Screen: Left Document Content / Right Research AI */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Pane: Paper Metadata & Text Content */}
          <div className="w-full md:w-7/12 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto p-6 space-y-6">
            {/* Meta details bar */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
              <div className="text-xs text-slate-400">
                <strong className="text-slate-300 font-medium">Authors:</strong>{' '}
                {paper.authors?.join(', ') || 'Unknown Authors'}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>
                  <strong className="text-slate-300 font-medium">Venue:</strong> {paper.venue || 'N/A'}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-300 font-medium">Year:</strong> {paper.year}
                </span>
                {paper.citationCount !== undefined && (
                  <>
                    <span>•</span>
                    <span>
                      <strong className="text-slate-300 font-medium">Citations:</strong>{' '}
                      {paper.citationCount.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Content Tabs (Overview vs Extracted Text if available) */}
            <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Abstract & Methodology
              </button>
              {paper.extractedText && (
                <button
                  onClick={() => setActiveTab('extracted_text')}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    activeTab === 'extracted_text'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Full Extracted Text ({Math.round(paper.extractedText.length / 1000)}k chars)
                </button>
              )}
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Abstract Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    Abstract
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-300 text-justify bg-slate-900/30 p-4 rounded-xl border border-slate-800/60">
                    {paper.abstract || 'No abstract text available for this paper.'}
                  </p>
                </div>

                {/* Structured Research Attributes */}
                <div className="grid grid-cols-1 gap-3 text-xs">
                  {paper.methodology && (
                    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                      <div className="font-semibold text-slate-200 mb-1 text-[11px] uppercase tracking-wider text-sky-400">
                        Methodology Architecture
                      </div>
                      <p className="text-slate-300 leading-normal">{paper.methodology}</p>
                    </div>
                  )}

                  {(paper.dataset || paper.datasets?.length) && (
                    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                      <div className="font-semibold text-slate-200 mb-1 text-[11px] uppercase tracking-wider text-emerald-400">
                        Primary Datasets
                      </div>
                      <p className="text-slate-300 leading-normal">
                        {paper.datasets?.join(', ') || paper.dataset}
                      </p>
                    </div>
                  )}

                  {paper.limitations && (
                    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                      <div className="font-semibold text-slate-200 mb-1 text-[11px] uppercase tracking-wider text-amber-400">
                        Identified Limitations
                      </div>
                      <p className="text-slate-300 leading-normal">{paper.limitations}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {paper.extractedText}
              </div>
            )}
          </div>

          {/* Right Pane: Contextual Research AI Copilot */}
          <div className="w-full md:w-5/12 flex flex-col bg-slate-900/40 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Research AI • Grounded Paper Q&A
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                Paper Scoped
              </span>
            </div>

            {/* Quick Questions Chips */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/20">
              <div className="text-[11px] font-medium text-slate-400 mb-2">Suggested Inquiries:</div>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    disabled={aiLoading}
                    onClick={() => handleAskAI(q)}
                    className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-sky-500/10 hover:border-sky-500/40 border border-slate-700/60 text-slate-300 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response Display Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {aiLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                  <p className="text-xs text-slate-400">
                    Grounding inquiry against paper abstract and extracted literature...
                  </p>
                </div>
              ) : aiResponse ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Scope badge */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{aiResponse.contextScope}</span>
                    {aiResponse.sourceSupported ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Source-Supported
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertCircle className="w-3 h-3" /> General Synthesis
                      </span>
                    )}
                  </div>

                  {/* Main AI Reply */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs leading-relaxed text-slate-200 space-y-2 whitespace-pre-wrap">
                    {aiResponse.reply}
                  </div>

                  {/* Grounded Evidence Excerpts */}
                  {aiResponse.groundedEvidence?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Source Excerpts & Citations:
                      </div>
                      {aiResponse.groundedEvidence.map((ev, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300"
                        >
                          <div className="font-medium text-sky-400 mb-1">
                            📄 {ev.paperTitle} {ev.section ? `• ${ev.section}` : ''}
                          </div>
                          <div className="italic text-slate-400 text-[11px]">"{ev.excerpt}"</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-600 mb-1" />
                  <p className="text-xs font-medium text-slate-300">
                    Ask questions grounded in this paper
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    EduPye Research AI examines the paper's methodology, benchmarks, and limitations to
                    provide verifiable, citation-backed answers.
                  </p>
                </div>
              )}
            </div>

            {/* Custom Question Input Bar */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-900/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAI(aiQuery);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask Research AI about this paper..."
                  className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Cite Paper Modal */}
      <CitePaperModal
        isOpen={isCiteModalOpen}
        onClose={() => setIsCiteModalOpen(false)}
        paper={paper}
      />
    </div>
  );
};
