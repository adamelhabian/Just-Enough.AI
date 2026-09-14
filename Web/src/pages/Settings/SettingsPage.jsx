import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import BusinessSettings from '../../components/settings/BusinessSettings';
import AccountSettings from '../../components/settings/AccountSettings';
import ForecastSettings from '../../components/settings/ForecastSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import IntegrationSettings from '../../components/settings/IntegrationSettings';
import LoadingState from '../../components/common/LoadingState';
import { fetchSettings, updateSettings } from '../../api/settings';
import { Building2, User, Sparkles, Bell, Database } from 'lucide-react';
import '../../components/settings/settings.css';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchSettings();
        setSettingsData(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSection = async (section, payload) => {
    try {
      await updateSettings(section, payload);
      setSettingsData((prev) => ({
        ...prev,
        [section]: payload
      }));
    } catch (err) {
      console.error(`Error updating ${section}`, err);
    }
  };

  const tabs = [
    { id: 'business', label: 'Business Profile', icon: Building2, badge: 'Venue' },
    { id: 'account', label: 'Account & Security', icon: User, badge: 'Manager' },
    { id: 'forecast', label: 'AI Forecast Parameters', icon: Sparkles, badge: '94.8% Acc' },
    { id: 'notifications', label: 'Notification Triggers', icon: Bell, badge: 'Alerts' },
    { id: 'integrations', label: 'POS Integrations', icon: Database, badge: '5 Systems' },
  ];

  return (
    <DashboardLayout
      title="Settings & System Configuration"
      subtitle="Manage your business profile, AI algorithm parameters, alert triggers, and POS integrations."
    >
      {loading ? (
        <LoadingState message="Loading configuration preferences..." />
      ) : (
        <div className="settings-page-wrapper">
          {/* Top Horizontal Sub-Navigation Bar */}
          <div className="settings-tabs-header-card">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`settings-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  <span className="tab-badge">{tab.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Main Full-Width Content Shell */}
          <div className="settings-content-shell page-transition">
            {activeTab === 'business' && (
              <BusinessSettings
                initialData={settingsData?.business}
                onSave={(data) => handleSaveSection('business', data)}
              />
            )}

            {activeTab === 'account' && (
              <AccountSettings
                initialData={settingsData?.account}
                onSave={(data) => handleSaveSection('account', data)}
              />
            )}

            {activeTab === 'forecast' && (
              <ForecastSettings
                initialData={settingsData?.forecast}
                onSave={(data) => handleSaveSection('forecast', data)}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationSettings
                initialData={settingsData?.notifications}
                onSave={(data) => handleSaveSection('notifications', data)}
              />
            )}

            {activeTab === 'integrations' && (
              <IntegrationSettings
                integrations={settingsData?.integrations}
              />
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SettingsPage;
