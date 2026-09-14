import React from 'react';
import { Sparkles } from 'lucide-react';
import './common.css';

export const AiInsight = ({ title, children, action, className = '' }) => {
  return (
    <div className={`ai-insight-card ${className}`}>
      <div className="ai-insight-icon">
        <Sparkles size={20} />
      </div>
      <div className="ai-insight-body" style={{ flex: 1 }}>
        {title && <h4>{title}</h4>}
        <div>{children}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default AiInsight;
