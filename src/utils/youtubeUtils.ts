/**
 * YouTube URL Parsing, Validation, and Normalization Utility
 *
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID (and m.youtube.com, query params like t=, start=, list=)
 * - https://youtu.be/VIDEO_ID (short links, with ?t= or ?start=)
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - URLs without explicit scheme (e.g. www.youtube.com/watch?v=...)
 */

export interface YouTubeVideoInfo {
  videoId: string;
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string;
  startTime?: number; // In seconds
  endTime?: number;
  playlistId?: string;
}

export interface ParseYouTubeResult {
  isValid: boolean;
  isYouTube: boolean;
  info?: YouTubeVideoInfo;
  error?: string;
}

export interface VideoValidationResult {
  isValid: boolean;
  isYouTube: boolean;
  isDirectVideo: boolean;
  embedUrl?: string;
  youtubeInfo?: YouTubeVideoInfo;
  error?: string;
}

// Exactly 11 characters: alphanumeric, hyphen, underscore
export const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

/**
 * Parse time string (e.g. "90", "90s", "1m30s", "1h2m30s") into seconds
 */
export function parseYouTubeTimestamp(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();

  // Pure digits: "120"
  if (/^\d+$/.test(trimmed)) {
    const s = parseInt(trimmed, 10);
    return isNaN(s) || s < 0 ? undefined : s;
  }

  // Digits with 's': "120s"
  if (/^\d+s$/i.test(trimmed)) {
    const s = parseInt(trimmed.slice(0, -1), 10);
    return isNaN(s) || s < 0 ? undefined : s;
  }

  // Format like 1h2m30s, 2m15s, 1h45s
  const match = trimmed.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (match && (match[1] || match[2] || match[3])) {
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    const total = hours * 3600 + minutes * 60 + seconds;
    return total >= 0 ? total : undefined;
  }

  return undefined;
}

/**
 * Format seconds into a friendly human-readable timestamp (e.g. "1:30" or "1:02:15")
 */
export function formatSecondsToTimestamp(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '0:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Check if a URL or host belongs to YouTube
 */
export function isYouTubeHost(urlOrHost: string): boolean {
  if (!urlOrHost) return false;
  let normalized = urlOrHost.trim().toLowerCase();

  // If full URL, parse hostname
  try {
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    const parsed = new URL(normalized);
    return YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    // Check if contains youtube.com or youtu.be
    return /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(urlOrHost);
  }
}

/**
 * Parse and validate any supported YouTube URL format.
 * Returns normalized embed URL using youtube-nocookie.com, watch URL, thumbnail, and extracted params.
 */
export function parseYouTubeUrl(rawUrl: string): ParseYouTubeResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      isYouTube: false,
      error: 'URL is required.',
    };
  }

  let trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      isYouTube: false,
      error: 'URL cannot be empty.',
    };
  }

  // Prepend https:// if scheme is missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      isYouTube: false,
      error: 'Malformed URL format.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isYt = YOUTUBE_HOSTS.has(hostname);

  if (!isYt) {
    return {
      isValid: false,
      isYouTube: false,
      error: 'Not a YouTube URL.',
    };
  }

  let videoId: string | null = null;
  const pathname = parsed.pathname;

  // Case 1: youtu.be/<VIDEO_ID>
  if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      videoId = segments[0];
    }
  }
  // Case 2: youtube.com/watch?v=<VIDEO_ID>
  else if (pathname === '/watch' || pathname === '/watch/') {
    videoId = parsed.searchParams.get('v');
  }
  // Case 3: youtube.com/embed/<VIDEO_ID>
  else if (pathname.startsWith('/embed/')) {
    const segments = pathname.replace('/embed/', '').split('/').filter(Boolean);
    if (segments.length > 0) {
      videoId = segments[0];
    }
  }
  // Case 4: youtube.com/shorts/<VIDEO_ID>
  else if (pathname.startsWith('/shorts/')) {
    const segments = pathname.replace('/shorts/', '').split('/').filter(Boolean);
    if (segments.length > 0) {
      videoId = segments[0];
    }
  }
  // Case 5: youtube.com/live/<VIDEO_ID>
  else if (pathname.startsWith('/live/')) {
    const segments = pathname.replace('/live/', '').split('/').filter(Boolean);
    if (segments.length > 0) {
      videoId = segments[0];
    }
  }
  // Case 6: legacy youtube.com/v/<VIDEO_ID>
  else if (pathname.startsWith('/v/')) {
    const segments = pathname.replace('/v/', '').split('/').filter(Boolean);
    if (segments.length > 0) {
      videoId = segments[0];
    }
  }

  if (!videoId) {
    return {
      isValid: false,
      isYouTube: true,
      error: 'Could not find YouTube video ID in the provided link.',
    };
  }

  // Validate the 11-character video ID
  if (!YOUTUBE_VIDEO_ID_REGEX.test(videoId)) {
    return {
      isValid: false,
      isYouTube: true,
      error: `Invalid YouTube video ID "${videoId}". Video IDs must be exactly 11 alphanumeric characters.`,
    };
  }

  // Extract query parameters: start/t, end, list
  const rawStart = parsed.searchParams.get('start') || parsed.searchParams.get('t');
  const startTime = parseYouTubeTimestamp(rawStart);

  const rawEnd = parsed.searchParams.get('end');
  const endTime = rawEnd && /^\d+$/.test(rawEnd) ? parseInt(rawEnd, 10) : undefined;

  const playlistId = parsed.searchParams.get('list') || undefined;

  // Build secure, privacy-friendly youtube-nocookie.com embed URL
  const embedParams = new URLSearchParams();
  if (startTime !== undefined && startTime > 0) {
    embedParams.set('start', startTime.toString());
  }
  if (endTime !== undefined && endTime > 0) {
    embedParams.set('end', endTime.toString());
  }
  if (playlistId) {
    embedParams.set('list', playlistId);
  }
  // Best practice embed settings: rel=0, enablejsapi=1
  embedParams.set('rel', '0');

  const embedParamStr = embedParams.toString();
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}${
    embedParamStr ? `?${embedParamStr}` : ''
  }`;

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}${
    startTime ? `&t=${startTime}s` : ''
  }`;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return {
    isValid: true,
    isYouTube: true,
    info: {
      videoId,
      embedUrl,
      watchUrl,
      thumbnailUrl,
      startTime,
      endTime,
      playlistId,
    },
  };
}

/**
 * Validate any video URL supplied for a course lesson.
 * Checks whether it's a YouTube URL or a direct video link (mp4, webm, etc.)
 */
export function validateLessonVideoUrl(rawUrl: string | undefined): VideoValidationResult {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isValid: true,
      isYouTube: false,
      isDirectVideo: false,
    };
  }

  const trimmed = rawUrl.trim();

  // Disallow dangerous URI schemes (XSS prevention)
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return {
      isValid: false,
      isYouTube: false,
      isDirectVideo: false,
      error: 'Unsafe URL scheme detected. Only HTTP/HTTPS URLs are permitted.',
    };
  }

  // Check if it's a YouTube link
  if (isYouTubeHost(trimmed)) {
    const ytResult = parseYouTubeUrl(trimmed);
    if (!ytResult.isValid) {
      return {
        isValid: false,
        isYouTube: true,
        isDirectVideo: false,
        error: ytResult.error || 'Invalid YouTube URL.',
      };
    }
    return {
      isValid: true,
      isYouTube: true,
      isDirectVideo: false,
      embedUrl: ytResult.info?.embedUrl,
      youtubeInfo: ytResult.info,
    };
  }

  // Check if it's a valid web URL
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        isYouTube: false,
        isDirectVideo: false,
        error: 'Only HTTP and HTTPS video links are supported.',
      };
    }

    return {
      isValid: true,
      isYouTube: false,
      isDirectVideo: true,
      embedUrl: trimmed,
    };
  } catch {
    return {
      isValid: false,
      isYouTube: false,
      isDirectVideo: false,
      error: 'Invalid video URL format. Please provide a valid web address.',
    };
  }
}
