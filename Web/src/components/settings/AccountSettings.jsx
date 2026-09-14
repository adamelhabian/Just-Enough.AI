import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Toggle from '../common/Toggle';
import Alert from '../common/Alert';
import { User, Mail, Lock, Phone, ShieldCheck, Save, Camera, KeyRound } from 'lucide-react';
import './settings.css';

export const AccountSettings = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSave && onSave(formData);
      setLoading(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {savedSuccess && (
        <Alert type="success" title="Account Credentials Updated">
          Your manager profile and security preferences have been updated.
        </Alert>
      )}

      {/* Card 1: User Profile & Photo */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><User size={19} color="var(--terracotta)" /> Personal Manager Profile</h4>
            <p>Manage your account identity and kitchen management role.</p>
          </div>
        </div>

        <div className="account-avatar-card">
          <div className="account-avatar-circle">
            <img src={formData.avatar} alt={formData.name} />
            <div className="avatar-upload-badge" title="Change Photo">
              <Camera size={13} />
            </div>
          </div>
          <div className="avatar-meta">
            <h5>{formData.name || 'Manager Name'}</h5>
            <p>{formData.role || 'Kitchen Operations Manager'}</p>
            <Button variant="outline" size="sm" icon={Camera} style={{ marginTop: '0.5rem' }}>
              Upload New Photo
            </Button>
          </div>
        </div>

        <div className="sub-card-grid">
          <Input
            label="Full Name"
            icon={User}
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Work Email Address"
            type="email"
            icon={Mail}
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Direct Phone Number"
            icon={Phone}
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />

          <Input
            label="Manager Role & Title"
            icon={User}
            value={formData.role || ''}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>
      </div>

      {/* Card 2: Security & Password */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><KeyRound size={19} color="var(--terracotta)" /> Password & Authorization</h4>
            <p>Update your authentication password and account recovery phrase.</p>
          </div>
        </div>

        <div className="sub-card-grid">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            placeholder="••••••••••••"
          />

          <Input
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="••••••••••••"
            helperText="Minimum 8 characters with at least one number"
          />
        </div>
      </div>

      {/* Card 3: Two-Factor Authentication */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><ShieldCheck size={19} color="var(--emerald)" /> Two-Factor Security (2FA)</h4>
            <p>Add an extra layer of protection to safeguard operational inventory data.</p>
          </div>
        </div>

        <div style={{ padding: '0.5rem 0' }}>
          <Toggle
            checked={formData.twoFactorEnabled}
            onChange={(val) => setFormData({ ...formData, twoFactorEnabled: val })}
            label="Enable Two-Factor Authentication (2FA)"
            description="Requires an SMS verification code or Google Authenticator app when signing in from unrecognized browsers."
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="settings-action-bar">
        <span className="action-bar-text">
          Keep your email address updated to receive daily morning prep alerts.
        </span>
        <Button type="submit" variant="primary" icon={Save} loading={loading}>
          Save Account Changes
        </Button>
      </div>
    </form>
  );
};

export default AccountSettings;
