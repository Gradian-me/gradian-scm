// Loading State Component

import React from 'react';
import { LoadingStateProps } from '../types';
import { cn } from '../../shared/utils';

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  text = 'Loading...',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const loadingClasses = cn(
    'flex flex-col items-center justify-center py-12',
    className
  );

  const spinnerClasses = cn(
    'animate-spin rounded-full border-b-2 border-violet-600',
    sizeClasses[size]
  );

  return (
    <div className={loadingClasses} {...props}>
      <div className={spinnerClasses} />
      {text && (
        <p className="mt-4 text-sm text-gray-500">
          {text}
        </p>
      )}
    </div>
  );
};

LoadingState.displayName = 'LoadingState';
