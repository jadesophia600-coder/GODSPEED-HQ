import React, { useState } from 'react';
import { Member } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { 
  X, 
  Award, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  UserCheck, 
  CheckSquare, 
  TrendingUp, 
  HeartPulse, 
  GitFork 
} from 'lucide-react';

interface MemberProfileModalProps {
  member: Member | null;
  onClose: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'pv' | 'earnings' | 'health'>('overview');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden relative my-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Hero Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0B132B] text-white relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img
              src={member.avatar_url}
              alt={member.full_name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/10 shadow-lg"
            />
            <div className="text-center sm:text-left min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-bold text-white">{member.full_name}</h2>
                <StatusBadge status={member.status} size="sm" />
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 font-mono mb-3">
                <span>{member.member_id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold font-sans">
                  <Award className="w-3.5 h-3.5" />
                  {member.rank}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-sans">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {member.office_name}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {member.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {member.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Joined {member.join_date}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-semibold bg-slate-50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pv')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'pv' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
            }`}
          >
            PV History ({member.pv_total.toLocaleString()})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'earnings' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
            }`}
          >
            Earnings (${member.earnings_ytd.toLocaleString()})
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'health' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500'
            }`}
          >
            Vitality ({member.health_score}%)
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total PV</span>
                <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                  {member.pv_total.toLocaleString()} PV
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Earnings YTD</span>
                <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  ${member.earnings_ytd.toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Health Score</span>
                <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {member.health_score}%
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Downlines</span>
                <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                  {member.downline_count} Members
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pv' && (
            <div className="text-xs space-y-2">
              <p className="text-slate-500">Recent Personal Volume credits recorded for {member.full_name}:</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                <div>
                  <span className="font-bold">Enterprise Vitality Pack</span>
                  <p className="text-[11px] text-slate-400">REC-2026-9812</p>
                </div>
                <span className="font-mono font-bold text-blue-600">1,450 PV</span>
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="text-xs space-y-2">
              <p className="text-slate-500">Commission payouts and volume overrides:</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                <div>
                  <span className="font-bold">Q3 2026 Total Payout</span>
                  <p className="text-[11px] text-slate-400">Base + Volume Bonus</p>
                </div>
                <span className="font-mono font-bold text-emerald-600">${member.earnings_ytd.toLocaleString()}</span>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="text-xs space-y-2">
              <p className="text-slate-500">Vitality metrics and activity assessment:</p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span>Vitality Grade:</span>
                  <span className="font-bold text-emerald-600">A+</span>
                </div>
                <div className="flex justify-between">
                  <span>Attendance Record:</span>
                  <span className="font-bold">96% Summit Check-in</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
