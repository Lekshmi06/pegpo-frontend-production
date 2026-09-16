import { API_BASE_URL } from './apiClient';

export interface NoteItem {
  _id: string;
  id?: string;
  title: string;
  content: string;
  preview: string;
  folderId?: string;
  tags?: string[];
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FolderItem {
  _id: string;
  id?: string;
  name: string;
  title?: string;
  desc?: string;
  color?: string;
  category?: 'notes' | 'homework' | 'projects' | 'general';
  notesCount?: number;
  createdAt?: string;
}

export interface CalendarEventItem {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  eventType: 'class' | 'exam' | 'assignment' | 'reminder' | 'task' | 'general';
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  color?: string;
  isCompleted: boolean;
  createdAt?: string;
}

export interface ProjectItem {
  _id: string;
  id?: string;
  name: string;
  title: string;
  content: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  dueDate?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  const profileId = localStorage.getItem('studentProfileId');
  const userEmail = localStorage.getItem('userEmail');
  const userJson = localStorage.getItem('user');

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (profileId) headers['x-student-profile-id'] = profileId;
  if (userEmail) headers['x-user-email'] = userEmail;

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user?._id) headers['x-user-id'] = user._id;
    } catch {
      // ignore
    }
  }

  return headers;
};

// Local storage fallback keys
const LOCAL_NOTES_KEY = 'edupye_workspace_notes';
const LOCAL_FOLDERS_KEY = 'edupye_workspace_folders';
const LOCAL_EVENTS_KEY = 'edupye_workspace_events';
const LOCAL_PROJECTS_KEY = 'edupye_workspace_projects';

function getLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore quota issues
  }
}

export const workspaceService = {
  // ==========================================
  // NOTES
  // ==========================================
  getNotes: async (folderId?: string, search?: string): Promise<NoteItem[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (folderId) queryParams.set('folderId', folderId);
      if (search) queryParams.set('search', search);

      const res = await fetch(`${API_BASE_URL}/workspace/notes?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setLocal(LOCAL_NOTES_KEY, json.data);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend getNotes unreachable, using local fallback:', err);
    }
    return getLocal<NoteItem[]>(LOCAL_NOTES_KEY, []);
  },

  createNote: async (data: Partial<NoteItem>): Promise<NoteItem> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const current = getLocal<NoteItem[]>(LOCAL_NOTES_KEY, []);
        setLocal(LOCAL_NOTES_KEY, [json.data, ...current]);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend createNote unreachable, saving locally:', err);
    }

    const fallbackNote: NoteItem = {
      _id: `local-note-${Date.now()}`,
      title: data.title?.trim() || 'New Note',
      content: data.content || '',
      preview: data.content ? data.content.slice(0, 100) : 'No text yet',
      tags: data.tags || [],
      isPinned: Boolean(data.isPinned),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getLocal<NoteItem[]>(LOCAL_NOTES_KEY, []);
    setLocal(LOCAL_NOTES_KEY, [fallbackNote, ...current]);
    return fallbackNote;
  },

  updateNote: async (id: string, data: Partial<NoteItem>): Promise<NoteItem> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/notes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const current = getLocal<NoteItem[]>(LOCAL_NOTES_KEY, []);
        setLocal(
          LOCAL_NOTES_KEY,
          current.map((n) => (n._id === id ? json.data : n))
        );
        return json.data;
      }
    } catch (err) {
      console.warn('Backend updateNote unreachable, updating locally:', err);
    }

    const current = getLocal<NoteItem[]>(LOCAL_NOTES_KEY, []);
    const updated = current.map((n) => (n._id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n));
    setLocal(LOCAL_NOTES_KEY, updated);
    return updated.find((n) => n._id === id) || (data as NoteItem);
  },

  deleteNote: async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/workspace/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Backend deleteNote unreachable:', err);
    }
    const current = getLocal<NoteItem[]>(LOCAL_NOTES_KEY, []);
    setLocal(
      LOCAL_NOTES_KEY,
      current.filter((n) => n._id !== id)
    );
  },

  // ==========================================
  // FOLDERS
  // ==========================================
  getFolders: async (): Promise<FolderItem[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/folders`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setLocal(LOCAL_FOLDERS_KEY, json.data);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend getFolders unreachable, using local fallback:', err);
    }
    return getLocal<FolderItem[]>(LOCAL_FOLDERS_KEY, [
      {
        _id: 'default-folder-1',
        name: 'Mathematics',
        title: 'Mathematics Study Material',
        desc: 'Algebra, Geometry, and Calculus notes and solutions',
        color: '#2b4d7a',
        category: 'notes',
        notesCount: 4,
      },
      {
        _id: 'default-folder-2',
        name: 'Physics & Lab Records',
        title: 'Physics & Lab Records',
        desc: 'Class experiments, derivations, and practice questions',
        color: '#0284c7',
        category: 'notes',
        notesCount: 3,
      },
    ]);
  },

  createFolder: async (data: Partial<FolderItem>): Promise<FolderItem> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/folders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const current = getLocal<FolderItem[]>(LOCAL_FOLDERS_KEY, []);
        setLocal(LOCAL_FOLDERS_KEY, [json.data, ...current]);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend createFolder unreachable, saving locally:', err);
    }

    const fallbackFolder: FolderItem = {
      _id: `local-folder-${Date.now()}`,
      name: data.name?.trim() || 'New Folder',
      title: data.title?.trim() || data.name?.trim() || 'New Folder',
      desc: data.desc?.trim() || 'Workspace folder for study documents',
      color: data.color || '#2b4d7a',
      category: data.category || 'notes',
      notesCount: 0,
      createdAt: new Date().toISOString(),
    };
    const current = getLocal<FolderItem[]>(LOCAL_FOLDERS_KEY, []);
    setLocal(LOCAL_FOLDERS_KEY, [fallbackFolder, ...current]);
    return fallbackFolder;
  },

  updateFolder: async (id: string, data: Partial<FolderItem>): Promise<FolderItem> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/folders/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const current = getLocal<FolderItem[]>(LOCAL_FOLDERS_KEY, []);
        setLocal(
          LOCAL_FOLDERS_KEY,
          current.map((f) => (f._id === id ? json.data : f))
        );
        return json.data;
      }
    } catch (err) {
      console.warn('Backend updateFolder unreachable:', err);
    }

    const current = getLocal<FolderItem[]>(LOCAL_FOLDERS_KEY, []);
    const updated = current.map((f) => (f._id === id ? { ...f, ...data } : f));
    setLocal(LOCAL_FOLDERS_KEY, updated);
    return updated.find((f) => f._id === id) || (data as FolderItem);
  },

  deleteFolder: async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/workspace/folders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Backend deleteFolder unreachable:', err);
    }
    const current = getLocal<FolderItem[]>(LOCAL_FOLDERS_KEY, []);
    setLocal(
      LOCAL_FOLDERS_KEY,
      current.filter((f) => f._id !== id)
    );
  },

  // ==========================================
  // CALENDAR EVENTS
  // ==========================================
  getCalendarEvents: async (date?: string): Promise<CalendarEventItem[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (date) queryParams.set('date', date);

      const res = await fetch(`${API_BASE_URL}/workspace/calendar?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setLocal(LOCAL_EVENTS_KEY, json.data);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend getCalendarEvents unreachable, using local fallback:', err);
    }
    return getLocal<CalendarEventItem[]>(LOCAL_EVENTS_KEY, [
      {
        _id: 'default-event-1',
        title: 'Revise Thermodynamics Formulas',
        description: 'Review Heat Engine & Carnot Cycle equations',
        eventType: 'reminder',
        date: 'Today',
        startTime: '10:00',
        endTime: '11:00',
        color: '#10b981',
        isCompleted: false,
      },
      {
        _id: 'default-event-2',
        title: 'Mathematics Chapter 4 Practice Set',
        description: 'Complete Exercise 4.2 & 4.3 quadratic roots',
        eventType: 'assignment',
        date: 'Today',
        startTime: '14:00',
        endTime: '15:30',
        color: '#3b82f6',
        isCompleted: true,
      },
      {
        _id: 'default-event-3',
        title: 'Physics Midterm Mock Test',
        description: 'Timed CBT Mock Test 1',
        eventType: 'exam',
        date: 'Today',
        startTime: '17:00',
        endTime: '18:30',
        color: '#ef4444',
        isCompleted: false,
      },
    ]);
  },

  createCalendarEvent: async (data: Partial<CalendarEventItem>): Promise<CalendarEventItem> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/calendar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const current = getLocal<CalendarEventItem[]>(LOCAL_EVENTS_KEY, []);
        setLocal(LOCAL_EVENTS_KEY, [...current, json.data]);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend createCalendarEvent unreachable, saving locally:', err);
    }

    const fallbackEvent: CalendarEventItem = {
      _id: `local-event-${Date.now()}`,
      title: data.title?.trim() || 'New Event',
      description: data.description || '',
      eventType: data.eventType || 'task',
      date: data.date || 'Today',
      startTime: data.startTime || undefined,
      endTime: data.endTime || undefined,
      location: data.location || '',
      color: data.color || '#3b82f6',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    const current = getLocal<CalendarEventItem[]>(LOCAL_EVENTS_KEY, []);
    setLocal(LOCAL_EVENTS_KEY, [...current, fallbackEvent]);
    return fallbackEvent;
  },

  updateCalendarEvent: async (id: string, data: Partial<CalendarEventItem>): Promise<CalendarEventItem> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/calendar/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const current = getLocal<CalendarEventItem[]>(LOCAL_EVENTS_KEY, []);
        setLocal(
          LOCAL_EVENTS_KEY,
          current.map((e) => (e._id === id ? json.data : e))
        );
        return json.data;
      }
    } catch (err) {
      console.warn('Backend updateCalendarEvent unreachable:', err);
    }

    const current = getLocal<CalendarEventItem[]>(LOCAL_EVENTS_KEY, []);
    const updated = current.map((e) => (e._id === id ? { ...e, ...data } : e));
    setLocal(LOCAL_EVENTS_KEY, updated);
    return updated.find((e) => e._id === id) || (data as CalendarEventItem);
  },

  deleteCalendarEvent: async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/workspace/calendar/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Backend deleteCalendarEvent unreachable:', err);
    }
    const current = getLocal<CalendarEventItem[]>(LOCAL_EVENTS_KEY, []);
    setLocal(
      LOCAL_EVENTS_KEY,
      current.filter((e) => e._id !== id)
    );
  },

  // ==========================================
  // PROJECTS
  // ==========================================
  getProjects: async (): Promise<ProjectItem[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/projects`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setLocal(LOCAL_PROJECTS_KEY, json.data);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend getProjects unreachable, using local fallback:', err);
    }
    return getLocal<ProjectItem[]>(LOCAL_PROJECTS_KEY, [
      {
        _id: 'default-proj-1',
        name: 'Science Exhibition: Solar Cell Efficiency',
        title: 'Solar Cell Efficiency Project',
        content: 'Analyzing monocrystalline vs polycrystalline panel outputs under varying temperature conditions.',
        status: 'in_progress',
        tags: ['Physics', 'Renewable Energy'],
        createdAt: new Date().toISOString(),
      },
    ]);
  },

  createProject: async (data: Partial<ProjectItem>): Promise<ProjectItem> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const current = getLocal<ProjectItem[]>(LOCAL_PROJECTS_KEY, []);
        setLocal(LOCAL_PROJECTS_KEY, [json.data, ...current]);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend createProject unreachable, saving locally:', err);
    }

    const fallbackProj: ProjectItem = {
      _id: `local-proj-${Date.now()}`,
      name: data.name?.trim() || 'New Project',
      title: data.title?.trim() || '',
      content: data.content || '',
      status: data.status || 'planning',
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getLocal<ProjectItem[]>(LOCAL_PROJECTS_KEY, []);
    setLocal(LOCAL_PROJECTS_KEY, [fallbackProj, ...current]);
    return fallbackProj;
  },

  updateProject: async (id: string, data: Partial<ProjectItem>): Promise<ProjectItem> => {
    try {
      const res = await fetch(`${API_BASE_URL}/workspace/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const current = getLocal<ProjectItem[]>(LOCAL_PROJECTS_KEY, []);
        setLocal(
          LOCAL_PROJECTS_KEY,
          current.map((p) => (p._id === id ? json.data : p))
        );
        return json.data;
      }
    } catch (err) {
      console.warn('Backend updateProject unreachable:', err);
    }

    const current = getLocal<ProjectItem[]>(LOCAL_PROJECTS_KEY, []);
    const updated = current.map((p) => (p._id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
    setLocal(LOCAL_PROJECTS_KEY, updated);
    return updated.find((p) => p._id === id) || (data as ProjectItem);
  },

  deleteProject: async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/workspace/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Backend deleteProject unreachable:', err);
    }
    const current = getLocal<ProjectItem[]>(LOCAL_PROJECTS_KEY, []);
    setLocal(
      LOCAL_PROJECTS_KEY,
      current.filter((p) => p._id !== id)
    );
  },
};
