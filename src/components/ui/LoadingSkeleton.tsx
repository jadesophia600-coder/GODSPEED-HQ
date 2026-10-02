import React from 'react';

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card">
    <div className="flex items-center justify-between mb-3">
      <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded skeleton-shimmer" />
      <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-800 skeleton-shimmer" />
    </div>
    <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2 skeleton-shimmer" />
    <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded skeleton-shimmer" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-card">
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
      <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded skeleton-shimmer" />
      <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg skeleton-shimmer" />
    </div>
    <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 skeleton-shimmer" />
            <div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-1.5 skeleton-shimmer" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded skeleton-shimmer" />
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full skeleton-shimmer" />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card">
    <div className="flex justify-between items-center mb-6">
      <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded skeleton-shimmer" />
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded skeleton-shimmer" />
    </div>
    <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/40 rounded-lg skeleton-shimmer" />
  </div>
);
