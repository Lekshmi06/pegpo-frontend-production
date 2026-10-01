import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Check, Sparkles, Plus } from 'lucide-react';
import { researchService } from '../../services/researchService';
import { ResearchProjectSummary } from '../../types/research';

interface AddToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string;
  paperTitle: string;
  onSuccess?: () => void;
}

export const AddToProjectModal: React.FC<AddToProjectModalProps> = ({
  isOpen,
  onClose,
  paperId,
  paperTitle,
  onSuccess,
}) => {
  const [projects, setProjects] = useState<ResearchProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      researchService.listProjects().then((list) => {
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id || (list[0] as any)._id);
        } else {
          setIsCreatingNew(true);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAttach = async () => {
    setLoading(true);
    setError(null);

    try {
      let targetProjectId = selectedProjectId;

      if (isCreatingNew) {
        if (!newTitle.trim()) {
          setError('Please provide a title for the new research project.');
          setLoading(false);
          return;
        }

        const created = await researchService.createProject({
          title: newTitle.trim(),
          researchQuestion: newQuestion.trim(),
        });
        targetProjectId = created.id || (created as any)._id;
      }

      if (!targetProjectId) {
        setError('Please select or create a project.');
        setLoading(false);
        return;
      }

      await researchService.addPaperToProject(paperId, targetProjectId);
      setSuccessMsg('Paper successfully attached to project!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to attach paper to project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Add Paper to Research Project</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{paperTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          {/* Toggle between existing and new project */}
          <div className="flex rounded-lg bg-slate-800/80 p-1 border border-slate-700/50">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                !isCreatingNew
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Select Existing Project
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isCreatingNew
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create New Project
            </button>
          </div>

          {!isCreatingNew ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Active Research Projects ({projects.length})
              </label>
              {projects.length === 0 ? (
                <div className="p-4 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl text-center">
                  <p className="text-xs text-slate-400 mb-2">No active projects yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create your first research project
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {projects.map((proj) => {
                    const id = proj.id || (proj as any)._id;
                    const isSelected = selectedProjectId === id;
                    return (
                      <div
                        key={id}
                        onClick={() => setSelectedProjectId(id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-500/10 border-sky-500/50 ring-1 ring-sky-500/30'
                            : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-200">{proj.title}</span>
                          {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-400">{proj.domain}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {proj.currentStage}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AI-Based Medical Image Segmentation"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Central Research Question (Optional)
                </label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. How to mitigate boundary degradation on 3D volumetric CT?"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || (!isCreatingNew && !selectedProjectId)}
            onClick={handleAttach}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            {loading ? (
              'Attaching...'
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Attach to Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
