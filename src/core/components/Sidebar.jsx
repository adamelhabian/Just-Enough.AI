import React from 'react';
import { LayoutDashboard, TrendingUp, ClipboardList, LogOut, UtensilsCrossed } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: TrendingUp, label: 'Demand Forecast', path: '/forecast' },
    { icon: ClipboardList, label: 'Production Plan', path: '/production' },
  ];

  return (
    <div className="w-64 bg-restaurant-dark text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <UtensilsCrossed className="text-restaurant-primary w-8 h-8" />
        <span className="text-2xl font-bold tracking-tight text-white uppercase italic">Just Enough</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-restaurant-primary text-white shadow-lg shadow-restaurant-primary/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white w-full text-left transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
