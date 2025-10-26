// Grid Row Component

import React from 'react';
import { GridRowProps } from '../types';
import { cn } from '../../../shared/utils';

export const GridRow: React.FC<GridRowProps> = ({
  config,
  children,
  className,
  ...props
}) => {
  const {
    columns,
    gap,
    alignment,
    wrap = true,
    reverse = false,
  } = config;

  const rowClasses = cn(
    'grid',
    `grid-cols-${columns}`,
    `gap-${gap}`,
    // Alignment
    alignment?.horizontal === 'start' && 'justify-items-start',
    alignment?.horizontal === 'center' && 'justify-items-center',
    alignment?.horizontal === 'end' && 'justify-items-end',
    alignment?.horizontal === 'between' && 'justify-items-stretch',
    alignment?.horizontal === 'around' && 'justify-items-stretch',
    alignment?.horizontal === 'evenly' && 'justify-items-stretch',
    alignment?.vertical === 'start' && 'items-start',
    alignment?.vertical === 'center' && 'items-center',
    alignment?.vertical === 'end' && 'items-end',
    alignment?.vertical === 'stretch' && 'items-stretch',
    // Wrap
    wrap && 'flex-wrap',
    !wrap && 'flex-nowrap',
    // Reverse
    reverse && 'flex-row-reverse',
    !reverse && 'flex-row',
    className
  );

  return (
    <div
      className={rowClasses}
      {...props}
    >
      {children}
    </div>
  );
};

GridRow.displayName = 'GridRow';
