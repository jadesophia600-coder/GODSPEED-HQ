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
  DollarSign,
  UserCheck
} from 'lucide-react';
import { 
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
  SEEDED_CURRENT_USER, 
  SEEDED_OFFICES, 
  SEEDED_MEMBERS, 
  SEEDED_PV_SUBMISSIONS, 
  SEEDED_DUES, 
  SEEDED_ATTENDANCE, 
  SEEDED_EARNINGS, 
  SEEDED_HEALTH_METRICS, 
  SEEDED_ACTIVITIES,
  SEEDED_GENEALOGY
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
import { StatCardSkeleton, TableSkeleton } from './components/ui/LoadingSkeleton';

export function App() {
  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data Store States
  const [currentUser, setCurrentUser] = useState<Member>(SEEDED_CURRENT_USER);
  const [members, setMembers] = useState<Member[]>(SEEDED_MEMBERS);
  const [offices] = useState<Office[]>(SEEDED_OFFICES);
  const [pvSubmissions, setPvSubmissions] = useState<PVSubmission[]>(SEEDED_PV_SUBMISSIONS);
  const [duesRecords] = useState<DuesRecord[]>(SEEDED_DUES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(SEEDED_ATTENDANCE);
  const [earningsRecords] = useState<EarningsRecord[]>(SEEDED_EARNINGS);
  const [healthMetrics] = useState<HealthMetric[]>(SEEDED_HEALTH_METRICS);
  const [activities, setActivities] = useState<ActivityItem[]>(SEEDED_ACTIVITIES);

  // Modals
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

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize current user state when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    setCurrentUser(prev => ({ ...prev, role: newRole }));
    triggerToast(`Switched view context to ${newRole.replace('_', ' ').toUpperCase()}`);
  };

  // Handlers for PV
  const handleApprovePV = (id: string) => {
    setPvSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED', approver_note: 'Approved by Executive Command' } : s));
    triggerToast('PV Submission verified and approved.');
  };

  const handleRejectPV = (id: string) => {
    setPvSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'REJECTED', approver_note: 'Audit reference conflict' } : s));
    triggerToast('PV Submission rejected.');
  };

  const handleSubmitNewPV = (data: Partial<PVSubmission>) => {
    const newSub: PVSubmission = {
      id: `pv-${Date.now()}`,
      member_id: currentUser.id,
      member_name: currentUser.full_name,
      office_name: currentUser.office_name,
      pv_amount: data.pv_amount || 1000,
      submission_date: new Date().toISOString().slice(0, 10),
      product_category: data.product_category || 'Enterprise Vitality Packs',
      receipt_ref: data.receipt_ref || `REC-${Date.now().toString().slice(-4)}`,
      status: 'PENDING',
      approver_note: 'Awaiting regional review'
    };
    setPvSubmissions([newSub, ...pvSubmissions]);
    triggerToast('New PV submission logged successfully.');
  };

  // Handlers for Attendance
  const handleRecordCheckIn = (data: Partial<AttendanceRecord>) => {
    const newRec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      member_id: currentUser.id,
      member_name: currentUser.full_name,
      office_id: currentUser.office_id,
      office_name: currentUser.office_name,
      date: data.date || new Date().toISOString().slice(0, 10),
      check_in_time: data.check_in_time || '09:00 AM',
      event_type: data.event_type || 'Weekly Leadership Summit',
      status: 'ACTIVE'
    };
    setAttendanceRecords([newRec, ...attendanceRecords]);
    triggerToast('Leadership event check-in recorded.');
  };

  // Handlers for Add Member
  const handleAddMemberSubmit = (data: Partial<Member>) => {
    const newMember: Member = {
      id: `usr-${Date.now()}`,
      member_id: `GSD-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: data.full_name || 'New Member',
      email: data.email || 'member@godspeedhq.com',
      phone: data.phone || '+1 555 000 0000',
      role: 'member',
      rank: data.rank || 'Bronze Associate',
      office_id: 'off-01',
      office_name: data.office_name || 'Global HQ — London',
      status: 'ACTIVE',
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      join_date: new Date().toISOString().slice(0, 10),
      pv_total: 500,
      earnings_ytd: 2500,
      health_score: 88,
      downline_count: 0
    };
    setMembers([newMember, ...members]);
    triggerToast(`New member ${newMember.full_name} registered.`);
  };

  // Get Page Title
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
      
      {/* Left Sidebar Shell */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Layout Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header
          pageTitle={getPageTitle()}
          breadcrumb={currentTab.replace('_', ' ').toUpperCase()}
          user={currentUser}
          userRole={userRole}
          onChangeRole={handleRoleChange}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenProfileModal={() => setSelectedMember(currentUser)}
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
              
              {/* Hero Banner */}
              <DashboardHero user={currentUser} userRole={userRole} />

              {/* KPI Statistics Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {userRole === 'super_admin' ? (
                    <>
                      <StatCard
                        label="Total Members"
                        value="1,248"
                        icon={<Users className="w-5 h-5" />}
                        trend={{ value: '+8.4%', isPositive: true, period: 'last month' }}
                        subtitle="Global active network"
                      />
                      <StatCard
                        label="Summit Attendance"
                        value="94.2%"
                        icon={<CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                        trend={{ value: '+2.1%', isPositive: true, period: 'target 90%' }}
                        subtitle="Weekly Leadership Summit"
                      />
                      <StatCard
                        label="PV Submitted"
                        value="342,000"
                        icon={<CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        trend={{ value: '+12.5%', isPositive: true, period: 'Q3 target' }}
                        subtitle="Personal Volume total"
                      />
                      <StatCard
                        label="YTD Earnings Payout"
                        value="$184,500"
                        icon={<Award className="w-5 h-5 text-amber-500" />}
                        isGold={true}
                        trend={{ value: '+15.8%', isPositive: true, period: 'YTD Growth' }}
                        subtitle="Commission & Overrides"
                      />
                    </>
                  ) : userRole === 'regional_manager' ? (
                    <>
                      <StatCard
                        label="Office Members"
                        value="420"
                        icon={<Building2 className="w-5 h-5 text-blue-600" />}
                        trend={{ value: '+5.2%', isPositive: true, period: 'this month' }}
                        subtitle="Global HQ — London"
                      />
                      <StatCard
                        label="Attendance Rate"
                        value="94.2%"
                        icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
                        trend={{ value: '+1.5%', isPositive: true }}
                        subtitle="Summit check-in"
                      />
                      <StatCard
                        label="Pending PV Queue"
                        value={pvSubmissions.filter(s => s.status === 'PENDING').length}
                        icon={<CheckSquare className="w-5 h-5 text-amber-500" />}
                        subtitle="Requires review"
                      />
                      <StatCard
                        label="Regional Volume"
                        value="342,000 PV"
                        icon={<Award className="w-5 h-5 text-amber-500" />}
                        isGold={true}
                        subtitle="Hub performance score 98%"
                      />
                    </>
                  ) : (
                    <>
                      <StatCard
                        label="My Personal Volume"
                        value="14,850 PV"
                        icon={<CheckSquare className="w-5 h-5 text-blue-600" />}
                        trend={{ value: '+9.4%', isPositive: true }}
                        subtitle="Diamond rank threshold"
                      />
                      <StatCard
                        label="My YTD Earnings"
                        value="$184,500"
                        icon={<DollarSign className="w-5 h-5 text-amber-500" />}
                        isGold={true}
                        trend={{ value: '+18.2%', isPositive: true }}
                        subtitle="Commissions & bonus"
                      />
                      <StatCard
                        label="My Downline Team"
                        value="342"
                        icon={<Users className="w-5 h-5 text-emerald-600" />}
                        subtitle="Active network members"
                      />
                      <StatCard
                        label="Health Score"
                        value="94%"
                        icon={<HeartPulse className="w-5 h-5 text-rose-500" />}
                        subtitle="Vitality index A+"
                      />
                    </>
                  )}

                </div>
              )}

              {/* Data Visualization Section */}
              <DataVisualizationSection userRole={userRole} darkMode={darkMode} />

              {/* Members Table Snapshot & Recent Activity Grid */}
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
                  <RecentActivityList activities={activities} />
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
            <OfficesGrid offices={offices} />
          )}

          {/* Genealogy Tab */}
          {currentTab === 'genealogy' && (
            <GenealogyTree
              rootNode={SEEDED_GENEALOGY}
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
            <ChatView currentUser={currentUser} />
          )}

          {/* Settings Tab */}
          {currentTab === 'settings' && (
            <SettingsView
              user={currentUser}
              userRole={userRole}
              onChangeRole={handleRoleChange}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
            />
          )}

        </main>
      </div>

      {/* Member Detail Profile Modal */}
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

      {/* Toast Notification Alert */}
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
