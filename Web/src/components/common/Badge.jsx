import React from 'react';
import { getStatusBadgeClass } from '../../utils/formatters';
import './common.css';

export const Badge = ({ status, children, variant, className = '' }) => {
  const badgeClass = variant ? `badge-${variant}` : getStatusBadgeClass(status);

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;
