import React from 'react';
import './common.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner"></span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="btn-icon" size={size === 'sm' ? 16 : 18} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="btn-icon" size={size === 'sm' ? 16 : 18} />}
        </>
      )}
    </button>
  );
};

export default Button;
