import React from 'react';
import Button from '../common/Button';
import { CreditCard, Utensils, Database, ShoppingCart, DollarSign, RefreshCw, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import './settings.css';

export const IntegrationSettings = ({ integrations = [] }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard size={24} color="var(--terracotta)" />;
      case 'Utensils': return <Utensils size={24} color="var(--emerald)" />;
      case 'Database': return <Database size={24} color="var(--golden)" />;
      case 'ShoppingCart': return <ShoppingCart size={24} color="var(--text-muted)" />;
      default: return <DollarSign size={24} color="var(--emerald)" />;
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'Connected').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Overview Summary Strip */}
      <div className="integrations-summary-strip">
        <div className="summary-metric-box">
          <div>
            <span className="lbl">Active Integrations</span>
            <div className="val text-emerald">{connectedCount} Connected</div>
          </div>
          <CheckCircle2 size={26} color="var(--emerald)" />
        </div>

        <div className="summary-metric-box">
          <div>
            <span className="lbl">Realtime Sales Sync</span>
            <div className="val">Healthy (100%)</div>
          </div>
          <RefreshCw size={24} color="var(--emerald)" />
        </div>

        <div className="summary-metric-box">
          <div>
            <span className="lbl">API Latency</span>
            <div className="val">&lt; 140 ms</div>
          </div>
          <ShieldCheck size={24} color="var(--golden)" />
        </div>
      </div>

      {/* Main Integrations List */}
      <div className="settings-sub-card">
        <div className="sub-card-header">
          <div>
            <h4><Database size={20} color="var(--emerald)" /> Point of Sale & System Integrations</h4>
            <p>Connect your live transaction terminals to continuously feed sales history into the AI model.</p>
          </div>
        </div>

        <div className="integrations-list-container">
          {integrations.map((item) => {
            const isConnected = item.status === 'Connected';
            const isComing = item.status === 'Coming Soon';

            return (
              <div key={item.id} className={`integration-row-card ${isConnected ? 'is-connected' : ''}`}>
                <div className="integ-row-left">
                  <div className="integ-row-icon-box">
                    {getIcon(item.icon)}
                  </div>

                  <div className="integ-row-info">
                    <span className="integ-cat">{item.category}</span>
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>

                <div className="integ-row-right">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                    <span className={`integ-status-pill ${isConnected ? 'pill-connected' : isComing ? 'pill-coming' : 'pill-not'}`}>
                      {item.status}
                    </span>
                    {isConnected && (
                      <span className="sync-time">
                        <RefreshCw size={12} /> Synced {item.lastSync}
                      </span>
                    )}
                  </div>

                  <Button
                    variant={isConnected ? 'outline' : isComing ? 'ghost' : 'primary'}
                    size="sm"
                    disabled={isComing}
                  >
                    {isConnected ? 'Configure Sync' : isComing ? 'Coming Soon' : 'Connect System'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
