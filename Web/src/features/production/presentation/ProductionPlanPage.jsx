import React, { useEffect, useState } from 'react';
import Sidebar from '../../../core/components/Sidebar';
import { ChefHat, Timer, CheckCircle2, AlertCircle, ShoppingCart, Sliders, History, AlertTriangle } from 'lucide-react';
import { useProductionStore } from '../domain/useProductionStore';

const ProductionPlanPage = () => {
  const { items, auditLogs, fetchProductionItems, overrideItem, isLoading, error } = useProductionStore();
  const [activeItem, setActiveItem] = useState(null);
  const [overrideQty, setOverrideQty] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSuccess, setOverrideSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProductionItems();
  }, [fetchProductionItems]);

  const handleOpenOverride = (item) => {
    setActiveItem(item);
    setOverrideQty(item.recommended.toString());
    setOverrideReason('');
    setOverrideSuccess(false);
  };

  const handleSubmitOverride = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    setSubmitting(true);
    const res = await overrideItem(activeItem.id, overrideQty, overrideReason);
    setSubmitting(false);
    if (res.success) {
      setOverrideSuccess(true);
      setTimeout(() => {
        setActiveItem(null);
        setOverrideSuccess(false);
      }, 1200);
    }
  };

  return (
    <div className="flex min-h-screen bg-restaurant-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <span className="font-bold uppercase tracking-wider text-xs block">Service Status</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
            <button
              onClick={() => fetchProductionItems()}
              className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-restaurant-dark tracking-tighter uppercase flex items-center gap-3">
              <ChefHat className="text-restaurant-primary" size={32} />
              Kitchen Production & Prep Plan
            </h1>
            <p className="text-restaurant-dark opacity-60 font-medium">Quantile AI-guided prep batches with human manager override & immutable audit ledger.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-restaurant-background shadow-sm flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Timer className="text-restaurant-primary" size={20} />
              <span className="text-xs font-black uppercase tracking-widest text-restaurant-dark">Shift: Lunch Prep Batch</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-restaurant-background overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 flex justify-between items-start border-b border-restaurant-background border-opacity-30">
                  <div>
                    <h3 className="text-lg font-black text-restaurant-dark mb-2 tracking-tight">{item.name}</h3>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-restaurant-dark opacity-60">
                      <span>Predicted Demand: <strong className="text-restaurant-dark">{item.predicted} {item.unit}</strong></span>
                      <span className="text-restaurant-secondary">AI Recommended: <strong>{item.recommended} {item.unit}</strong></span>
                    </div>
                    {item.override_reason && (
                      <p className="mt-2 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                        <strong>Override Note:</strong> {item.override_reason}
                      </p>
                    )}
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.status === 'Overridden' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    item.status === 'Completed' ? 'bg-restaurant-secondary bg-opacity-10 text-restaurant-secondary border border-restaurant-secondary border-opacity-20' :
                    'bg-restaurant-primary bg-opacity-10 text-restaurant-primary border border-restaurant-primary border-opacity-20'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="p-6 bg-restaurant-background bg-opacity-20">
                  <h4 className="text-[10px] font-black text-restaurant-dark opacity-40 uppercase tracking-widest mb-4">Required Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ing, idx) => (
                      <span key={idx} className="bg-white px-3 py-1.5 rounded-xl border border-restaurant-background text-[11px] text-restaurant-dark font-bold shadow-sm">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 flex justify-end gap-4 bg-white border-t border-restaurant-background border-opacity-30">
                  <button
                    onClick={() => handleOpenOverride(item)}
                    className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-restaurant-dark opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <Sliders size={14} /> Override Quantity
                  </button>
                  <button className="bg-restaurant-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-restaurant-accent transition-all shadow-lg shadow-restaurant-primary/20">
                    Confirm Prep
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-restaurant-background">
              <h3 className="text-xs font-black uppercase tracking-widest text-restaurant-dark mb-8 flex items-center gap-2">
                <ShoppingCart size={16} className="text-restaurant-primary" />
                Shift Overview
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-restaurant-dark opacity-50 uppercase tracking-widest">Active Prep Items</span>
                  <span className="text-lg font-black text-restaurant-dark">{items.length} Products</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-restaurant-dark opacity-50 uppercase tracking-widest">Audit Entries</span>
                  <span className="text-lg font-black text-restaurant-dark">{auditLogs.length} Logged</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-restaurant-background rounded-full overflow-hidden">
                    <div className="h-full bg-restaurant-secondary w-2/3 shadow-sm shadow-restaurant-secondary/50" />
                  </div>
                  <p className="text-[10px] font-black text-restaurant-dark opacity-40 text-center uppercase tracking-widest">66% Batches Ready</p>
                </div>
              </div>
            </div>

            <div className="bg-restaurant-red bg-opacity-10 p-8 rounded-2xl border border-restaurant-red border-opacity-20 shadow-lg shadow-restaurant-red/5">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-restaurant-red" size={24} />
                <h3 className="text-xs font-black uppercase tracking-widest text-restaurant-red">Waste Protection Alert</h3>
              </div>
              <p className="text-sm text-restaurant-dark leading-relaxed font-bold italic opacity-70">
                P90 safety threshold: keep fresh produce prep capped within 24h holding limit to guarantee zero spoilage.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-restaurant-background">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <History className="text-restaurant-primary" size={24} />
              <div>
                <h2 className="text-lg font-black text-restaurant-dark uppercase tracking-tight">Audit Trail & Manager Overrides</h2>
                <p className="text-xs text-gray-500 font-medium">Immutable governance log recording every human intervention into AI recommendations.</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">
              {auditLogs.length} Records
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400 font-medium">
              No overrides recorded yet. Any adjustments to AI recommendations will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Actor</th>
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Old Qty</th>
                    <th className="pb-3">New Qty</th>
                    <th className="pb-3">Justification Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 text-gray-500">{log.created_at || 'Just now'}</td>
                      <td className="py-3 font-semibold text-gray-800">{log.actor_user_id || 'Manager'}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{log.payload?.old_qty ?? '-'}</td>
                      <td className="py-3 font-bold text-restaurant-primary">{log.payload?.new_qty ?? '-'}</td>
                      <td className="py-3 text-gray-700 italic">{log.payload?.reason || 'Shift adjustment'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Manager Override Modal */}
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
              {overrideSuccess ? (
                <div className="text-center py-6 flex flex-col items-center gap-3">
                  <CheckCircle2 size={48} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-restaurant-dark">Recommendation Overridden</h3>
                  <p className="text-xs text-gray-500">The quantity adjustment and reason have been committed to the immutable audit log.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitOverride}>
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <h3 className="font-black text-sm uppercase tracking-wider text-restaurant-dark flex items-center gap-2">
                      <Sliders size={18} className="text-restaurant-primary" /> Override: {activeItem.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveItem(null)}
                      className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-1">Current AI Recommendation</span>
                      <div className="p-3 bg-gray-50 rounded-xl font-bold text-gray-700">
                        {activeItem.recommended} {activeItem.unit}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-700 font-bold block mb-1">New Prep Quantity ({activeItem.unit})</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        required
                        value={overrideQty}
                        onChange={(e) => setOverrideQty(e.target.value)}
                        className="w-full p-3 border rounded-xl font-bold text-restaurant-dark focus:outline-restaurant-primary"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 font-bold block mb-1">
                        Override Justification Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows="3"
                        required
                        placeholder="e.g. VIP banquet reserved for 40 guests; increasing burger batch."
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="w-full p-3 border rounded-xl font-medium text-gray-700 focus:outline-restaurant-primary"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setActiveItem(null)}
                        className="px-4 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !overrideReason.trim()}
                        className="px-5 py-2 bg-restaurant-primary text-white rounded-xl font-bold shadow-lg shadow-restaurant-primary/30 hover:bg-restaurant-accent disabled:opacity-50"
                      >
                        {submitting ? 'Saving...' : 'Commit Override'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductionPlanPage;
