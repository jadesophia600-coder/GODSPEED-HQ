import React, { useState } from 'react';
import { GenealogyNode, Member } from '../../types';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Award, 
  Building,
  User,
  GitFork,
  UserPlus,
  Users,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { AddDownlineModal } from './AddDownlineModal';

interface GenealogyTreeProps {
  rootNode: GenealogyNode;
  currentUser: Member;
  registeredMembers: Member[];
  onAddDownline: (downlineData: Partial<Member>) => Promise<void>;
  onSelectMemberNode?: (nodeId: string) => void;
}

export const GenealogyTree: React.FC<GenealogyTreeProps> = ({ 
  rootNode, 
  currentUser,
  registeredMembers,
  onAddDownline,
  onSelectMemberNode 
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Collect all downline IDs/Emails under the root node
  const collectDownlineKeys = (node: GenealogyNode): string[] => {
    let keys: string[] = [node.id.toLowerCase(), node.member_id.toLowerCase()];
    if (node.children) {
      node.children.forEach(child => {
        keys = [...keys, ...collectDownlineKeys(child)];
      });
    }
    return keys;
  };

  const downlineKeys = collectDownlineKeys(rootNode);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to colorize rank badges
  const getRankBadgeStyle = (rankStr?: string) => {
    const r = (rankStr || '').toLowerCase();
    if (r.includes('director')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    } else if (r.includes('manager')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    } else if (r.includes('pro')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
  };

  const renderNode = (node: GenealogyNode, level: number = 1) => {
    const isCollapsed = collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isMatched = searchTerm && (
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.member_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div key={node.id} className="flex flex-col items-center relative transition-all duration-300">
        
        {/* Node Card */}
        <div
          onClick={() => onSelectMemberNode && onSelectMemberNode(node.id)}
          className={`relative z-10 w-64 bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer ${
            isMatched 
              ? 'ring-2 ring-amber-500 border-amber-400 dark:border-amber-500' 
              : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          {/* Level Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Tier Level {node.level}
            </span>
            <StatusBadge status={node.status} size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <img
              src={node.avatar}
              alt={node.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {node.name}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">{node.member_id}</p>
              <div className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <Award className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span className="truncate">{node.rank}</span>
              </div>
            </div>
          </div>

          {/* PV Metric Footer */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" />
              {node.office.split('—')[0]}
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {node.pv.toLocaleString()} PV
            </span>
          </div>

          {/* Expand/Collapse Toggle Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(node.id);
              }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-20"
              title={isCollapsed ? "Expand team downlines" : "Collapse team downlines"}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Children Downline Tree Connector Lines */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center w-full mt-4">
            {/* Vertical connector down from parent */}
            <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />

            <div className="flex items-start justify-center gap-8 relative pt-4 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-[calc(100%-16rem)] before:h-0.5 before:bg-slate-300 dark:before:bg-slate-700">
              {node.children!.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Vertical connector down to child */}
                  <div className="absolute -top-4 w-0.5 h-4 bg-slate-300 dark:bg-slate-700" />
                  {renderNode(child, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  };

  // Filter registered members for list view search
  const filteredListMembers = registeredMembers.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      m.member_id.toLowerCase().includes(term) ||
      (m.rank && m.rank.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl shadow-card overflow-hidden">
        
        {/* Header Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Team Members & Downline Network
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive multi-level downline tree map and registered team members directory
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'tree'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                Hierarchy Tree
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Registered Members ({registeredMembers.length})
              </button>
            </div>

            {/* Add Downline Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Downline
            </button>

          </div>
        </div>

        {/* Control Sub-bar */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={viewMode === 'tree' ? "Highlight member in tree..." : "Search registered members..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {viewMode === 'tree' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Zoom:</span>
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 10, 60))}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 10, 140))}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors border-l border-slate-200 dark:border-slate-700"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* View Mode Canvas */}
        {viewMode === 'tree' ? (
          <div className="p-8 overflow-x-auto min-h-[480px] bg-slate-50/50 dark:bg-slate-950/40 flex justify-center">
            <div 
              className="transition-transform duration-200 transform origin-top py-4"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {renderNode(rootNode)}
            </div>
          </div>
        ) : (
          /* Registered Team Members Directory List */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Business Rank</th>
                  <th className="py-3 px-4">Office</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Network Link</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
                {filteredListMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No registered members matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredListMembers.map(member => {
                    const isSelf = member.id === currentUser.id || member.email === currentUser.email;
                    const isDownline = downlineKeys.includes(member.id.toLowerCase()) || downlineKeys.includes(member.email.toLowerCase()) || downlineKeys.includes(member.member_id.toLowerCase());

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Member Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.full_name)}`}
                              alt={member.full_name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                {member.full_name}
                                {isSelf && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px]">{member.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Member ID */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {member.member_id}
                        </td>

                        {/* Business Rank */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRankBadgeStyle(member.rank)}`}>
                            <Award className="w-3 h-3" />
                            {member.rank || 'Distributors'}
                          </span>
                        </td>

                        {/* Office */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {member.office_name || 'GODSPEED Office'}
                        </td>

                        {/* Account Status */}
                        <td className="py-3 px-4">
                          <StatusBadge status={member.status || 'ACTIVE'} size="sm" />
                        </td>

                        {/* Network Link Status */}
                        <td className="py-3 px-4">
                          {isSelf ? (
                            <span className="text-slate-400 font-semibold text-[11px]">Root Sponsor</span>
                          ) : isDownline ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Attached Downline
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Registered Team Member</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          {!isSelf && !isDownline && (
                            <button
                              onClick={() => {
                                onAddDownline({
                                  id: member.id,
                                  member_id: member.member_id,
                                  full_name: member.full_name,
                                  email: member.email,
                                  rank: member.rank,
                                  role: member.role,
                                  office_name: member.office_name,
                                  avatar_url: member.avatar_url,
                                  status: 'ACTIVE',
                                  sponsor_id: currentUser.id,
                                  sponsor_name: currentUser.full_name
                                });
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
                            >
                              <UserPlus className="w-3 h-3" />
                              Add Downline
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add Downline Modal */}
      <AddDownlineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        currentUser={currentUser}
        registeredMembers={registeredMembers}
        existingDownlineIds={downlineKeys}
        onAddDownline={onAddDownline}
      />

    </div>
  );
};
