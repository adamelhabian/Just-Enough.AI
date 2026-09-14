import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { Building2, MapPin, Clock, Users, Save } from 'lucide-react';
import './settings.css';

export const BusinessSettings = ({ initialData, onSave }) => {
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {savedSuccess && (
        <Alert type="success" title="Business Settings Saved">
          Your venue profile and operational parameters have been updated across the platform.
        </Alert>
      )}

      {/* Card 1: General Information */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><Building2 size={20} color="var(--terracotta)" /> General Business Information</h4>
            <p>Define your primary venue identity and culinary business classification.</p>
          </div>
        </div>

        <div className="sub-card-grid-2">
          <Input
            label="Business / Venue Name"
            icon={Building2}
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            helperText="Appears on daily kitchen prep sheets & invoices"
          />

          <Select
            label="Business Category"
            value={formData.type || 'Bakery & Cafe'}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              'Restaurant (Full Service)',
              'Bakery & Pastry Shop',
              'Cafe & Coffee House',
              'Food Production & Catering',
              'Dark Kitchen / Ghost Kitchen'
            ]}
          />
        </div>
      </div>

      {/* Card 2: Location & Schedule */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><MapPin size={20} color="var(--terracotta)" /> Location & Operating Schedule</h4>
            <p>Physical venue address used for local weather sync and holiday event tracking.</p>
          </div>
        </div>

        <div className="sub-card-grid-3">
          <Input
            label="Street Address / Location"
            icon={MapPin}
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. 742 Evergreen Terrace, Downtown"
          />

          <Input
            label="Daily Opening Hours"
            icon={Clock}
            value={formData.openingHours || ''}
            onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
            placeholder="e.g. 07:00 AM - 09:00 PM"
          />

          <Select
            label="Venue Timezone"
            value={formData.timezone || 'America/New_York (EST)'}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            options={[
              'America/New_York (EST)',
              'America/Chicago (CST)',
              'America/Denver (MST)',
              'America/Los_Angeles (PST)',
              'Europe/London (GMT)'
            ]}
          />
        </div>
      </div>

      {/* Card 3: Scaling & Financial Metrics */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><Users size={20} color="var(--terracotta)" /> Operational Scale & Currency</h4>
            <p>Staffing size and currency standards for profit loss & waste calculations.</p>
          </div>
        </div>

        <div className="sub-card-grid-2">
          <Input
            label="Active Staff / Employees"
            icon={Users}
            value={formData.employees || ''}
            onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
            placeholder="e.g. 18 staff members"
          />

          <Select
            label="Reporting Currency"
            value={formData.currency || 'USD ($)'}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)']}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="settings-action-bar">
        <span className="action-bar-text">
          Changes will take effect immediately across all daily production schedules.
        </span>
        <Button type="submit" variant="primary" icon={Save} loading={loading}>
          Save Business Profile
        </Button>
      </div>
    </form>
  );
};

export default BusinessSettings;
