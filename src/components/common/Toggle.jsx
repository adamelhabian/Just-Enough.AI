import React from 'react';
import './common.css';

export const Toggle = ({ checked, onChange, label, description, className = '' }) => {
  return (
    <div className={`toggle-wrapper ${className}`} onClick={() => onChange(!checked)}>
      <div className={`toggle-switch ${checked ? 'active' : ''}`}>
        <div className="toggle-thumb" />
      </div>
      {(label || description) && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {label && <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{label}</span>}
          {description && <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{description}</span>}
        </div>
      )}
    </div>
  );
};

export default Toggle;
