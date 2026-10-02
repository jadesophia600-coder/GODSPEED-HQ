import React from 'react';
import { Office } from '../../types';
import { Building2, MapPin, Users, Calendar, Award, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';

interface OfficesGridProps {
  offices: Office[];
}

export const OfficesGrid: React.FC<OfficesGridProps> = ({ offices }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Regional Office Hubs & Operations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active organizational centers, member density, and performance yield
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          {offices.length} International Hubs Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offices.map((office) => (
          <div
            key={office.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 relative overflow-hidden"
          >
            {/* Top Header info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {office.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {office.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{office.location}, {office.city}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" />
                  {office.performance_score}% Score
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 dark:border-slate-800/80 my-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Members</span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                  {office.member_count}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Attendance</span>
                <p className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {office.attendance_rate}%
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Dues Collected</span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  ${(office.dues_collected / 1000).toFixed(1)}k
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total PV</span>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                  {(office.total_pv / 1000).toFixed(0)}k
                </p>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Summit Attendance Goal</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{office.attendance_rate}% / 100%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${office.attendance_rate}%` }}
                />
              </div>
            </div>

            {/* Manager info */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <span>Regional Director: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{office.manager_name}</strong></span>
              <span>Est. {office.established_year}</span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
