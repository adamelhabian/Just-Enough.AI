import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, UserCheck, RefreshCw, Zap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, dataMode, logout, switchRole, setDataMode } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand & Branch */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-800 flex items-center justify-center text-white font-black text-lg shadow-sm">
              JE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base">JustEnough.AI</span>
                <span className="text-xs font-medium text-slate-500 hidden sm:inline">| Operations Engine</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                DHG Cairo • Branch R01 (Downtown Bistro)
              </p>
            </div>
          </div>

          {/* Controls: Mode & User Info */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <button
              onClick={() => setDataMode(dataMode === 'LIVE' ? 'DEMO' : 'LIVE')}
              title="Click to toggle Data Mode"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                dataMode === 'LIVE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200'
              }`}
            >
              {dataMode === 'LIVE' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE MODE
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 text-amber-600" />
                  DEMO / SYNTHETIC
                </>
              )}
            </button>

            {/* Role Quick Switch */}
            <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => switchRole('manager')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  role === 'manager'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manager
              </button>
              <button
                onClick={() => switchRole('employee')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  role === 'employee'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inventory
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.full_name || 'User'}</p>
                <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  {role === 'manager' ? 'Branch Manager' : 'Inventory Clerk'}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => logout()}
              title="Log Out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
