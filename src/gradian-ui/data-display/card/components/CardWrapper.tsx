// Card Wrapper Component

import React from 'react';
import { Card as RadixCard, CardContent, CardHeader, CardTitle, CardFooter } from '../../../../components/ui/card';
import { CardWrapperProps } from '../types';
import { cn } from '../../../shared/utils';

export const CardWrapper: React.FC<CardWrapperProps> = ({
  config,
  children,
  className,
  ...props
}) => {
  const {
    styling = {},
    behavior = {},
    layout = {},
  } = config;

  const cardClasses = cn(
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    'w-full', // Ensure full width
    styling.variant === 'elevated' && 'shadow-lg',
    styling.variant === 'outlined' && 'border-2',
    styling.variant === 'filled' && 'bg-muted',
    styling.rounded && 'rounded-xl',
    styling.shadow === 'sm' && 'shadow-sm',
    styling.shadow === 'md' && 'shadow-md',
    styling.shadow === 'lg' && 'shadow-lg',
    behavior.hoverable && 'hover:shadow-md transition-shadow duration-200',
    behavior.clickable && 'cursor-pointer hover:scale-[1.01] transition-transform duration-200', // Reduced scale
    className
  );

  return (
    <RadixCard className={cardClasses} {...props}>
      {children}
    </RadixCard>
  );
};

// Export sub-components for convenience
export { CardContent, CardHeader, CardTitle, CardFooter };

CardWrapper.displayName = 'CardWrapper';
