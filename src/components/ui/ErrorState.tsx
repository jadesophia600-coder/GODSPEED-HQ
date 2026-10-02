import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Unable to load information",
  message = "A network or permissions error occurred while requesting live data. Please try again.",
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl">
      <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200 mb-1">{title}</h4>
      <p className="text-xs text-rose-700 dark:text-rose-400 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-200 bg-white dark:bg-rose-900/60 border border-rose-300 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};
