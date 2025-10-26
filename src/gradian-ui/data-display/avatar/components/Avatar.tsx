// Avatar Component

import React from 'react';
import { Avatar as RadixAvatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
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
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const variantClasses = {
    default: 'bg-gray-300 text-gray-700',
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
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
