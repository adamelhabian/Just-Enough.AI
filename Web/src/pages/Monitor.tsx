import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, AlertTriangle, TrendingDown } from 'lucide-react';
import { api } from '../api/client';
import { InventoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const Monitor: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInventory().then(data => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="h-4 w-4 text-indigo-600" />
            Stock Safety & Buffer Intelligence
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Perishable Stock & Buffer Monitor
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Continuous real-time surveillance of stock levels vs safety buffers to preempt stockouts during peak trading hours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const bufferPct = Math.round((item.current_stock / item.safety_stock) * 100);
          return (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{item.name}</h3>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="flex items-baseline justify-between pt-2">
                <div>
                  <span className="text-2xl font-black text-slate-900">{item.current_stock}</span>
                  <span className="text-xs text-slate-500 ml-1">{item.unit} on hand</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-600">Buffer: {item.safety_stock} {item.unit}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Safety Buffer Adherence</span>
                  <span className={`font-bold ${bufferPct < 100 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {bufferPct}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      bufferPct < 70 ? 'bg-[#D32F2F]' : bufferPct < 100 ? 'bg-[#F57F17]' : 'bg-[#2E7D32]'
                    }`}
                    style={{ width: `${Math.min(bufferPct, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Reorder Point: {item.reorder_point} {item.unit}</span>
                <span>Last Counted: {item.last_counted}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
