import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Trophy, Search, ChevronDown, Plus, Trash2, Folder as FolderIcon,
  NotebookPen, MessageSquare, BookOpen, Mic, Video, Brain, FileText, CheckCircle2,
  Layers, TrendingUp, RotateCcw, Bookmark, Edit3, ArrowRight
} from 'lucide-react';
import userImg from '../../assets/user.png';
import cardSmartboard from '../../assets/card-smartboard.png';
import cardCombine from '../../assets/card-combine.png';
import cardSlide from '../../assets/card-slide.png';
import cardInfographics from '../../assets/card-infographics.png';
import { useToast } from '../../hooks/useToast';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { workspaceService, FolderItem, NoteItem } from '../../services/workspaceService';

export default function NewFolder() {
  const navigate = useNavigate();
  const toast = useToast();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [foldersList, setFoldersList] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [folderNotes, setFolderNotes] = useState<NoteItem[]>([]);

  // Create folder modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Edit folder mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Right sidebar actions & graphic cards
  const [activeModal, setActiveModal] = useState<'action' | 'graphic' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedActionLabel, setSelectedActionLabel] = useState('');
  const [selectedGraphicCard, setSelectedGraphicCard] = useState<{ title: string; img: string; desc: string } | null>(null);

  // Fetch folders on mount
  useEffect(() => {
    let mounted = true;
    const fetchFolders = async () => {
      try {
        const list = await workspaceService.getFolders();
        if (mounted && list.length > 0) {
          setFoldersList(list);
          setSelectedFolderId(list[0]._id);
          setEditTitle(list[0].title || list[0].name);
          setEditDesc(list[0].desc || '');
        }
      } catch (err) {
        console.error('Failed to load folders:', err);
      }
    };
    fetchFolders();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch notes inside active folder
  useEffect(() => {
    if (!selectedFolderId) return;
    const fetchNotes = async () => {
      try {
        const notes = await workspaceService.getNotes(selectedFolderId);
        setFolderNotes(notes);
      } catch {
        setFolderNotes([]);
      }
    };
    fetchNotes();
  }, [selectedFolderId]);

  const activeFolder = foldersList.find((f) => f._id === selectedFolderId) || foldersList[0];

  const handleSelectFolder = (f: FolderItem) => {
    setSelectedFolderId(f._id);
    setEditTitle(f.title || f.name);
    setEditDesc(f.desc || '');
    setIsEditing(false);
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }
    try {
      const created = await workspaceService.createFolder({
        name: newFolderName.trim(),
        title: newFolderName.trim(),
        desc: newFolderDesc.trim(),
      });
      setFoldersList((prev) => [created, ...prev]);
      setSelectedFolderId(created._id);
      setEditTitle(created.title || created.name);
      setEditDesc(created.desc || '');
      setNewFolderName('');
      setNewFolderDesc('');
      setShowCreateModal(false);
      toast.success('Created new folder');
    } catch {
      toast.error('Failed to create folder');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFolderId) return;
    try {
      const updated = await workspaceService.updateFolder(selectedFolderId, {
        title: editTitle,
        desc: editDesc,
      });
      setFoldersList((prev) =>
        prev.map((f) => (f._id === selectedFolderId ? updated : f))
      );
      setIsEditing(false);
      toast.success('Folder updated');
    } catch {
      toast.error('Failed to update folder');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await workspaceService.deleteFolder(id);
      const remaining = foldersList.filter((f) => f._id !== id);
      setFoldersList(remaining);
      if (selectedFolderId === id && remaining.length > 0) {
        setSelectedFolderId(remaining[0]._id);
        setEditTitle(remaining[0].title || remaining[0].name);
        setEditDesc(remaining[0].desc || '');
      }
      toast.success('Folder deleted');
    } catch {
      toast.error('Failed to delete folder');
    }
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
      {/* Create Folder Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Folder">
        <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Folder Name</label>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Physics Formulas, Term 1 Math"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Description (optional)</label>
            <textarea
              rows={3}
              value={newFolderDesc}
              onChange={(e) => setNewFolderDesc(e.target.value)}
              placeholder="Brief description of materials in this folder"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#111827] outline-none focus:border-[#0091ff] resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Create Folder
            </Button>
          </div>
        </form>
      </Modal>

      {/* Action / Graphic Modals */}
      <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={modalTitle}>
        {activeModal === 'action' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">
              Generate an instant AI-powered <strong>{selectedActionLabel}</strong> inside your selected folder.
            </p>
            <Button
              onClick={async () => {
                try {
                  await workspaceService.createNote({
                    folderId: selectedFolderId,
                    title: `AI ${selectedActionLabel}: ${activeFolder?.name || 'Study'}`,
                    content: `Summary and key review points for ${activeFolder?.name || 'this folder'}.`,
                  });
                  toast.success(`${selectedActionLabel} note created in ${activeFolder?.name}!`);
                  const updatedNotes = await workspaceService.getNotes(selectedFolderId);
                  setFolderNotes(updatedNotes);
                } catch {
                  toast.error('Failed to create action');
                }
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
                placeholder="Search folders..."
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

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8fbfe] overflow-y-auto">
            <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Workspace Folders</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Organize your notes, worksheets, and study sets</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} size="sm" leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}>
                  New Folder
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[500px]">
                {/* Left: Folders Sidebar Column */}
                <div className="lg:col-span-4 bg-white border border-[#e2ebf4] rounded-3xl overflow-hidden shadow-xs flex flex-col">
                  <div className="bg-[#1c3352] text-white px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      <span>All Folders ({foldersList.length})</span>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Add New Folder"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[580px]">
                    {foldersList.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-400 font-medium">
                        No folders yet. Click New Folder above to start.
                      </div>
                    ) : (
                      foldersList.map((f) => {
                        const isSelected = selectedFolderId === f._id;
                        return (
                          <div
                            key={f._id}
                            onClick={() => handleSelectFolder(f)}
                            className={`p-3.5 text-xs font-extrabold rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-[#dbeafe] text-[#1c3352] shadow-2xs border border-[#93c5fd]'
                                : 'bg-[#eef6fc] text-slate-700 hover:bg-[#e3edf7] border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <FolderIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#0091ff]' : 'text-slate-500'}`} />
                              <span className="truncate">{f.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {f.notesCount !== undefined && (
                                <span className="text-[10px] text-slate-400 font-bold bg-white/70 px-2 py-0.5 rounded-full">
                                  {f.notesCount}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolder(f._id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete folder"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Active Folder Detail Column */}
                <div className="lg:col-span-8 bg-white border border-[#e2ebf4] rounded-3xl p-8 shadow-xs flex flex-col justify-between space-y-6">
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      {isEditing ? (
                        <div className="space-y-3 w-full">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="text-xl font-extrabold text-[#111827] outline-none border-b border-[#0091ff] pb-1 w-full"
                          />
                          <textarea
                            rows={3}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="text-xs font-medium text-slate-600 outline-none border border-slate-200 rounded-xl p-2.5 w-full resize-none"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save Changes
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
                              {activeFolder?.title || activeFolder?.name || 'Folder Details'}
                            </h2>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                              title="Edit folder info"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs font-medium text-slate-500 max-w-lg leading-relaxed">
                            {activeFolder?.desc || 'Organized folder for student notes and assignments.'}
                          </p>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate('/student/notebook')}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Open in Notebook
                      </Button>
                    </div>

                    {/* Files / Notes in this folder */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-[#111827] uppercase tracking-wider">
                          Notes in this folder ({folderNotes.length})
                        </h3>
                        <button
                          onClick={async () => {
                            try {
                              await workspaceService.createNote({
                                folderId: selectedFolderId,
                                title: `New Note in ${activeFolder?.name || 'Folder'}`,
                                content: '',
                              });
                              toast.success('Note added to folder');
                              const updatedNotes = await workspaceService.getNotes(selectedFolderId);
                              setFolderNotes(updatedNotes);
                            } catch {
                              toast.error('Failed to create note');
                            }
                          }}
                          className="text-xs font-bold text-[#0091ff] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Note Here</span>
                        </button>
                      </div>

                      {folderNotes.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl text-center space-y-2">
                          <p className="text-xs text-slate-400 font-medium">No notes created in this folder yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {folderNotes.map((note) => (
                            <div
                              key={note._id}
                              onClick={() => navigate('/student/notebook')}
                              className="p-4 bg-[#f8fbfe] hover:bg-[#eef6fc] border border-[#e2ebf4] rounded-2xl cursor-pointer transition-colors space-y-1"
                            >
                              <div className="flex items-center gap-2">
                                <NotebookPen className="w-4 h-4 text-[#0091ff]" />
                                <h4 className="text-xs font-extrabold text-[#111827] truncate">{note.title}</h4>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2">{note.preview || 'No text yet'}</p>
                            </div>
                          ))}
                        </div>
                      )}
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
