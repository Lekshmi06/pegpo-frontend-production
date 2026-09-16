import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Trophy, Search, ChevronDown, ChevronLeft, ChevronRight, Plus, X,
  Calendar as CalendarIcon, MapPin, CheckCircle2, Layers,
  MessageSquare, BookOpen, Mic, Video, Brain, FileText,
  TrendingUp, RotateCcw, NotebookPen, Bookmark, Trash2, Clock
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { workspaceService, CalendarEventItem } from '../../services/workspaceService';

interface EventItem {
  id: string | number;
  _id?: string;
  title: string;
  time: string;
  bg: string;
  date?: string;
  description?: string;
  location?: string;
  eventType?: string;
  isCompleted?: boolean;
}

const COLOR_PALETTES = [
  'bg-[#dbeafe] border-blue-200 text-[#1e40af]',
  'bg-[#fef08a] border-amber-200 text-[#713f12]',
  'bg-[#86efac] border-emerald-200 text-[#14532d]',
  'bg-[#a7f3d0] border-teal-200 text-[#065f46]',
  'bg-[#e9d5ff] border-purple-200 text-[#581c87]',
  'bg-[#fca5a5]/60 border-rose-200 text-[#881337]',
  'bg-[#c084fc] border-purple-300 text-white',
  'bg-[#4ade80] border-emerald-300 text-[#14532d]',
  'bg-[#5eead4] border-teal-300 text-[#065f46]',
];

function getPaletteColor(idx: number): string {
  return COLOR_PALETTES[idx % COLOR_PALETTES.length];
}

const DEFAULT_DAY1: EventItem[] = [
  { id: 'def-1', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fca5a5]/60 border-rose-200 text-[#881337]' },
  { id: 'def-2', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fef08a] border-amber-200 text-[#713f12]' },
  { id: 'def-3', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#86efac] border-emerald-200 text-[#14532d]' },
];

const DEFAULT_DAY2: EventItem[] = [
  { id: 'def-4', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#a7f3d0] border-teal-200 text-[#065f46]' },
  { id: 'def-5', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#e9d5ff] border-purple-200 text-[#581c87]' },
  { id: 'def-6', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#c084fc] border-purple-300 text-white' },
  { id: 'def-7', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fca5a5]/70 border-rose-300 text-[#881337]' },
  { id: 'def-8', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#dbeafe] border-blue-200 text-[#1e40af]' },
  { id: 'def-9', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#86efac] border-emerald-200 text-[#14532d]' },
];

const DEFAULT_DAY3: EventItem[] = [
  { id: 'def-10', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fef08a] border-amber-200 text-[#713f12]' },
  { id: 'def-11', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#4ade80] border-emerald-300 text-[#14532d]' },
  { id: 'def-12', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#5eead4] border-teal-300 text-[#065f46]' },
  { id: 'def-13', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#a855f7] border-purple-300 text-white' },
  { id: 'def-14', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#f87171] border-rose-300 text-white' },
];

const DEFAULT_WAITING: EventItem[] = [
  { id: 'def-101', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#fca5a5]/60 border-rose-200 text-[#881337]' },
  { id: 'def-102', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#a7f3d0] border-teal-200 text-[#065f46]' },
  { id: 'def-103', title: 'Write an Email for Clint', time: '1.00 hr', bg: 'bg-[#dbeafe] border-blue-200 text-[#1e40af]' },
];

export default function StudentCalendar() {
  const navigate = useNavigate();
  const toast = useToast();

  const [todayFilter, setTodayFilter] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [dayOffset, setDayOffset] = useState(0);

  // Backend Events state
  const [allEvents, setAllEvents] = useState<CalendarEventItem[]>([]);
  const [isBackendLoaded, setIsBackendLoaded] = useState(false);

  // Inline task card state
  const [showInlineTaskCard, setShowInlineTaskCard] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [inlineTaskName, setInlineTaskName] = useState('');
  const [inlineEstTime, setInlineEstTime] = useState('');
  const [inlineSelectedDay, setInlineSelectedDay] = useState<'day1' | 'day2' | 'day3'>('day1');

  // New Event Modal state
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [eventDate, setEventDate] = useState('Today');
  const [eventStartTime, setEventStartTime] = useState('11:00');
  const [eventEndTime, setEventEndTime] = useState('12:00');
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventAgenda, setEventAgenda] = useState('');

  // Event Details Modal state
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventItem | null>(null);

  // Right sidebar actions & graphic cards
  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  // Compute 3 visible dynamic dates
  const getDayDetails = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset + offset);
    const dayNum = d.getDate();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullMonthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return {
      dateStr: d.toISOString().split('T')[0],
      dayLabel: `${dayNum} ${dayNames[d.getDay()]}`,
      monthYear: `${fullMonthNames[d.getMonth()]} ${d.getFullYear()}`,
    };
  };

  const day1Info = getDayDetails(0);
  const day2Info = getDayDetails(1);
  const day3Info = getDayDetails(2);

  // Load calendar events from backend on mount
  useEffect(() => {
    let mounted = true;
    const loadEvents = async () => {
      try {
        const events = await workspaceService.getCalendarEvents();
        if (mounted) {
          setAllEvents(events || []);
          setIsBackendLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load calendar events from backend:', err);
        if (mounted) setIsBackendLoaded(true);
      }
    };
    loadEvents();
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for live calendar events dispatched by EduPye AI
  useEffect(() => {
    const handleCalendarEventCreated = (e: Event) => {
      const customEvt = e as CustomEvent<CalendarEventItem>;
      if (customEvt.detail) {
        setAllEvents((prev) => {
          if (customEvt.detail._id && prev.some((item) => item._id === customEvt.detail._id)) {
            return prev;
          }
          return [...prev, customEvt.detail];
        });
      }
    };
    window.addEventListener('edupye_calendar_event_created', handleCalendarEventCreated);
    return () => {
      window.removeEventListener('edupye_calendar_event_created', handleCalendarEventCreated);
    };
  }, []);

  // Split events across the 3 day columns and Waiting list
  const userDay1Events: EventItem[] = [];
  const userDay2Events: EventItem[] = [];
  const userDay3Events: EventItem[] = [];
  const userWaitingTasks: EventItem[] = [];

  allEvents.forEach((evt, idx) => {
    const item: EventItem = {
      id: evt._id || `evt-${idx}`,
      _id: evt._id,
      title: evt.title,
      time: evt.startTime ? `${evt.startTime}${evt.endTime ? ` - ${evt.endTime}` : ''}` : '1.00 hr',
      bg: evt.color && evt.color.startsWith('bg-') ? evt.color : getPaletteColor(idx),
      date: evt.date,
      description: evt.description,
      location: evt.location,
      eventType: evt.eventType,
      isCompleted: evt.isCompleted,
    };

    if (evt.date === 'waiting_list') {
      userWaitingTasks.push(item);
    } else if (evt.date === day1Info.dateStr || evt.date === 'Today' || evt.date === 'day1') {
      userDay1Events.push(item);
    } else if (evt.date === day2Info.dateStr || evt.date === 'day2') {
      userDay2Events.push(item);
    } else if (evt.date === day3Info.dateStr || evt.date === 'day3') {
      userDay3Events.push(item);
    } else {
      userDay1Events.push(item);
    }
  });

  // If student has no saved events yet, show default items so the screen is complete
  const effectiveDay1 = allEvents.length > 0 ? userDay1Events : DEFAULT_DAY1;
  const effectiveDay2 = allEvents.length > 0 ? userDay2Events : DEFAULT_DAY2;
  const effectiveDay3 = allEvents.length > 0 ? userDay3Events : DEFAULT_DAY3;
  const effectiveWaiting = allEvents.length > 0 ? userWaitingTasks : DEFAULT_WAITING;

  // Search filter
  const applySearch = (list: EventItem[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q))
    );
  };

  const filteredDay1 = applySearch(effectiveDay1);
  const filteredDay2 = applySearch(effectiveDay2);
  const filteredDay3 = applySearch(effectiveDay3);
  const filteredWaiting = applySearch(effectiveWaiting);

  // 1. Save inline task to backend
  const handleSaveInlineTask = async () => {
    if (!inlineTaskName.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    const targetDate =
      inlineSelectedDay === 'day2'
        ? day2Info.dateStr
        : inlineSelectedDay === 'day3'
        ? day3Info.dateStr
        : day1Info.dateStr;

    try {
      const created = await workspaceService.createCalendarEvent({
        title: inlineTaskName.trim(),
        startTime: inlineEstTime.trim() || '1.00 hr',
        date: targetDate,
        eventType: 'task',
        color: 'bg-[#dbeafe] border-blue-200 text-[#1e40af]',
        isCompleted: false,
      });

      setAllEvents((prev) => [created, ...prev]);
      setInlineTaskName('');
      setInlineEstTime('');
      setShowInlineTaskCard(false);
      setShowDatePicker(false);
      toast.success('Task saved to calendar & cloud database!');
    } catch {
      toast.error('Failed to save task to backend');
    }
  };

  // 2. Save modal event to backend
  const handleCreateModalEvent = async () => {
    if (!eventName.trim()) {
      toast.error('Event name is required');
      return;
    }

    const targetDate = eventDate === 'Today' ? day1Info.dateStr : eventDate;

    try {
      const created = await workspaceService.createCalendarEvent({
        title: eventName.trim(),
        description: eventAgenda.trim(),
        location: eventLocation.trim(),
        date: targetDate,
        startTime: eventStartTime,
        endTime: eventEndTime,
        eventType: 'class',
        color: 'bg-[#fef08a] border-amber-200 text-[#713f12]',
        isCompleted: false,
      });

      setAllEvents((prev) => [created, ...prev]);
      setShowCreateEventModal(false);
      setEventName('');
      setEventLocation('');
      setEventAgenda('');
      toast.success('Event created and saved to database!');
    } catch {
      toast.error('Failed to create event');
    }
  };

  // 3. Add task to Waiting List in backend
  const handleAddWaitingListTask = async () => {
    try {
      const created = await workspaceService.createCalendarEvent({
        title: 'Review Assignment Details',
        startTime: '1.00 hr',
        date: 'waiting_list',
        eventType: 'task',
        color: 'bg-[#fca5a5]/60 border-rose-200 text-[#881337]',
        isCompleted: false,
      });

      setAllEvents((prev) => [created, ...prev]);
      toast.success('Task added to Waiting List!');
    } catch {
      toast.error('Failed to add task to waiting list');
    }
  };

  // 4. Delete event from backend
  const handleDeleteEvent = async (event: EventItem) => {
    if (event._id) {
      try {
        await workspaceService.deleteCalendarEvent(event._id);
        setAllEvents((prev) => prev.filter((e) => e._id !== event._id));
        toast.success('Event deleted successfully');
      } catch {
        toast.error('Failed to delete event');
      }
    } else {
      // Local fallback removal
      setAllEvents((prev) => prev.filter((e) => String(e._id || e.id) !== String(event.id)));
      toast.info('Item removed');
    }
    setSelectedEventDetails(null);
  };

  // 5. Toggle event completed status
  const handleToggleCompleted = async (event: EventItem) => {
    if (event._id) {
      try {
        const updated = await workspaceService.updateCalendarEvent(event._id, {
          isCompleted: !event.isCompleted,
        });
        setAllEvents((prev) => prev.map((e) => (e._id === event._id ? updated : e)));
        toast.success(!event.isCompleted ? 'Task completed! Great job.' : 'Task marked active');
      } catch {
        toast.error('Failed to update task status');
      }
    }
    setSelectedEventDetails(null);
  };

  // Right sidebar action handlers
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
    if (label === 'Quiz') {
      navigate('/student/quiz');
      return;
    }
    if (label === 'Flash Card') {
      navigate('/student/practice');
      return;
    }
    if (label === 'Notes') {
      navigate('/student/notebook');
      return;
    }
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
      {/* Create Event Modal */}
      <Modal isOpen={showCreateEventModal} onClose={() => setShowCreateEventModal(false)} title="Create event">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span>{eventDate}</span>
            </div>
            <input
              type="text"
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
              placeholder="11:00"
              className="w-20 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#0091ff]"
            />
            <input
              type="text"
              value={eventEndTime}
              onChange={(e) => setEventEndTime(e.target.value)}
              placeholder="12:00"
              className="w-20 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#0091ff]"
            />
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

      {/* Event Details / Delete Modal */}
      <Modal isOpen={!!selectedEventDetails} onClose={() => setSelectedEventDetails(null)} title="Event Details">
        {selectedEventDetails && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${selectedEventDetails.bg} space-y-2`}>
              <h3 className="text-sm font-extrabold">{selectedEventDetails.title}</h3>
              <div className="flex items-center gap-3 text-xs opacity-90 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedEventDetails.time}
                </span>
                {selectedEventDetails.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedEventDetails.location}
                  </span>
                )}
              </div>
              {selectedEventDetails.description && (
                <p className="text-xs pt-1 opacity-90 font-medium">{selectedEventDetails.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteEvent(selectedEventDetails)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Event
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleCompleted(selectedEventDetails)}
                >
                  {selectedEventDetails.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                </Button>
                <Button size="sm" onClick={() => setSelectedEventDetails(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Action / Graphic Modal */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Schedule an AI-powered <strong>{selectedActionLabel}</strong> study session directly into your calendar.
            </p>
            <Button
              onClick={async () => {
                try {
                  const created = await workspaceService.createCalendarEvent({
                    title: `Study Session: ${selectedActionLabel}`,
                    startTime: '1.00 hr',
                    date: day1Info.dateStr,
                    eventType: 'task',
                    color: 'bg-[#dbeafe] border-blue-200 text-[#1e40af]',
                    isCompleted: false,
                  });
                  setAllEvents((prev) => [created, ...prev]);
                  toast.success(`${selectedActionLabel} scheduled to calendar!`);
                } catch {
                  toast.error('Failed to schedule session');
                }
                setActiveModal(null);
              }}
              className="w-full py-2.5"
            >
              Add {selectedActionLabel} to Calendar
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
        {/* Header */}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {/* Page Title & Actions */}
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

              {/* Main Calendar Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[520px]">
                {/* 3 Days Columns */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e2ebf4] shadow-xs flex flex-col overflow-hidden relative">
                  <div className="p-3 border-b border-[#e2ebf4] space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold pl-2">{day1Info.monthYear}</span>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-2">
                      <button
                        onClick={() => setDayOffset((prev) => prev - 1)}
                        className="hover:text-[#0091ff] cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Previous day"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex-1 grid grid-cols-3 text-center font-bold">
                        <span className={dayOffset === 0 ? 'text-[#0091ff]' : ''}>{day1Info.dayLabel}</span>
                        <span>{day2Info.dayLabel}</span>
                        <span>{day3Info.dayLabel}</span>
                      </div>

                      <button
                        onClick={() => setDayOffset((prev) => prev + 1)}
                        className="hover:text-[#0091ff] cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Next day"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 divide-x divide-[#e2ebf4] relative">
                    {/* Day 1 Column */}
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
                            <div className="relative">
                              <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                                title="Select target day"
                              >
                                <CalendarIcon className="w-3 h-3 text-[#1c3352]" />
                              </button>

                              {showDatePicker && (
                                <div className="absolute left-0 bottom-8 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-30 flex flex-col gap-1 w-28 text-[11px] font-bold text-slate-700">
                                  <button
                                    onClick={() => { setInlineSelectedDay('day1'); setShowDatePicker(false); }}
                                    className={`px-2 py-1 rounded-lg text-left hover:bg-slate-50 ${inlineSelectedDay === 'day1' ? 'text-[#0091ff] bg-blue-50' : ''}`}
                                  >
                                    {day1Info.dayLabel}
                                  </button>
                                  <button
                                    onClick={() => { setInlineSelectedDay('day2'); setShowDatePicker(false); }}
                                    className={`px-2 py-1 rounded-lg text-left hover:bg-slate-50 ${inlineSelectedDay === 'day2' ? 'text-[#0091ff] bg-blue-50' : ''}`}
                                  >
                                    {day2Info.dayLabel}
                                  </button>
                                  <button
                                    onClick={() => { setInlineSelectedDay('day3'); setShowDatePicker(false); }}
                                    className={`px-2 py-1 rounded-lg text-left hover:bg-slate-50 ${inlineSelectedDay === 'day3' ? 'text-[#0091ff] bg-blue-50' : ''}`}
                                  >
                                    {day3Info.dayLabel}
                                  </button>
                                </div>
                              )}
                            </div>

                            <Button size="sm" onClick={handleSaveInlineTask}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )}

                      {filteredDay1.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEventDetails(evt)}
                          className={`p-3 rounded-2xl border ${evt.bg} shadow-2xs space-y-1 cursor-pointer transition-all hover:scale-102 ${
                            evt.isCompleted ? 'opacity-60 line-through' : ''
                          }`}
                        >
                          <h4 className="text-xs font-bold leading-snug">{evt.title}</h4>
                          <span className="text-[10px] opacity-80 font-semibold">{evt.time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Day 2 Column */}
                    <div className="p-3 space-y-2.5 flex flex-col">
                      {filteredDay2.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEventDetails(evt)}
                          className={`p-3 rounded-2xl border ${evt.bg} shadow-2xs space-y-1 cursor-pointer transition-all hover:scale-102 ${
                            evt.isCompleted ? 'opacity-60 line-through' : ''
                          }`}
                        >
                          <h4 className="text-xs font-bold leading-snug">{evt.title}</h4>
                          <span className="text-[10px] opacity-80 font-semibold">{evt.time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Day 3 Column */}
                    <div className="p-3 space-y-2.5 flex flex-col">
                      {filteredDay3.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEventDetails(evt)}
                          className={`p-3 rounded-2xl border ${evt.bg} shadow-2xs space-y-1 cursor-pointer transition-all hover:scale-102 ${
                            evt.isCompleted ? 'opacity-60 line-through' : ''
                          }`}
                        >
                          <h4 className="text-xs font-bold leading-snug">{evt.title}</h4>
                          <span className="text-[10px] opacity-80 font-semibold">{evt.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Waiting List Column */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-[#e2ebf4] p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-[#111827]">Waiting List</h3>
                        <span className="w-5 h-5 rounded-full bg-[#1c3352] text-white text-[10px] font-bold flex items-center justify-center">
                          {filteredWaiting.length}
                        </span>
                      </div>
                      <button
                        onClick={handleAddWaitingListTask}
                        className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Add to Waiting List"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 py-1">
                      {filteredWaiting.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedEventDetails(t)}
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

          {/* Right Sidebar */}
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
