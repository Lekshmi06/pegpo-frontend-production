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
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
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
