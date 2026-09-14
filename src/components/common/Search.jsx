import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Input from './Input';

export const Search = ({ value, onChange, placeholder = 'Search ingredients, recipes, or items...', className = '' }) => {
  return (
    <Input
      icon={SearchIcon}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
};

export default Search;
