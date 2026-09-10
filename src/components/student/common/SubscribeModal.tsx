import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useToast } from '../../../hooks/useToast';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  category?: string;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
  title = 'Unlock Premium Learning Suite',
  category = 'Mock Papers & Practice',
}) => {
  const toast = useToast();

  const handleUpgrade = () => {
    toast.success(`Subscription upgrade requested for ${category}! Your premium access will activate immediately.`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 text-center py-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500 shadow-2xs">
          <Sparkles className="w-7 h-7 stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#111827]">
            Unlock All {category} & Full Solutions
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            Get unlimited access to national-level CBT mock exams, full solution keys, step-by-step video solutions, and AI-powered performance analysis.
          </p>
        </div>

        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100+ Full-Length National CBT Mock Test Papers</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Instant step-by-step NCERT & exam verified solutions</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>AI-driven weak-topic diagnostics and predicted rank</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Includes Workbooks, Exercises, and Timed Drills</span>
          </div>
        </div>

        <div className="pt-1 space-y-2">
          <Button
            className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
            onClick={handleUpgrade}
          >
            <Zap className="w-4 h-4 fill-white" />
            Upgrade Plan • ₹299 / month
          </Button>

          <p className="text-[10px] text-slate-400 font-semibold">
            Cancel anytime • 7-day money-back guarantee
          </p>
        </div>
      </div>
    </Modal>
  );
};
