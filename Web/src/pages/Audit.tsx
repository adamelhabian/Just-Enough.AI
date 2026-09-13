import React, { useEffect, useState } from 'react';
import { ClipboardList, ShieldCheck, Filter } from 'lucide-react';
import { api } from '../api/client';
import { AuditLog } from '../types';

export const Audit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    api.getAuditLogs().then(setLogs);
  }, []);

  const filtered = logs.filter(l => {
    if (filter === 'ALL') return true;
    return l.action_type === filter;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">
            <ClipboardList className="h-4 w-4 text-slate-600" />
            Compliance & Operations Integrity
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Immutable Audit Trail
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Chronological audit records of all manager order overrides, physical stock adjustments, and alert resolutions.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          {['ALL', 'RECOMMENDATION_OVERRIDE', 'RECOMMENDATION_ACCEPT', 'INVENTORY_COUNT', 'STOCK_ADJUSTMENT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === f ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Old → New Value</th>
                <th className="py-3.5 px-6">Documented Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-xs">{log.user_email}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{log.user_role}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-slate-600">
                    {log.target_id}
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className="text-slate-400 line-through">{log.previous_value}</span>
                    <span className="text-slate-400 mx-1.5">→</span>
                    <span className="font-bold text-slate-900">{log.new_value}</span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700 italic">
                    "{log.reason}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
