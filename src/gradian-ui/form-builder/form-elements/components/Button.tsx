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
  // Map gradian-ui Button variants to UI Button styles (matches button.tsx)
  const variantClasses = {
    default: 'bg-violet-600 text-white shadow-sm hover:bg-violet-700 hover:shadow-md',
    primary: 'bg-violet-600 text-white shadow-sm hover:bg-violet-700 hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm hover:shadow-md',
    danger: 'bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md',
    outline: 'border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:border-violet-300 shadow-sm hover:shadow-md',
    ghost: 'text-violet-600 hover:bg-violet-50 hover:text-violet-700',
    link: 'text-violet-600 underline-offset-4 hover:underline hover:text-violet-700',
  };

  const sizeClasses = {
    sm: 'h-9 rounded-lg px-4 text-xs',
    md: 'h-11 px-6 py-2',
    lg: 'h-12 rounded-xl px-8 text-base',
    xl: 'h-14 rounded-2xl px-10 text-lg',
  };

  const buttonClasses = cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
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
