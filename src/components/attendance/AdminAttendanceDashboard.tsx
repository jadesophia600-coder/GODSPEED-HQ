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
  Activity,
  UserPlus,
  Mail,
  Phone,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AdminAttendanceDashboardProps {
  members: Member[];
  offices: Office[];
  attendanceRecords: AttendanceRecord[];
  currentAdminName?: string;
  onRefreshData?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onSelectMember?: (member: Member) => void;
}

export const AdminAttendanceDashboard: React.FC<AdminAttendanceDashboardProps> = ({
  members,
  offices,
  attendanceRecords,
  currentAdminName = 'Administrator',
  onRefreshData,
  isLoading = false,
  error = null,
  onSelectMember
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

  // Subscribe to Supabase Realtime for attendance and members updates
  useEffect(() => {
    const channel = supabase
      .channel('admin_dashboard_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance' },
        (payload) => {
          const newRec = payload.new as AttendanceRecord;
          setRealtimeRecords(prev => [newRec, ...prev.filter(r => r.id !== newRec.id)]);
          if (onRefreshData) onRefreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => {
          if (onRefreshData) onRefreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          if (onRefreshData) onRefreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRefreshData]);

  // Compute key stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalMembersCount = members.length;

  const newMembersTodayCount = members.filter(m => {
    if (!m.join_date) return false;
    return m.join_date.startsWith(todayStr);
  }).length;

  const recordsForDate = realtimeRecords.filter(r => r.date === selectedDate);
  const presentCount = recordsForDate.filter(r => r.status === 'PRESENT' || r.status === 'ACTIVE').length;
  const lateCount = recordsForDate.filter(r => r.status === 'LATE').length;
  const absentCount = recordsForDate.filter(r => r.status === 'ABSENT').length;
  const notMarkedCount = Math.max(0, totalMembersCount - (presentCount + lateCount + absentCount));

  // Sort members by join_date or timestamp descending (newest on top)
  const sortedMembersByDate = [...members].sort((a, b) => {
    const dateA = a.join_date ? new Date(a.join_date).getTime() : 0;
    const dateB = b.join_date ? new Date(b.join_date).getTime() : 0;
    return dateB - dateA;
  });

  const newestMembers = sortedMembersByDate.slice(0, 8);

  const isRecentNewMember = (joinDateStr?: string) => {
    if (!joinDateStr) return false;
    if (joinDateStr.startsWith(todayStr)) return true;
    const joinTime = new Date(joinDateStr).getTime();
    if (isNaN(joinTime)) return false;
    const diffHours = (Date.now() - joinTime) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 48;
  };

  const formatRegistrationTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'Registered recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return `Registered ${dateStr}`;
    
    const isToday = dateStr.startsWith(todayStr);
    const timeFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (isToday) {
      return `Registered Today, ${timeFormatted}`;
    }
    return `Registered ${dateFormatted}`;
  };

  // Build rows for ALL MEMBERS table
  const fullMemberRows = sortedMembersByDate.map(m => {
    const rec = recordsForDate.find(r => r.member_id === m.id || r.member_name === m.full_name);
    let statusVal = 'NOT MARKED';
    if (rec) {
      statusVal = rec.status === 'ACTIVE' ? 'PRESENT' : rec.status;
    }

    return {
      memberObj: m,
      id: m.id,
      member_id: m.member_id,
      member_name: m.full_name,
      email: m.email,
      phone: m.phone || '—',
      office_name: m.office_name || 'GODSPEED Office',
      role: m.role === 'super_admin' ? 'Admin Executive' : (m.rank || 'Member'),
      join_date: m.join_date,
      status: m.status || 'ACTIVE',
      attendance_status: statusVal
    };
  });

  // Filter rows
  const filteredMemberRows = fullMemberRows.filter(r => {
    const matchesSearch = 
      r.member_name.toLowerCase().includes(search.toLowerCase()) ||
      r.member_id.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.office_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesOffice = selectedOffice === 'ALL' || r.office_name === selectedOffice;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus || r.attendance_status === selectedStatus;

    return matchesSearch && matchesOffice && matchesStatus;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div className="space-y-8">
      
      {/* 1. TOP HEADER GREETING BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {getGreeting()}, {currentAdminName.toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-amber-400 shrink-0" />
            GODSPEED HQ ADMIN COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-300 mt-1.5 max-w-2xl">
            Real-time member directory management, automatic Supabase new registration tracking, daily QR session management, and weekly attendance logs.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onRefreshData && onRefreshData()}
            className="px-4 py-3 rounded-xl font-bold text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all flex items-center gap-2"
            title="Refresh Data from Supabase"
          >
            <RefreshCw className="w-4 h-4 text-blue-400" />
            <span>SYNC SUPABASE</span>
          </button>

          <button
            onClick={() => setShowQRGenerator(true)}
            className="px-5 py-3 rounded-xl font-extrabold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
          >
            <QrCode className="w-4 h-4" />
            <span>GENERATE ATTENDANCE QR</span>
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-5 text-rose-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-rose-200">Unable to load members.</p>
              <p className="text-[11px] text-rose-400 mt-0.5">There was a connectivity issue retrieving registered members from Supabase.</p>
            </div>
          </div>
          <button
            onClick={() => onRefreshData && onRefreshData()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition-all shrink-0"
          >
            [ Retry ]
          </button>
        </div>
      )}

      {/* 2. KPI CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
            ORGANIZATION METRICS & DAILY ATTENDANCE SUMMARY
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: TOTAL MEMBERS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:border-blue-500/50 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                <span>TOTAL MEMBERS</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {totalMembersCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Active registered organization members</p>
            </div>

            {/* CARD 2: NEW MEMBERS TODAY */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-800/40 rounded-2xl p-5 shadow-card hover:border-emerald-500/60 transition-colors bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                <span>NEW MEMBERS TODAY</span>
                <UserPlus className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {newMembersTodayCount}
              </div>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium">
                {newMembersTodayCount === 1 ? '1 new member registered today' : `${newMembersTodayCount} new members registered today`}
              </p>
            </div>

            {/* CARD 3: PRESENT TODAY */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                <span>PRESENT TODAY</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {presentCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">On-time QR scanner check-ins</p>
            </div>

            {/* CARD 4: LATE TODAY */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:border-amber-500/50 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                <span>LATE TODAY</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                {lateCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Checked in after 09:15 AM</p>
            </div>

          </div>
        )}
      </div>

      {/* 3. NEW MEMBERS SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-500" />
              NEW MEMBERS
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Newest organization members automatically synchronized from Supabase registration.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20 self-start sm:self-auto">
            {newMembersTodayCount} Registered Today
          </span>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : newestMembers.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <Users className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">NO NEW MEMBERS</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Newly registered members will appear here automatically as soon as they complete registration on the website.
            </p>
          </div>
        ) : (
          /* NEWEST MEMBERS CARDS GRID (Sorted Newest to Oldest) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {newestMembers.map(m => {
              const isNew = isRecentNewMember(m.join_date);
              return (
                <div 
                  key={m.id}
                  onClick={() => onSelectMember && onSelectMember(m)}
                  className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt={m.full_name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/30 flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0 shadow-md">
                          {m.full_name ? m.full_name.slice(0, 2).toUpperCase() : 'GS'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate group-hover:text-blue-500 transition-colors">
                            {m.full_name}
                          </h4>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                          {m.member_id}
                        </div>
                      </div>
                    </div>

                    {isNew && (
                      <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/50 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="truncate flex items-center gap-1 text-slate-500">
                        <Mail className="w-3 h-3 text-blue-400 shrink-0" />
                        {m.email}
                      </span>
                    </div>
                    {m.phone && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{m.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans">
                        {m.office_name || 'GODSPEED HQ'}
                      </span>
                      <StatusBadge status={m.status || 'ACTIVE'} size="sm" />
                    </div>
                  </div>

                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-semibold pt-1 flex items-center justify-between">
                    <span>{formatRegistrationTimestamp(m.join_date)}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ALL MEMBERS DIRECTORY SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-card overflow-hidden">
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                ALL AUTHORIZED MEMBERS ({filteredMemberRows.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete authorized team directory retrieved directly from Supabase.
              </p>
            </div>
          </div>

          {/* Table Filters & Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by member name, ID, email or office..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-transparent focus:border-blue-500 outline-none"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
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

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                <Filter className="w-3.5 h-3.5 text-emerald-500" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent outline-none text-xs"
                >
                  <option value="ALL">All Account Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PRESENT">PRESENT TODAY</option>
                  <option value="LATE">LATE TODAY</option>
                  <option value="NOT MARKED">NOT MARKED</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* All Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Member ID</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Office</th>
                <th className="py-4 px-6">Role / Rank</th>
                <th className="py-4 px-6">Registered</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              {filteredMemberRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No matching member records found.
                  </td>
                </tr>
              ) : (
                filteredMemberRows.map((r) => (
                  <tr 
                    key={r.id} 
                    onClick={() => onSelectMember && onSelectMember(r.memberObj)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                      {r.memberObj.avatar_url ? (
                        <img src={r.memberObj.avatar_url} alt={r.member_name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                          {r.member_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span>{r.member_name}</span>
                      {isRecentNewMember(r.join_date) && (
                        <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-400 font-semibold">
                      {r.member_id}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">
                      {r.email}
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                      {r.office_name}
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">
                      {r.role}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {r.join_date ? new Date(r.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 5. TODAY'S ATTENDANCE CONTROL & FIVE-DAY TRACKER SECTION */}
      <div className="space-y-6">
        
        {/* ATTENDANCE CONTROL PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-blue-500/30 dark:border-blue-800/40 rounded-3xl p-6 shadow-card space-y-4">
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
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
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                GENERATE / DISPLAY QR
              </button>
            </div>
          </div>
        </div>

        {/* FIVE-DAY ATTENDANCE TRACKER SECTION */}
        <WeeklyAttendanceSection
          attendanceRecords={realtimeRecords}
          totalMembersCount={totalMembersCount}
          allMembers={members}
          isAdmin={true}
        />
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

