import React from 'react';
import { StatusType } from '../../types';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (normalized === 'ACTIVE' || normalized === 'APPROVED' || normalized === 'PRESENT') {
    colorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50';
  } else if (normalized === 'PENDING') {
    colorClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50';
  } else if (normalized === 'COMPLETED') {
    colorClasses = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50';
  } else if (normalized === 'REJECTED' || normalized === 'INACTIVE' || normalized === 'ABSENT') {
    colorClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50';
  } else if (normalized === 'EXCUSED') {
    colorClasses = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/50';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1 text-sm font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses} tracking-wide uppercase`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        normalized === 'ACTIVE' || normalized === 'APPROVED' ? 'bg-emerald-500' :
        normalized === 'PENDING' ? 'bg-amber-500' :
        normalized === 'COMPLETED' ? 'bg-blue-500' :
        normalized === 'EXCUSED' ? 'bg-indigo-500' : 'bg-rose-500'
      }`} />
      {status}
    </span>
  );
};
