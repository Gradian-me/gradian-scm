// Avatar Component

import React from 'react';
import { Avatar as RadixAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AvatarProps } from '../types';
import { cn } from '../../../shared/utils';

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20',
    '3xl': 'h-24 w-24',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-violet-100 text-violet-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
  };

  const avatarClasses = cn(
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  return (
    <RadixAvatar className={avatarClasses} {...props}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback className={variantClasses[variant]}>
        {fallback || children}
      </AvatarFallback>
    </RadixAvatar>
  );
};

// Export the sub-components for convenience
export { AvatarImage, AvatarFallback };

Avatar.displayName = 'Avatar';

