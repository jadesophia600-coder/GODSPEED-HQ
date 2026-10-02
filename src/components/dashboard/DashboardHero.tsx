import React, { useState } from 'react';
import type { Member, UserRole, AttendanceRecord } from '../../types';
import { Calendar, Building, Award, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface DashboardHeroProps {
  user: Member;
  userRole: UserRole;
  todayAttendanceMarked: boolean;
  onQuickMarkAttendance: (eventType: string, officeName: string) => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ 
  user, 
  userRole,
  todayAttendanceMarked,
  onQuickMarkAttendance
}) => {
  const [selectedOffice, setSelectedOffice] = useState(user.office_name || 'Global HQ — London');
  const [selectedEvent, setSelectedEvent] = useState('Weekly Leadership Summit');
  const [isMarking, setIsMarking] = useState(false);

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

  const handleMarkNow = () => {
    setIsMarking(true);
    setTimeout(() => {
      onQuickMarkAttendance(selectedEvent, selectedOffice);
      setIsMarking(false);
    }, 400);
  };

  return (
    <div className="space-y-4 mb-6">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-card">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/50">
                {getGreeting()}, {user.full_name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/50 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-500" /> {user.rank}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
              Office Attendance & Executive HQ Portal
            </h2>

            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
              Mark your daily office attendance, verify session check-ins, and inspect organizational volume performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 md:flex-col md:items-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.office_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Quick Attendance Check-In Banner */}
      <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 shadow-md ${
        todayAttendanceMarked
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100 dark:bg-emerald-950/30'
          : 'bg-gradient-to-r from-blue-900 via-slate-900 to-[#0B132B] border-blue-500/40 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start gap-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              todayAttendanceMarked
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
            }`}>
              {todayAttendanceMarked ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Daily Attendance Check-In
                </span>
                {todayAttendanceMarked ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Marked for Today
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
                    Action Required Today
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-white mt-0.5">
                {todayAttendanceMarked 
                  ? `Attendance Verified for ${user.full_name}`
                  : `Mark Your Attendance for ${formattedDate}`}
              </h3>

              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                {todayAttendanceMarked
                  ? "Your daily attendance has been verified in the Supabase office ledger."
                  : "Select your active office session below and click 'Mark Attendance Now'."}
              </p>
            </div>
          </div>

          {/* Controls & Action Button */}
          {!todayAttendanceMarked ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900/90 text-white rounded-xl border border-slate-700 outline-none"
              >
                <option value="Weekly Leadership Summit">Weekly Leadership Summit</option>
                <option value="Daily Office Huddle">Daily Office Huddle</option>
                <option value="Regional Strategy Briefing">Regional Strategy Briefing</option>
                <option value="Executive Mastermind Session">Executive Mastermind Session</option>
              </select>

              <select
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900/90 text-white rounded-xl border border-slate-700 outline-none"
              >
                <option value="Global HQ — London">Global HQ — London</option>
                <option value="Americas Hub — New York">Americas Hub — New York</option>
                <option value="APAC Region — Singapore">APAC Region — Singapore</option>
                <option value="EMEA Hub — Zurich">EMEA Hub — Zurich</option>
              </select>

              <button
                onClick={handleMarkNow}
                disabled={isMarking}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isMarking ? 'Marking...' : 'Mark Attendance Now'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Session Logged at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
