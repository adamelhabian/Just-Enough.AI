import React from 'react';
import './common.css';

export const LoadingState = ({ message = 'Loading AI data...', className = '' }) => {
  return (
    <div
      className={`loading-state-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem'
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '3px solid var(--border-light)',
          borderTopColor: 'var(--terracotta)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
};

export default LoadingState;
