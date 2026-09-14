import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import './common.css';

export const Alert = ({ type = 'info', title, children, action, className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'low_stock':
        return <AlertTriangle size={20} color="#E5B141" />;
      case 'critical':
        return <XCircle size={20} color="#B94419" />;
      case 'success':
        return <CheckCircle size={20} color="#199B74" />;
      default:
        return <Info size={20} color="#3B82F6" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'warning':
      case 'low_stock':
        return 'rgba(229, 177, 65, 0.1)';
      case 'critical':
        return 'rgba(185, 68, 25, 0.1)';
      case 'success':
        return 'rgba(25, 155, 116, 0.1)';
      default:
        return 'rgba(59, 130, 246, 0.1)';
    }
  };

  return (
    <div
      className={`alert-box ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: getBgColor(),
        border: '1px solid rgba(0,0,0,0.06)'
      }}
    >
      <div style={{ marginTop: '0.1rem' }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{title}</div>}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{children}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default Alert;
