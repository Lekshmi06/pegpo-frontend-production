import React, { useEffect, useRef, useState } from 'react';
import { authService } from '../../services/authService';
import {
  loadGoogleIdentityScript,
  initializeGoogleIdentity,
  renderGoogleButton,
} from '../../services/googleAuthService';
import { MockGoogleAuthModal } from './MockGoogleAuthModal';
import { useToast } from '../../hooks/useToast';
import { UserRole, UserSession } from '../../types/auth';

interface GoogleAuthButtonProps {
  mode: 'signin' | 'signup';
  userType?: UserRole;
  onSuccess: (session: UserSession & { isNewUser?: boolean }) => void;
  onError?: (errorMessage: string) => void;
  className?: string;
  disabled?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode,
  userType,
  onSuccess,
  onError,
  className = '',
  disabled = false,
}) => {
  const toast = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);

  // Explicit testing flag controls whether simulated mock flow is enabled
  const isMockMode =
    (import.meta.env.VITE_ENABLE_MOCK_GOOGLE_AUTH as string | undefined)?.toLowerCase() === 'true';

  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();

  const handleCredentialResponse = async (credential: string) => {
    setIsLoading(true);
    try {
      const session = await authService.googleAuth(
        credential,
        mode === 'signup' ? userType : undefined
      );
      onSuccess(session);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      toast.error(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (err: any) => {
    const msg =
      typeof err === 'string'
        ? err
        : err?.message || 'Google Identity service encountered an error';
    console.warn('[Google Identity Error]:', err);
    toast.error(msg);
    onError?.(msg);
  };

  useEffect(() => {
    let isMounted = true;

    // In mock mode, we do NOT load Google Identity Services or call Google APIs
    if (isMockMode) {
      return;
    }

    if (!clientId) {
      // No client ID configured: fallback button will report visible feedback
      return;
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (!isMounted) return;

        const initialized = initializeGoogleIdentity(
          clientId,
          handleCredentialResponse,
          handleGoogleError
        );

        if (initialized && containerRef.current) {
          const rendered = renderGoogleButton(containerRef.current, {
            mode,
            theme: 'outline',
            shape: 'pill',
            width: 360,
          });
          if (rendered && isMounted) {
            setIsRendered(true);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[Google Identity Script Load Error]:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, mode, userType, isMockMode]);

  const handleButtonClick = () => {
    if (disabled || isLoading) return;

    if (isMockMode) {
      // Open Simulated Google Login Selector
      setIsMockModalOpen(true);
      return;
    }

    if (!clientId) {
      const msg =
        'Google Authentication is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your environment.';
      toast.error(msg);
      onError?.(msg);
      return;
    }

    toast.info('Google Sign-In is initializing. Please click the Google button.');
  };

  const buttonText = mode === 'signup' ? 'Sign Up with Google' : 'Sign In with Google';

  return (
    <>
      <div className={`w-full flex flex-col items-center justify-center ${className}`}>
        {/* Real Mode: Official Google Identity Button Mount Target */}
        {!isMockMode && (
          <div
            ref={containerRef}
            id={`google-${mode}-btn-container`}
            className={`w-full flex justify-center ${isRendered && !isLoading ? 'block' : 'hidden'}`}
          />
        )}

        {/* Fallback button (or Mock Mode Interactive Button) */}
        {(isMockMode || !isRendered || isLoading) && (
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={disabled || isLoading}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              isMockMode
                ? 'bg-amber-50/50 hover:bg-amber-100/60 border-amber-300/80 text-amber-900 hover:border-amber-400'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}

            <span>
              {isLoading
                ? 'Connecting to Google...'
                : isMockMode
                ? `${buttonText} (Simulated Test Mode)`
                : buttonText}
            </span>

            {isMockMode && (
              <span className="text-[10px] uppercase font-black bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded-md tracking-wider shrink-0 ml-1">
                🧪 Test Mode
              </span>
            )}
          </button>
        )}
      </div>

      {/* Simulated Google Authentication Modal */}
      {isMockMode && (
        <MockGoogleAuthModal
          isOpen={isMockModalOpen}
          onClose={() => setIsMockModalOpen(false)}
          mode={mode}
          userType={userType}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}
    </>
  );
};
