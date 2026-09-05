import { SourceItem, SourceContent } from '../types/source';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const sourceService = {
  uploadSource: async (studentId: string, file: File): Promise<SourceItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/students/${studentId}/sources`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to upload source file');
    }

    return json.data;
  },

  getStudentSources: async (studentId: string): Promise<SourceItem[]> => {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}/sources`);
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch sources');
    }

    return json.data;
  },

  getSource: async (sourceId: string): Promise<SourceItem> => {
    const res = await fetch(`${API_BASE_URL}/sources/${sourceId}`);
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch source details');
    }

    return json.data;
  },

  getSourceContent: async (sourceId: string): Promise<SourceContent> => {
    const res = await fetch(`${API_BASE_URL}/sources/${sourceId}/content`);
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch source content');
    }

    return json.data;
  },

  deleteSource: async (sourceId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/sources/${sourceId}`, {
      method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete source');
    }
  },

  getDownloadUrl: (sourceId: string): string => {
    return `${API_BASE_URL}/sources/${sourceId}/file`;
  },

  // AI Integration Endpoints
  chatWithSource: async (
    sourceId: string,
    query: string,
    history: Array<{ role: string; text: string }> = []
  ): Promise<{ reply: string; citations?: string[] }> => {
    const res = await fetch(`${API_BASE_URL}/sources/${sourceId}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, history }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to chat with source');
    }

    return json.data;
  },

  triggerAIAction: async (
    sourceId: string,
    action: string,
    options?: any
  ): Promise<{ action: string; data: any; cached: boolean }> => {
    const res = await fetch(`${API_BASE_URL}/sources/${sourceId}/ai/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, options }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || `Failed to generate ${action}`);
    }

    return json.data;
  },

  saveSourceNotes: async (
    sourceId: string,
    notes: string
  ): Promise<{ success: boolean; notes: string }> => {
    const res = await fetch(`${API_BASE_URL}/sources/${sourceId}/notes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to save notes');
    }

    return json.data;
  },
};
