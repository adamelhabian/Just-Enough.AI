import React from 'react';
import './common.css';

export const Card = ({ children, hoverable = false, className = '', ...props }) => {
  return (
    <div className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
