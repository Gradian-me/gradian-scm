// Badge Component

import React from 'react';
import { Badge as RadixBadge } from '../../../../components/ui/badge';
import { BadgeProps } from '../types';
import { cn } from '../../../shared/utils';

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    outline: 'bg-transparent text-gray-700 border-gray-300',
    cyan: 'bg-cyan-200 text-cyan-800 border-cyan-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  const badgeClasses = cn(
    'inline-flex items-center rounded-full border font-medium',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <RadixBadge className={badgeClasses} {...props}>
      {children}
    </RadixBadge>
  );
};

Badge.displayName = 'Badge';
