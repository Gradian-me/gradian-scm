// Search Bar Component

import React from 'react';
import { SearchBarProps } from '../types';
import { cn } from '../../shared/utils';
import { Input } from '../../form-builder/form-elements/components/Input';
import { Button } from '@/components/ui/button';

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  showSearchButton = false,
  className,
  ...props
}) => {
  const searchBarClasses = cn(
    'relative flex items-center',
    className
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value || '');
    }
  };

  return (
    <div className={searchBarClasses} {...props}>
      <div className="relative flex-1">
        <Input
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      {showSearchButton && (
        <Button
          variant="default"
          size="default"
          onClick={() => onSearch?.(value || '')}
          className="ml-2"
        >
          Search
        </Button>
      )}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';
