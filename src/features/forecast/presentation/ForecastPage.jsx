import React, { useEffect } from 'react';
import Sidebar from '../../../core/components/Sidebar';
import { Cloud, Sun, Calendar, Users, TrendingUp, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useForecastStore } from '../domain/useForecastStore';

const ForecastPage = () => {
  const { forecastData, impactFactors, selectedProduct, setSelectedProduct, fetchForecastData, isLoading } = useForecastStore();

  useEffect(() => {
    fetchForecastData();
  }, [fetchForecastData]);

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'sun': return <Sun className="text-restaurant-primary" size={24} />;
      case 'calendar': return <Calendar className="text-restaurant-accent" size={24} />;
      case 'users': return <Users className="text-restaurant-secondary" size={24} />;
      default: return <Info className="text-gray-400" size={24} />;
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-restaurant-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-restaurant-dark tracking-tighter uppercase">Demand Forecast</h1>
            <p className="text-restaurant-dark opacity-60 font-medium">Analyze future demand and prediction factors.</p>
          </div>
          <div className="flex gap-4">
            <select
              className="bg-white border border-restaurant-background rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-restaurant-primary outline-none transition-all shadow-sm"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option>All Products</option>
              <option>Beef Burger</option>
              <option>Chicken Pasta</option>
              <option>Fresh Salad</option>
            </select>
            <button className="bg-restaurant-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-restaurant-accent transition-all shadow-lg shadow-restaurant-primary/20">
              Export Forecast
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-restaurant-background">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-restaurant-dark">Actual vs. Prediction</h2>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-restaurant-dark opacity-60">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-restaurant-primary rounded-full" /> Actual</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-restaurant-secondary border-dashed rounded-full" /> Predicted</div>
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DBD9D5" strokeOpacity={0.5} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#56473A', opacity: 0.5, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#56473A', opacity: 0.5, fontSize: 12}} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#E5B141"
                    strokeWidth={3}
                    dot={{r: 4, fill: '#E5B141', strokeWidth: 0}}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#199B74"
                    strokeWidth={3}
                    dot={{r: 6, fill: '#199B74', strokeWidth: 0}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactFactors.map((factor, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-restaurant-background shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  {getIcon(factor.icon)}
                  <h3 className="text-xs font-black uppercase tracking-widest text-restaurant-dark">{factor.type}</h3>
                </div>
                <p className="text-sm text-restaurant-dark opacity-60 font-medium mb-2">{factor.val}</p>
                <div className={`flex items-center gap-2 text-sm font-black tracking-tight ${factor.impact.includes('+') ? 'text-restaurant-secondary' : 'text-gray-400'}`}>
                  {factor.impact.includes('+') && <TrendingUp size={16} />}
                  {factor.impact}
                </div>
              </div>
            ))}

            <div className="bg-restaurant-primary bg-opacity-5 p-6 rounded-2xl border border-restaurant-primary border-opacity-10">
              <div className="flex items-center gap-3 mb-3">
                <Info className="text-restaurant-primary" size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest text-restaurant-primary">AI Insight</h3>
              </div>
              <p className="text-[11px] text-restaurant-dark leading-relaxed font-bold italic opacity-70">
                Demand peaks on Friday evenings. Consider increasing preparation of Fresh Salad by 10%.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForecastPage;
