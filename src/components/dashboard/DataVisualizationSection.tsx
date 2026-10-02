import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { UserRole } from '../../types';

interface DataVisualizationSectionProps {
  userRole: UserRole;
  darkMode: boolean;
}

const PERFORMANCE_DATA = [
  { month: 'May', members: 840, pv: 184000, attendance: 88, earnings: 42000 },
  { month: 'Jun', members: 920, pv: 215000, attendance: 91, earnings: 48500 },
  { month: 'Jul', members: 1010, pv: 248000, attendance: 93, earnings: 56000 },
  { month: 'Aug', members: 1130, pv: 289000, attendance: 92, earnings: 64200 },
  { month: 'Sep', members: 1210, pv: 320000, attendance: 95, earnings: 71000 },
  { month: 'Oct', members: 1248, pv: 342000, attendance: 94.2, earnings: 78500 }
];

const OFFICE_YIELD_PIE = [
  { name: 'GODSPEED Office', value: 342000, color: '#2563EB' },
  { name: 'Americas Hub — NYC', value: 289000, color: '#3B82F6' },
  { name: 'APAC — Singapore', value: 265000, color: '#D97706' },
  { name: 'EMEA — Zurich', value: 178000, color: '#10B981' }
];

export const DataVisualizationSection: React.FC<DataVisualizationSectionProps> = ({
  userRole,
  darkMode
}) => {
  const [activeTab, setActiveTab] = useState<'pv' | 'members' | 'attendance'>('pv');

  const strokeGridColor = darkMode ? '#1E293B' : '#E2E8F0';
  const textAxisColor = darkMode ? '#94A3B8' : '#64748B';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{label} 2026</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium">{entry.name}:</span>
              <span className="font-bold font-mono">
                {entry.name === 'PV Volume' ? entry.value.toLocaleString() : entry.name === 'Earnings ($)' ? `$${entry.value.toLocaleString()}` : `${entry.value}%`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Primary Trend Area Chart (2 cols) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {userRole === 'super_admin' ? 'Organization Growth & Volume Trajectory' : 'Personal & Team Volume Trends'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical performance data across past 6 active months
            </p>
          </div>

          {/* Toggle Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('pv')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'pv' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              PV Volume
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'members' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'attendance' 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Attendance %
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'pv' ? (
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={strokeGridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textAxisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textAxisColor} fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="pv" 
                  name="PV Volume" 
                  stroke="#2563EB" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#pvGradient)" 
                />
              </AreaChart>
            ) : activeTab === 'members' ? (
              <BarChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={strokeGridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textAxisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textAxisColor} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="members" name="Total Members" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={strokeGridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textAxisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textAxisColor} fontSize={11} domain={[70, 100]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  name="Attendance %" 
                  stroke="#D97706" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#attGradient)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Distribution Breakdown Chart (1 col) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl p-5 shadow-card flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
            {userRole === 'super_admin' ? 'Regional Volume Distribution' : 'Commission Source Yield'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Share of total volume contributed by office hubs
          </p>
        </div>

        <div className="h-52 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={OFFICE_YIELD_PIE}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {OFFICE_YIELD_PIE.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val: any) => [`${(val || 0).toLocaleString()} PV`, 'Volume']}
                contentStyle={{ backgroundColor: darkMode ? '#0F172A' : '#FFFFFF', borderRadius: '8px', border: '1px solid #334155' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Top Hub: GODSPEED Office</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">32.8%</span>
        </div>
      </div>

    </div>
  );
};
