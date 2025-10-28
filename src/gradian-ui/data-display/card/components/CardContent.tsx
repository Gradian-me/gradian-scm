// Card Content Component

import React from 'react';
import { CardContentProps } from '../types';
import { cn } from '../../../shared/utils';

export const CardContent: React.FC<CardContentProps> = ({
  children,
  padding = true,
  className,
  ...props
}) => {
  const contentClasses = cn(
    'card-content',
    padding && 'p-4 sm:p-5',
    className
  );

  return (
    <div className={contentClasses} {...props}>
      {children}
    </div>
  );
};

CardContent.displayName = 'CardContent';
