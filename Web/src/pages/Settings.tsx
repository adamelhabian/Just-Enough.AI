import React, { useState } from 'react';
import { SlidersHorizontal, Server, Zap, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl, api } from '../api/client';

export const Settings: React.FC = () => {
  const { dataMode, setDataMode } = useAuth();
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.checkHealth();
      setTestResult(`SUCCESS: Connected to ${res.status} backend v${res.version} (DB: ${res.database})`);
    } catch (err: any) {
      setTestResult(`CONNECTION FAILED: ${err.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">
          <SlidersHorizontal className="h-4 w-4 text-slate-600" />
          Environment & Connectivity
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System & Runtime Configuration
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Control operational data modes, configure FastAPI endpoints, and manage zero-cost cloud deployment parameters.
        </p>
      </div>

      {/* Mode Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Data Operational Mode
        </h2>
        <p className="text-xs text-slate-600">
          Select whether JustEnough operates connected to the live FastAPI PostgreSQL backend or in an isolated synthetic demo mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div
            onClick={() => setDataMode('LIVE')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              dataMode === 'LIVE'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">LIVE BACKEND</span>
              {dataMode === 'LIVE' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Connects to FastAPI endpoints at <code className="font-mono text-[11px]">{apiUrl}</code>. Strictly requires live database connectivity.
            </p>
          </div>

          <div
            onClick={() => setDataMode('DEMO')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              dataMode === 'DEMO'
                ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">DEMO / SYNTHETIC</span>
              {dataMode === 'DEMO' && <CheckCircle2 className="h-4 w-4 text-amber-600" />}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Full offline standalone simulator. High-fidelity synthetic restaurant data for Cairo Bistro R01 with full override workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Backend API URL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Server className="h-4 w-4 text-blue-600" />
          Backend API Service Endpoint
        </h2>

        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              API Base URL (e.g. Local FastAPI or Render Cloud URL)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full font-mono text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
              placeholder="http://127.0.0.1:8000/api/v1"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800"
            >
              Save URL
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testLoading}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testLoading ? 'animate-spin' : ''}`} />
              Test Health Endpoint
            </button>
            {saved && <span className="text-xs text-emerald-600 font-bold">Settings saved!</span>}
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs font-mono mt-3 ${
              testResult.startsWith('SUCCESS') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testResult}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
