import { useState, useEffect, useRef, useCallback } from 'react';
import { liveClassService } from '../services/liveClassService';
import {
  ICallParticipant,
  ClassroomChatMessage,
  LiveClassRole,
  SignallingIncomingMessage,
  RTCIceServerConfig,
} from '../types/webrtc';

export interface UseWebRTCClassroomOptions {
  sessionId: string;
  role?: LiveClassRole;
  userName?: string;
  autoJoin?: boolean;
  onSessionEnded?: () => void;
  onForceLogout?: (reason?: string) => void;
  onWhiteboardSync?: (elements: any[]) => void;
}

export function useWebRTCClassroom({
  sessionId,
  role = 'student',
  userName,
  autoJoin = false,
  onSessionEnded,
  onForceLogout,
  onWhiteboardSync,
}: UseWebRTCClassroomOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [permissionErrorMessage, setPermissionErrorMessage] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Map<string, ICallParticipant>>(new Map());
  const [chatMessages, setChatMessages] = useState<ClassroomChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'disconnected'
  >('idle');
  const [isClassEnded, setIsClassEnded] = useState(false);
  const [isForceLoggedOut, setIsForceLoggedOut] = useState(false);
  const [endReason, setEndReason] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const iceServersRef = useRef<RTCIceServerConfig[]>([
    { urls: 'stun:stun.l.google.com:19302' },
  ]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const myPeerIdRef = useRef<string>('');

  // Keep callback refs fresh
  const onSessionEndedRef = useRef(onSessionEnded);
  onSessionEndedRef.current = onSessionEnded;
  const onForceLogoutRef = useRef(onForceLogout);
  onForceLogoutRef.current = onForceLogout;
  const onWhiteboardSyncRef = useRef(onWhiteboardSync);
  onWhiteboardSyncRef.current = onWhiteboardSync;

  // 1. Initialise local media stream with graceful degradation
  const initLocalMedia = useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) return localStreamRef.current;

    let stream: MediaStream | null = null;
    try {
      // Try full audio & video
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setHasPermissionError(false);
      setPermissionErrorMessage(null);
    } catch (err: any) {
      console.warn('[WebRTC] Full AV media capture failed, trying audio-only fallback:', err?.message);
      try {
        // Fallback: Audio-only
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: false,
        });
        setIsVideoMuted(true);
        setHasPermissionError(true);
        setPermissionErrorMessage('Camera unavailable or access denied. Audio-only mode enabled.');
      } catch (audioErr: any) {
        console.warn('[WebRTC] Audio fallback also failed. Entering spectator mode:', audioErr?.message);
        setIsAudioMuted(true);
        setIsVideoMuted(true);
        setHasPermissionError(true);
        setPermissionErrorMessage(
          'Microphone and camera access denied. You are joined as an audience spectator.'
        );
        return null;
      }
    }

    if (stream) {
      localStreamRef.current = stream;
      setLocalStream(stream);
      const vTrack = stream.getVideoTracks()[0];
      if (vTrack) {
        originalVideoTrackRef.current = vTrack;
      }
    }
    return stream;
  }, []);

  // 2. Fetch configured ICE servers (STUN/TURN)
  const fetchIceConfig = useCallback(async () => {
    try {
      const config = await liveClassService.getIceServers();
      if (config && config.iceServers && config.iceServers.length > 0) {
        iceServersRef.current = config.iceServers;
      }
    } catch (e) {
      console.warn('[WebRTC] Could not fetch server ICE config, using default STUN:', e);
    }
  }, []);

  // Helper to safely send WS payloads
  const sendSignalling = useCallback((payload: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  }, []);

  // 3. Create or get RTCPeerConnection for a remote peer
  const getOrCreatePeerConnection = useCallback(
    (remotePeerId: string, remotePeerName: string, remotePeerRole: LiveClassRole): RTCPeerConnection => {
      let pc = peerConnectionsRef.current.get(remotePeerId);
      if (pc && pc.signalingState !== 'closed') {
        return pc;
      }

      pc = new RTCPeerConnection({
        iceServers: iceServersRef.current,
        iceCandidatePoolSize: 2,
      });

      peerConnectionsRef.current.set(remotePeerId, pc);

      // Add local media tracks to this peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc?.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        setParticipants((prev) => {
          const next = new Map(prev);
          const existing = next.get(remotePeerId) || {
            peerId: remotePeerId,
            name: remotePeerName,
            role: remotePeerRole,
            isMicMuted: false,
            isVideoMuted: false,
          };
          let remoteStream = event.streams[0];
          if (!remoteStream) {
            remoteStream = existing.stream || new MediaStream();
            if (!remoteStream.getTracks().some((t) => t.id === event.track.id)) {
              remoteStream.addTrack(event.track);
            }
          }
          next.set(remotePeerId, {
            ...existing,
            stream: remoteStream,
            connectionState: 'connected',
          });
          return next;
        });
      };

      // Handle ICE candidates generated locally
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalling({
            type: 'ice-candidate',
            to: remotePeerId,
            candidate: event.candidate,
          });
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        const state = pc?.connectionState;
        setParticipants((prev) => {
          const next = new Map(prev);
          const current = next.get(remotePeerId);
          if (current) {
            next.set(remotePeerId, { ...current, connectionState: state });
          }
          return next;
        });

        if (state === 'failed') {
          console.warn(`[WebRTC] Peer ${remotePeerId} connection failed, attempting ICE restart`);
          pc?.restartIce?.();
        }
      };

      return pc;
    },
    [sendSignalling]
  );

  // Helper to drain queued ICE candidates after setRemoteDescription
  const drainCandidateQueue = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const queue = pendingCandidatesRef.current.get(peerId);
    if (queue && queue.length > 0) {
      for (const candidate of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn(`[WebRTC] Failed to add queued ICE candidate for ${peerId}:`, err);
        }
      }
      pendingCandidatesRef.current.delete(peerId);
    }
  }, []);

  // 4. WebSocket Signalling Handler
  const connectSignalling = useCallback(
    async (stream: MediaStream | null) => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
      if (!token) {
        setConnectionStatus('failed');
        console.error('[WebRTC] No auth token found in localStorage');
        return;
      }

      await fetchIceConfig();

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
      const host = apiBase.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
      const wsUrl = `${wsProtocol}//${host}/ws/classroom?token=${encodeURIComponent(
        token
      )}&sessionId=${encodeURIComponent(sessionId)}`;

      setConnectionStatus('connecting');
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
      };

      ws.onerror = (err) => {
        console.error('[WebRTC WS Error]', err);
        setConnectionStatus('failed');
      };

      ws.onclose = (event) => {
        if (!isClassEnded) {
          setConnectionStatus('disconnected');
        }
      };

      ws.onmessage = async (msgEvent) => {
        try {
          const data: SignallingIncomingMessage = JSON.parse(msgEvent.data);

          switch (data.type) {
            case 'room-state': {
              myPeerIdRef.current = data.self.peerId;

              // Populate initial participants
              setParticipants((prev) => {
                const next = new Map(prev);
                data.peers.forEach((p) => {
                  next.set(p.peerId, {
                    peerId: p.peerId,
                    name: p.name,
                    role: p.role,
                    isMicMuted: p.isMicMuted,
                    isVideoMuted: p.isVideoMuted,
                    connectionState: 'connecting',
                  });
                });
                return next;
              });

              // As the newly joined peer, initiate WebRTC offer to each existing peer
              for (const p of data.peers) {
                const pc = getOrCreatePeerConnection(p.peerId, p.name, p.role);
                try {
                  const offer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                  });
                  await pc.setLocalDescription(offer);
                  sendSignalling({
                    type: 'offer',
                    to: p.peerId,
                    offer: pc.localDescription,
                  });
                } catch (offerErr) {
                  console.error(`[WebRTC] Failed to create offer to ${p.peerId}:`, offerErr);
                }
              }
              break;
            }

            case 'peer-joined': {
              const { peer } = data;
              setParticipants((prev) => {
                const next = new Map(prev);
                next.set(peer.peerId, {
                  peerId: peer.peerId,
                  name: peer.name,
                  role: peer.role,
                  isMicMuted: peer.isMicMuted,
                  isVideoMuted: peer.isVideoMuted,
                  connectionState: 'connecting',
                });
                return next;
              });
              // The joined peer will send us an offer
              break;
            }

            case 'peer-left': {
              const { peerId } = data;
              const pc = peerConnectionsRef.current.get(peerId);
              if (pc) {
                pc.close();
                peerConnectionsRef.current.delete(peerId);
              }
              pendingCandidatesRef.current.delete(peerId);

              setParticipants((prev) => {
                const next = new Map(prev);
                next.delete(peerId);
                return next;
              });
              break;
            }

            case 'offer': {
              const { from, fromName, offer } = data;
              const pc = getOrCreatePeerConnection(from, fromName || 'Participant', 'student');
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                await drainCandidateQueue(from, pc);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignalling({
                  type: 'answer',
                  to: from,
                  answer: pc.localDescription,
                });
              } catch (ansErr) {
                console.error(`[WebRTC] Error handling offer from ${from}:`, ansErr);
              }
              break;
            }

            case 'answer': {
              const { from, answer } = data;
              const pc = peerConnectionsRef.current.get(from);
              if (pc) {
                try {
                  await pc.setRemoteDescription(new RTCSessionDescription(answer));
                  await drainCandidateQueue(from, pc);
                } catch (ansErr) {
                  console.error(`[WebRTC] Error handling answer from ${from}:`, ansErr);
                }
              }
              break;
            }

            case 'ice-candidate': {
              const { from, candidate } = data;
              const pc = peerConnectionsRef.current.get(from);
              if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (iceErr) {
                  console.warn(`[WebRTC] Error adding ICE candidate from ${from}:`, iceErr);
                }
              } else {
                // Queue candidate until setRemoteDescription completes
                const queue = pendingCandidatesRef.current.get(from) || [];
                queue.push(candidate);
                pendingCandidatesRef.current.set(from, queue);
              }
              break;
            }

            case 'media-state-change': {
              setParticipants((prev) => {
                const next = new Map(prev);
                const current = next.get(data.peerId);
                if (current) {
                  next.set(data.peerId, {
                    ...current,
                    isMicMuted: data.isMicMuted,
                    isVideoMuted: data.isVideoMuted,
                  });
                }
                return next;
              });
              break;
            }

            case 'chat-message': {
              setChatMessages((prev) => [
                ...prev,
                {
                  id: data.id,
                  senderId: data.senderId,
                  senderName: data.senderName,
                  senderRole: data.senderRole,
                  text: data.text,
                  timestamp: data.timestamp,
                },
              ]);
              break;
            }

            case 'whiteboard-sync': {
              if (onWhiteboardSyncRef.current) {
                onWhiteboardSyncRef.current(data.elements);
              }
              break;
            }

            case 'session-ended': {
              setIsClassEnded(true);
              setEndReason(data.reason || 'Live classroom has concluded.');
              setConnectionStatus('disconnected');
              if (onSessionEndedRef.current) {
                onSessionEndedRef.current();
              }
              break;
            }

            case 'force-logout': {
              setIsClassEnded(true);
              setIsForceLoggedOut(true);
              setEndReason(data.reason || 'Session idle limit exceeded (15 minutes).');
              setConnectionStatus('disconnected');
              if (onForceLogoutRef.current) {
                onForceLogoutRef.current(data.reason);
              } else if (onSessionEndedRef.current) {
                onSessionEndedRef.current();
              }
              break;
            }

            case 'error': {
              console.error('[WebRTC Classroom Error from Server]', data.message);
              break;
            }
          }
        } catch (e) {
          console.error('[WebRTC Message Parse Error]', e);
        }
      };
    },
    [sessionId, fetchIceConfig, getOrCreatePeerConnection, drainCandidateQueue, sendSignalling, isClassEnded]
  );

  // 5. User Control Actions
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    const aTracks = localStreamRef.current.getAudioTracks();
    const nextMuted = !isAudioMuted;
    aTracks.forEach((t) => {
      t.enabled = !nextMuted;
    });
    setIsAudioMuted(nextMuted);

    sendSignalling({
      type: 'media-state',
      isMicMuted: nextMuted,
      isVideoMuted,
    });
  }, [isAudioMuted, isVideoMuted, sendSignalling]);

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    const vTracks = localStreamRef.current.getVideoTracks();
    const nextMuted = !isVideoMuted;
    vTracks.forEach((t) => {
      t.enabled = !nextMuted;
    });
    setIsVideoMuted(nextMuted);

    sendSignalling({
      type: 'media-state',
      isMicMuted: isAudioMuted,
      isVideoMuted: nextMuted,
    });
  }, [isAudioMuted, isVideoMuted, sendSignalling]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing, restore camera track
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);

      if (originalVideoTrackRef.current && localStreamRef.current) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender && originalVideoTrackRef.current) {
            sender.replaceTrack(originalVideoTrackRef.current);
          }
        });
      }
    } else {
      // Start screen sharing
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        const screenTrack = displayStream.getVideoTracks()[0];
        setScreenStream(displayStream);
        setIsScreenSharing(true);

        // Replace track in all active peer connections
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        // Handle user stopping screen share via native browser stop button
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          if (originalVideoTrackRef.current) {
            peerConnectionsRef.current.forEach((pc) => {
              const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
              if (sender && originalVideoTrackRef.current) {
                sender.replaceTrack(originalVideoTrackRef.current);
              }
            });
          }
        };
      } catch (err: any) {
        console.warn('[WebRTC ScreenShare Cancelled/Denied]', err?.message);
      }
    }
  }, [isScreenSharing, screenStream]);

  const sendChatMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      sendSignalling({
        type: 'chat-message',
        text: text.trim(),
      });
    },
    [sendSignalling]
  );

  const broadcastWhiteboardData = useCallback(
    (elements: any[]) => {
      sendSignalling({
        type: 'whiteboard-sync',
        elements,
      });
    },
    [sendSignalling]
  );

  const leaveClass = useCallback(() => {
    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();

    // Close socket
    if (socketRef.current) {
      socketRef.current.close(1000, 'User left classroom');
      socketRef.current = null;
    }

    setConnectionStatus('disconnected');
    setParticipants(new Map());
  }, [screenStream]);

  const endClass = useCallback(async () => {
    sendSignalling({ type: 'end-session' });
    try {
      await liveClassService.endLiveClass(sessionId);
    } catch (e) {
      console.warn('[LiveClassService endLiveClass error]', e);
    }
    leaveClass();
    setIsClassEnded(true);
  }, [sessionId, sendSignalling, leaveClass]);

  const joinClass = useCallback(async () => {
    const stream = await initLocalMedia();
    await connectSignalling(stream);
  }, [initLocalMedia, connectSignalling]);

  // Handle autoJoin or cleanup on unmount
  useEffect(() => {
    if (autoJoin && sessionId) {
      joinClass();
    }
    return () => {
      leaveClass();
    };
  }, [autoJoin, sessionId]);

  const participantList = Array.from(participants.values());

  return {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    hasPermissionError,
    permissionErrorMessage,
    participants: participantList,
    chatMessages,
    connectionStatus,
    isClassEnded,
    isForceLoggedOut,
    endReason,
    joinClass,
    leaveClass,
    endClass,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage,
    broadcastWhiteboardData,
  };
}

