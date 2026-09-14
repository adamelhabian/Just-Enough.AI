import React, { useEffect } from 'react';
import Sidebar from '../../../core/components/Sidebar';
import KPICard from '../../../core/components/KPICard';
import { TrendingUp, Target, AlertTriangle, ShieldCheck, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useDashboardStore } from '../domain/useDashboardStore';
import { getStoredMode } from '../../../api/config';

const DashboardPage = () => {
  const { chartData, stats, isLoading, error, mode, fetchDashboardData } = useDashboardStore();
  const currentMode = mode || getStoredMode() || 'LIVE';

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="flex min-h-screen bg-restaurant-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Error Banner when LIVE backend fails */}
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
              onClick={() => fetchDashboardData()}
              className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-restaurant-dark tracking-tighter uppercase">Restaurant Morning Brief</h1>
            <p className="text-restaurant-dark opacity-60 font-medium">Real-time demand forecasting, stockout risk mitigation, and prep plan.</p>
          </div>
          <div className="flex items-center gap-3">
            {currentMode === 'DEMO' || currentMode === 'DEMO / SYNTHETIC' ? (
              <div className="bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-900 font-bold text-xs uppercase tracking-wider">DEMO / SYNTHETIC</span>
              </div>
            ) : (
              <div className="bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-emerald-900 font-bold text-xs uppercase tracking-wider">LIVE API ACTIVE</span>
              </div>
            )}
            <button
              onClick={() => fetchDashboardData()}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
              title="Refresh Real-time Data"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* KPI Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Predicted Demand"
              value={stats.predictedDemand}
              trend="up"
              trendValue="12"
              icon={TrendingUp}
              color="bg-restaurant-primary"
            />
            <KPICard
              title="Forecast Accuracy"
              value={stats.accuracy}
              trend="up"
              trendValue="3"
              icon={Target}
              color="bg-restaurant-secondary"
            />
            <KPICard
              title="Waste Risk"
              value={stats.wasteRisk}
              trend="down"
              trendValue="8"
              icon={AlertTriangle}
              color="bg-restaurant-red"
            />
            <KPICard
              title="Stock Coverage"
              value={stats.stockCoverage}
              trend="down"
              trendValue="2"
              icon={ShieldCheck}
              color="bg-restaurant-secondary"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-restaurant-background">
            <h2 className="text-sm font-black uppercase tracking-widest text-restaurant-dark mb-6">Demand vs. Forecast</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#199B74" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#199B74" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DBD9D5" strokeOpacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#56473A', opacity: 0.5, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#56473A', opacity: 0.5, fontSize: 12}} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Inter' }}
                  />
                  <Area type="monotone" dataKey="demand" stroke="#199B74" fillOpacity={1} fill="url(#colorDemand)" strokeWidth={3} />
                  <Area type="monotone" dataKey="forecast" stroke="#E5B141" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights & Alerts */}
          <div className="space-y-6">
            <div className="bg-restaurant-dark text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <Sparkles className="absolute -right-4 -top-4 text-white opacity-5 w-32 h-32" />
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-restaurant-primary" />
                AI Operational Insights
              </h3>
              <ul className="space-y-4 text-sm text-restaurant-background opacity-80 font-medium">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-restaurant-primary rounded-full mt-1.5 shrink-0" />
                  Demand surge projected for dinner service (+18%) driven by local event traffic.
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-restaurant-primary rounded-full mt-1.5 shrink-0" />
                  Prep priority: Pre-portion 45 burger patties before 11:30 AM shift start.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-restaurant-background">
              <h3 className="text-xs font-black uppercase tracking-widest text-restaurant-dark mb-4">Operational Monitor Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-restaurant-red bg-opacity-10 rounded-xl border border-restaurant-red border-opacity-10">
                  <AlertTriangle className="text-restaurant-red" size={18} />
                  <div>
                    <p className="text-sm font-bold text-restaurant-dark tracking-tight">Low Stock: Ground Beef</p>
                    <p className="text-xs text-restaurant-dark opacity-60 font-medium">12.5 kg remaining. Suggested order: 30 kg.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-restaurant-secondary bg-opacity-10 rounded-xl border border-restaurant-secondary border-opacity-10">
                  <AlertTriangle className="text-restaurant-secondary" size={18} />
                  <div>
                    <p className="text-sm font-bold text-restaurant-dark tracking-tight">Prep Recommendation</p>
                    <p className="text-xs text-restaurant-dark opacity-60 font-medium">Prepare 20L Tomato Base by 14:00.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
