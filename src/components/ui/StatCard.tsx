import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    period?: string;
  };
  subtitle?: string;
  isGold?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  subtitle,
  isGold = false
}) => {
  return (
    <div
      className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-5 transition-all duration-200 shadow-card hover:shadow-card-hover ${
        isGold
          ? 'border-amber-300/80 dark:border-amber-600/40 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900'
          : 'border-slate-200/80 dark:border-slate-800/90'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          {label}
        </span>
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
            isGold
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
          {value}
        </div>

        {trend && (
          <div
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isNeutral
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                : trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40'
            }`}
          >
            {trend.isNeutral ? (
              <Minus className="w-3 h-3 mr-1" />
            ) : trend.isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1 text-rose-600 dark:text-rose-400" />
            )}
            {trend.value}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{subtitle || (trend?.period ? `vs ${trend.period}` : 'Active period')}</span>
        {isGold && (
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-1.5 py-0.5 rounded uppercase">
            Featured KPI
          </span>
        )}
      </div>
    </div>
  );
};
