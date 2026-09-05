import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Trophy, Search, ChevronDown, MessageSquare, BookOpen, Mic, Video, Brain, FileText,
  CheckCircle2, Layers, TrendingUp, RotateCcw, NotebookPen, Bookmark
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
import { EmptyState, ErrorState } from '../../components/ui/StateViews';

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    profile,
    isLoading,
    isSaving,
    error,
    refetch,
    updateProfile,
  } = useStudentProfile();

  const [board, setBoard] = useState('CBSE');
  const [cbseClass, setCbseClass] = useState('Class 10');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form edit state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    goal: '',
    language: 'English',
    board: 'CBSE',
    classLevel: '10',
  });

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      const studentBoard = profile.education?.board || 'CBSE';
      const studentClass = profile.education?.classLevel || '10';
      const studentLanguage =
        (profile.userId && typeof profile.userId === 'object' && profile.userId.language) ||
        localStorage.getItem('userLanguage') ||
        'English';

      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        goal: profile.goal || 'Prepare for Exam',
        language: studentLanguage === 'Select' ? 'English' : studentLanguage,
        board: studentBoard,
        classLevel: studentClass,
      });

      setBoard(studentBoard);
      setCbseClass(studentClass.startsWith('Class') ? studentClass : `Class ${studentClass}`);
    }
  }, [profile]);

  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  const handleLogout = () => {
    toast.info('Logging out...');
    authService.logout();
    setTimeout(() => navigate('/signup'), 800);
  };

  const handleTopBoardChange = async (newBoard: string) => {
    setBoard(newBoard);
    setFormData((prev) => ({ ...prev, board: newBoard }));
    if (profile?._id) {
      try {
        await updateProfile({
          education: {
            ...profile.education,
            level: profile.education?.level || 'school',
            board: newBoard,
          },
        });
        toast.success(`Board updated to ${newBoard}`);
      } catch {
        toast.error('Failed to update board selection');
      }
    }
  };

  const handleTopClassChange = async (newClass: string) => {
    setCbseClass(newClass);
    const numericClass = newClass.replace(/\D/g, '') || '10';
    setFormData((prev) => ({ ...prev, classLevel: numericClass }));
    if (profile?._id) {
      try {
        await updateProfile({
          education: {
            ...profile.education,
            level: profile.education?.level || 'school',
            classLevel: numericClass,
          },
        });
        toast.success(`Class updated to ${newClass}`);
      } catch {
        toast.error('Failed to update class selection');
      }
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        goal: formData.goal.trim(),
        language: formData.language.trim() || 'English',
        education: {
          level: profile?.education?.level || 'school',
          board: formData.board,
          classLevel: formData.classLevel,
        },
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    if (profile) {
      const studentBoard = profile.education?.board || 'CBSE';
      const studentClass = profile.education?.classLevel || '10';
      const studentLanguage =
        (profile.userId && typeof profile.userId === 'object' && profile.userId.language) ||
        localStorage.getItem('userLanguage') ||
        'English';

      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        goal: profile.goal || 'Prepare for Exam',
        language: studentLanguage === 'Select' ? 'English' : studentLanguage,
        board: studentBoard,
        classLevel: studentClass,
      });
    }
    setIsEditing(false);
  };

  const profileDisplayItems = [
    { label: 'Name', value: profile?.name || '—' },
    { label: 'Phone', value: profile?.phone || '—' },
    {
      label: 'Email',
      value:
        (profile?.userId && typeof profile.userId === 'object' && profile.userId.email) ||
        localStorage.getItem('userEmail') ||
        '—',
    },
    { label: 'Board', value: profile?.education?.board || 'CBSE' },
    { label: 'Class', value: profile?.education?.classLevel || '10' },
    { label: 'Goal', value: profile?.goal || 'Prepare for Exam' },
    {
      label: 'Language',
      value:
        (profile?.userId && typeof profile.userId === 'object' && profile.userId.language) ||
        'English',
    },
  ];

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
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> for your profile study dashboard.
            </p>
            <Button
              onClick={() => {
                toast.success(`${selectedActionLabel} created!`);
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
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e2ebf4] flex items-center justify-between px-4 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={board}
                onChange={(e) => handleTopBoardChange(e.target.value)}
                className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-3.5 pr-8 py-1.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State">State</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>

            <div className="relative">
              <select
                value={cbseClass}
                onChange={(e) => handleTopClassChange(e.target.value)}
                className="appearance-none bg-[#e3edf7] text-[#1c3352] pl-3.5 pr-8 py-1.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer hover:bg-[#d5e6f5] transition-colors"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#1c3352] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>
          </div>

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
                placeholder="Search profile..."
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
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs hover:ring-2 hover:ring-[#0091ff]/30 transition-all cursor-pointer block"
                title="Student Profile"
              >
                <img src={userImg} alt="Profile" className="w-full h-full object-cover" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-52 bg-[#f0f6fc] border border-[#d8eaf8] rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                  {['Help & Tools', 'Feed Back', 'Quick Guide', 'Extension', 'Discord', 'Settings'].map((pill) => (
                    <button
                      key={pill}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3.5 py-2 bg-[#e3edf7] hover:bg-[#d5e6f5] text-[#1c3352] rounded-xl text-xs font-bold transition-colors"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              <div>
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Profile</h1>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-[#e2ebf4] p-8 shadow-xs max-w-3xl flex flex-col justify-between min-h-[460px] animate-in fade-in duration-150">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center min-h-[340px]">
                    <Loader text="Loading profile details..." />
                  </div>
                ) : error && !profile ? (
                  <div className="flex-1 flex items-center justify-center min-h-[340px]">
                    <ErrorState
                      title="Unable to load profile"
                      message={error}
                      onRetry={refetch}
                    />
                  </div>
                ) : !profile ? (
                  <div className="flex-1 flex items-center justify-center min-h-[340px]">
                    <EmptyState
                      title="No Profile Found"
                      message="Could not locate your profile record in the database."
                      onRetry={refetch}
                    />
                  </div>
                ) : isEditing ? (
                  /* Edit Mode */
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                      <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        required
                      />

                      <Input
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+99 85 75 92 78"
                      />

                      <Input
                        label="Email"
                        value={
                          (profile?.userId && typeof profile.userId === 'object' && profile.userId.email) ||
                          localStorage.getItem('userEmail') ||
                          ''
                        }
                        disabled
                        className="bg-slate-50 cursor-not-allowed text-slate-500"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 w-full text-left">
                          <label className="block text-xs font-bold text-slate-700">Board</label>
                          <div className="relative">
                            <select
                              value={formData.board}
                              onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                              className="w-full py-3 px-4 border border-slate-200 rounded-2xl bg-white text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 appearance-none cursor-pointer"
                            >
                              <option value="CBSE">CBSE</option>
                              <option value="ICSE">ICSE</option>
                              <option value="State">State</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1.5 w-full text-left">
                          <label className="block text-xs font-bold text-slate-700">Class</label>
                          <div className="relative">
                            <select
                              value={formData.classLevel}
                              onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                              className="w-full py-3 px-4 border border-slate-200 rounded-2xl bg-white text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff] focus:ring-2 focus:ring-[#0091ff]/20 appearance-none cursor-pointer"
                            >
                              <option value="9">Class 9</option>
                              <option value="10">Class 10</option>
                              <option value="11">Class 11</option>
                              <option value="12">Class 12</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Academic Goal"
                          value={formData.goal}
                          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                          placeholder="e.g. Prepare for Exam"
                        />

                        <Input
                          label="Language"
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          placeholder="e.g. English"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-6 py-2.5"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSaving}
                        className="px-6 py-2.5"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <>
                    <div className="space-y-6">
                      {profileDisplayItems.map((item, idx) => (
                        <div
                          key={item.label}
                          className={`space-y-1 ${
                            idx !== profileDisplayItems.length - 1 ? 'border-b border-slate-100 pb-5' : ''
                          }`}
                        >
                          <span className="text-xs text-slate-400 font-semibold">{item.label}</span>
                          <h3 className="text-base font-extrabold text-[#111827]">{item.value}</h3>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-8">
                      <Button variant="danger" onClick={handleLogout} className="px-8 py-2.5">
                        Log Out
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                        className="px-8 py-2.5"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </>
                )}
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
                  <span className="text-[11px] font-extrabold text-[#111827] max-w-[100px] leading-tight">
                    {card.title}
                  </span>
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-14 h-10 object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
