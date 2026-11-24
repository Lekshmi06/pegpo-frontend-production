import React, { useState, useRef } from 'react';
import {
  X,
  ClipboardList,
  Upload,
  Calendar,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { tuitionService } from '../../services/tuitionService';

interface PostAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    type: 'assignment';
    title: string;
    subject?: string;
    topic?: string;
    instructions: string;
    dueDate?: string;
    totalMarks: number;
    referenceFileUrl?: string;
    referenceFileName?: string;
  }) => Promise<void>;
  initialSubject?: string;
}

export const PostAssignmentModal: React.FC<PostAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject = 'General',
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);

  // Reference file attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploadingFile(true);
    setErrorMsg(null);
    try {
      const res = await tuitionService.uploadTuitionMedia(file);
      if (res.success && res.url) {
        setUploadedFileUrl(res.url);
        setUploadedFileName(file.name);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to upload reference study PDF.');
      setSelectedFile(null);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter an assignment title.');
      return;
    }
    if (!instructions.trim()) {
      setErrorMsg('Please enter instructions for the assignment.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        type: 'assignment',
        title: title.trim(),
        subject: subject.trim(),
        topic: topic.trim(),
        instructions: instructions.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        totalMarks: Number(totalMarks) || 100,
        referenceFileUrl: uploadedFileUrl || undefined,
        referenceFileName: uploadedFileName || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to post assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Post Homework / Assignment Topic
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Students will upload PDF documents for review and grading
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4 Thermodynamics Practice Sheet"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Topic / Module
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Work Done &amp; Heat Transfer"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Total Points
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Instructions &amp; Prompts <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Outline homework questions, guidelines, and what students must submit in their PDF..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Due Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Reference Study PDF Attachment */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Attach Study Material / Question Paper (Optional PDF)</span>
              {uploadedFileUrl && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Uploaded
                </span>
              )}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf,.pdf"
              className="hidden"
            />

            {uploadedFileName ? (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{uploadedFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadedFileUrl(null);
                    setUploadedFileName(null);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold ml-2 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {isUploadingFile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Uploading PDF study material...</span>
                  </>
                ) : (
                  <>
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span>Click to attach Question Sheet / Reference PDF</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingFile}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostAssignmentModal;
