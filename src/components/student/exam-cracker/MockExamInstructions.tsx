import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { MockExamItem } from '../../../types/testTypes';
import { Button } from '../../ui/Button';

interface MockExamInstructionsProps {
  exam: MockExamItem;
  onBack: () => void;
  onStartExam: () => void;
}

export const MockExamInstructions: React.FC<MockExamInstructionsProps> = ({
  exam,
  onBack,
  onStartExam,
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi'>('English');

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0091ff] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exam Cracker
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>Choose Default Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
          </select>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase">
              {exam.category}
            </span>
            <h1 className="text-2xl font-extrabold text-[#111827]">
              {exam.title}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {exam.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-center">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Duration</div>
              <div className="text-[#111827] text-sm font-extrabold">{exam.durationMinutes} mins</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-center">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Total Marks</div>
              <div className="text-[#111827] text-sm font-extrabold">{exam.totalMarks} Marks</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-center">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Questions</div>
              <div className="text-[#111827] text-sm font-extrabold">{exam.totalQuestions} Qs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections Breakdown */}
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0091ff]" />
          Sectional Structure & Marking Scheme
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-2.5">Section Name</th>
                <th className="py-2.5">Questions</th>
                <th className="py-2.5">Marks / Q</th>
                <th className="py-2.5">Negative Marking</th>
                <th className="py-2.5">Total Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {exam.sections.map((sec) => (
                <tr key={sec.id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-[#111827]">{sec.name}</td>
                  <td className="py-3">{sec.totalQuestions}</td>
                  <td className="py-3 text-emerald-600 font-bold">+{sec.marksPerQuestion}</td>
                  <td className="py-3 text-rose-500 font-bold">
                    {sec.negativeMarks > 0 ? `-${sec.negativeMarks}` : '0 (No Negative)'}
                  </td>
                  <td className="py-3 font-bold">{sec.totalQuestions * sec.marksPerQuestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CBT Palette Legend */}
      <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Computer Based Test (CBT) Question Palette Symbols
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              1
            </span>
            <span className="font-semibold text-slate-700">You have answered the question</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              2
            </span>
            <span className="font-semibold text-slate-700">You have not answered the question</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              3
            </span>
            <span className="font-semibold text-slate-700">Marked for Review (Unanswered)</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs relative shrink-0">
              4
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
            </span>
            <span className="font-semibold text-slate-700">Answered & Marked for Review</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
              5
            </span>
            <span className="font-semibold text-slate-700">You have not visited the question yet</span>
          </div>
        </div>
      </div>

      {/* Mandatory Declaration */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
            className="mt-1 rounded text-[#0091ff] focus:ring-[#0091ff] cursor-pointer"
          />
          <span className="text-xs text-slate-700 font-medium leading-relaxed">
            I have read and understood all the instructions given above. I agree that in case of any unauthorized activity or tab switching, the test may be automatically submitted. I am ready to begin this examination.
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!hasAgreed}
            onClick={onStartExam}
            className={`px-8 py-2.5 text-xs font-bold ${
              hasAgreed
                ? 'bg-[#0091ff] hover:bg-[#007cdb] text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            I am Ready to Begin &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
};
