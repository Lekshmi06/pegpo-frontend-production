import { RTCIceServerConfig, WebRTCConfiguration } from '../types/webrtc';

export const DEFAULT_STUN_SERVERS: RTCIceServerConfig[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
];

/**
 * Returns dynamic WebRTC configuration with STUN and production TURN servers.
 * Reads environment variables:
 * - VITE_TURN_URL: comma-separated or single TURN server URL(s)
 * - VITE_TURN_USERNAME: TURN authentication username
 * - VITE_TURN_CREDENTIAL: TURN authentication credential / password
 */
export function getClientWebRTCConfig(): WebRTCConfiguration {
  const iceServers: RTCIceServerConfig[] = [...DEFAULT_STUN_SERVERS];

  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (turnUrl && typeof turnUrl === 'string') {
    const urls = turnUrl
      .split(/[,\s]+/)
      .map((u: string) => u.trim())
      .filter(Boolean);

    if (urls.length > 0) {
      // Add grouped config for modern clients
      const turnConfig: RTCIceServerConfig = { urls };
      if (turnUsername) turnConfig.username = turnUsername;
      if (turnCredential) turnConfig.credential = turnCredential;
      iceServers.push(turnConfig);

      // Add individual server configs to maximize compatibility across WebRTC stacks
      urls.forEach((singleUrl) => {
        const singleConfig: RTCIceServerConfig = { urls: singleUrl };
        if (turnUsername) singleConfig.username = turnUsername;
        if (turnCredential) singleConfig.credential = turnCredential;
        iceServers.push(singleConfig);
      });
    }
  }

  return {
    iceServers,
    iceTransportPolicy: 'all',
  };
}
