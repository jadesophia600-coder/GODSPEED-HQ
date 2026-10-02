import React, { useState } from 'react';
import { GenealogyNode } from '../../types';
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
  GitFork
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface GenealogyTreeProps {
  rootNode: GenealogyNode;
  onSelectMemberNode?: (nodeId: string) => void;
}

export const GenealogyTree: React.FC<GenealogyTreeProps> = ({ rootNode, onSelectMemberNode }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl shadow-card overflow-hidden">
      
      {/* Header Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GitFork className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Organizational Genealogy Hierarchy
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive multi-level sponsor and downline team tree map
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Member Filter */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Highlight member in tree..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-transparent focus:border-blue-500 outline-none w-44"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 10, 60))}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 10, 140))}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors border-l border-slate-200 dark:border-slate-700"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tree Canvas Box */}
      <div className="p-8 overflow-x-auto min-h-[480px] bg-slate-50/50 dark:bg-slate-950/40 flex justify-center">
        <div 
          className="transition-transform duration-200 transform origin-top py-4"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {renderNode(rootNode)}
        </div>
      </div>

    </div>
  );
};
