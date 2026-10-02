import React from 'react';
import { 
  UserPlus, 
  CalendarCheck, 
  CheckSquare, 
  Receipt, 
  UserCheck, 
  Building,
  Clock
} from 'lucide-react';
import { ActivityItem } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface RecentActivityListProps {
  activities: ActivityItem[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'member_registered':
        return <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'attendance_recorded':
        return <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'pv_submitted':
        return <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'payment_received':
        return <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'profile_updated':
        return <UserCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'office_created':
        return <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Live Activity Stream
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time audit log of organization and team events
          </p>
        </div>
        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/40">
          Real-time Sync
        </span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {activities.map((item) => (
          <div key={item.id} className="relative flex items-start justify-between gap-4 group">
            {/* Timeline Node */}
            <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
              <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            </div>

            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getActivityIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.title}
                  </span>
                  {item.status && <StatusBadge status={item.status} size="sm" />}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span>{item.user_name}</span>
                  <span>•</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
