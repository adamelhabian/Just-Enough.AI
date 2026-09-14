import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Mail, Lock, ArrowRight, Globe } from 'lucide-react';
import { loginUser } from '../../api/auth';

export const LoginPage = () => {
  const [email, setEmail] = useState('sarah@artisankitchen.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        localStorage.setItem('just_enough_token', res.token);
        navigate('/inventory');
      }
    } catch (err) {
      setError('Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your demand forecasting portal."
    >
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && <Alert type="critical">{error}</Alert>}

        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="name@business.com"
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
            <span>Remember me</span>
          </label>
          <a href="#forgot" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Forgot password?</a>
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
          Log In
        </Button>

        <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
        </div>

        <Button
          variant="outline"
          fullWidth
          icon={Globe}
          onClick={() => {
            localStorage.setItem('just_enough_token', 'google_demo_token');
            navigate('/inventory');
          }}
        >
          Continue with Google
        </Button>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--terracotta)', fontWeight: 700 }}>
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
