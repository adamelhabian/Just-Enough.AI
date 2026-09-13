import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KPICard = ({ title, value, trend, trendValue, icon: Icon, color }) => {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-restaurant-background">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-restaurant-secondary' : 'text-restaurant-red'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}%
        </div>
      </div>
      <div>
        <h3 className="text-restaurant-dark text-opacity-60 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-2xl font-black text-restaurant-dark tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

export default KPICard;
