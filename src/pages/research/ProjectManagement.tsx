import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ProjectManagement() {
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Task name', status: 'Staus', type: 'Meeting', due: 'Staus', priority: 'Staus', assignee: 'K' },
    { id: 2, name: 'Task name', status: 'Staus', type: 'Meeting', due: 'Staus', priority: 'Staus', assignee: 'K' },
    { id: 3, name: 'Task name', status: 'Staus', type: 'Meeting', due: 'Staus', priority: 'Staus', assignee: 'K' },
  ]);

  const handleAddTask = () => {
    setTasks([...tasks, { id: Date.now(), name: 'Task name', status: 'Staus', type: 'Meeting', due: 'Staus', priority: 'Staus', assignee: 'K' }]);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-white">
      <div className="w-52 bg-white border-r border-[#e2edf7] flex flex-col flex-shrink-0">
        <div className="bg-[#1c3352] text-white px-4 py-3 flex justify-between items-center text-xs font-extrabold">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowSettings(false)}>
            <span className="text-[10px]">∨</span>
            <span>Projects</span>
          </div>
          <button onClick={handleAddTask} className="hover:text-sky-300 font-bold text-sm cursor-pointer">+</button>
        </div>

        <div>
          <button 
            onClick={() => setShowSettings(false)}
            className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${
              !showSettings ? 'bg-[#d0e3f7] text-[#1c3352]' : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            Project name
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-white">
        {showSettings ? (
          <div className="max-w-4xl space-y-8 bg-white min-h-screen">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Project settings</h1>
              <Button size="sm" variant="outline" onClick={() => setShowSettings(false)}>
                ← Back to Activity
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#e2edf7] rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead className="bg-white text-slate-700 font-bold border-b border-[#e2edf7] text-xs">
                  <tr>
                    <th className="p-4 pl-6 flex items-center gap-1.5 text-slate-900 font-extrabold">
                      <span>∨</span>
                      <span>Activity</span>
                    </th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Due date</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Assignee</th>
                    <th className="p-4 text-right pr-6">
                      <button 
                        onClick={() => setShowSettings(true)}
                        className="hover:text-slate-900 p-1 transition-colors text-base cursor-pointer"
                        title="Project Settings"
                      >
                        ⚙
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2edf7]">
                  {tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-500">{t.name}</td>
                      <td className="p-4 text-slate-400">{t.status}</td>
                      <td className="p-4 text-slate-500">{t.type}</td>
                      <td className="p-4 text-slate-400">{t.due}</td>
                      <td className="p-4 text-emerald-500 font-bold">{t.priority}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#3f88c5] text-white flex items-center justify-center text-[10px] font-bold">
                            {t.assignee}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <Button size="sm">
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div 
              onClick={handleAddTask}
              className="p-4 pl-6 border-t border-[#e2edf7] flex items-center gap-2 text-slate-500 hover:text-[#3f88c5] cursor-pointer text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create task</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
