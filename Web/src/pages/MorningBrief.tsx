import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { MorningBriefSummary, Recommendation, OperationalAlert } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  Sun,
  AlertTriangle,
  ChefHat,
  ShoppingCart,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  ShieldCheck
} from 'lucide-react';

export const MorningBrief: React.FC = () => {
  const [brief, setBrief] = useState<MorningBriefSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role, user, dataMode } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMorningBrief();
      setBrief(data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to live backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dataMode]);

  const handleAcceptOrder = async (id: string) => {
    try {
      await api.acceptRecommendation(id, user?.email || 'manager@justenough.ai');
      await loadData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveAlert(id, user?.email || 'manager@justenough.ai');
      await loadData();
    } catch (err: any) {
      alert(`Alert resolution error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-semibold">Synthesizing Morning Brief Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Sun className="h-4 w-4 text-amber-500" />
            Operational Shift Readiness • {brief?.date}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Executive Morning Operations Brief
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Synthesized AI priorities for <span className="font-semibold text-slate-800">Branch R01 (Downtown Cairo Bistro)</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Intelligence
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={loadData}
            className="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Critical Shortages</span>
            <Flame className="h-4 w-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#D32F2F]">{brief?.kpis.shortage_risks || 0}</span>
            <span className="text-xs text-slate-500">Items below safety</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Action needed before 11:00 AM shift</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Waste Risk Items</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F57F17]">{brief?.kpis.waste_risks || 0}</span>
            <span className="text-xs text-slate-500">Expiring ≤ 48 hrs</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Requires daily specials promotion</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Inventory Health</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#2E7D32]">{brief?.kpis.stock_health_pct || 94}%</span>
            <span className="text-xs text-slate-500">Buffer adherence</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Target threshold: ≥ 90%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Forecasted Covers</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{brief?.kpis.forecasted_covers || 240}</span>
            <span className="text-xs text-slate-500">Guest meals today</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">+14% vs last Thursday baseline</p>
        </div>
      </div>

      {/* SECTION 1: What Should I PREPARE? */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <ChefHat className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">1. What Should Kitchen PREPARE Today?</h2>
              <p className="text-xs text-slate-500">Recommended prep batches based on 240 projected meal covers.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/prepare')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Prep Station View <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {brief?.to_prepare.map((item) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.product_name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.batch_quantity} {item.unit}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">BOM Ingredients: </span>
                  {item.recipe_summary}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Deadline</span>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    {item.completion_deadline}
                  </span>
                </div>
                <StatusBadge status={item.status === 'DONE' ? 'ACCEPTED' : 'PENDING'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: What Should I ORDER? */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">2. What Should I ORDER from Suppliers?</h2>
              <p className="text-xs text-slate-500">Automated purchase recommendations adjusted for supplier MOQ & pack sizes.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/order')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            All Purchase Orders <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {brief?.to_order.map((rec) => (
            <div key={rec.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{rec.ingredient_name}</span>
                  <StatusBadge status={rec.risk_factor} />
                  <span className="text-xs text-slate-400">Supplier: {rec.supplier_name || 'Primary Partner'}</span>
                </div>
                <p className="text-xs text-slate-600">
                  Forecasted Demand: <span className="font-semibold text-slate-800">{rec.predicted_demand} {rec.unit}</span> •
                  Current Stock: <span className={`font-semibold ${rec.current_inventory <= rec.safety_stock ? 'text-red-600' : 'text-slate-800'}`}>{rec.current_inventory} {rec.unit}</span> •
                  Safety Buffer: <span className="font-semibold text-slate-800">{rec.safety_stock} {rec.unit}</span>
                </p>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">AI Logic: </span>
                  {rec.risk_factor === 'SHORTAGE'
                    ? `Current stock (${rec.current_inventory}) is below buffer (${rec.safety_stock}). Recommended order of ${rec.recommended_order_qty} ${rec.unit} rounded to pack size of ${rec.pack_size}.`
                    : `Adequate supply on hand. No replenishment needed to avoid expiration risk.`}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex items-center gap-3 self-end lg:self-center">
                <div className="text-right mr-2">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">AI Recommended PO</span>
                  <span className="text-base font-black text-slate-900">
                    {rec.override_qty !== undefined && rec.override_qty !== null ? rec.override_qty : rec.recommended_order_qty} {rec.unit}
                  </span>
                </div>

                {role === 'manager' ? (
                  rec.status === 'ACCEPTED' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4" /> Approved
                    </span>
                  ) : rec.status === 'OVERRIDDEN' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      <SlidersHorizontal className="h-4 w-4" /> Overridden
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptOrder(rec.id)}
                        className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-lg shadow-xs transition-colors"
                      >
                        Approve PO
                      </button>
                      <button
                        onClick={() => navigate(`/app/recommendations/${rec.id}`)}
                        className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
                      >
                        Override / Inspect
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => navigate(`/app/recommendations/${rec.id}`)}
                    className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3 & 4: Operational Alerts & What to Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900">3. Active Operational Alerts</h2>
            </div>
            <button
              onClick={() => navigate('/app/alerts')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Alert Center
            </button>
          </div>
          <div className="p-4 space-y-3">
            {brief?.alerts.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">Zero active operational alerts. Operations optimal.</p>
            ) : (
              brief?.alerts.map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{alert.ingredient_name}</span>
                    <StatusBadge status={alert.severity === 'CRITICAL' ? 'CRITICAL' : 'LOW'} />
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{alert.message}</p>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Action: </span>
                    {alert.suggested_action}
                  </p>
                  {role === 'manager' && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1 block"
                    >
                      ✓ Mark Resolved
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* What to Monitor */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">4. Perishable Buffer Watchlist</h2>
            </div>
            <button
              onClick={() => navigate('/app/inventory')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Full Inventory
            </button>
          </div>
          <div className="p-4 space-y-3">
            {brief?.to_monitor.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Current: <span className="font-semibold text-slate-800">{item.current_stock} {item.unit}</span> (Safety buffer: {item.safety_stock} {item.unit})
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
