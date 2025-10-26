// Grid Column Component

import React from 'react';
import { GridColumnProps } from '../types';
import { cn } from '../../../shared/utils';

export const GridColumn: React.FC<GridColumnProps> = ({
  config,
  children,
  className,
  ...props
}) => {
  const {
    span,
    offset,
    order,
    alignment,
    breakpoints,
  } = config;

  const columnClasses = cn(
    'grid-column',
    // Span
    span && `col-span-${span}`,
    // Offset
    offset && `col-start-${offset + 1}`,
    // Order
    order && `order-${order}`,
    // Alignment
    alignment?.horizontal === 'start' && 'justify-self-start',
    alignment?.horizontal === 'center' && 'justify-self-center',
    alignment?.horizontal === 'end' && 'justify-self-end',
    alignment?.horizontal === 'stretch' && 'justify-self-stretch',
    alignment?.vertical === 'start' && 'self-start',
    alignment?.vertical === 'center' && 'self-center',
    alignment?.vertical === 'end' && 'self-end',
    alignment?.vertical === 'stretch' && 'self-stretch',
    // Responsive breakpoints
    breakpoints?.sm?.span && `sm:col-span-${breakpoints.sm.span}`,
    breakpoints?.sm?.offset && `sm:col-start-${breakpoints.sm.offset + 1}`,
    breakpoints?.sm?.order && `sm:order-${breakpoints.sm.order}`,
    breakpoints?.md?.span && `md:col-span-${breakpoints.md.span}`,
    breakpoints?.md?.offset && `md:col-start-${breakpoints.md.offset + 1}`,
    breakpoints?.md?.order && `md:order-${breakpoints.md.order}`,
    breakpoints?.lg?.span && `lg:col-span-${breakpoints.lg.span}`,
    breakpoints?.lg?.offset && `lg:col-start-${breakpoints.lg.offset + 1}`,
    breakpoints?.lg?.order && `lg:order-${breakpoints.lg.order}`,
    breakpoints?.xl?.span && `xl:col-span-${breakpoints.xl.span}`,
    breakpoints?.xl?.offset && `xl:col-start-${breakpoints.xl.offset + 1}`,
    breakpoints?.xl?.order && `xl:order-${breakpoints.xl.order}`,
    className
  );

  return (
    <div
      className={columnClasses}
      {...props}
    >
      {children}
    </div>
  );
};

GridColumn.displayName = 'GridColumn';
