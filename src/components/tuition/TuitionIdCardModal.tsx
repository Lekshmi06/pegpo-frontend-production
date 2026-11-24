import React, { useEffect } from 'react';
import { X, Sparkles, ShieldCheck, Download } from 'lucide-react';
import { TuitionIdCard, TuitionIdCardData } from './TuitionIdCard';

export interface TuitionIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Partial<TuitionIdCardData> | any | null;
}

export const TuitionIdCardModal: React.FC<TuitionIdCardModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Top Bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                Official Tuition ID Card
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Download your official credential pass for verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Render ID Card with One-Click Download */}
        <TuitionIdCard user={user} showDownloadBtn={true} />

        {/* Footer info note */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>High-resolution 300 DPI PNG export &bull; Instant offline download</span>
          </p>
        </div>
      </div>
    </div>
  );
};
export default TuitionIdCardModal;
