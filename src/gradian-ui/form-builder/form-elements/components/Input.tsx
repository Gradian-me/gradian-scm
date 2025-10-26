// Input Component

import React from 'react';
import { Input as RadixInput } from '../../../../components/ui/input';
import { InputProps } from '../types';
import { cn } from '../../../shared/utils';

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  className,
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

  const inputClasses = cn(
    'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <RadixInput className={inputClasses} {...props} />
  );
};

Input.displayName = 'Input';
