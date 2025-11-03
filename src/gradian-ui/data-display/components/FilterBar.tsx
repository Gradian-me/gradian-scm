// Filter Bar Component

import React from 'react';
import { FilterBarProps } from '../types';
import { cn } from '../../shared/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../form-builder/form-elements/components/Select';
import { Button } from '@/components/ui/button';

export const FilterBar: React.FC<FilterBarProps> = ({
  filters = [],
  onFilterChange,
  onClearFilters,
  className,
  ...props
}) => {
  const filterBarClasses = cn(
    'flex flex-wrap gap-2',
    className
  );

  return (
    <div className={filterBarClasses} {...props}>
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            {filter.label}:
          </label>
          <Select
            value={filter.value}
            onValueChange={(value) => onFilterChange?.(filter.key, value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

FilterBar.displayName = 'FilterBar';
