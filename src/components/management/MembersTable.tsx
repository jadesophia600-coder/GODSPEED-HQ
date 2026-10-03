import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight, 
  Award,
  MoreVertical,
  Building
} from 'lucide-react';
import type { Member, UserRole } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface MembersTableProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
  onAddMember: () => void;
  userRole: UserRole;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  onSelectMember,
  onAddMember,
  userRole
}) => {
  const [search, setSearch] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('ALL');
  const [selectedOffice, setSelectedOffice] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.member_id.toLowerCase().includes(search.toLowerCase());
    
    const matchesRank = selectedRank === 'ALL' || m.rank === selectedRank;
    const matchesOffice = selectedOffice === 'ALL' || m.office_name === selectedOffice;

    return matchesSearch && matchesRank && matchesOffice;
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    const headers = "ID,Name,Email,Rank,Office,Status,PV,Earnings,HealthScore\n";
    const rows = filteredMembers.map(m => 
      `"${m.member_id}","${m.full_name}","${m.email}","${m.rank}","${m.office_name}","${m.status}",${m.pv_total},${m.earnings_ytd},${m.health_score}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `godspeed_members_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl shadow-card overflow-hidden">
      
      {/* Header & Controls Bar */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Member Management Directory
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
              {filteredMembers.length} Members
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View profiles, assign offices, inspect volume performance and rank achievements
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {userRole === 'super_admin' && (
            <button
              onClick={onAddMember}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add New Member
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Sub-bar */}
      <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedRank}
            onChange={(e) => { setSelectedRank(e.target.value); setCurrentPage(1); }}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Business Statuses</option>
            <option value="Director">Director</option>
            <option value="Executive Manager">Executive Manager</option>
            <option value="Senior Manager">Senior Manager</option>
            <option value="Manager">Manager</option>
            <option value="Distributors">Distributors</option>
            <option value="PRO">PRO</option>
          </select>
        </div>

        <div>
          <select
            value={selectedOffice}
            onChange={(e) => { setSelectedOffice(e.target.value); setCurrentPage(1); }}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Offices</option>
            <option value="GODSPEED Office">GODSPEED Office</option>
            <option value="Americas Hub — New York">Americas Hub — New York</option>
            <option value="APAC Region — Singapore">APAC Region — Singapore</option>
            <option value="EMEA Hub — Zurich">EMEA Hub — Zurich</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">Member Info</th>
              <th className="py-3 px-4">Status & Hub</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Total PV</th>
              <th className="py-3 px-4">Earnings (YTD)</th>
              <th className="py-3 px-4">Vitality Score</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => onSelectMember(m)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.full_name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {m.full_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {m.full_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {m.member_id} • {m.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{m.rank}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{m.office_name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={m.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {m.pv_total.toLocaleString()} PV
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ${m.earnings_ytd.toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            m.health_score > 90 ? 'bg-emerald-500' : m.health_score > 80 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${m.health_score}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {m.health_score}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMember(m);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No member records matched your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredMembers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, filteredMembers.length)}</span> of{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">{filteredMembers.length}</span> members
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono font-semibold text-slate-700 dark:text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
