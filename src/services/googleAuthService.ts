declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            error_callback?: (err: any) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'small' | 'medium' | 'large';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          cancel: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

let isScriptLoading = false;
let scriptPromise: Promise<void> | null = null;

let isInitialized = false;
let initializedClientId: string | null = null;

// Dynamic listeners so multiple components or navigating between /login and /signup
// will not trigger duplicate google.accounts.id.initialize() calls.
type CredentialCallback = (credential: string) => void;
type ErrorCallback = (error: any) => void;

let activeCredentialCallback: CredentialCallback | null = null;
let activeErrorCallback: ErrorCallback | null = null;

/**
 * Ensures the Google Identity Services client script (https://accounts.google.com/gsi/client)
 * is loaded in the DOM.
 */
export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not defined'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    // Check if script tag is already in DOM
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      // Check if it's already loaded or wait for it
      let checkCount = 0;
      const interval = setInterval(() => {
        checkCount++;
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
        } else if (checkCount > 50) {
          clearInterval(interval);
          reject(new Error('Timed out waiting for Google Identity Services script.'));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve();
      } else {
        reject(new Error('Google Identity Services loaded but google.accounts.id is unavailable.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services. Check your internet connection or ad-blocker.'));
    };

    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Initializes Google Identity Services once.
 * Re-uses existing GIS instance when the client ID matches to prevent duplicate
 * initialization warnings from Google's library.
 */
export function initializeGoogleIdentity(
  clientId: string,
  onCredential: CredentialCallback,
  onError?: ErrorCallback
): boolean {
  if (!clientId || !clientId.trim()) {
    return false;
  }

  activeCredentialCallback = onCredential;
  activeErrorCallback = onError || null;

  if (!window.google?.accounts?.id) {
    return false;
  }

  const cleanClientId = clientId.trim();

  // If already initialized with this exact client_id, avoid calling initialize() again
  // to prevent "[GSI_LOGGER]: The library is initialized multiple times" warnings.
  if (isInitialized && initializedClientId === cleanClientId) {
    return true;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: cleanClientId,
      callback: (res) => {
        if (res.credential && activeCredentialCallback) {
          activeCredentialCallback(res.credential);
        }
      },
      error_callback: (err) => {
        if (activeErrorCallback) {
          activeErrorCallback(err);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    isInitialized = true;
    initializedClientId = cleanClientId;
    return true;
  } catch (err) {
    console.warn('[Google Identity] initialize failed:', err);
    return false;
  }
}

/**
 * Renders the official Google button into the provided container element.
 */
export function renderGoogleButton(
  container: HTMLElement,
  options: {
    mode: 'signin' | 'signup';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    width?: number;
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  }
): boolean {
  if (!window.google?.accounts?.id || !container) {
    return false;
  }

  try {
    // Clear previous children to prevent duplicate stacked buttons
    container.innerHTML = '';

    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: options.theme || 'outline',
      size: 'large',
      text: options.mode === 'signup' ? 'signup_with' : 'signin_with',
      shape: options.shape || 'pill',
      logo_alignment: 'left',
      width: options.width || 340,
    });

    return true;
  } catch (err) {
    console.warn('[Google Identity] renderButton failed:', err);
    return false;
  }
}

/**
 * Prompts Google One Tap / credential prompt if available.
 */
export function promptGoogleOneTap(onMoment?: (notification: any) => void): void {
  if (window.google?.accounts?.id) {
    try {
      window.google.accounts.id.prompt(onMoment);
    } catch (err) {
      console.warn('[Google Identity] prompt failed:', err);
    }
  }
}
