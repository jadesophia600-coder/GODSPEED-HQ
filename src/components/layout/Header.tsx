import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Check, 
  Sparkles,
  Building,
  Award
} from 'lucide-react';
import type { Member, UserRole, Notification } from '../../types';
import { getNotifications } from '../../lib/supabase';

interface HeaderProps {
  pageTitle: string;
  breadcrumb?: string;
  user: Member;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenMobileSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfileModal: () => void;
  onSignOut?: () => void;
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  breadcrumb = "Dashboard",
  user,
  userRole,
  onChangeRole,
  onOpenMobileSidebar,
  darkMode,
  onToggleDarkMode,
  onOpenProfileModal,
  onSignOut,
  sidebarCollapsed
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    getNotifications().then(data => setNotifications(data));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header 
      className={`sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Page Header / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span>GODSPEED HQ</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{breadcrumb}</span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search members, offices, PV submissions, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 rounded-lg border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
            />
          </div>
        </div>

        {/* Right Actions: Role Switcher, Notifications, Dark Mode, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Role Switcher Pill */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors"
              title="Switch role view"
            >
              <Shield className={`w-3.5 h-3.5 ${userRole === 'super_admin' ? 'text-amber-500' : 'text-blue-500'}`} />
              <span className="capitalize">{userRole.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                  Switch Role View
                </div>
                {(['super_admin', 'regional_manager', 'member'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onChangeRole(r);
                      setShowRoleDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 capitalize"
                  >
                    <span className="flex items-center gap-2">
                      {r === 'super_admin' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                      {r === 'regional_manager' && <Building className="w-3.5 h-3.5 text-blue-500" />}
                      {r === 'member' && <UserIcon className="w-3.5 h-3.5 text-emerald-500" />}
                      {r.replace('_', ' ')}
                    </span>
                    {userRole === r && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          !n.read ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.full_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none flex items-center gap-1">
                  {user.full_name}
                  {user.rank === 'Diamond Executive' && <Award className="w-3 h-3 text-amber-500 fill-amber-400 inline" />}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {user.member_id}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                    {user.rank}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenProfileModal();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    View Member Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
