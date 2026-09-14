import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { signupUser } from '../../api/auth';

export const SignupPage = () => {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!businessName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await signupUser({ businessName, email, password, businessType });
      if (res.success) {
        localStorage.setItem('just_enough_token', res.token);
        navigate('/inventory');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Start forecasting today"
      subtitle="Create your business account to reduce waste and optimize production."
    >
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {error && <Alert type="critical">{error}</Alert>}

        <Input
          label="Business Name"
          icon={Building2}
          placeholder="e.g. Artisan Bakery & Kitchen"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

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
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Select
          label="Business Type"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          options={[
            'Restaurant',
            'Bakery',
            'Cafe',
            'Food Production & Catering'
          ]}
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          style={{ marginTop: '0.5rem' }}
        >
          Create Account
        </Button>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--terracotta)', fontWeight: 700 }}>
            Log In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
