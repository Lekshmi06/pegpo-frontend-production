const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!envUrl) {
    return '/api';
  }

  // Remove any trailing slashes
  const clean = envUrl.replace(/\/+$/, '');

  // If full HTTP/HTTPS URL provided without '/api' suffix, automatically append it
  if (/^https?:\/\//i.test(clean) && !clean.endsWith('/api')) {
    return `${clean}/api`;
  }

  return clean;
};

export const API_BASE_URL = getApiBaseUrl();

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let normalizedEndpoint = endpoint;
  if (API_BASE_URL.endsWith('/api') && normalizedEndpoint.startsWith('/api')) {
    normalizedEndpoint = normalizedEndpoint.replace(/^\/api/, '');
  }
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${normalizedEndpoint.startsWith('/') ? '' : '/'}${normalizedEndpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Automatically attach authentication & researcher identity headers if available in storage
  const token = localStorage.getItem('token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const researcherId =
    localStorage.getItem('researcherProfileId') ||
    localStorage.getItem('userId') ||
    token;
  if (researcherId && !headers.has('x-researcher-id')) {
    headers.set('x-researcher-id', researcherId);
  }

  const userEmail = localStorage.getItem('userEmail');
  if (userEmail && !headers.has('x-user-email')) {
    headers.set('x-user-email', userEmail);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message = (data && typeof data === 'object' && (data.message || data.error)) || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

/**
 * Resolves static media and uploaded document URLs (e.g. /uploads/assessments/...)
 * ensuring proper domain and protocol resolution across environments.
 */
export const resolveAssetUrl = (url?: string): string => {
  if (!url) return '#';
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    const origin = envUrl.replace(/\/api\/?$/, '');
    return `${origin}${cleanPath}`;
  }
  return cleanPath;
};
