import React, { useEffect } from 'react';
import Sidebar from '../../../core/components/Sidebar';
import { ChefHat, Timer, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { useProductionStore } from '../domain/useProductionStore';

const ProductionPlanPage = () => {
  const { items, fetchProductionItems, isLoading } = useProductionStore();

  useEffect(() => {
    fetchProductionItems();
  }, [fetchProductionItems]);

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-restaurant-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-restaurant-dark tracking-tighter uppercase flex items-center gap-3">
              <ChefHat className="text-restaurant-primary" size={32} />
              Kitchen Production Plan
            </h1>
            <p className="text-restaurant-dark opacity-60 font-medium">Optimized preparation list based on AI demand forecasting.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-restaurant-background shadow-sm flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Timer className="text-restaurant-primary" size={20} />
              <span className="text-xs font-black uppercase tracking-widest text-restaurant-dark">Shift: Morning Prep</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-restaurant-background overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 flex justify-between items-start border-b border-restaurant-background border-opacity-30">
                  <div>
                    <h3 className="text-lg font-black text-restaurant-dark mb-2 tracking-tight">{item.name}</h3>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-restaurant-dark opacity-60">
                      <span>Predicted: <span className="text-restaurant-dark">{item.predicted} {item.unit}</span></span>
                      <span className="text-restaurant-secondary">Recommended: {item.recommended} {item.unit}</span>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.status === 'Completed' ? 'bg-restaurant-secondary bg-opacity-10 text-restaurant-secondary border border-restaurant-secondary border-opacity-20' :
                    item.status === 'In Progress' ? 'bg-restaurant-primary bg-opacity-10 text-restaurant-primary border border-restaurant-primary border-opacity-20' :
                    'bg-gray-100 text-gray-400'
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
                  <button className="text-xs font-black uppercase tracking-widest text-restaurant-dark opacity-40 hover:opacity-100 transition-opacity">Adjust</button>
                  <button className="bg-restaurant-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-restaurant-accent transition-all shadow-lg shadow-restaurant-primary/20">
                    Start Prep
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-restaurant-background">
              <h3 className="text-xs font-black uppercase tracking-widest text-restaurant-dark mb-8 flex items-center gap-2">
                <ShoppingCart size={16} className="text-restaurant-primary" />
                Prep Summary
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-restaurant-dark opacity-50 uppercase tracking-widest">Items to Prep</span>
                  <span className="text-lg font-black text-restaurant-dark">12 Products</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-restaurant-dark opacity-50 uppercase tracking-widest">Est. Time</span>
                  <span className="text-lg font-black text-restaurant-dark">3.5 Hours</span>
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-restaurant-background rounded-full overflow-hidden">
                        <div className="h-full bg-restaurant-secondary w-1/3 shadow-sm shadow-restaurant-secondary/50" />
                    </div>
                    <p className="text-[10px] font-black text-restaurant-dark opacity-40 text-center uppercase tracking-widest">33% Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-restaurant-red bg-opacity-10 p-8 rounded-2xl border border-restaurant-red border-opacity-20 shadow-lg shadow-restaurant-red/5">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-restaurant-red" size={24} />
                <h3 className="text-xs font-black uppercase tracking-widest text-restaurant-red">Waste Warning</h3>
              </div>
              <p className="text-sm text-restaurant-dark leading-relaxed font-bold italic opacity-70">
                AI predicts low demand for **Seafood Pasta** today. Reduce recommended prep by 20% to avoid waste.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductionPlanPage;
