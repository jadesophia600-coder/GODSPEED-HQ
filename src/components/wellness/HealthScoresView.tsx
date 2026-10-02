import React from 'react';
import { HealthMetric } from '../../types';
import { HeartPulse, ShieldCheck, AlertTriangle, Award } from 'lucide-react';

interface HealthScoresViewProps {
  healthMetrics: HealthMetric[];
}

export const HealthScoresView: React.FC<HealthScoresViewProps> = ({ healthMetrics }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          Member Vitality & Organization Health Index
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Wellness assessment metrics, retention risk flags, and engagement ratings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthMetrics.map((hm) => (
          <div
            key={hm.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{hm.member_name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">Assessed: {hm.last_assessment_date}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                hm.engagement_grade.startsWith('A') 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200'
              }`}>
                Grade {hm.engagement_grade}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Vitality Index</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{hm.vitality_score}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${hm.vitality_score}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Activity Index</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{hm.activity_index}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${hm.activity_index}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Retention Risk Status:</span>
              <span className={`font-semibold ${
                hm.retention_risk === 'LOW' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {hm.retention_risk} RISK
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
