import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { OperationalAlert } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, user } = useAuth();

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.resolveAlert(id, user?.email || 'manager@justenough.ai');
      await loadAlerts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider mb-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Active Warning Center
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Operational Alerts & Anomaly Feed
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time critical inventory signals, impending ingredient expirations, and projected peak-hour stockouts.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
            <ShieldCheck className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Zero Active Operational Alerts</h3>
            <p className="text-sm text-slate-500 mt-1">All kitchen buffers and ingredient stocks are operating within target tolerances.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.status === 'RESOLVED'
                  ? 'border-slate-200 opacity-60 bg-slate-50/50'
                  : alert.severity === 'CRITICAL'
                  ? 'border-red-200 ring-1 ring-red-100'
                  : 'border-amber-200 ring-1 ring-amber-100'
              }`}
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-400">{alert.id}</span>
                  <span className="font-extrabold text-slate-900 text-sm">{alert.ingredient_name}</span>
                  <StatusBadge status={alert.severity === 'CRITICAL' ? 'CRITICAL' : 'LOW'} />
                  <span className="text-xs text-slate-500">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p className="text-sm text-slate-800 font-medium">{alert.message}</p>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-800">Suggested Resolution: </span>
                  {alert.suggested_action}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                {alert.status === 'RESOLVED' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4" /> Resolved
                  </span>
                ) : role === 'manager' ? (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    Acknowledge & Resolve
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">Manager action required</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
