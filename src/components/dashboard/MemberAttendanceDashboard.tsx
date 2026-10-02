import React, { useState } from 'react';
import { Member, AttendanceRecord } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { QRScannerModal } from '../attendance/QRScannerModal';
import { 
  QrCode, 
  CalendarCheck, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  User, 
  Award, 
  Users, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface MemberAttendanceDashboardProps {
  user: Member;
  attendanceRecords: AttendanceRecord[];
  onAttendanceMarkedSuccess?: (record: AttendanceRecord) => void;
  onNavigateTab?: (tab: string) => void;
}

export const MemberAttendanceDashboard: React.FC<MemberAttendanceDashboardProps> = ({
  user,
  attendanceRecords,
  onAttendanceMarkedSuccess,
  onNavigateTab
}) => {
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  
  // Filter user's own records
  const myRecords = attendanceRecords.filter(
    r => r.member_id === user.id || r.member_name === user.full_name
  );

  // Check today's status
  const todayRecord = myRecords.find(r => r.date === todayStr);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate user stats
  const totalCheckIns = myRecords.length;
  const presentDays = myRecords.filter(r => r.status === 'PRESENT' || r.status === 'ACTIVE').length;
  const lateDays = myRecords.filter(r => r.status === 'LATE').length;
  const attendanceRate = totalCheckIns > 0 ? Math.round((presentDays / totalCheckIns) * 100) : 100;

  const handleScanSuccess = (record: AttendanceRecord) => {
    setShowScannerModal(false);
    if (onAttendanceMarkedSuccess) {
      onAttendanceMarkedSuccess(record);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP WELCOME & ATTENDANCE HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0B132B] via-slate-900 to-[#1C2541] rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
                {getGreeting()}, {user.full_name}
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" /> {user.rank}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Daily Attendance Management
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Verify your daily office presence using the secure QR Code scanner below.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{user.office_name || 'GODSPEED Office'}</span>
              </div>
            </div>
          </div>

          {/* ATTENDANCE CARD & ACTION */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 min-w-[280px]">
            
            <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-slate-800">
              <span className="text-slate-400 uppercase font-bold tracking-wider">Today's Status</span>
              {todayRecord ? (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  todayRecord.status === 'LATE'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {todayRecord.status}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase">
                  NOT MARKED
                </span>
              )}
            </div>

            {todayRecord ? (
              <div className="py-2 space-y-1">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white">Attendance Verified</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Checked in at {todayRecord.check_in_time}
                </p>
              </div>
            ) : (
              <div className="py-1 space-y-2">
                <p className="text-xs text-slate-300">
                  Ready to mark your presence for today?
                </p>

                <button
                  onClick={() => setShowScannerModal(true)}
                  className="w-full py-3 px-6 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2.5 transform hover:scale-[1.03] active:scale-95 animate-pulse"
                >
                  <QrCode className="w-5 h-5" />
                  <span>SCAN QR CODE</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 2. ATTENDANCE SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
            <span>Attendance Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {attendanceRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Verified check-in consistency
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
            <span>Days Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {presentDays}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            On-time attendance records
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
            <span>Late Check-ins</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {lateDays}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Arrivals after 09:15 AM
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
            <span>Total Logged</span>
            <CalendarCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {totalCheckIns}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total attendance sessions
          </p>
        </div>

      </div>

      {/* 3. RECENT ATTENDANCE HISTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-500" />
              My Attendance History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal daily check-in verification records
            </p>
          </div>

          <button
            onClick={() => setShowScannerModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" /> Scan QR
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Office Hub</th>
                <th className="py-3.5 px-5">Check-in Time</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No attendance records found yet. Click 'Scan QR Code' to record your attendance.
                  </td>
                </tr>
              ) : (
                myRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {r.date}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300">
                      {r.office_name}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600 dark:text-slate-400">
                      {r.check_in_time}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <StatusBadge status={r.status === 'ACTIVE' ? 'PRESENT' : r.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. QUICK ACCESS LINKS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab && onNavigateTab('members')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all text-left group"
        >
          <User className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">My Profile</h4>
          <p className="text-[11px] text-slate-400">View rank & details</p>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('genealogy')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all text-left group"
        >
          <Users className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">My Team</h4>
          <p className="text-[11px] text-slate-400">Genealogy downline</p>
        </button>

        <button
          onClick={() => setShowScannerModal(true)}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-amber-500/50 transition-all text-left group"
        >
          <QrCode className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Scan QR Code</h4>
          <p className="text-[11px] text-slate-400">Record attendance</p>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('settings')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-purple-500/50 transition-all text-left group"
        >
          <ShieldCheck className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Settings</h4>
          <p className="text-[11px] text-slate-400">Account governance</p>
        </button>
      </div>

      {/* SCANNER MODAL */}
      {showScannerModal && (
        <QRScannerModal
          currentMember={user}
          onClose={() => setShowScannerModal(false)}
          onSuccess={handleScanSuccess}
        />
      )}

    </div>
  );
};
