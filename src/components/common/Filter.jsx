import React from 'react';
import Select from './Select';

export const Filter = ({ options = [], value, onChange, label, className = '' }) => {
  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
};

export default Filter;
