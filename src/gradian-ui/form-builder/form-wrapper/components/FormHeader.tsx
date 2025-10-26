// Form Header Component

import React from 'react';
import { FormHeaderProps } from '../types';
import { cn } from '../../../shared/utils';

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  className,
  children,
  ...props
}) => {
  const headerClasses = cn(
    'mb-8 pb-6 border-b border-gray-100',
    className
  );

  return (
    <div className={headerClasses} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-gray-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-base text-gray-600">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

FormHeader.displayName = 'FormHeader';
