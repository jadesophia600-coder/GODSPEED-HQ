import React from 'react';
import { Member, UserRole } from '../../types';
import { Calendar, Building, Sparkles, Award } from 'lucide-react';

interface DashboardHeroProps {
  user: Member;
  userRole: UserRole;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ user, userRole }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-card mb-6">
      {/* Soft restrained subtle glow background highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/50">
              {getGreeting()}, {user.full_name.split(' ')[0]}
            </span>
            {userRole === 'super_admin' && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/50 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-500" /> Executive Command
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            {userRole === 'super_admin'
              ? 'Organization Performance Summary'
              : userRole === 'regional_manager'
              ? `${user.office_name} Operational Overview`
              : 'Personal Performance & Earnings Portal'}
          </h2>

          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            {userRole === 'super_admin'
              ? "Here's the live high-level overview of global office metrics, PV submissions, and organization performance."
              : userRole === 'regional_manager'
              ? "Review your office attendance, pending PV approvals, and regional team growth."
              : "Track your personal volume (PV), upcoming dues, quarterly earnings, and downline team activity."}
          </p>
        </div>

        {/* Context Badges */}
        <div className="flex flex-wrap items-center gap-2.5 md:flex-col md:items-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>{user.office_name}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{user.rank}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
