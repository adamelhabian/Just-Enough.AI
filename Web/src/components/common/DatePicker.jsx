import React from 'react';
import { Calendar } from 'lucide-react';
import Input from './Input';

export const DatePicker = ({ value, onChange, label, className = '' }) => {
  return (
    <Input
      type="date"
      label={label}
      icon={Calendar}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
};

export default DatePicker;
