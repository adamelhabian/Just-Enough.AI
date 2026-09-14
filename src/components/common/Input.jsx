import React from 'react';
import './common.css';

export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  helperText,
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
      <div className="input-field-container">
        {Icon && <Icon className="input-icon-left" size={18} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input-field ${Icon ? 'input-has-left-icon' : ''} ${error ? 'input-error' : ''}`}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '0.775rem', color: 'var(--terracotta)' }}>{error}</span>}
      {!error && helperText && <span style={{ fontSize: '0.775rem', color: 'var(--text-light)' }}>{helperText}</span>}
    </div>
  );
};

export default Input;
