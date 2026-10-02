import React, { useState } from 'react';
import { PVSubmission, UserRole } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { CheckSquare, Plus, CheckCircle, XCircle, Search, FileText } from 'lucide-react';

interface PVSubmissionsViewProps {
  pvSubmissions: PVSubmission[];
  userRole: UserRole;
  onApprovePV: (id: string) => void;
  onRejectPV: (id: string) => void;
  onSubmitNewPV: (data: Partial<PVSubmission>) => void;
}

export const PVSubmissionsView: React.FC<PVSubmissionsViewProps> = ({
  pvSubmissions,
  userRole,
  onApprovePV,
  onRejectPV,
  onSubmitNewPV
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Form State
  const [category, setCategory] = useState('Enterprise Vitality Packs');
  const [pvAmount, setPvAmount] = useState('1200');
  const [receiptRef, setReceiptRef] = useState(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  const filteredSubmissions = pvSubmissions.filter(s => {
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchesSearch = 
      s.member_name.toLowerCase().includes(search.toLowerCase()) ||
      s.receipt_ref.toLowerCase().includes(search.toLowerCase()) ||
      s.product_category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitNewPV({
      product_category: category,
      pv_amount: Number(pvAmount),
      receipt_ref: receiptRef
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Personal Volume (PV) Queue & Approvals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit product order volume credits and review regional verification approvals
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Submit New PV Credit
        </button>
      </div>

      {/* Table Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl shadow-card overflow-hidden">
        
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search member name or receipt ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-transparent focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <option value="ALL">All Submissions</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Member & Hub</th>
                <th className="py-3 px-4">Product Category</th>
                <th className="py-3 px-4">Receipt Ref</th>
                <th className="py-3 px-4">PV Amount</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{sub.member_name}</div>
                      <div className="text-[11px] text-slate-500">{sub.office_name}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {sub.product_category}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {sub.receipt_ref}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {sub.pv_amount.toLocaleString()} PV
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {sub.submission_date}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={sub.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      {sub.status === 'PENDING' && (userRole === 'super_admin' || userRole === 'regional_manager') ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onApprovePV(sub.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800"
                            title="Approve PV"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectPV(sub.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 transition-colors border border-rose-200 dark:border-rose-800"
                            title="Reject PV"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {sub.approver_note || 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No PV submissions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Dialog for PV Submission */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Submit Personal Volume (PV)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter product purchase details for verification credit.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Category / Package
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                >
                  <option value="Enterprise Vitality Packs">Enterprise Vitality Packs</option>
                  <option value="Corporate Wellness System">Corporate Wellness System</option>
                  <option value="Executive Health Kit">Executive Health Kit</option>
                  <option value="Nutraceutical Line A">Nutraceutical Line A</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PV Point Value
                </label>
                <input
                  type="number"
                  value={pvAmount}
                  onChange={(e) => setPvAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receipt / Invoice Reference Code
                </label>
                <input
                  type="text"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
