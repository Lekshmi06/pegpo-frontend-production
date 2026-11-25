export type LiveClassStatus = 'scheduled' | 'live' | 'ended';
export type LiveClassRole = 'host' | 'student';

export interface RTCIceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRTCConfiguration {
  iceServers: RTCIceServerConfig[];
  iceTransportPolicy?: 'all' | 'relay';
}

export interface LiveClassSession {
  _id: string;
  title: string;
  hostId: string | { _id: string; name?: string };
  hostRole: 'teacher' | 'tuition_provider' | 'institution';
  status: LiveClassStatus;
  sessionType: 'smartboard_ad_hoc' | 'tuition' | 'class_section';
  tuitionSessionId?: string;
  offeringId?: string;
  batchId?: string;
  lessonPlanId?: string;
  planSessionNumber?: number;
  authorizedStudentIds: string[];
  settings: {
    allowMicrophone: boolean;
    allowCamera: boolean;
    allowScreenShare: boolean;
    allowChat: boolean;
  };
  startedAt?: string;
  endedAt?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  createdAt?: string;
  updatedAt?: string;
  totalDurationMinutes?: number;
}

export interface ICallParticipant {
  peerId: string;
  name: string;
  role: LiveClassRole;
  stream?: MediaStream;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  isLocal?: boolean;
  connectionState?: RTCPeerConnectionState | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';
}

export interface ClassroomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: LiveClassRole | 'teacher' | string;
  text: string;
  messageType?: 'text' | 'voice' | 'attachment';
  voiceUrl?: string;
  voiceDuration?: number;
  attachment?: {
    name: string;
    url: string;
    fileType?: string;
    size?: number;
  };
  timestamp: string;
}

export type LiveAssessmentType = 'quiz' | 'test' | 'assignment';

export interface InMeetingQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex?: number;
  points: number;
}

export interface InMeetingSubmission {
  studentId: string;
  studentName: string;
  studentRole?: string;
  score: number;
  totalPossible: number;
  percentage: number;
  submittedAt: string;
}

export interface InMeetingAssessment {
  _id: string;
  sessionId: string;
  programId?: string;
  homeworkId?: string;
  type: LiveAssessmentType;
  title: string;
  instructions?: string;
  timeLimitMinutes?: number;
  totalPoints: number;
  status: 'active' | 'closed';
  questions: InMeetingQuestion[];
  submissions: InMeetingSubmission[];
  publishedBy: string;
  publishedByName: string;
  createdAt: string;
}

export type SignallingIncomingMessage =
  | {
      type: 'room-state';
      sessionId: string;
      self: { peerId: string; name: string; role: LiveClassRole };
      peers: Array<{
        peerId: string;
        name: string;
        role: LiveClassRole;
        isMicMuted: boolean;
        isVideoMuted: boolean;
      }>;
      whiteboardState?: any[];
      allowStudentBoardDraw?: boolean;
      studentBoardPermissions?: Record<string, boolean>;
      canDrawWhiteboard?: boolean;
      chatHistory?: ClassroomChatMessage[];
      activeAssessments?: InMeetingAssessment[];
    }
  | {
      type: 'peer-joined';
      peer: {
        peerId: string;
        name: string;
        role: LiveClassRole;
        isMicMuted: boolean;
        isVideoMuted: boolean;
      };
    }
  | {
      type: 'peer-left';
      peerId: string;
    }
  | {
      type: 'offer';
      from: string;
      fromName?: string;
      offer: RTCSessionDescriptionInit;
    }
  | {
      type: 'answer';
      from: string;
      answer: RTCSessionDescriptionInit;
    }
  | {
      type: 'ice-candidate';
      from: string;
      candidate: RTCIceCandidateInit;
    }
  | {
      type: 'media-state-change';
      peerId: string;
      isMicMuted: boolean;
      isVideoMuted: boolean;
    }
  | {
      type: 'chat-message';
      id: string;
      senderId: string;
      senderName: string;
      senderRole: LiveClassRole;
      text: string;
      messageType?: 'text' | 'voice' | 'attachment';
      voiceUrl?: string;
      voiceDuration?: number;
      attachment?: {
        name: string;
        url: string;
        fileType?: string;
        size?: number;
      };
      timestamp: string;
    }
  | {
      type: 'whiteboard:draw' | 'whiteboard-draw';
      senderId?: string;
      element: any;
    }
  | {
      type: 'whiteboard:clear' | 'whiteboard-clear';
      senderId?: string;
    }
  | {
      type: 'whiteboard:undo' | 'whiteboard-undo';
      senderId?: string;
      elements?: any[];
    }
  | {
      type: 'whiteboard:sync-state' | 'whiteboard-sync';
      senderId?: string;
      elements: any[];
    }
  | {
      type: 'whiteboard:permission' | 'board-permission-changed';
      allowStudentBoardDraw?: boolean;
      studentBoardPermissions?: Record<string, boolean>;
      targetStudentId?: string;
      allowed?: boolean;
    }
  | {
      type: 'assessment:published';
      assessment: InMeetingAssessment;
    }
  | {
      type: 'assessment:graded';
      assessmentId: string;
      submission: InMeetingSubmission & { answers?: any[] };
    }
  | {
      type: 'assessment:results';
      assessmentId: string;
      totalSubmissions: number;
      submissions: InMeetingSubmission[];
    }
  | {
      type: 'assessment:closed';
      assessmentId: string;
    }
  | {
      type: 'session-ended';
      reason?: string;
    }
  | {
      type: 'force-logout';
      sessionId?: string;
      reason?: string;
      code?: string;
    }
  | {
      type: 'error';
      message: string;
    };

