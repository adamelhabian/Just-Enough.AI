import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';
import './common.css';

export const EmptyState = ({
  title = 'No items found',
  description = 'Try adjusting your search query or filters.',
  actionLabel,
  onAction,
  icon: Icon = PackageOpen,
  className = ''
}) => {
  return (
    <div
      className={`empty-state-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
        gap: '1rem',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px border-dashed var(--border-light)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--cream-light)',
          color: 'var(--text-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={28} />
      </div>
      <div style={{ maxWidth: '380px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} style={{ marginTop: '0.5rem' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
