import React, { useState } from 'react';
import Toggle from '../common/Toggle';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { Bell, Save, AlertTriangle, ChefHat, MessageSquare } from 'lucide-react';
import './settings.css';

export const NotificationSettings = ({ initialData, onSave }) => {
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

  const updateToggle = (key, val) => {
    setFormData({ ...formData, [key]: val });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {savedSuccess && (
        <Alert type="success" title="Notification Preferences Saved">
          Your alert channels and trigger thresholds have been updated.
        </Alert>
      )}

      {/* Card 1: Inventory Risk Triggers */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><AlertTriangle size={19} color="var(--terracotta)" /> Inventory & Stock Warning Triggers</h4>
            <p>Control when the platform alerts kitchen managers about stock deficits or overstock risks.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
          <Toggle
            checked={formData.lowStockAlerts}
            onChange={(val) => updateToggle('lowStockAlerts', val)}
            label="Low Stock Deficit Warnings"
            description="Immediate notification when ingredient stock drops below predicted shift demand requirements."
          />

          <Toggle
            checked={formData.overstockAlerts}
            onChange={(val) => updateToggle('overstockAlerts', val)}
            label="Overstock & Waste Expiry Risk Alerts"
            description="Alert when perishable ingredient inventory exceeds 7-day projected consumption."
          />
        </div>
      </div>

      {/* Card 2: Kitchen & Operations Digest */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><ChefHat size={19} color="var(--golden)" /> Daily Kitchen & Prep Digests</h4>
            <p>Scheduled morning prep summaries for chefs and head operations leads.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
          <Toggle
            checked={formData.forecastUpdates}
            onChange={(val) => updateToggle('forecastUpdates', val)}
            label="Morning Shift Demand Summary"
            description="Receive a 06:30 AM daily email digest detailing predicted sales surges and weather adjustments."
          />

          <Toggle
            checked={formData.productionRecommendations}
            onChange={(val) => updateToggle('productionRecommendations', val)}
            label="Production Prep Sheets Sync"
            description="Push morning kitchen prep batching guides directly to kitchen tablets or manager email."
          />
        </div>
      </div>

      {/* Card 3: AI Insights & Mobile Channels */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><MessageSquare size={19} color="var(--emerald)" /> AI Insights & Mobile Text (SMS)</h4>
            <p>High-priority alert delivery for critical stock situations.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
          <Toggle
            checked={formData.aiInsights}
            onChange={(val) => updateToggle('aiInsights', val)}
            label="AI Waste Reduction Optimization Tips"
            description="Receive weekly insights on top ingredients saved and supplier reorder recommendations."
          />

          <Toggle
            checked={formData.smsUrgentAlerts}
            onChange={(val) => updateToggle('smsUrgentAlerts', val)}
            label="Urgent SMS Mobile Text Alerts"
            description="Send an instant SMS text to store managers for critical stock depletion expected within 12 hours."
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="settings-action-bar">
        <span className="action-bar-text">
          Notifications are filtered by severity to prevent alert fatigue.
        </span>
        <Button type="submit" variant="primary" icon={Save} loading={loading}>
          Save Triggers
        </Button>
      </div>
    </form>
  );
};

export default NotificationSettings;
