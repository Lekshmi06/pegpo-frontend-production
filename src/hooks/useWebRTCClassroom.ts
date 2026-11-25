import { useState, useEffect, useRef, useCallback } from 'react';
import { liveClassService } from '../services/liveClassService';
import { getClientWebRTCConfig } from '../config/webrtc_config';
import {
  ICallParticipant,
  ClassroomChatMessage,
  LiveClassRole,
  SignallingIncomingMessage,
  RTCIceServerConfig,
  InMeetingAssessment,
  InMeetingSubmission,
} from '../types/webrtc';

export function resolveClassroomWsUrl(sessionId: string, token: string): string {
  const explicitWs = import.meta.env.VITE_WS_URL;
  if (explicitWs && typeof explicitWs === 'string' && explicitWs.trim()) {
    let cleanWs = explicitWs.trim().replace(/\/+$/, '');
    if (cleanWs.startsWith('http://')) {
      cleanWs = cleanWs.replace(/^http:\/\//, 'ws://');
    } else if (cleanWs.startsWith('https://')) {
      cleanWs = cleanWs.replace(/^https:\/\//, 'wss://');
    } else if (!cleanWs.startsWith('ws://') && !cleanWs.startsWith('wss://')) {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      cleanWs = `${isHttps ? 'wss:' : 'ws:'}//${cleanWs}`;
    }
    cleanWs = cleanWs.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const wsEndpoint = cleanWs.endsWith('/ws/classroom') ? cleanWs : `${cleanWs}/ws/classroom`;
    return `${wsEndpoint}?token=${encodeURIComponent(token)}&sessionId=${encodeURIComponent(sessionId)}`;
  }

  const rawBase =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

  const trimmed = String(rawBase).trim();
  const isSecure =
    trimmed.startsWith('https://') ||
    (typeof window !== 'undefined' && window.location.protocol === 'https:' && !trimmed.startsWith('http://'));

  const protocol = isSecure ? 'wss:' : 'ws:';
  const cleanHost = trimmed
    .replace(/^https?:\/\//, '')
    .replace(/^wss?:\/\//, '')
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');

  return `${protocol}//${cleanHost}/ws/classroom?token=${encodeURIComponent(token)}&sessionId=${encodeURIComponent(sessionId)}`;
}

export interface UseWebRTCClassroomOptions {
  sessionId: string;
  role?: LiveClassRole;
  userName?: string;
  autoJoin?: boolean;
  onSessionEnded?: () => void;
  onForceLogout?: (reason?: string) => void;
  onWhiteboardSync?: (elements: any[]) => void;
  onWhiteboardDraw?: (element: any) => void;
  onWhiteboardClear?: () => void;
  onWhiteboardUndo?: (elements?: any[]) => void;
  onAssessmentPublished?: (assessment: InMeetingAssessment) => void;
  onAssessmentGraded?: (assessmentId: string, submission: InMeetingSubmission) => void;
  onAssessmentResults?: (assessmentId: string, submissions: InMeetingSubmission[]) => void;
  onAssessmentClosed?: (assessmentId: string) => void;
}

export function useWebRTCClassroom({
  sessionId,
  role = 'student',
  userName,
  autoJoin = false,
  onSessionEnded,
  onForceLogout,
  onWhiteboardSync,
  onWhiteboardDraw,
  onWhiteboardClear,
  onWhiteboardUndo,
  onAssessmentPublished,
  onAssessmentGraded,
  onAssessmentResults,
  onAssessmentClosed,
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
  const [activeAssessments, setActiveAssessments] = useState<InMeetingAssessment[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Map<string, InMeetingSubmission>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'disconnected'
  >('idle');
  const [isClassEnded, setIsClassEnded] = useState(false);
  const [isForceLoggedOut, setIsForceLoggedOut] = useState(false);
  const [endReason, setEndReason] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const makingOfferRef = useRef<Map<string, boolean>>(new Map());
  const iceWatchdogsRef = useRef<Map<string, any>>(new Map());
  const iceServersRef = useRef<RTCIceServerConfig[]>(getClientWebRTCConfig().iceServers);
  const heartbeatTimerRef = useRef<any>(null);
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
  const onWhiteboardDrawRef = useRef(onWhiteboardDraw);
  onWhiteboardDrawRef.current = onWhiteboardDraw;
  const onWhiteboardClearRef = useRef(onWhiteboardClear);
  onWhiteboardClearRef.current = onWhiteboardClear;
  const onWhiteboardUndoRef = useRef(onWhiteboardUndo);
  onWhiteboardUndoRef.current = onWhiteboardUndo;
  const onAssessmentPublishedRef = useRef(onAssessmentPublished);
  onAssessmentPublishedRef.current = onAssessmentPublished;
  const onAssessmentGradedRef = useRef(onAssessmentGraded);
  onAssessmentGradedRef.current = onAssessmentGraded;
  const onAssessmentResultsRef = useRef(onAssessmentResults);
  onAssessmentResultsRef.current = onAssessmentResults;
  const onAssessmentClosedRef = useRef(onAssessmentClosed);
  onAssessmentClosedRef.current = onAssessmentClosed;

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

      // Add tracks to any peer connections that were initialized before media resolved
      peerConnectionsRef.current.forEach((pc) => {
        const senders = pc.getSenders();
        stream.getTracks().forEach((track) => {
          const alreadyAdded = senders.some((s) => s.track && s.track.kind === track.kind);
          if (!alreadyAdded) {
            try {
              pc.addTrack(track, stream);
            } catch (err) {
              console.warn('[WebRTC] Error adding track to existing PC:', err);
            }
          }
        });
      });
    }
    return stream;
  }, []);

  // 2. Fetch configured ICE servers (STUN/TURN)
  const fetchIceConfig = useCallback(async () => {
    try {
      const clientConfig = getClientWebRTCConfig();
      const config = await liveClassService.getIceServers();
      if (config && config.iceServers && config.iceServers.length > 0) {
        const merged: RTCIceServerConfig[] = [...clientConfig.iceServers];
        config.iceServers.forEach((srv) => {
          const srvUrls = Array.isArray(srv.urls) ? srv.urls : [srv.urls];
          const exists = merged.some((m) => {
            const mUrls = Array.isArray(m.urls) ? m.urls : [m.urls];
            return srvUrls.some((u) => mUrls.includes(u));
          });
          if (!exists) {
            merged.push(srv);
          }
        });
        iceServersRef.current = merged;
      } else {
        iceServersRef.current = clientConfig.iceServers;
      }
    } catch (e) {
      console.warn('[WebRTC] Could not fetch server ICE config, using client STUN/TURN config:', e);
      iceServersRef.current = getClientWebRTCConfig().iceServers;
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
        iceCandidatePoolSize: 4,
      });

      peerConnectionsRef.current.set(remotePeerId, pc);

      // Add local media tracks to this peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc?.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle automatic renegotiation when tracks change
      pc.onnegotiationneeded = async () => {
        try {
          if (pc.signalingState !== 'stable') return;
          makingOfferRef.current.set(remotePeerId, true);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignalling({
            type: 'offer',
            to: remotePeerId,
            offer: pc.localDescription,
          });
        } catch (negErr) {
          console.warn(`[WebRTC] onnegotiationneeded error for ${remotePeerId}:`, negErr);
        } finally {
          makingOfferRef.current.set(remotePeerId, false);
        }
      };

      // Handle remote tracks
      pc.ontrack = (event) => {
        const incomingStream = event.streams && event.streams[0] ? event.streams[0] : null;
        setParticipants((prev) => {
          const next = new Map(prev);
          const existing = next.get(remotePeerId) || {
            peerId: remotePeerId,
            name: remotePeerName,
            role: remotePeerRole,
            isMicMuted: false,
            isVideoMuted: false,
          };

          let remoteStream: MediaStream;
          if (incomingStream) {
            // Re-instantiate MediaStream with all tracks to guarantee React state detects a reference change
            remoteStream = new MediaStream(incomingStream.getTracks());
          } else {
            const currentTracks = existing.stream ? existing.stream.getTracks() : [];
            if (!currentTracks.some((t) => t.id === event.track.id)) {
              remoteStream = new MediaStream([...currentTracks, event.track]);
            } else {
              remoteStream = new MediaStream(currentTracks);
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
        if (event.candidate && event.candidate.candidate) {
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
          try {
            pc?.restartIce?.();
          } catch (err) {
            console.warn(`[WebRTC] restartIce error for ${remotePeerId}:`, err);
          }
        }
      };

      // Monitor ICE connection state with automatic restartIce watchdog for mobile/Wi-Fi handover and checking hangs
      pc.oniceconnectionstatechange = async () => {
        const iceState = pc.iceConnectionState;
        console.log(`[WebRTC ICE] Peer ${remotePeerId} iceConnectionState: ${iceState}`);

        if (iceState === 'connected' || iceState === 'completed') {
          // Clear watchdog timer once connected
          if (iceWatchdogsRef.current.has(remotePeerId)) {
            clearTimeout(iceWatchdogsRef.current.get(remotePeerId));
            iceWatchdogsRef.current.delete(remotePeerId);
          }
          setParticipants((prev) => {
            const next = new Map(prev);
            const current = next.get(remotePeerId);
            if (current) {
              next.set(remotePeerId, { ...current, connectionState: 'connected' });
            }
            return next;
          });
        } else if (iceState === 'checking') {
          // If stuck in checking for > 6 seconds, initiate auto-recovery
          if (!iceWatchdogsRef.current.has(remotePeerId)) {
            const timer = setTimeout(async () => {
              iceWatchdogsRef.current.delete(remotePeerId);
              if (pc.iceConnectionState === 'checking') {
                console.warn(`[WebRTC ICE Watchdog] Peer ${remotePeerId} stuck in checking > 6s, restarting ICE...`);
                try {
                  if (typeof pc.restartIce === 'function') {
                    pc.restartIce();
                  }
                  if (pc.signalingState === 'stable') {
                    makingOfferRef.current.set(remotePeerId, true);
                    const restartOffer = await pc.createOffer({ iceRestart: true });
                    await pc.setLocalDescription(restartOffer);
                    sendSignalling({
                      type: 'offer',
                      to: remotePeerId,
                      offer: pc.localDescription,
                    });
                  }
                } catch (recErr) {
                  console.warn(`[WebRTC ICE Watchdog] Restart failed for ${remotePeerId}:`, recErr);
                } finally {
                  makingOfferRef.current.set(remotePeerId, false);
                }
              }
            }, 6000);
            iceWatchdogsRef.current.set(remotePeerId, timer);
          }
        } else if (iceState === 'disconnected' || iceState === 'failed') {
          if (iceWatchdogsRef.current.has(remotePeerId)) {
            clearTimeout(iceWatchdogsRef.current.get(remotePeerId));
            iceWatchdogsRef.current.delete(remotePeerId);
          }
          setParticipants((prev) => {
            const next = new Map(prev);
            const current = next.get(remotePeerId);
            if (current) {
              next.set(remotePeerId, { ...current, connectionState: 'disconnected' });
            }
            return next;
          });

          console.warn(`[WebRTC ICE] Peer ${remotePeerId} entered ${iceState}, attempting ICE restart...`);
          try {
            if (typeof pc.restartIce === 'function') {
              pc.restartIce();
            }
            if (pc.signalingState === 'stable') {
              makingOfferRef.current.set(remotePeerId, true);
              const restartOffer = await pc.createOffer({ iceRestart: true });
              await pc.setLocalDescription(restartOffer);
              sendSignalling({
                type: 'offer',
                to: remotePeerId,
                offer: pc.localDescription,
              });
            }
          } catch (restartErr) {
            console.warn(`[WebRTC ICE] Restart attempt for ${remotePeerId} failed:`, restartErr);
          } finally {
            makingOfferRef.current.set(remotePeerId, false);
          }
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
      const token =
        localStorage.getItem('tuition_mode_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('auth_token') ||
        '';
      if (!token) {
        setConnectionStatus('failed');
        console.error('[WebRTC] No auth token found in localStorage (checked tuition_mode_token, token, auth_token)');
        return;
      }

      await fetchIceConfig();

      const wsUrl = resolveClassroomWsUrl(sessionId, token);

      setConnectionStatus('connecting');
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }

      ws.onopen = () => {
        setConnectionStatus('connected');
        // Render & proxy keepalive heartbeat (fires every 20s)
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
            } catch {}
          }
        }, 20000);
      };

      ws.onerror = (err) => {
        console.error('[WebRTC WS Error]', err);
        setConnectionStatus('failed');
      };

      ws.onclose = (event) => {
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        if (!isClassEnded) {
          setConnectionStatus('disconnected');
          if (event.reason === 'Replaced by new connection') {
            setEndReason('Disconnected: This account joined from another window or tab. To test two participants simultaneously, open the second account in an Incognito window.');
          }
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
                  makingOfferRef.current.set(p.peerId, true);
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
                } finally {
                  makingOfferRef.current.set(p.peerId, false);
                }
              }
              // Initial whiteboard sync if room has existing strokes
              if ((data as any).whiteboardState && Array.isArray((data as any).whiteboardState) && (data as any).whiteboardState.length > 0) {
                onWhiteboardSyncRef.current?.((data as any).whiteboardState);
              }
              // Hydrate persistent chat history for late joiners
              if ((data as any).chatHistory && Array.isArray((data as any).chatHistory) && (data as any).chatHistory.length > 0) {
                setChatMessages((data as any).chatHistory);
              }
              // Hydrate active assessments in session
              if ((data as any).activeAssessments && Array.isArray((data as any).activeAssessments)) {
                setActiveAssessments((data as any).activeAssessments);
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
              if (iceWatchdogsRef.current.has(peerId)) {
                clearTimeout(iceWatchdogsRef.current.get(peerId));
                iceWatchdogsRef.current.delete(peerId);
              }
              makingOfferRef.current.delete(peerId);

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
                // W3C Perfect Negotiation: polite peer yields on collision, impolite peer ignores colliding offer
                const isPolite = role !== 'host';
                const isCollision = Boolean(makingOfferRef.current.get(from)) || pc.signalingState !== 'stable';

                if (isCollision && !isPolite) {
                  console.warn(`[WebRTC] Glare collision on impolite host from ${from}, ignoring colliding offer`);
                  break;
                }

                if (isCollision && isPolite) {
                  console.log(`[WebRTC] Glare collision on polite peer from ${from}, rolling back local offer`);
                  await pc.setRemoteDescription({ type: 'rollback' });
                }

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
                  if (pc.signalingState === 'have-local-offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    await drainCandidateQueue(from, pc);
                  }
                } catch (ansErr) {
                  console.error(`[WebRTC] Error handling answer from ${from}:`, ansErr);
                }
              }
              break;
            }

            case 'ice-candidate': {
              const { from, candidate } = data;
              if (!candidate || !candidate.candidate) {
                // Ignore empty or end-of-candidate markers safely
                break;
              }
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
              setChatMessages((prev) => {
                if (prev.some((m) => m.id === data.id)) return prev;
                return [
                  ...prev,
                  {
                    id: data.id,
                    senderId: data.senderId,
                    senderName: data.senderName,
                    senderRole: data.senderRole,
                    text: data.text,
                    messageType: data.messageType || 'text',
                    voiceUrl: data.voiceUrl,
                    voiceDuration: data.voiceDuration,
                    attachment: data.attachment,
                    timestamp: data.timestamp,
                  },
                ];
              });
              break;
            }

            case 'assessment:published': {
              const publishedAss = (data as any).assessment;
              if (publishedAss) {
                setActiveAssessments((prev) => {
                  const exists = prev.some((a) => a._id === publishedAss._id);
                  if (exists) return prev.map((a) => (a._id === publishedAss._id ? publishedAss : a));
                  return [publishedAss, ...prev];
                });
                onAssessmentPublishedRef.current?.(publishedAss);
              }
              break;
            }

            case 'assessment:graded': {
              const { assessmentId, submission } = data as any;
              if (assessmentId && submission) {
                setStudentSubmissions((prev) => new Map(prev).set(assessmentId, submission));
                onAssessmentGradedRef.current?.(assessmentId, submission);
              }
              break;
            }

            case 'assessment:results': {
              const { assessmentId, submissions } = data as any;
              if (assessmentId) {
                setActiveAssessments((prev) =>
                  prev.map((a) =>
                    a._id === assessmentId
                      ? {
                          ...a,
                          submissions: submissions || a.submissions,
                        }
                      : a
                  )
                );
                onAssessmentResultsRef.current?.(assessmentId, submissions || []);
              }
              break;
            }

            case 'assessment:closed': {
              const { assessmentId } = data as any;
              if (assessmentId) {
                setActiveAssessments((prev) =>
                  prev.map((a) => (a._id === assessmentId ? { ...a, status: 'closed' } : a))
                );
                onAssessmentClosedRef.current?.(assessmentId);
              }
              break;
            }

            case 'whiteboard:draw':
            case 'whiteboard-draw': {
              if (onWhiteboardDrawRef.current && (data as any).element) {
                onWhiteboardDrawRef.current((data as any).element);
              }
              break;
            }

            case 'whiteboard:clear':
            case 'whiteboard-clear': {
              if (onWhiteboardClearRef.current) {
                onWhiteboardClearRef.current();
              }
              break;
            }

            case 'whiteboard:undo':
            case 'whiteboard-undo': {
              if (onWhiteboardUndoRef.current) {
                onWhiteboardUndoRef.current((data as any).elements);
              }
              break;
            }

            case 'whiteboard:sync-state':
            case 'whiteboard-sync': {
              if (onWhiteboardSyncRef.current && (data as any).elements) {
                onWhiteboardSyncRef.current((data as any).elements);
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
    (
      text: string,
      metadata?: {
        messageType?: 'text' | 'voice' | 'attachment';
        voiceUrl?: string;
        voiceDuration?: number;
        attachment?: {
          name: string;
          url: string;
          fileType?: string;
          size?: number;
        };
      }
    ) => {
      const cleanText = text?.trim() || '';
      if (!cleanText && !metadata?.voiceUrl && !metadata?.attachment) return;
      sendSignalling({
        type: 'chat-message',
        text: cleanText,
        messageType: metadata?.messageType || (metadata?.voiceUrl ? 'voice' : metadata?.attachment ? 'attachment' : 'text'),
        voiceUrl: metadata?.voiceUrl,
        voiceDuration: metadata?.voiceDuration,
        attachment: metadata?.attachment,
      });
    },
    [sendSignalling]
  );

  const broadcastWhiteboardDraw = useCallback(
    (element: any) => {
      sendSignalling({
        type: 'whiteboard:draw',
        element,
      });
    },
    [sendSignalling]
  );

  const broadcastWhiteboardClear = useCallback(() => {
    sendSignalling({
      type: 'whiteboard:clear',
    });
  }, [sendSignalling]);

  const broadcastWhiteboardUndo = useCallback(
    (elements?: any[]) => {
      sendSignalling({
        type: 'whiteboard:undo',
        elements,
      });
    },
    [sendSignalling]
  );

  const broadcastWhiteboardData = useCallback(
    (elements: any[]) => {
      sendSignalling({
        type: 'whiteboard:sync-state',
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

    // Clear all ICE watchdogs & active offer flags
    iceWatchdogsRef.current.forEach((t) => clearTimeout(t));
    iceWatchdogsRef.current.clear();
    makingOfferRef.current.clear();

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();

    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

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
    broadcastWhiteboardDraw,
    broadcastWhiteboardClear,
    broadcastWhiteboardUndo,
    activeAssessments,
    studentSubmissions,
    publishAssessment: (assessment: any) => {
      sendSignalling({
        type: 'assessment:publish',
        assessment,
      });
    },
    submitAssessment: (assessmentId: string, answers: any[]) => {
      sendSignalling({
        type: 'assessment:submit',
        assessmentId,
        answers,
      });
    },
    closeAssessment: (assessmentId: string) => {
      sendSignalling({
        type: 'assessment:close',
        assessmentId,
      });
    },
  };
}

