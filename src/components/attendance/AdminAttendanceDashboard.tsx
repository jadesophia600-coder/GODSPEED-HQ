import React, { useState, useEffect } from 'react';
import { Member, Office, AttendanceRecord, AttendanceSession } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { AdminQRGeneratorModal } from './AdminQRGeneratorModal';
import { WeeklyAttendanceSection } from './WeeklyAttendanceSection';
import { supabase, getWeeklyAttendanceData } from '../../lib/supabase';
import { 
  Users, 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  Search, 
  Filter, 
  Building2, 
  Calendar, 
  TrendingUp, 
  Download, 
  RefreshCw,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AdminAttendanceDashboardProps {
  members: Member[];
  offices: Office[];
  attendanceRecords: AttendanceRecord[];
  currentAdminName?: string;
  onRefreshData?: () => void;
}

export const AdminAttendanceDashboard: React.FC<AdminAttendanceDashboardProps> = ({
  members,
  offices,
  attendanceRecords,
  currentAdminName = 'Administrator',
  onRefreshData
}) => {
  const [showQRGenerator, setShowQRGenerator] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedOffice, setSelectedOffice] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [realtimeRecords, setRealtimeRecords] = useState<AttendanceRecord[]>(attendanceRecords);

  // Sync prop changes
  useEffect(() => {
    setRealtimeRecords(attendanceRecords);
  }, [attendanceRecords]);

  // Subscribe to Supabase Realtime for attendance updates
  useEffect(() => {
    const channel = supabase
      .channel('public:attendance')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance' },
        (payload) => {
          const newRec = payload.new as AttendanceRecord;
          setRealtimeRecords(prev => [newRec, ...prev.filter(r => r.id !== newRec.id)]);
          if (onRefreshData) onRefreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRefreshData]);

  // Compute stats for selected date
  const recordsForDate = realtimeRecords.filter(r => r.date === selectedDate);
  const presentCount = recordsForDate.filter(r => r.status === 'PRESENT' || r.status === 'ACTIVE').length;
  const lateCount = recordsForDate.filter(r => r.status === 'LATE').length;
  const absentCount = recordsForDate.filter(r => r.status === 'ABSENT').length;
  const totalMembersCount = members.length;
  const notMarkedCount = Math.max(0, totalMembersCount - (presentCount + lateCount + absentCount));
  const attendanceRate = totalMembersCount > 0 
    ? Math.round(((presentCount + lateCount) / totalMembersCount) * 100) 
    : 0;

  // Recently registered members sorted by join_date or fallback timestamp
  const sortedRecentMembers = [...members].sort((a, b) => {
    const dateA = a.join_date || '2026-01-01';
    const dateB = b.join_date || '2026-01-01';
    return dateB.localeCompare(dateA);
  }).slice(0, 6);

  // Build rows for table (combining members with attendance records)
  const fullAttendanceRows = members.map(m => {
    const rec = recordsForDate.find(r => r.member_id === m.id || r.member_name === m.full_name);
    let statusVal = 'NOT MARKED';
    if (rec) {
      statusVal = rec.status === 'ACTIVE' ? 'PRESENT' : rec.status;
    }

    return {
      id: m.id,
      member_id: m.member_id,
      member_name: m.full_name,
      office_name: m.office_name || 'GODSPEED Office',
      check_in_time: rec ? rec.check_in_time : '—',
      status: statusVal,
      date: selectedDate
    };
  });

  // Filter rows
  const filteredRows = fullAttendanceRows.filter(r => {
    const matchesSearch = 
      r.member_name.toLowerCase().includes(search.toLowerCase()) ||
      r.member_id.toLowerCase().includes(search.toLowerCase()) ||
      r.office_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesOffice = selectedOffice === 'ALL' || r.office_name === selectedOffice;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchesSearch && matchesOffice && matchesStatus;
  });

  // Live weekly chart data derived from database attendance records
  const weeklySummaries = getWeeklyAttendanceData(realtimeRecords, totalMembersCount);
  const currentWeekData = weeklySummaries[0];
  const chartData = currentWeekData
    ? currentWeekData.dailyBreakdown.slice(0, 5).map(d => ({
        day: d.day,
        Present: d.present,
        Late: d.late
      }))
    : [
        { day: 'Mon', Present: 0, Late: 0 },
        { day: 'Tue', Present: 0, Late: 0 },
        { day: 'Wed', Present: 0, Late: 0 },
        { day: 'Thu', Present: 0, Late: 0 },
        { day: 'Fri', Present: 0, Late: 0 },
      ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER GREETING BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono mb-1">
            {getGreeting()}, {currentAdminName.toUpperCase()}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-amber-400" />
            ORGANIZATION ATTENDANCE COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time workforce monitoring, daily QR session management, and five-day attendance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRGenerator(true)}
            className="px-5 py-3 rounded-xl font-extrabold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
          >
            <QrCode className="w-4 h-4" />
            <span>GENERATE ATTENDANCE QR</span>
          </button>
        </div>
      </div>

      {/* 2. ORGANIZATION OVERVIEW (4 MAJOR STATS + NOT MARKED) */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
          ORGANIZATION OVERVIEW — TODAY ({new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <span>TOTAL MEMBERS</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {totalMembersCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Active registered members</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <span>PRESENT</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {presentCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">On-time check-ins</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <span>LATE</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {lateCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">After 09:15 AM</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <span>ABSENT</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {absentCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Closed session absences</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
              <span>NOT MARKED</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-600 dark:text-slate-300 font-mono">
              {notMarkedCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Session open pending</p>
          </div>

        </div>
      </div>

      {/* 3. ATTENDANCE CONTROL PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-blue-500/30 dark:border-blue-800/40 rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-500" />
              ATTENDANCE CONTROL PANEL
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage today's active QR attendance session for your organization hub.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Hub:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {offices[0]?.name || 'GODSPEED HQ Akure'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                TODAY'S SESSION: <span className="text-emerald-500 font-mono">ACTIVE</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Date: {selectedDate} • Threshold: 09:15 AM
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowQRGenerator(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              GENERATE / DISPLAY QR
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENTLY REGISTERED MEMBERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              RECENTLY REGISTERED MEMBERS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Newest registered members automatically synchronized from Supabase Auth & Member DB.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {members.length} Total Registered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedRecentMembers.map(m => (
            <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-3">
              {m.avatar_url ? (
                <img src={m.avatar_url} alt={m.full_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {m.full_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{m.full_name}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{m.member_id} • {m.rank}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-semibold mt-0.5">
                  Registered {m.join_date ? new Date(m.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. FIVE-DAY ATTENDANCE TRACKER SECTION */}
      <WeeklyAttendanceSection
        attendanceRecords={realtimeRecords}
        totalMembersCount={totalMembersCount}
        allMembers={members}
        isAdmin={true}
      />

      {/* Admin Attendance Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        
        {/* Table Filters Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by member name, ID or office..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-transparent focus:border-blue-500 outline-none"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <select
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                  className="bg-transparent outline-none text-xs"
                >
                  <option value="ALL">All Office Hubs</option>
                  {offices.map(o => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                <Filter className="w-3.5 h-3.5 text-emerald-500" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent outline-none text-xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="NOT MARKED">NOT MARKED</option>
                </select>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200/60 dark:border-slate-700/60 outline-none"
              />
            </div>

          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-5">Member</th>
                <th className="py-3.5 px-5">Member ID</th>
                <th className="py-3.5 px-5">Office Hub</th>
                <th className="py-3.5 px-5">Check-in Time</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No matching member attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100">
                      {r.member_name}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500 dark:text-slate-400">
                      {r.member_id}
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

      {/* Admin QR Generator Modal */}
      {showQRGenerator && (
        <AdminQRGeneratorModal
          offices={offices}
          currentAdminName={currentAdminName}
          onClose={() => setShowQRGenerator(false)}
        />
      )}

    </div>
  );
};
