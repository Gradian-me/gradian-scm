// Select Component

import React from 'react';
import { Select as RadixSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { SelectProps } from '../types';
import { cn } from '../../../shared/utils';

export const Select: React.FC<SelectProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    primary: 'border-blue-300 focus:border-blue-500 focus:ring-blue-500',
    secondary: 'border-gray-300 focus:border-gray-500 focus:ring-gray-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
    danger: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const selectClasses = cn(
    'flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <RadixSelect {...props}>
      <SelectTrigger className={selectClasses}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </RadixSelect>
  );
};

// Export sub-components for convenience
export { SelectContent, SelectItem, SelectTrigger, SelectValue };

Select.displayName = 'Select';
