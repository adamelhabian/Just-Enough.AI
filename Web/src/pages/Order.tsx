import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle2, SlidersHorizontal, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { Recommendation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Order: React.FC = () => {
  const [orders, setOrders] = useState<Recommendation[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations();
      setOrders(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.acceptRecommendation(id, user?.email || 'manager@justenough.ai');
      await loadOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = orders.filter(o => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            Replenishment Engine
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Purchase Orders & Recommendations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Algorithmically generated POs optimized for supplier minimum order quantities (MOQ), pack sizes, and shelf life.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          {['ALL', 'PENDING', 'ACCEPTED', 'OVERRIDDEN'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === f ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Ingredient</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Stock / Buffer</th>
                <th className="py-3.5 px-4 text-center">Forecast Demand</th>
                <th className="py-3.5 px-4 text-center">Pack Size</th>
                <th className="py-3.5 px-4 text-right">Recommended PO</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{rec.ingredient_name}</div>
                    <div className="text-xs text-slate-400 font-mono">{rec.id}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium text-xs">
                    {rec.supplier_name || 'Direct Wholesale'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="font-semibold text-slate-800 text-xs">
                      {rec.current_inventory} {rec.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">Buffer: {rec.safety_stock} {rec.unit}</div>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-800 text-xs">
                    {rec.predicted_demand} {rec.unit}
                  </td>
                  <td className="py-4 px-4 text-center text-xs text-slate-600">
                    {rec.pack_size} {rec.unit}/pack
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-base font-black text-slate-900">
                      {rec.override_qty !== undefined && rec.override_qty !== null ? rec.override_qty : rec.recommended_order_qty}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">{rec.unit}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <StatusBadge status={rec.status === 'PENDING' ? rec.risk_factor : rec.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {role === 'manager' && rec.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(rec.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/app/recommendations/${rec.id}`)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Full Math & Override"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
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
