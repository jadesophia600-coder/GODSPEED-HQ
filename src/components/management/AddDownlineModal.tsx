import React, { useState } from 'react';
import { Member, BusinessStatus } from '../../types';
import { UserPlus, UserCheck, Search, Shield, X, Award, Building, Sparkles } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { cleanMemberId } from '../../lib/supabase';

interface AddDownlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Member;
  registeredMembers: Member[];
  existingDownlineIds: string[];
  onAddDownline: (memberData: Partial<Member>) => Promise<void>;
}

export const AddDownlineModal: React.FC<AddDownlineModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  registeredMembers,
  existingDownlineIds,
  onAddDownline
}) => {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Downline Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [businessStatus, setBusinessStatus] = useState<BusinessStatus>('PRO');
  const [officeName, setOfficeName] = useState<string>('GODSPEED Office');

  if (!isOpen) return null;

  // Filter available registered members who are not already in downlines and not the current user
  const availableMembers = registeredMembers.filter(m => {
    if (m.id === currentUser.id || m.email === currentUser.email) return false;
    if (existingDownlineIds.includes(m.id) || existingDownlineIds.includes(m.email)) return false;
    
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.member_id.toLowerCase().includes(term) ||
      (m.rank && m.rank.toLowerCase().includes(term))
    );
  });

  const selectedMember = registeredMembers.find(m => m.id === selectedMemberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'existing') {
        if (!selectedMember) return;
        await onAddDownline({
          id: selectedMember.id,
          member_id: selectedMember.member_id,
          full_name: selectedMember.full_name,
          email: selectedMember.email,
          rank: selectedMember.rank,
          role: selectedMember.role,
          office_name: selectedMember.office_name,
          avatar_url: selectedMember.avatar_url,
          status: 'ACTIVE',
          sponsor_id: currentUser.id,
          sponsor_name: currentUser.full_name
        });
      } else {
        if (!fullName || !email) return;
        const generatedMemberId = cleanMemberId('', email);
        await onAddDownline({
          id: `usr-${Date.now()}`,
          member_id: generatedMemberId,
          full_name: fullName,
          email: email,
          phone: phone,
          rank: businessStatus,
          role: 'member',
          office_name: officeName,
          status: 'ACTIVE',
          sponsor_id: currentUser.id,
          sponsor_name: currentUser.full_name,
          pv_total: 0,
          earnings_ytd: 0,
          health_score: 100,
          downline_count: 0
        });
      }

      // Reset & Close
      setSelectedMemberId('');
      setFullName('');
      setEmail('');
      setPhone('');
      onClose();
    } catch (err) {
      console.error('Failed to add downline:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900/10 via-emerald-900/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Add Team Member Downline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sponsor: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.full_name}</span> ({currentUser.member_id})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'existing'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Select Registered App Member ({availableMembers.length})
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'new'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Register New Downline
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {activeTab === 'existing' ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Choose App Registered Member:
              </label>

              {/* Search Filter */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search registered members by name, email, or rank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Member Selection List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/30">
                {availableMembers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No available registered members found to add as downline.
                  </div>
                ) : (
                  availableMembers.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`p-2.5 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                        selectedMemberId === m.id
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.full_name)}`}
                          alt={m.full_name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {m.full_name}
                            <span className="font-mono text-[10px] text-slate-500">{m.member_id}</span>
                          </h4>
                          <p className="text-[11px] text-slate-500">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {m.rank || 'Distributors'}
                        </span>
                        <StatusBadge status={m.status || 'ACTIVE'} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedMember && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>
                    Selected <strong>{selectedMember.full_name}</strong> ({selectedMember.rank}) as direct downline under <strong>{currentUser.full_name}</strong>.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. johndoe@godspeedhq.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Rank Status *
                  </label>
                  <select
                    value={businessStatus}
                    onChange={(e) => setBusinessStatus(e.target.value as BusinessStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (activeTab === 'existing' && !selectedMemberId) || (activeTab === 'new' && (!fullName || !email))}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              {isSubmitting ? 'Attaching Downline...' : 'Attach Downline to Network'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
