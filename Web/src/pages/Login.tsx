import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('manager@justenough.ai');
  const [password, setPassword] = useState('ChangeMeBeforeProduction!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, dataMode, setDataMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/morning-brief');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail: string, demoRole: 'manager' | 'employee') => {
    setEmail(demoEmail);
    setPassword('ChangeMeBeforeProduction!');
    if (dataMode !== 'DEMO') {
      // Allow seamless demo test
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-emerald-700 items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-900/50 mb-4">
          JE
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">JustEnough.AI</h2>
        <p className="mt-2 text-sm text-slate-400">
          Intelligent Forecasting & Dynamic Food-Waste Reduction Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-sm text-red-700 flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Login Error: </span>
                  {error}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Email
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  placeholder="manager@justenough.ai"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Operations Console'}
              </button>
            </div>
          </form>

          {/* Quick Fill Demo Roles */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Quick Demo Persona Fill:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill('manager@justenough.ai', 'manager')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg border border-slate-200 text-left transition-colors"
              >
                Branch Manager
                <span className="block text-[10px] text-slate-400 font-normal">Full AI Approval</span>
              </button>
              <button
                type="button"
                onClick={() => quickFill('inventory@justenough.ai', 'employee')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg border border-slate-200 text-left transition-colors"
              >
                Inventory Clerk
                <span className="block text-[10px] text-slate-400 font-normal">Counts & Waste</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
