import React from 'react';
import { DuesRecord } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Receipt, CheckCircle, Clock } from 'lucide-react';

interface DuesViewProps {
  duesRecords: DuesRecord[];
}

export const DuesView: React.FC<DuesViewProps> = ({ duesRecords }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Administrative Dues & Fee Ledger
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monthly office administrative dues, receipt tracking, and payment verification status
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Office Hub</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              {duesRecords.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {d.member_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {d.office_name}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {d.month_year}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${d.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {d.due_date}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {d.payment_method || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={d.status} size="sm" />
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
