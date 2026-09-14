import React from 'react';
import * as Icons from 'lucide-react';
import './common.css';

export const KpiCard = ({ title, value, unit, change, trend = 'up', iconName = 'Boxes', className = '' }) => {
  const IconComponent = Icons[iconName] || Icons.Boxes;

  return (
    <div className={`kpi-card ${className}`}>
      <div className="kpi-top">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-box">
          <IconComponent size={20} />
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">
        {unit && <span className="kpi-unit">{unit}</span>}
        {change && (
          <span className={`kpi-change ${trend === 'up' ? 'text-emerald' : trend === 'down' ? 'text-terracotta' : ''}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
