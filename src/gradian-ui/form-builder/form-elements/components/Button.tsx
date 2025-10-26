// Button Component

import React from 'react';
import { Button as RadixButton } from '../../../../components/ui/button';
import { ButtonProps } from '../types';
import { cn } from '../../../shared/utils';

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    link: 'text-blue-600 underline-offset-4 hover:underline',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg',
  };

  const buttonClasses = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <RadixButton className={buttonClasses} {...props}>
      {children}
    </RadixButton>
  );
};

Button.displayName = 'Button';
