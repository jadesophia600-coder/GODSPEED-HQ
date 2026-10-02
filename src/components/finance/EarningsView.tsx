import React from 'react';
import { EarningsRecord } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { TrendingUp, DollarSign, Award, Layers } from 'lucide-react';

interface EarningsViewProps {
  earningsRecords: EarningsRecord[];
}

export const EarningsView: React.FC<EarningsViewProps> = ({ earningsRecords }) => {
  const totalEarningsAll = earningsRecords.reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Commissions & Financial Earnings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Base commissions, volume overrides, and leadership rank bonuses
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-4 py-2 rounded-xl text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Quarter Total Payout</span>
          <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
            ${totalEarningsAll.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Base Sales Commissions</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">$104,700</p>
          <span className="text-[10px] text-emerald-600 font-medium">+14.2% vs Q2</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Volume Bonus Pool</span>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">$40,600</p>
          <span className="text-[10px] text-amber-600 font-medium">Top Tier Threshold</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Leadership Overrides</span>
          <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">$21,600</p>
          <span className="text-[10px] text-blue-600 font-medium">Gold & Diamond Tier</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Base Commission</th>
                <th className="py-3 px-4">Volume Bonus</th>
                <th className="py-3 px-4">Leadership Override</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              {earningsRecords.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {e.member_name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {e.period}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    ${e.base_commission.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-amber-600 dark:text-amber-400">
                    ${e.volume_bonus.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                    ${e.leadership_override.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${e.total_amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={e.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
