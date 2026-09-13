import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Recommendation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  SlidersHorizontal,
  Calculator,
  ShieldAlert,
  Info,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const RecommendationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideQty, setOverrideQty] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const { role, user } = useAuth();

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getRecommendation(id);
      if (data) {
        setRec(data);
        setOverrideQty(data.override_qty !== undefined && data.override_qty !== null ? data.override_qty : data.recommended_order_qty);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!rec) return;
    try {
      await api.acceptRecommendation(rec.id, user?.email || 'manager@justenough.ai');
      setActionSuccess('Order recommendation successfully approved and sent to Procurement.');
      await loadDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rec) return;
    try {
      await api.overrideRecommendation(rec.id, Number(overrideQty), overrideReason, user?.email || 'manager@justenough.ai');
      setActionSuccess(`Recommendation overridden to ${overrideQty} ${rec.unit} with documented reason.`);
      setIsOverriding(false);
      await loadDetail();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !rec) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading recommendation details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Operations
      </button>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-slate-400 font-bold">{rec.id}</span>
              <StatusBadge status={rec.status === 'PENDING' ? rec.risk_factor : rec.status} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">{rec.ingredient_name}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" /> Supplier: {rec.supplier_name || 'Cairo Meat & Protein Co.'} •
              <Calendar className="h-3.5 w-3.5 ml-2" /> For: {rec.date}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
            <span className="text-xs uppercase font-bold text-slate-400 block">AI Recommended Order</span>
            <div className="text-3xl font-black text-slate-900">
              {rec.override_qty !== undefined && rec.override_qty !== null ? rec.override_qty : rec.recommended_order_qty}
              <span className="text-sm text-slate-500 ml-1 font-semibold">{rec.unit}</span>
            </div>
            {rec.override_qty !== undefined && rec.override_qty !== null && (
              <span className="text-[10px] text-blue-600 font-bold block">Overridden from {rec.recommended_order_qty} {rec.unit}</span>
            )}
          </div>
        </div>

        {/* Manager Actions Bar */}
        {role === 'manager' && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {rec.status === 'PENDING' && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve PO Recommendation
                </button>
                <button
                  onClick={() => setIsOverriding(!isOverriding)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="h-4 w-4" /> {isOverriding ? 'Cancel Override' : 'Modify / Override Quantity'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Override Form Modal/Drawer */}
      {isOverriding && (
        <form onSubmit={handleOverrideSubmit} className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            Branch Manager Override Console
          </div>
          <p className="text-xs text-blue-800">
            You are overriding the automated replenishment calculation. All overrides are permanently recorded in the immutable compliance audit ledger.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                New Order Quantity ({rec.unit})
              </label>
              <input
                type="number"
                required
                min={0}
                value={overrideQty}
                onChange={(e) => setOverrideQty(Number(e.target.value))}
                className="w-full bg-white p-2.5 border border-slate-300 rounded-lg text-base font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Mandatory Business Justification Reason
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VIP banquet reserved on Friday night; +30 patties required."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full bg-white p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOverriding(false)}
              className="px-4 py-2 bg-white text-slate-700 font-bold text-xs rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!overrideReason || overrideReason.length < 5}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg disabled:opacity-50"
            >
              Commit Manager Override
            </button>
          </div>
        </form>
      )}

      {/* Math & Reasoning Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Calculator className="h-5 w-5 text-emerald-700" />
          Replenishment Formula & Constraint Breakdown
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Forecast Demand</span>
            <span className="text-xl font-black text-slate-800">{rec.predicted_demand}</span>
            <span className="text-xs text-slate-500 ml-1">{rec.unit}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">+ Safety Buffer</span>
            <span className="text-xl font-black text-slate-800">{rec.safety_stock}</span>
            <span className="text-xs text-slate-500 ml-1">{rec.unit}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">- Current Stock</span>
            <span className="text-xl font-black text-slate-800">{rec.current_inventory}</span>
            <span className="text-xs text-slate-500 ml-1">{rec.unit}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Supplier Pack Size</span>
            <span className="text-xl font-black text-slate-800">{rec.pack_size}</span>
            <span className="text-xs text-slate-500 ml-1">{rec.unit}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            AI Confidence Score: {Math.round(rec.confidence_score * 100)}%
          </div>
          <p>
            Net deficit is calculated as: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
              max(0, {rec.predicted_demand} + {rec.safety_stock} - {rec.current_inventory}) = {Math.max(0, rec.predicted_demand + rec.safety_stock - rec.current_inventory)} {rec.unit}
            </code>.
            This is rounded up to the nearest wholesale case size of {rec.pack_size} {rec.unit}, yielding a final order recommendation of <span className="font-bold text-slate-900">{rec.recommended_order_qty} {rec.unit}</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
