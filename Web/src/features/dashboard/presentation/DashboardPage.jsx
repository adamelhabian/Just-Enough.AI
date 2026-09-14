import React, { useEffect } from 'react';
import Sidebar from '../../../core/components/Sidebar';
import KPICard from '../../../core/components/KPICard';
import { TrendingUp, Target, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useDashboardStore } from '../domain/useDashboardStore';

const DashboardPage = () => {
  const { chartData, stats, isLoading, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading || !stats) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-restaurant-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-restaurant-dark tracking-tighter uppercase">Restaurant Overview</h1>
            <p className="text-restaurant-dark opacity-60 font-medium">Welcome back, here's your AI-powered insights for today.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-restaurant-primary bg-opacity-10 px-4 py-2 rounded-xl flex items-center gap-2 border border-restaurant-primary border-opacity-20">
              <Sparkles className="text-restaurant-primary" size={18} />
              <span className="text-restaurant-primary font-black text-xs uppercase tracking-widest">AI Active</span>
            </div>
          </div>
        </header>

        {/* KPI Grid */}
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
                AI Insights
              </h3>
              <ul className="space-y-4 text-sm text-restaurant-background opacity-80 font-medium">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-restaurant-primary rounded-full mt-1.5 shrink-0" />
                  Expect 15% more demand for Outdoor Seating today due to 22°C weather.
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-restaurant-primary rounded-full mt-1.5 shrink-0" />
                  Local football game at 7 PM may increase Takeout orders by 20%.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-restaurant-background">
              <h3 className="text-xs font-black uppercase tracking-widest text-restaurant-dark mb-4">Critical Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-restaurant-red bg-opacity-10 rounded-xl border border-restaurant-red border-opacity-10">
                  <AlertTriangle className="text-restaurant-red" size={18} />
                  <div>
                    <p className="text-sm font-bold text-restaurant-dark tracking-tight">Chicken Breast Low</p>
                    <p className="text-xs text-restaurant-dark opacity-60 font-medium">Stock expires in 2 days. 20kg needed.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-restaurant-secondary bg-opacity-10 rounded-xl border border-restaurant-secondary border-opacity-10">
                  <AlertTriangle className="text-restaurant-secondary" size={18} />
                  <div>
                    <p className="text-sm font-bold text-restaurant-dark tracking-tight">Overstock Risk</p>
                    <p className="text-xs text-restaurant-dark opacity-60 font-medium">Tomatoes above optimal levels by 15%.</p>
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
