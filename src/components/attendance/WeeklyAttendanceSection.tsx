import React, { useState } from 'react';
import { AttendanceRecord, Member } from '../../types';
import { getWeeklyAttendanceData, getCurrentFiveWorkingDays } from '../../lib/supabase';
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Users,
  Check,
  X,
  Minus
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface WeeklyAttendanceSectionProps {
  attendanceRecords: AttendanceRecord[];
  totalMembersCount: number;
  currentUser?: Member;
  allMembers?: Member[];
  isAdmin?: boolean;
}

export const WeeklyAttendanceSection: React.FC<WeeklyAttendanceSectionProps> = ({
  attendanceRecords,
  totalMembersCount,
  currentUser,
  allMembers = [],
  isAdmin = false
}) => {
  const weeklySummaries = getWeeklyAttendanceData(attendanceRecords, totalMembersCount);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  const currentWeek = weeklySummaries[selectedWeekIndex] || weeklySummaries[0];
  if (!currentWeek) return null;

  const fiveDays = getCurrentFiveWorkingDays(currentWeek.startDate);

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
            {isAdmin ? '5-Working-Day Organization Weekly Attendance' : 'My Weekly Attendance (Mon – Fri)'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAdmin 
              ? 'Complete 5-day attendance matrix across all active organization members' 
              : 'Personal 5-working-day check-in status and attendance history'}
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

      {/* 5-Working-Day Overview Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
            THIS WEEK (MON – FRI)
          </h4>
          <span className="text-[11px] font-semibold text-slate-500 font-mono">
            {fiveDays[0]?.monthDayLabel} – {fiveDays[4]?.monthDayLabel}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {fiveDays.map((wd) => {
            const dayBreakdown = currentWeek.dailyBreakdown.find(d => d.date === wd.date);
            const userDayRec = userRecords.find(r => r.date === wd.date);
            const isToday = wd.isToday;

            return (
              <div
                key={wd.day}
                className={`p-3 rounded-xl border transition-all text-center flex flex-col justify-between ${
                  isToday
                    ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/40 shadow-md'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
                    <span>{wd.day}</span>
                    {isToday && <span className="text-blue-600 dark:text-blue-400 font-extrabold text-[9px] bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">TODAY</span>}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                    {wd.monthDayLabel}
                  </div>
                </div>

                <div className="my-2.5">
                  {!isAdmin ? (
                    userDayRec ? (
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          userDayRec.status === 'LATE'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                        }`}>
                          <Check className="w-3 h-3" />
                          {userDayRec.status === 'ACTIVE' ? 'PRESENT' : userDayRec.status}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">{userDayRec.check_in_time}</p>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        wd.isPast
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {wd.isPast ? 'ABSENT' : (isToday ? 'NOT MARKED' : 'PENDING')}
                      </span>
                    )
                  ) : (
                    <div className="space-y-0.5">
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        {(dayBreakdown?.present || 0) + (dayBreakdown?.late || 0)} / {totalMembersCount || 1}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {dayBreakdown?.late && dayBreakdown.late > 0 ? `${dayBreakdown.late} late` : 'on-time'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: isAdmin
                        ? `${Math.min(100, Math.round((((dayBreakdown?.present || 0) + (dayBreakdown?.late || 0)) / (totalMembersCount || 1)) * 100))}%`
                        : userDayRec ? '100%' : '0%'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization-Wide 5-Day Weekly Attendance Matrix for Admin */}
      {isAdmin && allMembers.length > 0 && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              WEEKLY ATTENDANCE MATRIX (MON – FRI)
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> P = Present
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> L = Late
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> A = Absent
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> - = Not Marked
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Organization Member</th>
                  {fiveDays.map(wd => (
                    <th key={wd.day} className="py-2.5 px-3 text-center font-mono">
                      {wd.day} ({wd.monthDayLabel})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {allMembers.slice(0, 15).map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{m.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.member_id} • {m.rank}</div>
                    </td>
                    {fiveDays.map(wd => {
                      const rec = attendanceRecords.find(r => 
                        (r.member_id === m.id || r.member_name === m.full_name) && r.date === wd.date
                      );
                      
                      let code = '-';
                      let color = 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';

                      if (rec) {
                        if (rec.status === 'LATE') {
                          code = 'L';
                          color = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
                        } else if (rec.status === 'ABSENT') {
                          code = 'A';
                          color = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
                        } else {
                          code = 'P';
                          color = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
                        }
                      } else if (wd.isPast) {
                        code = 'A';
                        color = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
                      }

                      return (
                        <td key={wd.day} className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-extrabold ${color}`}>
                            {code}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

