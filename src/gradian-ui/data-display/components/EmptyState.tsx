// Empty State Component

import React from 'react';
import { EmptyStateProps } from '../types';
import { cn } from '../../shared/utils';
import { Button } from '../../form-builder/form-elements/components/Button';

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) => {
  const emptyStateClasses = cn(
    'flex flex-col items-center justify-center py-12 px-4 text-center',
    className
  );

  return (
    <div className={emptyStateClasses} {...props}>
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex flex-col sm:flex-row gap-2">
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
