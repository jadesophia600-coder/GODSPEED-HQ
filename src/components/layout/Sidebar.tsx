import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  GitFork, 
  CalendarCheck, 
  Receipt, 
  CheckSquare, 
  TrendingUp, 
  FileText, 
  HeartPulse, 
  MessageSquare, 
  Settings, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab = 
  | 'dashboard'
  | 'members'
  | 'offices'
  | 'genealogy'
  | 'attendance'
  | 'dues'
  | 'pv'
  | 'earnings'
  | 'financial_reports'
  | 'health_scores'
  | 'chat'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemDef {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

interface NavGroupDef {
  title: string;
  items: NavItemDef[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {

  const navGroups: NavGroupDef[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'regional_manager', 'member'] }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'members', label: 'Members', icon: Users, roles: ['super_admin', 'regional_manager'] },
        { id: 'offices', label: 'Offices', icon: Building2, roles: ['super_admin', 'regional_manager'] },
        { id: 'genealogy', label: 'Genealogy', icon: GitFork, roles: ['super_admin', 'regional_manager', 'member'] }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['super_admin', 'regional_manager', 'member'] },
        { id: 'dues', label: 'Dues', icon: Receipt, roles: ['super_admin', 'regional_manager', 'member'], badge: 'Due' },
        { id: 'pv', label: 'PV Submissions', icon: CheckSquare, roles: ['super_admin', 'regional_manager', 'member'] }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'earnings', label: 'Earnings', icon: TrendingUp, roles: ['super_admin', 'regional_manager', 'member'] },
        { id: 'financial_reports', label: 'Financial Reports', icon: FileText, roles: ['super_admin'] }
      ]
    },
    {
      title: 'WELLNESS',
      items: [
        { id: 'health_scores', label: 'Health Scores', icon: HeartPulse, roles: ['super_admin', 'regional_manager', 'member'] }
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'chat', label: 'Chat & Broadcasts', icon: MessageSquare, roles: ['super_admin', 'regional_manager', 'member'] }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'regional_manager', 'member'] }
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B132B] text-slate-300 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-amber-500 p-0.5 shadow-md flex-shrink-0">
            <div className="h-full w-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-extrabold tracking-tight text-white font-sans flex items-center gap-1.5">
                GODSPEED <span className="text-amber-400 text-xs px-1 py-0.2 bg-amber-400/10 rounded font-mono border border-amber-400/20">HQ</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase truncate">
                Business Platform
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex h-7 w-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white items-center justify-center transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge Indicator */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 bg-slate-900/90 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className={`w-4 h-4 ${userRole === 'super_admin' ? 'text-amber-400' : 'text-blue-400'}`} />
            <span className="text-xs font-semibold text-slate-200 capitalize">
              {userRole.replace('_', ' ')}
            </span>
          </div>
          {userRole === 'super_admin' && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              Super Admin
            </span>
          )}
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {group.title}
                </div>
              )}

              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (mobileOpen) onCloseMobile();
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      collapsed ? 'justify-center px-2' : 'justify-between px-3'
                    } py-2 rounded-lg text-xs transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && !isActive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}

                    {collapsed && isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-amber-400 rounded-l" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / Status */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070B16]/60">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Supabase Engine Live
            </span>
            <span className="font-mono text-[10px]">v2.4.0</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Live" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
