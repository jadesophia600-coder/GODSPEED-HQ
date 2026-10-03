import React, { useState } from 'react';
import { Member, UserRole } from '../../types';
import { Settings, Shield, UserCheck, ShieldAlert, LogOut, Moon, Check, Sparkles } from 'lucide-react';
import { updateUserProfile } from '../../lib/supabase';

interface SettingsViewProps {
  user: Member;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onRefreshUser?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  userRole,
  onChangeRole,
  darkMode,
  onToggleDarkMode,
  onRefreshUser
}) => {
  const [showConfirmStepDown, setShowConfirmStepDown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStepDown = async () => {
    setIsUpdating(true);
    try {
      // Update profile in Supabase to member
      await updateUserProfile(user.id, { role: 'member' });
      localStorage.setItem('godspeed_user_role', 'member');
      onChangeRole('member');
      if (onRefreshUser) onRefreshUser();
      setShowConfirmStepDown(false);
    } catch (err) {
      console.error('Failed to step down from admin:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          System Preferences & Account Governance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage system theme, active role privileges, and admin position status
        </p>
      </div>

      {/* Admin Position & Account Privilege Governance Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              userRole === 'super_admin' 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Account Privilege Position
                {userRole === 'super_admin' ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Active Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Member Position
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {userRole === 'super_admin'
                  ? 'You are registered as an Admin. Your account remains an active Admin until you choose to step down.'
                  : 'Your account is registered as a Member. Only registered Admins have access to the Admin panel.'}
              </p>
            </div>
          </div>
        </div>

        {userRole === 'super_admin' && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Relinquish / Step Down from Admin Position
              </h4>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/70 mt-0.5">
                Once you step down, your account role in Supabase will be changed to Member and Admin privileges will be removed.
              </p>
            </div>

            <button
              onClick={() => setShowConfirmStepDown(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
              Step Down from Admin Position
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Stepping Down */}
      {showConfirmStepDown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Admin Step Down
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove yourself from the Admin position? Your role in Supabase database will be updated to <strong>Member</strong> and you will no longer have executive access to the Admin panel.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmStepDown(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStepDown}
                disabled={isUpdating}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-all shadow-md"
              >
                {isUpdating ? 'Updating...' : 'Yes, Step Down Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display & Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Display & Appearance</h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Dark Mode Theme</span>
            <p className="text-[11px] text-slate-500">Toggle dark obsidian slate palette</p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
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
