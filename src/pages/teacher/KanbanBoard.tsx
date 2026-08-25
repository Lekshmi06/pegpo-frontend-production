import React, { useState } from 'react';
import { CalendarDays, ChevronDown, Plus, Settings, X } from 'lucide-react';
import { useTeacherKanban } from '../../hooks/useTeacherKanban';
import { TaskStatus, TaskCategory } from '../../types/teacher';

const columns: TaskStatus[] = ['New task', 'Scheduled', 'In Progress', 'Completed'];
const types = [
  ['Operational', '#d9eaf7'],
  ['Technical', '#f2d36b'],
  ['Strategic', '#d8facd'],
  ['Hiring', '#ffb9b5'],
  ['Financial', '#d9d9d9'],
] as const;

export default function KanbanBoard() {
  const { tasks, addTask } = useTeacherKanban();
  const [composerOpen, setComposerOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [taskType, setTaskType] = useState<TaskCategory>('Operational');
  const [taskName, setTaskName] = useState('');

  const saveTask = () => {
    if (!taskName.trim()) return;
    addTask(taskName, 'New task', taskType);
    setTaskName('');
    setComposerOpen(false);
  };

  return (
    <div className="min-h-full bg-[#f8fcff]">
      <div className="flex h-14 items-center justify-end border-b border-[#d5e4f2] px-3">
        <button
          onClick={() => setComposerOpen(true)}
          aria-label="Add task"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#214d7d] text-white hover:bg-[#173c63] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-4 border-b border-[#c8dced] bg-white text-center text-[16px] font-medium text-[#161b23]">
        {columns.map((column) => (
          <div key={column} className="py-4">
            {column}
          </div>
        ))}
      </div>
      <div className="grid min-h-[420px] grid-cols-4 bg-white">
        {columns.map((column, index) => (
          <section key={column} className={`min-h-full p-2 ${index ? 'border-l border-[#d7e5f1]' : ''}`}>
            {index === 0 && composerOpen && (
              <div className="relative mb-2 rounded-lg bg-[#d6e8f6] p-3 text-[#536177]">
                <button
                  onClick={() => setComposerOpen(false)}
                  aria-label="Close task editor"
                  className="absolute -right-1 -top-1 rounded-full bg-[#9eb9ce] p-0.5 text-[#234d7d]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <textarea
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Task name"
                  className="h-11 w-full resize-none bg-transparent text-xs leading-4 outline-none placeholder:text-[#536177]"
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTypePickerOpen((v) => !v);
                        setCalendarOpen(false);
                      }}
                      className="rounded-full border border-[#234d7d] p-1 cursor-pointer"
                      aria-label="Choose task type"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        setCalendarOpen((v) => !v);
                        setTypePickerOpen(false);
                      }}
                      className="rounded-full border border-[#234d7d] p-1 cursor-pointer"
                    >
                      <CalendarDays className="h-3 w-3" />
                    </button>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4383d5] text-xs text-white">K</span>
                  </div>
                  <button onClick={saveTask} className="rounded-lg bg-[#214d7d] px-3 py-1 text-[10px] text-white font-bold cursor-pointer">
                    Save
                  </button>
                </div>
                {calendarOpen && <CalendarPopup close={() => setCalendarOpen(false)} />}
                {typePickerOpen && (
                  <TypePicker
                    selected={taskType}
                    onSelect={(type) => {
                      setTaskType(type as TaskCategory);
                      setTypePickerOpen(false);
                    }}
                  />
                )}
              </div>
            )}
            {tasks
              .filter((task) => task.status === column)
              .map((task) => (
                <div key={task.id} className="mt-2 rounded-md border border-[#d7e5f1] p-2 text-sm text-[#39485a]">
                  {task.name}
                </div>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function TypePicker({ selected, onSelect }: { selected: string; onSelect: (type: string) => void }) {
  return (
    <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-44 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      {types.map(([name, color]) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`flex w-full items-center gap-3 rounded px-1 py-2 text-left text-sm text-[#536177] ${
            selected === name ? 'bg-slate-50' : 'hover:bg-slate-50'
          }`}
        >
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
          {name}
        </button>
      ))}
      <button className="mt-5 flex items-center gap-2 text-sm text-[#536177]">
        <Settings className="h-4 w-4 text-[#214d7d]" />
        Edit Type
      </button>
    </div>
  );
}

function CalendarPopup({ close }: { close: () => void }) {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return (
    <div className="absolute left-[calc(100%+18px)] top-10 z-20 w-64 rounded-2xl bg-[#d6e8f6] p-5 shadow-xl">
      <button className="ml-auto block rounded-md bg-black px-3 py-1 text-sm text-white">December</button>
      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm text-[#606060]">
        {days.map((day) => (
          <span key={day} className={day === 'Sa' || day === 'Su' ? 'text-[#0097ff]' : ''}>
            {day}
          </span>
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <button key={`dec-day-${day}`} className={`rounded py-1 hover:bg-[#1d9cf0] hover:text-white ${day === 18 ? 'bg-black text-white' : ''}`}>
            {day}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button className="rounded bg-white px-2 py-1 text-xs">Add Time</button>
        <button className="rounded bg-white px-2 py-1 text-xs" onClick={close}>
          No Due Date
        </button>
      </div>
    </div>
  );
}
