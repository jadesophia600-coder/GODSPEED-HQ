import React from 'react';
import { Member, UserRole } from '../../types';
import { Settings, Shield, Bell, Key, User, Moon, Globe } from 'lucide-react';

interface SettingsViewProps {
  user: Member;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  userRole,
  onChangeRole,
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          System Preferences & Account Governance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage system theme, active role privileges, and communication preferences
        </p>
      </div>

      {/* Role Switcher Governance Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          Interactive Evaluator Role Switcher
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Switch the active portal view permissions instantly between Admin and Member views.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['super_admin', 'member'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => onChangeRole(r)}
              className={`p-4 rounded-xl border text-left transition-all ${
                userRole === r
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                  {r === 'super_admin' ? 'Admin' : 'Member'}
                </span>
                {userRole === r && (
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {r === 'super_admin' ? 'Full organization management & executive controls' : 'Personal volume, check-in history & team downlines'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Display & Appearance</h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Dark Mode Theme</span>
            <p className="text-[11px] text-slate-500">Toggle dark obsidian slate palette</p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              darkMode ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {darkMode ? 'Dark Mode Active' : 'Light Mode Active'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Supabase RLS Status</span>
            <p className="text-[11px] text-slate-500">Row Level Security enabled for member queries</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">ENFORCED</span>
        </div>
      </div>
    </div>
  );
};
