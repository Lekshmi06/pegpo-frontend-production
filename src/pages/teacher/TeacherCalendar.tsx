import React from 'react';

export default function TeacherCalendar() {
  const events = [
    { title: 'Calculus Introduction Lecture', date: 'August 24, 2026', time: '10:00 AM', type: 'Lecture' },
    { title: 'Mid-term Paper Submissions Due', date: 'August 27, 2026', time: '11:59 PM', type: 'Deadline' },
    { title: 'Department Faculty Sync', date: 'August 28, 2026', time: '02:00 PM', type: 'Meeting' }
  ];

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-[#0b2d5a]">Calendars & Planners</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your class schedules, deadlines, and department meetings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#0b2d5a]">August 2026</h3>
            <div className="flex gap-1.5">
              <button className="px-2.5 py-1 bg-slate-100 rounded text-xs cursor-pointer">Prev</button>
              <button className="px-2.5 py-1 bg-slate-100 rounded text-xs cursor-pointer">Next</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 mb-2">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>
          <div className="grid grid-cols-7 gap-2 h-64 text-center">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasEvent = day === 24 || day === 27 || day === 28;
              return (
                <div 
                  key={`tday-${i}`} 
                  className={`flex flex-col items-center justify-center border border-slate-100 rounded-lg text-xs cursor-pointer hover:bg-slate-50 ${
                    hasEvent ? 'bg-[#e2ebf4]/60 border-[#1c3d73] font-bold text-[#0b2d5a]' : 'text-slate-600'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#e2ebf4] p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0b2d5a]">Upcoming Events</h3>
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.title} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">{evt.type}</span>
                <h4 className="text-xs font-bold text-slate-800">{evt.title}</h4>
                <p className="text-[10px] text-slate-400 font-semibold">{evt.date} • {evt.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
