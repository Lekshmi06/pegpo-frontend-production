import { apiRequest } from './apiClient';
import { LiveClassSession, WebRTCConfiguration } from '../types/webrtc';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const liveClassService = {
  /**
   * Create or start a new live classroom session
   */
  createLiveClass: async (data: {
    title: string;
    sessionType?: 'smartboard_ad_hoc' | 'tuition' | 'class_section';
    tuitionSessionId?: string;
    offeringId?: string;
    batchId?: string;
    lessonPlanId?: string;
    planSessionNumber?: number;
    authorizedStudentIds?: string[];
  }): Promise<{ success: boolean; session: LiveClassSession; rtcConfig: WebRTCConfiguration }> => {
    return apiRequest('/live-classes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  /**
   * Fetch live class details, authorization status, and ICE servers
   */
  getLiveClassDetails: async (
    sessionId: string
  ): Promise<{ success: boolean; session: LiveClassSession; rtcConfig: WebRTCConfiguration }> => {
    return apiRequest(`/live-classes/${sessionId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Shortcut to retrieve live class session model
   */
  getLiveClass: async (sessionId: string): Promise<LiveClassSession> => {
    const res = await liveClassService.getLiveClassDetails(sessionId);
    return res.session;
  },

  /**
   * End a live class session (Host only)
   */
  endLiveClass: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/live-classes/${sessionId}/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Get STUN/TURN ICE server configuration
   */
  getIceConfig: async (): Promise<{ success: boolean; rtcConfig: WebRTCConfiguration }> => {
    return apiRequest('/live-classes/config/ice', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Shortcut to get ICE configuration directly
   */
  getIceServers: async (): Promise<WebRTCConfiguration> => {
    const res = await liveClassService.getIceConfig();
    return res.rtcConfig;
  },
};
