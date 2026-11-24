import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { EdupyeLogo } from './EdupyeLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('tuition_mode_token');
      localStorage.removeItem('tuition_mode_session');
      localStorage.removeItem('tuition_program_context');
      localStorage.removeItem('tuition_guest_session');
      sessionStorage.removeItem('tuition_code_only_session');
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
            <div className="flex justify-center">
              <EdupyeLogo className="h-7" />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Session Reset</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We encountered an unexpected display issue while transitioning workspace states. Returning to the home dashboard will restore a clean session.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 break-words text-left">
                  <span className="font-bold text-amber-600 dark:text-amber-400">Diagnostic:</span> {this.state.error.message}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
