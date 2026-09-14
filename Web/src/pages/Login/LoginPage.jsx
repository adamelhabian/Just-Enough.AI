import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Mail, Lock, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { loginUser } from '../../api/auth';
import { CONFIG, getStoredMode, setStoredMode } from '../../api/config';

export const LoginPage = () => {
  const [dataMode, setDataMode] = useState(getStoredMode() || 'LIVE');
  const [email, setEmail] = useState('admin@justenough.local');
  const [password, setPassword] = useState('AdminSecret123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleModeChange = (newMode) => {
    setDataMode(newMode);
    setStoredMode(newMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      setStoredMode(dataMode);
      const res = await loginUser({ email, password });
      if (res.success) {
        localStorage.setItem(CONFIG.storageKeys.token, res.token);
        localStorage.setItem(CONFIG.storageKeys.user, JSON.stringify(res.user));
        navigate('/dashboard');
      } else {
        setError('Login failed: Check credentials or service availability.');
      }
    } catch (err) {
      setError(err.message || 'SERVICE UNAVAILABLE: Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="JustEnough Restaurant AI"
      subtitle="Sign in to your enterprise demand forecasting & food waste control tower."
    >
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <Alert type="critical">
            <strong>{error.includes('SERVICE UNAVAILABLE') ? 'SERVICE UNAVAILABLE' : 'Error'}:</strong> {error}
          </Alert>
        )}

        {/* Data Mode Selector - LIVE is default */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={15} /> System Data Mode
          </label>
          <select
            id="dataModeSelect"
            value={dataMode}
            onChange={(e) => handleModeChange(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              backgroundColor: dataMode === 'DEMO' ? '#FFFBEB' : '#F0FDF4',
              color: dataMode === 'DEMO' ? '#92400E' : '#065F46',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            <option value="LIVE" selected>LIVE (Production Backend http://127.0.0.1:8000)</option>
            <option value="DEMO">DEMO / SYNTHETIC (Offline Evaluation)</option>
          </select>
          {dataMode === 'DEMO' && (
            <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 500 }}>
              Notice: DEMO / SYNTHETIC mode explicitly active. Real DB sync is paused.
            </span>
          )}
        </div>

        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="admin@justenough.local"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--terracotta)' }}
            />
            <span>Remember session</span>
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Seeded: admin@justenough.local
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
        >
          {dataMode === 'DEMO' ? 'Enter in Demo Mode' : 'Sign In to Live Portal'}
        </Button>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Enterprise Multitenant • 52-Feature Quantile AI • Zero Silent Fallback
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
