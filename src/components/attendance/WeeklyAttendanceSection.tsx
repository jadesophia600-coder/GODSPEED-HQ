import React, { useState } from 'react';
import { AttendanceRecord, Member } from '../../types';
import { getWeeklyAttendanceData, WeeklyAttendanceSummary } from '../../lib/supabase';
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart2
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface WeeklyAttendanceSectionProps {
  attendanceRecords: AttendanceRecord[];
  totalMembersCount: number;
  currentUser?: Member;
  isAdmin?: boolean;
}

export const WeeklyAttendanceSection: React.FC<WeeklyAttendanceSectionProps> = ({
  attendanceRecords,
  totalMembersCount,
  currentUser,
  isAdmin = false
}) => {
  const weeklySummaries = getWeeklyAttendanceData(attendanceRecords, totalMembersCount);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  const currentWeek = weeklySummaries[selectedWeekIndex] || weeklySummaries[0];
  if (!currentWeek) return null;

  // Filter records for user if in member mode
  const userRecords = currentUser 
    ? attendanceRecords.filter(r => r.member_id === currentUser.id || r.member_name === currentUser.full_name)
    : [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card p-5 space-y-5">
      
      {/* Header & Week Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Weekly Attendance Tracking & Database Logs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAdmin ? 'System-wide weekly office attendance analytics' : 'Personal 7-day weekly attendance performance record'}
          </p>
        </div>

        {/* Week Switcher Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedWeekIndex(prev => Math.min(prev + 1, weeklySummaries.length - 1))}
            disabled={selectedWeekIndex >= weeklySummaries.length - 1}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200 dark:border-slate-700"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold font-mono border border-slate-200 dark:border-slate-700">
            {currentWeek.weekLabel}
          </span>

          <button
            onClick={() => setSelectedWeekIndex(prev => Math.max(prev - 1, 0))}
            disabled={selectedWeekIndex <= 0}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200 dark:border-slate-700"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekly Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Weekly Attendance Rate
          </div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {currentWeek.attendanceRate}%
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Total Check-ins Saved
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {currentWeek.totalCheckIns}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            On-Time Check-ins
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {currentWeek.presentCount}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Late Check-ins
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {currentWeek.lateCount}
          </div>
        </div>
      </div>

      {/* 7-Day Day-by-Day Breakdown Cards */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
          7-Day Weekly Attendance Calendar
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {currentWeek.dailyBreakdown.map((dayData) => {
            // Find user's record for this day if member mode
            const userDayRec = userRecords.find(r => r.date === dayData.date);
            const isToday = dayData.date === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={dayData.day}
                className={`p-3 rounded-xl border transition-all text-center flex flex-col justify-between ${
                  isToday
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/50'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">
                    <span>{dayData.day}</span>
                    {isToday && <span className="text-blue-500 font-bold text-[9px]">TODAY</span>}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                    {new Date(dayData.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </div>
                </div>

                <div className="my-2 py-1.5">
                  {!isAdmin ? (
                    userDayRec ? (
                      <div className="space-y-1">
                        <StatusBadge status={userDayRec.status === 'ACTIVE' ? 'PRESENT' : userDayRec.status} size="sm" />
                        <p className="text-[10px] text-slate-400 font-mono">{userDayRec.check_in_time}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {isToday ? 'NOT MARKED' : 'UNMARKED'}
                      </span>
                    )
                  ) : (
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {dayData.present + dayData.late} / {totalMembersCount || 1}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {dayData.late > 0 ? `${dayData.late} late` : 'all on-time'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: isAdmin
                        ? `${Math.min(100, Math.round(((dayData.present + dayData.late) / (totalMembersCount || 1)) * 100))}%`
                        : userDayRec ? '100%' : '0%'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
