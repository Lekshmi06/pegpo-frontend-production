import React, { useState, useEffect } from 'react';
import {
  NotebookPen,
  Sparkles,
  Copy,
  Check,
  Save,
  RotateCcw,
  Edit3,
  Eye,
} from 'lucide-react';
import { SourceItem } from '../../../types/source';
import { sourceService } from '../../../services/sourceService';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../../components/ui/Loader';
import { Button } from '../../../components/ui/Button';

interface SourceNotesViewProps {
  source: SourceItem;
}

export const SourceNotesView: React.FC<SourceNotesViewProps> = ({ source }) => {
  const toast = useToast();
  const [notes, setNotes] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchNotes = async (forceRegenerate = false) => {
    setIsLoading(true);
    try {
      const res = await sourceService.triggerAIAction(source._id, 'notes', { forceRegenerate });
      if (typeof res.data === 'string') {
        setNotes(res.data);
      } else {
        toast.error('Could not generate notes.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate notes';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(false);
  }, [source._id]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await sourceService.saveSourceNotes(source._id, notes);
      toast.success('Notes saved successfully!');
      setIsEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save notes';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    toast.success('Notes copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-12 shadow-xs min-h-[460px] flex flex-col items-center justify-center space-y-3">
        <Loader size="lg" />
        <h4 className="text-sm font-extrabold text-[#111827]">Generating High-Yield Revision Notes...</h4>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Synthesizing formulas, core principles, and study checklists from "{source.originalName}".
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-xs min-h-[520px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <NotebookPen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
              <span>Study Notes & Cheat Sheet</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-700">
                Exam Ready
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Structured markdown notes formatted for rapid retention</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            title={isEditing ? 'Preview Mode' : 'Edit Mode'}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Preview' : 'Edit'}</span>
          </button>

          <button
            onClick={copyNotes}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Copy Notes"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => fetchNotes(true)}
            className="text-[11px] font-bold text-slate-500 hover:text-[#0091ff] transition-colors flex items-center gap-1 cursor-pointer pl-1"
            title="Regenerate Notes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="py-4 flex-1">
        {isEditing ? (
          <textarea
            rows={14}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-full min-h-[340px] p-4 bg-[#f8fbfe] border border-[#cbd5e1] rounded-2xl text-xs font-mono text-slate-800 outline-none focus:border-[#0091ff] leading-relaxed"
            placeholder="Type your notes here..."
          />
        ) : (
          <div className="bg-[#f8fbfe] border border-[#e2ebf4] rounded-2xl p-6 max-h-[380px] overflow-y-auto space-y-3 font-sans text-xs leading-relaxed text-slate-700 select-text">
            <div className="whitespace-pre-wrap font-medium">{notes}</div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {isEditing ? 'Editing mode: Save changes when finished' : 'Ready to save or export'}
        </span>

        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="py-2 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
