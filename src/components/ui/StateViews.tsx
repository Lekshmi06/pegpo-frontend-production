import React from 'react';
import { AlertCircle, FolderOpen, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface StateViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const EmptyState: React.FC<StateViewProps> = ({
  title = 'No items found',
  message = 'There are no records to display at this time.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <FolderOpen className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-extrabold text-slate-800 tracking-tight mb-1">{title}</h4>
      <p className="text-xs font-medium text-slate-500 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<StateViewProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load content. Please try again later.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-3xl border border-rose-100">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-extrabold text-rose-900 tracking-tight mb-1">{title}</h4>
      <p className="text-xs font-medium text-rose-600 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Try Again
        </Button>
      )}
    </div>
  );
};
