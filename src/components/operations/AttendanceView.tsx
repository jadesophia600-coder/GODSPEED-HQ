import React, { useState } from 'react';
import { AttendanceRecord, UserRole } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { CalendarCheck, Plus, CheckCircle2, Search } from 'lucide-react';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  userRole: UserRole;
  onRecordCheckIn: (record: Partial<AttendanceRecord>) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  userRole,
  onRecordCheckIn
}) => {
  const [showModal, setShowModal] = useState(false);
  const [eventType, setEventType] = useState('Weekly Leadership Summit');
  const [search, setSearch] = useState('');

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordCheckIn({
      event_type: eventType,
      date: new Date().toISOString().slice(0, 10),
      check_in_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'ACTIVE'
    });
    setShowModal(false);
  };

  const filteredRecords = attendanceRecords.filter(r => 
    r.member_name.toLowerCase().includes(search.toLowerCase()) ||
    r.event_type.toLowerCase().includes(search.toLowerCase()) ||
    r.office_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Attendance Verification & Event Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track weekly summits, regional rallies, and office check-ins
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record Event Check-in
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, event or office..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-transparent focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Office Hub</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {r.member_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {r.office_name}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {r.event_type}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {r.date} • {r.check_in_time}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={r.status === 'ACTIVE' ? 'PRESENT' : r.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Record Attendance Check-in
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Log verified attendance for today's leadership session.
            </p>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Session
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                >
                  <option value="Weekly Leadership Summit">Weekly Leadership Summit</option>
                  <option value="Regional Strategy Briefing">Regional Strategy Briefing</option>
                  <option value="Executive Mastermind Huddle">Executive Mastermind Huddle</option>
                </select>
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
