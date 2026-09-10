import React, { useState } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { HomeworkTask } from '../../../types/testTypes';
import { Button } from '../../ui/Button';
import { useToast } from '../../../hooks/useToast';

interface HomeworkViewProps {
  tasks: HomeworkTask[];
  selectedSubject: string;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  tasks,
  selectedSubject,
}) => {
  const toast = useToast();
  const filteredTasks =
    selectedSubject === 'All'
      ? tasks
      : tasks.filter((t) => t.subject.toLowerCase() === selectedSubject.toLowerCase());

  const [activeTask, setActiveTask] = useState<HomeworkTask | null>(null);
  const [taskAnswers, setTaskAnswers] = useState<Record<string, string>>({});

  const handleSubmitTask = (taskId: string) => {
    toast.success('Homework submitted to teacher successfully! 📤');
    setActiveTask(null);
  };

  if (activeTask) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTask(null)}
            className="text-xs font-bold text-[#0d9488] hover:underline cursor-pointer"
          >
            &larr; Back to Homework List
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Due: {activeTask.dueDate}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-[#e2ebf4] p-6 sm:p-8 shadow-2xs space-y-6">
          <div>
            <span className="px-2.5 py-1 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase">
              {activeTask.subject} • Assigned by {activeTask.assignedBy}
            </span>
            <h2 className="text-xl font-extrabold text-[#111827] mt-2">
              {activeTask.title}
            </h2>
          </div>

          {activeTask.feedback && (
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 text-xs space-y-1">
              <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Teacher Evaluation ({activeTask.grade}):</span>
              </div>
              <p className="text-slate-700 font-medium">{activeTask.feedback}</p>
            </div>
          )}

          <div className="space-y-6 pt-2">
            {activeTask.questions.map((q, idx) => (
              <div key={q.id} className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="text-sm font-bold text-[#111827]">
                  Question {idx + 1}: {q.text}
                </h4>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isSelected = taskAnswers[q.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() =>
                          setTaskAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                        }
                        className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-teal-50 border-[#0d9488] text-[#0d9488] font-bold shadow-2xs'
                            : 'bg-[#f8fafc] border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                            isSelected ? 'bg-[#0d9488] text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveTask(null)}>
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmitTask(activeTask.id)}
              className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold"
            >
              Submit Homework
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const isPending = task.status === 'Pending';
          const isReviewed = task.status === 'Reviewed';

          return (
            <div
              key={task.id}
              onClick={() => setActiveTask(task)}
              className="bg-white rounded-3xl border border-[#e2ebf4] p-6 shadow-2xs hover:shadow-md hover:border-[#0d9488]/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#d6e8f6] text-[#1c3352] text-[10px] font-extrabold uppercase">
                    {task.subject}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      isReviewed
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPending
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.grade && (
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Grade: {task.grade}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-[#111827] group-hover:text-[#0d9488] transition-colors">
                  {task.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Assigned by {task.assignedBy} • Due: {task.dueDate}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-[#0d9488] group-hover:translate-x-1 transition-transform">
                  {isReviewed ? 'View Graded Paper &rarr;' : 'Open Homework &rarr;'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
