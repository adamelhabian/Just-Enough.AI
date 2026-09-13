import React, { useEffect, useState } from 'react';
import { Boxes, Search, Plus, SlidersHorizontal, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { InventoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'COUNT' | 'ADJUST' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [countInput, setCountInput] = useState<number>(0);
  const [adjustInput, setAdjustInput] = useState<number>(0);
  const [reasonInput, setReasonInput] = useState('');
  const { user } = useAuth();

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setItems(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openCountModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setCountInput(item.current_stock);
    setActiveModal('COUNT');
  };

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustInput(0);
    setReasonInput('');
    setActiveModal('ADJUST');
  };

  const handleSaveCount = async () => {
    if (!selectedItem) return;
    try {
      await api.recordInventoryCount(selectedItem.id, Number(countInput), user?.email || 'inventory@justenough.ai');
      setActiveModal(null);
      await loadItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveAdjust = async () => {
    if (!selectedItem) return;
    try {
      await api.adjustStock(selectedItem.id, Number(adjustInput), reasonInput, user?.email || 'inventory@justenough.ai');
      setActiveModal(null);
      await loadItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const categories = ['ALL', 'Proteins', 'Bakery', 'Dairy', 'Produce', 'Condiments', 'Frozen', 'Pantry'];

  const filtered = items.filter(i => {
    const matchesCat = category === 'ALL' || i.category.toLowerCase() === category.toLowerCase();
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Boxes className="h-4 w-4 text-emerald-600" />
            Stock Ledger & Storage
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Live Inventory Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Physical stock counts, delivery receipts, kitchen prep waste recording, and variance reconciliations.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search ingredient or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                category === c
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Ingredient</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Safety Buffer</th>
                <th className="py-3.5 px-4 text-right">Reorder Point</th>
                <th className="py-3.5 px-4 text-center">Health Status</th>
                <th className="py-3.5 px-6 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.id} • Counted: {item.last_counted}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                    {item.category}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-base font-black text-slate-900">{item.current_stock}</span>
                    <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-medium text-slate-600">
                    {item.safety_stock} {item.unit}
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-medium text-slate-600">
                    {item.reorder_point} {item.unit}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openCountModal(item)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Record Count
                      </button>
                      <button
                        onClick={() => openAdjustModal(item)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs border border-emerald-200 transition-colors"
                      >
                        Adjust / Waste
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Physical Count */}
      {activeModal === 'COUNT' && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Record Physical Cycle Count</h3>
            <p className="text-xs text-slate-600">
              Update real physical stock for <span className="font-bold text-slate-800">{selectedItem.name}</span>.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Physical Units Counted ({selectedItem.unit})
              </label>
              <input
                type="number"
                value={countInput}
                onChange={(e) => setCountInput(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-lg"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Previous system stock: {selectedItem.current_stock} {selectedItem.unit} (Variance: {countInput - selectedItem.current_stock} {selectedItem.unit})
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCount}
                className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-800 shadow-xs"
              >
                Commit Count to Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Stock Adjustment / Waste */}
      {activeModal === 'ADJUST' && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Stock Adjustment & Waste Entry</h3>
            <p className="text-xs text-slate-600">
              Record inventory delta for <span className="font-bold text-slate-800">{selectedItem.name}</span>.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Quantity Delta (e.g. -5 for spoilage/waste, +10 for received lot)
              </label>
              <input
                type="number"
                value={adjustInput}
                onChange={(e) => setAdjustInput(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Mandatory Operational Justification Reason
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. Broken packaging during morning unloading; or dropped during kitchen prep."
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjust}
                disabled={!reasonInput || reasonInput.length < 5}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 disabled:opacity-40"
              >
                Submit Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
