import React, { useState, FormEvent } from 'react';
import {
  Clock, Plus, CheckCircle2, Eye, Edit3
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function LessonPlanner() {
  const [plans, setPlans] = useState([
    { id: 1, title: 'Introduction to Derivatives & Limits', subject: 'Calculus', duration: '45 mins', objectives: 'Understand the concept of rates of change and graphical tangent lines.', lessons: 4, status: 'Approved' },
    { id: 2, title: 'Laws of Thermodynamics & Enthalpy', subject: 'Physics', duration: '60 mins', objectives: 'Identify heat flow directions, thermal equilibrium and enthalpy calculations.', lessons: 6, status: 'Draft' },
    { id: 3, title: 'Organic Carbon Compounds & Bonding', subject: 'Chemistry', duration: '50 mins', objectives: 'Define covalent bonding configurations in basic organic structures.', lessons: 3, status: 'Pending Review' }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newSub, setNewSub] = useState('Physics');
  const [newObj, setNewObj] = useState('');
  const [newDur, setNewDur] = useState('45 mins');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddPlan = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setPlans([...plans, {
      id: Date.now(),
      title: newTitle,
      subject: newSub,
      duration: newDur,
      objectives: newObj || 'Curriculum objectives mapping',
      lessons: 1,
      status: 'Draft'
    }]);
    setNewTitle('');
    setNewObj('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#0b2d5a]">Lesson Planner</h2>
          <p className="text-xs text-slate-500 mt-0.5">Design syllabus, chapter flows, and lecture slides.</p>
        </div>
        <Button size="sm" onClick={() => setIsCreating(!isCreating)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Lesson Plan
        </Button>
      </div>

      {isCreating && (
        <form onSubmit={handleAddPlan} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md space-y-4 max-w-xl mx-auto">
          <h3 className="text-xs font-bold text-[#0b2d5a] uppercase">New Syllabus Plan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 font-bold block mb-1">PLAN TITLE</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Wave Optics Introduction"
                className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0b2d5a]"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">SUBJECT</label>
              <select
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Calculus">Calculus</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">DURATION</label>
              <input
                type="text"
                value={newDur}
                onChange={(e) => setNewDur(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 font-bold block mb-1">LEARNING OBJECTIVES</label>
              <textarea
                value={newObj}
                onChange={(e) => setNewObj(e.target.value)}
                placeholder="e.g. Describe refraction and compute angles..."
                className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none h-16"
              />
            </div>
          </div>
          <Button type="submit" className="w-full py-2">
            Save Lesson Plan
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {plans.map((p) => (
            <div key={p.id} className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-[#0b2d5a] border border-[#e2ebf4] rounded uppercase">{p.subject}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                      p.status === 'Pending Review' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-50 text-slate-600'
                    }`}>{p.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 pt-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 leading-normal pt-1">
                    <span className="font-semibold text-slate-600">Objectives: </span>
                    {p.objectives}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#0b2d5a]">{p.lessons} Lessons</span>
                  <p className="text-[10px] text-slate-400 mt-1">{p.duration} per lesson</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                <button className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded text-[10px] font-bold">
                  <Eye className="w-3.5 h-3.5" /> View Lessons
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1 text-[#0b2d5a] hover:bg-blue-50 rounded text-[10px] font-bold">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Syllabus
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm space-y-4 h-fit">
          <h3 className="text-xs font-extrabold text-[#0b2d5a] uppercase tracking-wider">Lesson Schedule</h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#ecfcf3] border border-[#bbf3d2] rounded-xl flex gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-800">Limits Introduction</h4>
                <p className="text-[10px] text-emerald-700 mt-0.5">Calculus batch - Completed today</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Thermodynamics Lab</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Physics batch - August 24, 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
