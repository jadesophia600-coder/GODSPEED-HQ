import React, { useState } from 'react';
import type { Member, BusinessStatus } from '../../types';
import { X, UserPlus } from 'lucide-react';

interface AddMemberModalProps {
  onClose: () => void;
  onAddMember: (memberData: Partial<Member>) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onAddMember }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rank, setRank] = useState<BusinessStatus>('Distributors');
  const [officeName, setOfficeName] = useState('GODSPEED Office');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    onAddMember({
      full_name: fullName,
      email,
      phone,
      rank,
      office_name: officeName,
      role: 'member',
      status: 'ACTIVE',
      pv_total: 500,
      earnings_ytd: 2500,
      health_score: 88,
      downline_count: 0,
      join_date: new Date().toISOString().slice(0, 10),
      avatar_url: ''
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Add New Organization Member
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Register a new team member into GODSPEED HQ registry.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Charlotte Hayes"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email
              </label>
              <input
                type="email"
                required
                placeholder="c.hayes@godspeedhq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+44 20 7946 0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status in the Business
              </label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as BusinessStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500"
              >
                <option value="PRO">PRO</option>
                <option value="Distributors">Distributors</option>
                <option value="Manager">Manager</option>
                <option value="Senior Manager">Senior Manager</option>
                <option value="Executive Manager">Executive Manager</option>
                <option value="Director">Director</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Office Hub
              </label>
              <select
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500"
              >
                <option value="GODSPEED Office">GODSPEED Office</option>
                <option value="Americas Hub — New York">Americas Hub — New York</option>
                <option value="APAC Region — Singapore">APAC Region — Singapore</option>
                <option value="EMEA Hub — Zurich">EMEA Hub — Zurich</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
