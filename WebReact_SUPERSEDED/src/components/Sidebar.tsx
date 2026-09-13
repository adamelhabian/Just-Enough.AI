import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sun,
  ChefHat,
  ShoppingCart,
  Activity,
  AlertTriangle,
  Boxes,
  ClipboardList,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const links = [
    { to: '/app/morning-brief', label: 'Morning Brief', icon: Sun, highlight: true },
    { to: '/app/prepare', label: 'Kitchen Prep', icon: ChefHat },
    { to: '/app/order', label: 'Purchase Orders', icon: ShoppingCart },
    { to: '/app/monitor', label: 'Buffer Monitor', icon: Activity },
    { to: '/app/alerts', label: 'Operational Alerts', icon: AlertTriangle, badge: '2' },
    { to: '/app/inventory', label: 'Live Inventory', icon: Boxes },
    { to: '/app/audit', label: 'Audit Trail', icon: ClipboardList },
    { to: '/app/settings', label: 'System Settings', icon: SlidersHorizontal },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Daily Operations
        </div>
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Context Helper */}
      <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
        <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">Active Persona Scope</div>
        <p className="text-xs text-slate-200 font-medium">
          {role === 'manager' ? 'Branch Manager (Full Authority)' : 'Inventory Specialist (Stock & Count)'}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {role === 'manager'
            ? 'Can approve AI orders, execute quantity overrides, and resolve alerts.'
            : 'Can log physical cycle counts, receive stock, and report kitchen waste.'}
        </p>
      </div>
    </aside>
  );
};
