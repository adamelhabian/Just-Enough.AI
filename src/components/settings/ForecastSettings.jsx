import React, { useState } from 'react';
import Select from '../common/Select';
import Button from '../common/Button';
import Toggle from '../common/Toggle';
import Alert from '../common/Alert';
import { Sparkles, Sliders, Calendar, Sun, Save, Layers } from 'lucide-react';
import './settings.css';

export const ForecastSettings = ({ initialData, onSave }) => {
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
        <Alert type="success" title="AI Model Parameters Calibrated">
          Neural demand forecasting parameters have been re-calibrated.
        </Alert>
      )}

      {/* Card 1: Prediction Window & Sensitivity */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><Sparkles size={19} color="var(--emerald)" /> Forecast Horizon & Sensitivity</h4>
            <p>Configure how far ahead AI projects demand and how fast it reacts to trend spikes.</p>
          </div>
        </div>

        <div className="sub-card-grid">
          <Select
            label="Forecast Horizon Window"
            value={formData.horizon || '7 days'}
            onChange={(e) => setFormData({ ...formData, horizon: e.target.value })}
            options={['7 days (Recommended)', '14 days (Extended Planning)', '30 days (Monthly Bulk)']}
          />

          <Select
            label="Demand Sensitivity Tuning"
            value={formData.sensitivity || 'High (0.85)'}
            onChange={(e) => setFormData({ ...formData, sensitivity: e.target.value })}
            options={[
              { label: 'High Sensitivity (Fast reaction to weather & sudden surges)', value: 'High (0.85)' },
              { label: 'Balanced (Standard 14-day weighted moving average)', value: 'Balanced (0.65)' },
              { label: 'Conservative (Long-term smoothing for stable menus)', value: 'Conservative (0.45)' }
            ]}
          />
        </div>
      </div>

      {/* Card 2: Kitchen Safety Buffers */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><Layers size={19} color="var(--terracotta)" /> Kitchen Prep Buffers & Metric Standards</h4>
            <p>Specify safety production cushions to prevent rush stockouts without overproducing.</p>
          </div>
        </div>

        <div className="sub-card-grid">
          <Select
            label="Default Kitchen Production Buffer"
            value={formData.buffer || '10%'}
            onChange={(e) => setFormData({ ...formData, buffer: e.target.value })}
            options={[
              '0% (Strict Zero Waste Target)',
              '5% Low Safety Cushion',
              '10% Balanced Cushion (Recommended)',
              '15% High Surge Cushion'
            ]}
          />

          <Select
            label="Primary Metric Measurement Unit"
            value={formData.defaultUnit || 'kg'}
            onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
            options={['kg (Kilograms)', 'g (Grams)', 'L (Liters)', 'units (Count / Pieces)']}
          />
        </div>
      </div>

      {/* Card 3: External Signals Auto-Sync */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><Sun size={19} color="var(--golden)" /> Automated External Signals Integration</h4>
            <p>Automatically adjust predicted daily item quantities based on real-time external data.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
          <Toggle
            checked={formData.weatherIntegration}
            onChange={(val) => setFormData({ ...formData, weatherIntegration: val })}
            label="Live Weather & Temperature Auto-Sync"
            description="Dynamically increase cold drink forecasts on hot days (+30%) or soup/bakery items on rainy days."
          />

          <Toggle
            checked={formData.eventTracking}
            onChange={(val) => setFormData({ ...formData, eventTracking: val })}
            label="Local Calendar Events & Sports Tracking"
            description="Automatically factor in nearby stadium games, concerts, and national holidays into shift estimates."
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="settings-action-bar">
        <span className="action-bar-text">
          Re-calibrating parameters updates tomorrow's kitchen prep recommendations automatically.
        </span>
        <Button type="submit" variant="primary" icon={Save} loading={loading}>
          Save AI Preferences
        </Button>
      </div>
    </form>
  );
};

export default ForecastSettings;
