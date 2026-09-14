import React from 'react';
import './common.css';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label className="input-label">
          {label} {required && <span style={{ color: 'var(--terracotta)' }}>*</span>}
        </label>
      )}
      <select value={value} onChange={onChange} className="select-field" {...props}>
        {options.map((opt, i) => (
          <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
