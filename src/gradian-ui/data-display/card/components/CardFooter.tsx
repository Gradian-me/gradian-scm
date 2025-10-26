// Card Footer Component

import React from 'react';
import { CardFooterProps } from '../types';
import { cn } from '../../../shared/utils';

export const CardFooter: React.FC<CardFooterProps> = ({
  actions,
  children,
  alignment = 'right',
  className,
  ...props
}) => {
  const footerClasses = cn(
    'card-footer px-4 py-3 border-t border-gray-200',
    alignment === 'left' && 'flex justify-start',
    alignment === 'center' && 'flex justify-center',
    alignment === 'right' && 'flex justify-end',
    alignment === 'between' && 'flex justify-between',
    className
  );

  const getButtonClasses = (variant: string, disabled: boolean) => {
    const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const disabledClasses = 'opacity-50 cursor-not-allowed';

    return cn(
      baseClasses,
      variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary,
      disabled && disabledClasses
    );
  };

  return (
    <div className={footerClasses} {...props}>
      {children || (
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2 md:space-x-0">
          {actions?.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                getButtonClasses(action.variant || 'primary', action.disabled || false),
                'w-full md:w-auto flex-1 md:flex-none'
              )}
            >
              <div className="flex items-center justify-center space-x-1">
                {action.icon && <span>{action.icon}</span>}
                <span>{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';
