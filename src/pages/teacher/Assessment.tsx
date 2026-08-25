import React, { useState } from 'react';
import {
  Clock, ClipboardList, CheckCircle2
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';

export default function Assessment() {
  const toast = useToast();
  const [grades, setGrades] = useState<{ id: number; name: string; subject: string; test: string; score: number | null; status: string }[]>([
    { id: 1, name: 'Adarsh Sen', subject: 'Physics', test: 'Midterm 1', score: 88, status: 'Graded' },
    { id: 2, name: 'Amal Benny', subject: 'Calculus', test: 'Limits Quiz', score: 92, status: 'Graded' },
    { id: 3, name: 'Karthika Balan', subject: 'Chemistry', test: 'Lab Bonding', score: null, status: 'Pending' },
  ]);

  const [activeGradeId, setActiveGradeId] = useState<number | null>(null);
  const [editScore, setEditScore] = useState('');

  const handleSaveGrade = (id: number) => {
    const numScore = parseFloat(editScore);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error('Please enter a score between 0 and 100');
      return;
    }
    setGrades(grades.map(g => 
      g.id === id ? { ...g, score: numScore, status: 'Graded' } : g
    ));
    setActiveGradeId(null);
    toast.success('Grade saved successfully');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#0b2d5a] rounded-xl"><ClipboardList className="w-6 h-6" /></div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase">Class Average</h4>
            <p className="text-xl font-extrabold text-[#0b2d5a]">90.0%</p>
          </div>
        </div>
        <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase">Tests Graded</h4>
            <p className="text-xl font-extrabold text-[#0b2d5a]">2 / 3</p>
          </div>
        </div>
        <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-6 h-6" /></div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase">Pending Review</h4>
            <p className="text-xl font-extrabold text-[#0b2d5a]">1 Exam</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e2ebf4] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e2ebf4] bg-slate-50/50">
          <h3 className="text-xs font-extrabold text-[#0b2d5a] uppercase tracking-wider">Assessment / Scorecard Worksheets</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-[#e2ebf4]">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Test Name</th>
                <th className="p-4">Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition-all">
                  <td className="p-4 font-bold text-slate-800">{g.name}</td>
                  <td className="p-4">{g.subject}</td>
                  <td className="p-4">{g.test}</td>
                  <td className="p-4 font-bold">
                    {activeGradeId === g.id ? (
                      <input
                        type="number"
                        max="100"
                        value={editScore}
                        onChange={(e) => setEditScore(e.target.value)}
                        className="w-16 text-xs p-1 border border-slate-200 rounded text-center focus:outline-none"
                      />
                    ) : (
                      g.score !== null ? `${g.score} / 100` : '--'
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      g.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>{g.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    {activeGradeId === g.id ? (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" onClick={() => handleSaveGrade(g.id)}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setActiveGradeId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => { setActiveGradeId(g.id); setEditScore(g.score !== null ? g.score.toString() : ''); }}>
                        Grade
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
