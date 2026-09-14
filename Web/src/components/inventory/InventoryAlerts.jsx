import React from 'react';
import { AlertTriangle, TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import './inventory.css';

export const InventoryAlerts = ({ alerts = [], onAlertAction }) => {
  return (
    <div className="inventory-alerts-grid">
      {alerts.map((alert) => {
        const isLow = alert.type === 'low_stock';
        const isOver = alert.type === 'overstock';
        
        return (
          <div key={alert.id} className={`inv-alert-card ${isLow ? 'alert-low' : isOver ? 'alert-over' : 'alert-info'}`}>
            <div className="alert-top">
              <div className="alert-badge-icon">
                {isLow && <AlertTriangle size={18} color="#B94419" />}
                {isOver && <TrendingDown size={18} color="#E5B141" />}
                {!isLow && !isOver && <Sparkles size={18} color="#199B74" />}
              </div>
              <span className="alert-type-title">{alert.title}</span>
            </div>

            <p className="alert-message">{alert.message}</p>

            <div className="alert-impact-strip">
              <Sparkles size={14} color="#199B74" />
              <span>{alert.impact}</span>
            </div>

            <div className="alert-action-bar">
              <Button
                variant={isLow ? 'primary' : 'outline'}
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => onAlertAction && onAlertAction(alert)}
              >
                {alert.actionLabel}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryAlerts;
