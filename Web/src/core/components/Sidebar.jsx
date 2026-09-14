import React from 'react';
import { LayoutDashboard, TrendingUp, ClipboardList, Boxes, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../../components/common/BrandLogo';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingUp, label: 'Demand Forecast', path: '/forecast' },
    { icon: ClipboardList, label: 'Production Plan', path: '/production' },
    { icon: Boxes, label: 'Inventory Intelligence', path: '/inventory' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-restaurant-dark text-white h-screen fixed left-0 top-0 flex flex-col z-50">
      {/* Header with official logo */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link to="/" aria-label="Just Enough Home">
          <BrandLogo variant="light" height={36} />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="px-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
          MANAGEMENT & PLANNING
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive
                  ? 'bg-restaurant-primary text-white shadow-lg shadow-restaurant-primary/30 font-semibold'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-white/10">
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white w-full text-left transition-colors text-sm font-medium">
          <LogOut size={19} />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
