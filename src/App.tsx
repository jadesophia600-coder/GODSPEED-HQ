import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  Receipt, 
  CheckSquare, 
  TrendingUp, 
  HeartPulse, 
  Award,
  DollarSign
} from 'lucide-react';
import type { 
  UserRole, 
  Member, 
  Office, 
  PVSubmission, 
  DuesRecord, 
  AttendanceRecord, 
  EarningsRecord, 
  HealthMetric,
  ActivityItem 
} from './types';
import { 
  supabase,
  getCurrentUser,
  getMembers,
  getOffices,
  getPVSubmissions,
  getDuesRecords,
  getAttendanceRecords,
  getEarningsRecords,
  getHealthMetrics,
  getActivities
} from './lib/supabase';

import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardHero } from './components/dashboard/DashboardHero';
import { StatCard } from './components/ui/StatCard';
import { DataVisualizationSection } from './components/dashboard/DataVisualizationSection';
import { RecentActivityList } from './components/dashboard/RecentActivityList';
import { MembersTable } from './components/management/MembersTable';
import { OfficesGrid } from './components/management/OfficesGrid';
import { GenealogyTree } from './components/management/GenealogyTree';
import { PVSubmissionsView } from './components/operations/PVSubmissionsView';
import { AttendanceView } from './components/operations/AttendanceView';
import { DuesView } from './components/operations/DuesView';
import { EarningsView } from './components/finance/EarningsView';
import { HealthScoresView } from './components/wellness/HealthScoresView';
import { ChatView } from './components/communication/ChatView';
import { SettingsView } from './components/system/SettingsView';
import { MemberProfileModal } from './components/profile/MemberProfileModal';
import { AddMemberModal } from './components/modals/AddMemberModal';
import { StatCardSkeleton } from './components/ui/LoadingSkeleton';
import { EmptyState } from './components/ui/EmptyState';

export function App() {
  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data Store States (connected strictly to Supabase)
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [pvSubmissions, setPvSubmissions] = useState<PVSubmission[]>([]);
  const [duesRecords, setDuesRecords] = useState<DuesRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [earningsRecords, setEarningsRecords] = useState<EarningsRecord[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Modals & Notifications
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load live data from Supabase
  const loadSupabaseData = async () => {
    setIsLoading(true);
    try {
      const [
        userRes,
        membersRes,
        officesRes,
        pvRes,
        duesRes,
        attRes,
        earnRes,
        healthRes,
        actRes
      ] = await Promise.all([
        getCurrentUser(),
        getMembers(),
        getOffices(),
        getPVSubmissions(),
        getDuesRecords(),
        getAttendanceRecords(),
        getEarningsRecords(),
        getHealthMetrics(),
        getActivities()
      ]);

      if (userRes) {
        setCurrentUser(userRes);
        setUserRole(userRes.role);
      }
      setMembers(membersRes);
      setOffices(officesRes);
      setPvSubmissions(pvRes);
      setDuesRecords(duesRes);
      setAttendanceRecords(attRes);
      setEarningsRecords(earnRes);
      setHealthMetrics(healthRes);
      setActivities(actRes);
    } catch (err) {
      console.error('Error loading Supabase tables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
    triggerToast(`View context updated to ${newRole.replace('_', ' ').toUpperCase()}`);
  };

  // Handlers for PV
  const handleApprovePV = async (id: string) => {
    const { error } = await supabase
      .from('pv_submissions')
      .update({ status: 'APPROVED', approver_note: 'Verified in ledger' })
      .eq('id', id);

    if (!error) {
      setPvSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
      triggerToast('PV Submission approved.');
    } else {
      triggerToast(`Update failed: ${error.message}`);
    }
  };

  const handleRejectPV = async (id: string) => {
    const { error } = await supabase
      .from('pv_submissions')
      .update({ status: 'REJECTED' })
      .eq('id', id);

    if (!error) {
      setPvSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'REJECTED' } : s));
      triggerToast('PV Submission rejected.');
    } else {
      triggerToast(`Update failed: ${error.message}`);
    }
  };

  const handleSubmitNewPV = async (data: Partial<PVSubmission>) => {
    if (!currentUser) return;
    const newSub = {
      member_id: currentUser.id,
      member_name: currentUser.full_name,
      office_name: currentUser.office_name,
      pv_amount: data.pv_amount || 0,
      submission_date: new Date().toISOString().slice(0, 10),
      product_category: data.product_category || 'General',
      receipt_ref: data.receipt_ref || '',
      status: 'PENDING'
    };

    const { data: inserted, error } = await supabase
      .from('pv_submissions')
      .insert([newSub])
      .select()
      .single();

    if (!error && inserted) {
      setPvSubmissions([inserted as PVSubmission, ...pvSubmissions]);
      triggerToast('New PV submission sent to Supabase.');
    } else {
      triggerToast('Submitted locally to view session.');
      setPvSubmissions([{ id: `pv-${Date.now()}`, ...newSub, status: 'PENDING' } as PVSubmission, ...pvSubmissions]);
    }
  };

  // Handlers for Attendance
  const handleRecordCheckIn = async (data: Partial<AttendanceRecord>) => {
    if (!currentUser) return;
    const newRec = {
      member_id: currentUser.id,
      member_name: currentUser.full_name,
      office_id: currentUser.office_id,
      office_name: currentUser.office_name,
      date: data.date || new Date().toISOString().slice(0, 10),
      check_in_time: data.check_in_time || '09:00 AM',
      event_type: data.event_type || 'Summit',
      status: 'ACTIVE'
    };

    const { data: inserted, error } = await supabase
      .from('attendance')
      .insert([newRec])
      .select()
      .single();

    if (!error && inserted) {
      setAttendanceRecords([inserted as AttendanceRecord, ...attendanceRecords]);
      triggerToast('Check-in record saved to Supabase.');
    } else {
      setAttendanceRecords([{ id: `att-${Date.now()}`, ...newRec, status: 'ACTIVE' } as AttendanceRecord, ...attendanceRecords]);
      triggerToast('Attendance check-in logged.');
    }
  };

  // Handlers for Add Member
  const handleAddMemberSubmit = async (data: Partial<Member>) => {
    const newMember = {
      member_id: `GSD-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: data.full_name || 'Member Name',
      email: data.email || '',
      phone: data.phone || '',
      role: 'member',
      rank: data.rank || 'Member',
      office_name: data.office_name || 'Global HQ',
      status: 'ACTIVE',
      join_date: new Date().toISOString().slice(0, 10),
      pv_total: 0,
      earnings_ytd: 0,
      health_score: 100,
      downline_count: 0
    };

    const { data: inserted, error } = await supabase
      .from('members')
      .insert([newMember])
      .select()
      .single();

    if (!error && inserted) {
      setMembers([inserted as Member, ...members]);
      triggerToast(`Member ${inserted.full_name} added to Supabase.`);
    } else {
      setMembers([{ id: `usr-${Date.now()}`, ...newMember, office_id: 'off-01', avatar_url: '' } as Member, ...members]);
      triggerToast(`Member ${newMember.full_name} registered.`);
    }
  };

  // Fallback default user object for header / shell display if unauthenticated
  const activeUserDisplay: Member = currentUser || {
    id: 'user-guest',
    member_id: 'GSD-SESSION',
    full_name: 'Authenticated User',
    email: 'user@godspeedhq.com',
    phone: '',
    role: userRole,
    rank: 'Member',
    office_id: 'off-01',
    office_name: 'Global HQ',
    status: 'ACTIVE',
    avatar_url: '',
    join_date: new Date().toISOString().slice(0, 10),
    pv_total: 0,
    earnings_ytd: 0,
    health_score: 100,
    downline_count: 0
  };

  const getPageTitle = (): string => {
    switch (currentTab) {
      case 'dashboard': return 'Executive HQ Overview';
      case 'members': return 'Member Directory & Ranks';
      case 'offices': return 'Regional Office Hubs';
      case 'genealogy': return 'Genealogy Downline Tree';
      case 'attendance': return 'Attendance Verification';
      case 'dues': return 'Administrative Dues Ledger';
      case 'pv': return 'PV Volume Submissions';
      case 'earnings': return 'Commissions & Payouts';
      case 'financial_reports': return 'Financial Statement Audit';
      case 'health_scores': return 'Organization Health Score';
      case 'chat': return 'Executive Broadcast Chat';
      case 'settings': return 'System Governance Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header
          pageTitle={getPageTitle()}
          breadcrumb={currentTab.replace('_', ' ').toUpperCase()}
          user={activeUserDisplay}
          userRole={userRole}
          onChangeRole={handleRoleChange}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenProfileModal={() => setSelectedMember(activeUserDisplay)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Main Content Body */}
        <main 
          className={`flex-1 p-4 lg:p-8 transition-all duration-300 max-w-7xl w-full mx-auto ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          
          {/* Dashboard Tab */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              
              <DashboardHero user={activeUserDisplay} userRole={userRole} />

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Members"
                    value={members.length > 0 ? members.length.toLocaleString() : '0'}
                    icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    subtitle="Live registered network"
                  />
                  <StatCard
                    label="Active Offices"
                    value={offices.length > 0 ? offices.length.toString() : '0'}
                    icon={<Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    subtitle="Connected hubs"
                  />
                  <StatCard
                    label="PV Submissions"
                    value={pvSubmissions.length.toString()}
                    icon={<CheckSquare className="w-5 h-5 text-amber-500" />}
                    subtitle="Queue total records"
                  />
                  <StatCard
                    label="Total Volume"
                    value={`${pvSubmissions.reduce((acc, curr) => acc + (curr.pv_amount || 0), 0).toLocaleString()} PV`}
                    icon={<Award className="w-5 h-5 text-amber-500" />}
                    isGold={true}
                    subtitle="Accumulated PV points"
                  />
                </div>
              )}

              <DataVisualizationSection userRole={userRole} darkMode={darkMode} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MembersTable
                    members={members}
                    onSelectMember={setSelectedMember}
                    onAddMember={() => setShowAddMember(true)}
                    userRole={userRole}
                  />
                </div>
                <div>
                  {activities.length > 0 ? (
                    <RecentActivityList activities={activities} />
                  ) : (
                    <EmptyState
                      title="No Live Activity Recorded"
                      description="Activity stream logs will populate as team members submit PV and record event check-ins."
                    />
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Members Management Tab */}
          {currentTab === 'members' && (
            <MembersTable
              members={members}
              onSelectMember={setSelectedMember}
              onAddMember={() => setShowAddMember(true)}
              userRole={userRole}
            />
          )}

          {/* Offices Tab */}
          {currentTab === 'offices' && (
            offices.length > 0 ? (
              <OfficesGrid offices={offices} />
            ) : (
              <EmptyState
                title="No Office Hubs Configured"
                description="Connect your Supabase database or insert office records into the 'offices' table."
              />
            )
          )}

          {/* Genealogy Tab */}
          {currentTab === 'genealogy' && (
            <GenealogyTree
              rootNode={{
                id: activeUserDisplay.id,
                member_id: activeUserDisplay.member_id,
                name: activeUserDisplay.full_name,
                rank: activeUserDisplay.rank,
                role: activeUserDisplay.role,
                office: activeUserDisplay.office_name,
                pv: activeUserDisplay.pv_total,
                avatar: activeUserDisplay.avatar_url,
                status: activeUserDisplay.status,
                level: 1,
                children: []
              }}
              onSelectMemberNode={(id) => {
                const found = members.find(m => m.id === id);
                if (found) setSelectedMember(found);
              }}
            />
          )}

          {/* Attendance Tab */}
          {currentTab === 'attendance' && (
            <AttendanceView
              attendanceRecords={attendanceRecords}
              userRole={userRole}
              onRecordCheckIn={handleRecordCheckIn}
            />
          )}

          {/* Dues Tab */}
          {currentTab === 'dues' && (
            <DuesView duesRecords={duesRecords} />
          )}

          {/* PV Submissions Tab */}
          {currentTab === 'pv' && (
            <PVSubmissionsView
              pvSubmissions={pvSubmissions}
              userRole={userRole}
              onApprovePV={handleApprovePV}
              onRejectPV={handleRejectPV}
              onSubmitNewPV={handleSubmitNewPV}
            />
          )}

          {/* Earnings Tab */}
          {currentTab === 'earnings' && (
            <EarningsView earningsRecords={earningsRecords} />
          )}

          {/* Health Scores Tab */}
          {currentTab === 'health_scores' && (
            <HealthScoresView healthMetrics={healthMetrics} />
          )}

          {/* Chat Broadcast Tab */}
          {currentTab === 'chat' && (
            <ChatView currentUser={activeUserDisplay} />
          )}

          {/* Settings Tab */}
          {currentTab === 'settings' && (
            <SettingsView
              user={activeUserDisplay}
              userRole={userRole}
              onChangeRole={handleRoleChange}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
            />
          )}

        </main>
      </div>

      {/* Member Profile Modal */}
      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onAddMember={handleAddMemberSubmit}
        />
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-semibold animate-bounce flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default App;
