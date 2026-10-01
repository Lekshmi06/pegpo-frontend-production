import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResearchNoteType,
  HypothesisStatus,
  ResearchPaper,
} from '../../types/research';
import { researchService } from '../../services/researchService';

export interface SaveResearchNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (note: any) => void;
  projectId?: string;
  projectTitle?: string;
  availablePapers?: ResearchPaper[];
  initialValues?: {
    title?: string;
    content?: string;
    noteType?: ResearchNoteType;
    hypothesisStatus?: HypothesisStatus;
    paperId?: string;
    paperIds?: string[];
    excerpt?: string;
    sourceText?: string;
    aiGenerated?: boolean;
    aiAssisted?: boolean;
    tags?: string[];
  };
  initialTitle?: string;
  initialContent?: string;
  initialType?: ResearchNoteType;
  initialHypothesisStatus?: HypothesisStatus;
  initialPaperIds?: string[];
  initialSourceText?: string;
}

const NOTE_TYPE_OPTIONS: Array<{
  value: ResearchNoteType;
  label: string;
  desc: string;
  icon: any;
  color: string;
}> = [
  { value: 'hypothesis', label: 'Hypothesis', desc: 'Testable empirical proposition', icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { value: 'finding', label: 'Finding', desc: 'Empirical result or literature takeaway', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
  { value: 'methodology', label: 'Methodology', desc: 'Protocol, architecture, or benchmark details', icon: Layers, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
  { value: 'critique', label: 'Critique', desc: 'Identified limitation, threat, or flaw', icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
  { value: 'observation', label: 'Observation', desc: 'Noteworthy pattern or empirical anomaly', icon: Info, color: 'text-sky-500 bg-sky-500/10 border-sky-500/30' },
  { value: 'idea', label: 'Idea', desc: 'Preliminary research concept or exploration', icon: Sparkles, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' },
  { value: 'limitation', label: 'Limitation', desc: 'Documented study boundary or constraint', icon: AlertTriangle, color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
  { value: 'quote', label: 'Direct Quote', desc: 'Exact excerpt from academic publication', icon: Bookmark, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
  { value: 'general', label: 'General Note', desc: 'Working research note or discussion memo', icon: FileText, color: 'text-slate-500 bg-slate-500/10 border-slate-500/30' },
];

export const SaveResearchNoteModal: React.FC<SaveResearchNoteModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  projectId,
  projectTitle,
  availablePapers = [],
  initialValues,
  initialTitle,
  initialContent,
  initialType,
  initialHypothesisStatus,
  initialPaperIds,
  initialSourceText,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<ResearchNoteType>('general');
  const [hypothesisStatus, setHypothesisStatus] = useState<HypothesisStatus>('idea');
  const [paperId, setPaperId] = useState('');
  const [tagsInput, setTagsInput] = useState('ai-assisted, project-note');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const effTitle = initialTitle ?? initialValues?.title ?? '';
      const effContent = initialContent ?? initialValues?.content ?? '';
      const effType = initialType ?? initialValues?.noteType ?? 'general';
      const effHypStatus = initialHypothesisStatus ?? initialValues?.hypothesisStatus ?? 'idea';
      const effPaperId =
        initialValues?.paperId ??
        (initialPaperIds && initialPaperIds.length > 0 ? initialPaperIds[0] : '');

      setTitle(effTitle);
      setContent(effContent);
      setNoteType(effType);
      setHypothesisStatus(effHypStatus);
      setPaperId(effPaperId);
      setTagsInput(
        initialValues?.tags
          ? initialValues.tags.join(', ')
          : 'ai-assisted, project-note'
      );
      setError(null);
      setIsSubmitting(false);
    }
  }, [
    isOpen,
    initialValues,
    initialTitle,
    initialContent,
    initialType,
    initialHypothesisStatus,
    initialPaperIds,
    initialSourceText,
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Both title and content are required.');
      return;
    }
    if (!projectId) {
      setError('A valid research project must be selected.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const created = await researchService.createProjectNote(projectId, {
        title: title.trim(),
        content: content.trim(),
        noteType,
        hypothesisStatus: noteType === 'hypothesis' ? hypothesisStatus : undefined,
        paperId: paperId || undefined,
        paperIds: paperId ? [paperId] : undefined,
        aiGenerated: Boolean(initialValues?.aiGenerated),
        aiAssisted: Boolean(initialValues?.aiGenerated || initialValues?.aiAssisted),
        sourceText: initialValues?.sourceText || initialValues?.excerpt,
        excerpt: initialValues?.excerpt,
        tags,
      });

      if (onSaved) onSaved(created);
      onClose();
    } catch (err: any) {
      console.error('Failed to save research note:', err);
      setError(err?.message || 'Failed to save note to research project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Save as Project Note
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                {projectTitle ? `Project: ${projectTitle}` : 'Crystallize insight into research project'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {initialValues?.aiGenerated && (
            <div className="px-3.5 py-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-800 text-[11px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>
                <strong>AI-Assisted Insight</strong>: Review and refine the generated text below before crystallizing it as permanent research knowledge.
              </span>
            </div>
          )}

          {/* Note Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Knowledge Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {NOTE_TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = noteType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNoteType(opt.value)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-500'}`} />
                      <span className={`text-xs font-bold ${isSelected ? 'text-sky-900' : 'text-slate-700'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hypothesis Status Control (if noteType === 'hypothesis') */}
          {noteType === 'hypothesis' && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  Hypothesis Verification Status
                </span>
                <span className="text-[10px] font-semibold text-amber-700">
                  Researcher Controlled
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['idea', 'testing', 'supported', 'rejected'] as HypothesisStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setHypothesisStatus(st)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition-colors border ${
                      hypothesisStatus === st
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-amber-700 italic">
                * Note: AI suggests candidate hypotheses as "Idea". Only empirical experimentation can mark a hypothesis as "Supported".
              </p>
            </div>
          )}

          {/* Note Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Memory bottleneck in dense multi-head attention"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          {/* Note Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note Content / Synthesis
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your synthesized notes, arguments, or observations..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Reference Paper (Optional) */}
          {availablePapers.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Link to Source Paper (Optional)
              </label>
              <select
                value={paperId}
                onChange={(e) => setPaperId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">-- No specific paper linked --</option>
                {availablePapers.map((p) => (
                  <option key={p.id || (p as any)._id} value={p.id || (p as any)._id}>
                    {p.title} ({p.year || 'n.d.'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. transformers, segmentation, limitation"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Note...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Crystallize to Project Notes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveResearchNoteModal;
