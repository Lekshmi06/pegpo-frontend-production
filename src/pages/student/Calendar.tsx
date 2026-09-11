import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Trophy, Search, ChevronDown, ChevronLeft, ChevronRight, Plus, X,
  Calendar as CalendarIcon, MapPin, Paperclip, Bell, Bold, Italic, Underline, Link,
  CheckSquare, List, MessageSquare, BookOpen, Mic, Video, Brain, FileText, CheckCircle2, Layers,
  TrendingUp, RotateCcw, NotebookPen, Bookmark
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface EventItem {
  id: number;
  title: string;
  time: string;
  bg: string;
}

export default function StudentCalendar() {
  const navigate = useNavigate();
  const toast = useToast();

  const [todayFilter, setTodayFilter] = useState('Today');

  const [showInlineTaskCard, setShowInlineTaskCard] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  const [inlineTaskName, setInlineTaskName] = useState('');
  const [inlineEstTime, setInlineEstTime] = useState('');

  const [eventDate] = useState('Today');
  const [eventStartTime] = useState('11:00');
  const [eventEndTime] = useState('12:00');
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventAgenda, setEventAgenda] = useState('');

  const [day1Events, setDay1Events] = useState<EventItem[]>([
    { id: 1, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fca5a5]/60 border-rose-200 text-[#881337]' },
    { id: 2, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fef08a] border-amber-200 text-[#713f12]' },
    { id: 3, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#86efac] border-emerald-200 text-[#14532d]' },
  ]);

  const [day2Events] = useState<EventItem[]>([
    { id: 4, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#a7f3d0] border-teal-200 text-[#065f46]' },
    { id: 5, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#e9d5ff] border-purple-200 text-[#581c87]' },
    { id: 6, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#c084fc] border-purple-300 text-white' },
    { id: 7, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fca5a5]/70 border-rose-300 text-[#881337]' },
    { id: 8, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#dbeafe] border-blue-200 text-[#1e40af]' },
    { id: 9, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#86efac] border-emerald-200 text-[#14532d]' },
  ]);

  const [day3Events] = useState<EventItem[]>([
    { id: 10, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fef08a] border-amber-200 text-[#713f12]' },
    { id: 11, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#4ade80] border-emerald-300 text-[#14532d]' },
    { id: 12, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#5eead4] border-teal-300 text-[#065f46]' },
    { id: 13, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#a855f7] border-purple-300 text-white' },
    { id: 14, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#f87171] border-rose-300 text-white' },
  ]);

  const [waitingListTasks, setWaitingListTasks] = useState<EventItem[]>([
    { id: 101, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fca5a5]/60 border-rose-200 text-[#881337]' },
    { id: 102, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#a7f3d0] border-teal-200 text-[#065f46]' },
    { id: 103, title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#dbeafe] border-blue-200 text-[#1e40af]' },
  ]);

  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const handleSaveInlineTask = () => {
    const newTask: EventItem = {
      id: Date.now(),
      title: inlineTaskName || 'Write an Email for Clint',
      time: inlineEstTime || '1.00 hr',
      bg: 'bg-[#dbeafe] border-blue-200 text-[#1e40af]',
    };
    setDay1Events((prev) => [...prev, newTask]);
    setInlineTaskName('');
    setInlineEstTime('');
    setShowInlineTaskCard(false);
    toast.success('Task saved to calendar!');
  };

  const handleCreateModalEvent = () => {
    const newEvt: EventItem = {
      id: Date.now(),
      title: eventName || 'Meeting with Clint',
      time: '1.00 hr',
      bg: 'bg-[#fef08a] border-amber-200 text-[#713f12]',
    };
    setDay1Events((prev) => [...prev, newEvt]);
    setShowCreateEventModal(false);
    setEventName('');
    toast.success('Event created successfully!');
  };

  const createActions = [
    { label: 'Chat', icon: MessageSquare },
    { label: 'Chapter', icon: BookOpen },
    { label: 'Audio', icon: Mic },
    { label: 'Video', icon: Video },
    { label: 'Mind Map', icon: Brain },
    { label: 'Summery', icon: FileText },
    { label: 'Quiz', icon: CheckCircle2 },
    { label: 'Flash Card', icon: Layers },
    { label: 'Time Line', icon: TrendingUp },
    { label: 'Analyse', icon: RotateCcw },
    { label: 'Notes', icon: NotebookPen },
    { label: 'Book Mark', icon: Bookmark },
  ];

  const lowerGraphicCards = [
    { id: 'smartboard', title: 'Smart Bord /Projects', img: cardSmartboard, desc: 'Interactive digital chalkboard for group project simulations.' },
    { id: 'combine', title: 'Combine Study', img: cardCombine, desc: 'Collaborative live study rooms with peers and tutors.' },
    { id: 'slide', title: 'Slide', img: cardSlide, desc: 'AI-generated presentation decks for key syllabus concepts.' },
    { id: 'infographics', title: 'Info Graphics', img: cardInfographics, desc: 'Visual flowcharts, diagrams, and memory maps.' },
  ];

  const handleCreateActionClick = (label: string) => {
    setModalTitle(`Create ${label}`);
    setSelectedActionLabel(label);
    setActiveModal('action');
  };

  const handleGraphicCardClick = (card: { title: string; img: string; desc: string }) => {
    setModalTitle(card.title);
    setSelectedGraphicCard(card);
    setActiveModal('graphic');
  };

  return (
    <div className="flex h-full min-h-screen bg-[#f8fbfe] overflow-hidden">
      <Modal isOpen={showCreateEventModal} onClose={() => setShowCreateEventModal(false)} title="Create event">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span>{eventDate}</span>
            </div>
            <div className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700">
              {eventStartTime}
            </div>
            <div className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700">
              {eventEndTime}
            </div>
          </div>

          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Event Name"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
          />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 whitespace-nowrap">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Location</span>
            </div>
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Event Location"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
            />
          </div>

          <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-white">
            <textarea
              rows={3}
              value={eventAgenda}
              onChange={(e) => setEventAgenda(e.target.value)}
              placeholder="Event agenda"
              className="w-full text-xs font-semibold text-slate-700 outline-none resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateEventModal(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateModalEvent}>
              Create event
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your calendar schedule.
            </p>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} added to calendar!`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Generate {selectedActionLabel}
            </Button>
          </div>
        )}

        {activeModal === 'graphic' && selectedGraphicCard && (
          <div className="space-y-4">
            <div className="h-40 bg-[#eef6fc] rounded-2xl flex items-center justify-center p-4">
              <img src={selectedGraphicCard.img} alt={selectedGraphicCard.title} className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedGraphicCard.desc}</p>
            <Button
              onClick={() => {
                toast.info(`Launched ${selectedGraphicCard.title}!`);
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Launch Workspace
            </Button>
          </div>
        )}
      </Modal>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-end px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info('Language switched to English')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Select Language"
            >
              <Globe className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative w-40 sm:w-64 md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#264973]" />
              </span>
              <input
                type="text"
                placeholder="Search calendar..."
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl text-xs bg-[#e3edf7] text-[#264973] focus:outline-none focus:ring-2 focus:ring-[#264973]/30 font-medium"
              />
            </div>

            <button
              onClick={() => toast.info('Viewing Achievements & Badges')}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
              title="Achievements"
            >
              <Trophy className="w-5 h-5 text-[#1c3352] stroke-[2]" />
            </button>

            <div className="relative">
              <button
                onClick={() => navigate('/student/profile')}
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs hover:ring-2 hover:ring-[#0091ff]/30 transition-all cursor-pointer block"
                title="Student Profile"
              >
                <img src={userImg} alt="Profile" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Calendar</h1>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={todayFilter}
                      onChange={(e) => setTodayFilter(e.target.value)}
                      className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-4 pr-9 py-2 rounded-2xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
                  </div>

                  <Button onClick={() => setShowCreateEventModal(true)} size="sm" leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}>
                    Add New
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[520px]">
                <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e2ebf4] shadow-xs flex flex-col overflow-hidden relative">
                  <div className="p-3 border-b border-[#e2ebf4] space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold pl-2">December 2025</span>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-2">
                      <button onClick={() => toast.info('Previous days')} className="hover:text-[#0091ff] cursor-pointer">
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex-1 grid grid-cols-3 text-center">
                        <span>12 Fri</span>
                        <span>13 Sat</span>
                        <span>14 Sun</span>
                      </div>

                      <button onClick={() => toast.info('Next days')} className="hover:text-[#0091ff] cursor-pointer">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 divide-x divide-[#e2ebf4] relative">
                    <div className="p-3 space-y-2.5 flex flex-col relative">
                      {showInlineTaskCard && (
                        <div className="bg-[#dbeafe] border border-blue-200 rounded-2xl p-3.5 space-y-2 shadow-xs relative animate-in fade-in duration-150 z-20">
                          <button
                            onClick={() => setShowInlineTaskCard(false)}
                            className="absolute top-2.5 right-2.5 p-1 rounded-full text-[#1c3352] hover:bg-white/50 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="text"
                            value={inlineTaskName}
                            onChange={(e) => setInlineTaskName(e.target.value)}
                            placeholder="Task name"
                            className="w-full bg-transparent text-xs font-bold text-[#1c3352] outline-none placeholder:text-slate-500"
                          />

                          <input
                            type="text"
                            value={inlineEstTime}
                            onChange={(e) => setInlineEstTime(e.target.value)}
                            placeholder="Estimated time: hh:mm"
                            className="w-full bg-transparent text-[11px] font-semibold text-slate-600 outline-none placeholder:text-slate-500"
                          />

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <CalendarIcon className="w-3 h-3 text-[#1c3352]" />
                              </button>
                            </div>

                            <Button size="sm" onClick={handleSaveInlineTask}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )}

                      {day1Events.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => toast.info(`Opened ${evt.title}`)}
                          className={`p-3 rounded-2xl border ${evt.bg} shadow-2xs space-y-1 cursor-pointer transition-all hover:scale-102`}
                        >
                          <h4 className="text-xs font-bold leading-snug">{evt.title}</h4>
                          <span className="text-[10px] opacity-80 font-semibold">{evt.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 space-y-2.5 flex flex-col">
                      {day2Events.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => toast.info(`Opened ${evt.title}`)}
                          className={`p-3 rounded-2xl border ${evt.bg} shadow-2xs space-y-1 cursor-pointer transition-all hover:scale-102`}
                        >
                          <h4 className="text-xs font-bold leading-snug">{evt.title}</h4>
                          <span className="text-[10px] opacity-80 font-semibold">{evt.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 space-y-2.5 flex flex-col">
                      {day3Events.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => toast.info(`Opened ${evt.title}`)}
                          className={`p-3 rounded-2xl border ${evt.bg} shadow-2xs space-y-1 cursor-pointer transition-all hover:scale-102`}
                        >
                          <h4 className="text-xs font-bold leading-snug">{evt.title}</h4>
                          <span className="text-[10px] opacity-80 font-semibold">{evt.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e2ebf4] p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-[#111827]">Waiting List</h3>
                        <span className="w-5 h-5 rounded-full bg-[#1c3352] text-white text-[10px] font-bold flex items-center justify-center">
                          {waitingListTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const newWaitTask: EventItem = {
                            id: Date.now(),
                            title: 'Write an Email for Clint',
                            time: '1.00 hr',
                            bg: 'bg-[#fca5a5]/60 border-rose-200 text-[#881337]',
                          };
                          setWaitingListTasks((prev) => [...prev, newWaitTask]);
                          toast.success('Added task to Waiting List!');
                        }}
                        className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Add to Waiting List"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 py-1">
                      {waitingListTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-3.5 rounded-2xl border ${t.bg} shadow-2xs space-y-1 cursor-pointer hover:scale-102 transition-transform`}
                        >
                          <h4 className="text-xs font-bold leading-snug">{t.title}</h4>
                          <span className="text-[10px] opacity-80 font-semibold">{t.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="w-64 bg-[#d8eaf8] p-4 flex flex-col space-y-4 border-l border-[#cbd5e1]/50 shrink-0 select-none overflow-y-auto hidden lg:flex">
            <h2 className="flex items-center justify-start gap-1.5 text-xl font-extrabold text-[#111827] tracking-tight pl-2">
              <span className="text-[#2f78c4] font-extrabold">&gt;&gt;</span>
              <span>Create</span>
            </h2>

            <div className="bg-white rounded-3xl p-3 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                {createActions.map((act) => {
                  const ActionIcon = act.icon;
                  return (
                    <button
                      key={act.label}
                      onClick={() => handleCreateActionClick(act.label)}
                      className="flex flex-col items-center justify-center h-[54px] bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-xl text-[#214d7d] transition-colors p-1 cursor-pointer group shadow-2xs"
                      title={`Create ${act.label}`}
                    >
                      <ActionIcon className="w-4 h-4 text-[#214d7d] stroke-[2.2] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold mt-1 text-[#1c3352]">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-3 shadow-xs space-y-2.5">
              {lowerGraphicCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleGraphicCardClick(card)}
                  className="flex items-center justify-between p-3 bg-[#d6e8f6] hover:bg-[#c5dff2] rounded-2xl cursor-pointer transition-all group shadow-2xs"
                >
                  <span className="text-[11px] font-extrabold text-[#111827] max-w-[100px] leading-tight">{card.title}</span>
                  <img src={card.img} alt={card.title} className="w-14 h-10 object-contain group-hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
