import React from 'react';
import './common.css';

export const ChartCard = ({ title, subtitle, headerActions, children, className = '' }) => {
  return (
    <div className={`card ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          {title && <h3 style={{ fontSize: '1.15rem' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{subtitle}</p>}
        </div>
        {headerActions && <div style={{ display: 'flex', gap: '0.5rem' }}>{headerActions}</div>}
      </div>
      <div style={{ flex: 1, minHeight: '220px', width: '100%' }}>{children}</div>
    </div>
  );
};

export default ChartCard;
