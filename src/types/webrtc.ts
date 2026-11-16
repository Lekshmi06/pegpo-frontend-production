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
  senderRole: LiveClassRole;
  text: string;
  timestamp: string;
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
      timestamp: string;
    }
  | {
      type: 'whiteboard-sync';
      senderId: string;
      elements: any[];
    }
  | {
      type: 'session-ended';
      reason?: string;
    }
  | {
      type: 'error';
      message: string;
    };

