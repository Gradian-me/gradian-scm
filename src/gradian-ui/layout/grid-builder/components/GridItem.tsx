// Grid Item Component

import React from 'react';
import { GridItemProps } from '../types';
import { cn } from '../../../shared/utils';

export const GridItem: React.FC<GridItemProps> = ({
  config,
  children,
  className,
  ...props
}) => {
  const {
    columnStart,
    columnEnd,
    rowStart,
    rowEnd,
    span,
    order,
    justifySelf,
    alignSelf,
    breakpoints,
  } = config;

  const itemClasses = cn(
    'grid-item',
    // Column positioning
    columnStart && `col-start-${columnStart}`,
    columnEnd && `col-end-${columnEnd}`,
    span?.columns && `col-span-${span.columns}`,
    // Row positioning
    rowStart && `row-start-${rowStart}`,
    rowEnd && `row-end-${rowEnd}`,
    span?.rows && `row-span-${span.rows}`,
    // Order
    order && `order-${order}`,
    // Self alignment
    justifySelf === 'start' && 'justify-self-start',
    justifySelf === 'center' && 'justify-self-center',
    justifySelf === 'end' && 'justify-self-end',
    justifySelf === 'stretch' && 'justify-self-stretch',
    alignSelf === 'start' && 'self-start',
    alignSelf === 'center' && 'self-center',
    alignSelf === 'end' && 'self-end',
    alignSelf === 'stretch' && 'self-stretch',
    // Responsive breakpoints
    breakpoints?.sm?.span?.columns && `sm:col-span-${breakpoints.sm.span.columns}`,
    breakpoints?.sm?.span?.rows && `sm:row-span-${breakpoints.sm.span.rows}`,
    breakpoints?.sm?.order && `sm:order-${breakpoints.sm.order}`,
    breakpoints?.md?.span?.columns && `md:col-span-${breakpoints.md.span.columns}`,
    breakpoints?.md?.span?.rows && `md:row-span-${breakpoints.md.span.rows}`,
    breakpoints?.md?.order && `md:order-${breakpoints.md.order}`,
    breakpoints?.lg?.span?.columns && `lg:col-span-${breakpoints.lg.span.columns}`,
    breakpoints?.lg?.span?.rows && `lg:row-span-${breakpoints.lg.span.rows}`,
    breakpoints?.lg?.order && `lg:order-${breakpoints.lg.order}`,
    breakpoints?.xl?.span?.columns && `xl:col-span-${breakpoints.xl.span.columns}`,
    breakpoints?.xl?.span?.rows && `xl:row-span-${breakpoints.xl.span.rows}`,
    breakpoints?.xl?.order && `xl:order-${breakpoints.xl.order}`,
    className
  );

  return (
    <div
      className={itemClasses}
      {...props}
    >
      {children}
    </div>
  );
};

GridItem.displayName = 'GridItem';
