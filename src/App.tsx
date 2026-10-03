import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  CheckSquare, 
  Award
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
  updateUserProfile,
  cleanMemberId,
  getMembers,
  getOffices,
  getPVSubmissions,
  getDuesRecords,
  getAttendanceRecords,
  getEarningsRecords,
  getHealthMetrics,
  getActivities,
  addDownlineMember,
  buildGenealogyTree,
  saveAttendanceRecord
} from './lib/supabase';

import { LoginPortal } from './components/auth/LoginPortal';
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
import { MemberAttendanceDashboard } from './components/dashboard/MemberAttendanceDashboard';
import { AdminAttendanceDashboard } from './components/attendance/AdminAttendanceDashboard';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('super_admin');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data Store States
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [pvSubmissions, setPvSubmissions] = useState<PVSubmission[]>([]);
  const [duesRecords, setDuesRecords] = useState<DuesRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [earningsRecords, setEarningsRecords] = useState<EarningsRecord[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [todayAttendanceMarked, setTodayAttendanceMarked] = useState<boolean>(false);

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

  // Check Supabase session & local persistent session on startup
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          if (session.user.email) {
            localStorage.setItem('godspeed_user_email', session.user.email);
            localStorage.setItem('godspeed_is_authenticated', 'true');
          }
          await loadSupabaseData();
          return;
        }

        // Fallback to local persistent session if previously logged in
        const storedAuth = localStorage.getItem('godspeed_is_authenticated');
        const storedEmail = localStorage.getItem('godspeed_user_email');
        const storedRole = localStorage.getItem('godspeed_user_role') as UserRole;

        if (storedAuth === 'true' && storedEmail) {
          setIsAuthenticated(true);
          if (storedRole) setUserRole(storedRole);
          await loadSupabaseData();
          return;
        }
      } catch (e) {
        console.error('Error restoring session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        if (session.user.email) {
          localStorage.setItem('godspeed_user_email', session.user.email);
          localStorage.setItem('godspeed_is_authenticated', 'true');
        }
        loadSupabaseData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

      // Check if attendance is marked for today
      const todayStr = new Date().toISOString().slice(0, 10);
      const isMarked = attRes.some(r => r.date === todayStr);
      setTodayAttendanceMarked(isMarked);

    } catch (err) {
      console.error('Error loading Supabase tables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleChange = (newRole: UserRole) => {
    const registeredRole = currentUser?.role || localStorage.getItem('godspeed_user_role');
    if (newRole === 'super_admin' && registeredRole !== 'super_admin') {
      triggerToast('Access Denied: Only accounts registered as Admin can access the Admin Panel.');
      return;
    }
    setUserRole(newRole);
    localStorage.setItem('godspeed_user_role', newRole);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
    triggerToast(`View context updated to ${newRole === 'super_admin' ? 'ADMIN' : 'MEMBER'}`);
  };

  const handleLoginSuccess = (user: any, role: UserRole) => {
    const userEmail = user?.email || localStorage.getItem('godspeed_user_email') || '';
    if (userEmail) {
      localStorage.setItem('godspeed_user_email', userEmail);
    }
    localStorage.setItem('godspeed_user_role', role);
    localStorage.setItem('godspeed_is_authenticated', 'true');
    setUserRole(role);
    setIsAuthenticated(true);
    loadSupabaseData();
    triggerToast('Authenticated successfully.');
  };

  const handleDemoAccess = (role: UserRole) => {
    localStorage.setItem('godspeed_user_role', role);
    localStorage.setItem('godspeed_is_authenticated', 'true');
    setUserRole(role);
    setIsAuthenticated(true);
    loadSupabaseData();
    triggerToast(`Launched portal in ${role.replace('_', ' ').toUpperCase()} mode.`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('godspeed_is_authenticated');
    localStorage.removeItem('godspeed_user_email');
    localStorage.removeItem('godspeed_user_role');
    setIsAuthenticated(false);
    setCurrentUser(null);
    triggerToast('Signed out of GODSPEED HQ.');
  };

  // Quick Attendance Check-in Handler
  const handleQuickMarkAttendance = async (eventType: string, officeName: string) => {
    const activeUser = activeUserDisplay;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayDate = new Date().toISOString().slice(0, 10);

    const newAttendance: AttendanceRecord = {
      id: `att-${Date.now()}`,
      member_id: activeUser.id,
      member_name: activeUser.full_name,
      office_id: activeUser.office_id,
      office_name: officeName,
      date: todayDate,
      check_in_time: nowTime,
      event_type: eventType,
      status: 'ACTIVE'
    };

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'attendance_recorded',
      title: 'Office Attendance Marked',
      description: `${activeUser.full_name} marked attendance for ${eventType} at ${officeName}`,
      timestamp: 'Just now',
      user_name: activeUser.full_name,
      status: 'ACTIVE'
    };

    setAttendanceRecords([newAttendance, ...attendanceRecords]);
    setActivities([newActivity, ...activities]);
    setTodayAttendanceMarked(true);

    // Save to Supabase
    const { error } = await supabase
      .from('attendance')
      .insert([{
        member_id: activeUser.id,
        member_name: activeUser.full_name,
        office_id: activeUser.office_id,
        office_name: officeName,
        date: todayDate,
        check_in_time: nowTime,
        event_type: eventType,
        status: 'ACTIVE'
      }]);

    if (!error) {
      triggerToast(`Attendance marked successfully for ${activeUser.full_name}!`);
    } else {
      triggerToast('Attendance logged in active session.');
    }
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
    const activeUser = activeUserDisplay;
    const newSub = {
      member_id: activeUser.id,
      member_name: activeUser.full_name,
      office_name: activeUser.office_name,
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
      setPvSubmissions([{ id: `pv-${Date.now()}`, ...newSub, status: 'PENDING' } as PVSubmission, ...pvSubmissions]);
      triggerToast('PV submission logged.');
    }
  };

  // Handlers for Attendance Table View
  const handleRecordCheckIn = async (data: Partial<AttendanceRecord>) => {
    const activeUser = activeUserDisplay;
    const newRec = {
      member_id: activeUser.id,
      member_name: activeUser.full_name,
      office_id: activeUser.office_id,
      office_name: activeUser.office_name,
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
      setTodayAttendanceMarked(true);
      triggerToast('Check-in record saved to Supabase.');
    } else {
      setAttendanceRecords([{ id: `att-${Date.now()}`, ...newRec, status: 'ACTIVE' } as AttendanceRecord, ...attendanceRecords]);
      setTodayAttendanceMarked(true);
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
      rank: data.rank || 'Distributors',
      office_name: data.office_name || 'GODSPEED Office',
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

  // Save Profile Changes to Supabase and update local state
  const handleSaveProfile = async (updates: Partial<Member>) => {
    const targetMember = selectedMember || activeUserDisplay;
    if (!targetMember) return;

    const res = await updateUserProfile(targetMember.id, updates);
    if (!res.success) {
      triggerToast(`Update notice: ${res.error || 'Saved to session'}`);
    }

    const updatedMember: Member = {
      ...targetMember,
      ...updates
    };

    // Update active user state if updating logged-in profile
    if (!currentUser || targetMember.id === currentUser.id || targetMember.email === currentUser.email) {
      setCurrentUser(updatedMember);
    }

    // Update selected member state
    setSelectedMember(updatedMember);

    // Update members list state
    setMembers(prev => prev.map(m => m.id === updatedMember.id || m.email === updatedMember.email ? { ...m, ...updates } : m));

    // Store updated fields in localStorage for persistent session
    if (updates.email) localStorage.setItem('godspeed_user_email', updates.email);
    if (updates.full_name) localStorage.setItem('godspeed_user_name', updates.full_name);
    if (updates.rank) localStorage.setItem('godspeed_user_rank', updates.rank);
    if (updates.avatar_url) localStorage.setItem('godspeed_user_avatar', updates.avatar_url);

    triggerToast('Profile & Email saved & updated successfully!');
  };

  // User object for header / shell display
  const activeUserDisplay: Member = currentUser || {
    id: 'user-active',
    member_id: cleanMemberId('', localStorage.getItem('godspeed_user_email') || 'active'),
    full_name: localStorage.getItem('godspeed_user_name') || (userRole === 'super_admin' ? 'Executive Director' : 'Office Member'),
    email: localStorage.getItem('godspeed_user_email') || 'office.member@godspeedhq.org',
    phone: '',
    role: userRole,
    rank: localStorage.getItem('godspeed_user_rank') || (userRole === 'super_admin' ? 'Director' : 'Distributors'),
    office_id: 'off-01',
    office_name: 'GODSPEED Office',
    status: 'ACTIVE',
    avatar_url: localStorage.getItem('godspeed_user_avatar') || '',
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
      case 'genealogy': return 'Team Members & Downline Network';
      case 'attendance': return 'Attendance Verification & Check-In';
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

  if (!isAuthenticated) {
    return (
      <LoginPortal
        onLoginSuccess={handleLoginSuccess}
        onDemoAccess={handleDemoAccess}
      />
    );
  }

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
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        
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
          onSignOut={handleSignOut}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          
          {/* Dashboard Tab */}
          {currentTab === 'dashboard' && (
            userRole === 'member' ? (
              <MemberAttendanceDashboard
                user={activeUserDisplay}
                attendanceRecords={attendanceRecords}
                onAttendanceMarkedSuccess={(record) => {
                  setAttendanceRecords([record, ...attendanceRecords]);
                  setTodayAttendanceMarked(true);
                  triggerToast(`Attendance Marked: ${record.status}`);
                }}
                onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
              />
            ) : (
              <div className="space-y-6">
                
                {/* Hero & Quick Attendance Check-In Banner */}
                <DashboardHero 
                  user={activeUserDisplay} 
                  userRole={userRole} 
                  todayAttendanceMarked={todayAttendanceMarked}
                  onQuickMarkAttendance={handleQuickMarkAttendance}
                />

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
                      label="Today's Attendance Rate"
                      value={members.length > 0 ? `${Math.min(100, Math.round((attendanceRecords.length / members.length) * 100))}%` : "100%"}
                      icon={<CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                      trend={{ value: '+2.4%', isPositive: true, period: 'today' }}
                      subtitle={`${attendanceRecords.length} check-ins recorded`}
                    />
                    <StatCard
                      label="Total Office Members"
                      value={members.length.toLocaleString()}
                      icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      subtitle="Registered active network"
                    />
                    <StatCard
                      label="Connected Hubs"
                      value={offices.length.toString()}
                      icon={<Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                      subtitle="Active office hubs"
                    />
                    <StatCard
                      label="Total Volume"
                      value={`${pvSubmissions.reduce((acc, curr) => acc + (curr.pv_amount || 0), 0).toLocaleString()} PV`}
                      icon={<Award className="w-5 h-5 text-amber-500" />}
                      isGold={true}
                      subtitle="Accumulated verified volume"
                    />
                  </div>
                )}

                <DataVisualizationSection 
                  userRole={userRole} 
                  darkMode={darkMode} 
                  members={members}
                  offices={offices}
                  pvSubmissions={pvSubmissions}
                  attendanceRecords={attendanceRecords}
                />

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
            )
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
              rootNode={buildGenealogyTree(activeUserDisplay, members)}
              currentUser={activeUserDisplay}
              registeredMembers={members}
              onAddDownline={async (downlineData) => {
                const res = await addDownlineMember(activeUserDisplay.email, downlineData);
                if (res.success) {
                  await loadSupabaseData();
                  triggerToast(`Successfully attached ${downlineData.full_name || 'downline'} to team network!`);
                } else {
                  triggerToast(res.error || 'Failed to add downline');
                }
              }}
              onSelectMemberNode={(id) => {
                const found = members.find(m => m.id === id);
                if (found) setSelectedMember(found);
              }}
            />
          )}

          {/* Attendance Tab (Primary Feature Focus) */}
          {currentTab === 'attendance' && (
            userRole === 'member' ? (
              <MemberAttendanceDashboard
                user={activeUserDisplay}
                attendanceRecords={attendanceRecords}
                onAttendanceMarkedSuccess={(record) => {
                  setAttendanceRecords([record, ...attendanceRecords]);
                  setTodayAttendanceMarked(true);
                  triggerToast(`Attendance Marked: ${record.status}`);
                }}
                onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
              />
            ) : (
              <AdminAttendanceDashboard
                members={members}
                offices={offices}
                attendanceRecords={attendanceRecords}
                currentAdminName={activeUserDisplay.full_name}
                onRefreshData={loadSupabaseData}
              />
            )
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
          onSaveProfile={handleSaveProfile}
          attendanceRecords={attendanceRecords}
          pvSubmissions={pvSubmissions}
          earningsRecords={earningsRecords}
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
