// Grid Builder Component

import React from 'react';
import { GridBuilderProps } from '../types';
import { cn } from '../../../shared/utils';

export const GridBuilder: React.FC<GridBuilderProps> = ({
  config,
  children,
  className,
  ...props
}) => {
  const {
    columns,
    gap,
    padding,
    margin,
    breakpoints,
    responsive = true,
    autoFit = false,
    autoFill = false,
    minColumnWidth,
    maxColumnWidth,
    alignment,
  } = config;

  const gridClasses = cn(
    'grid',
    // Base grid template
    autoFit && minColumnWidth && `grid-cols-[repeat(auto-fit,minmax(${minColumnWidth}px,1fr))]`,
    autoFill && minColumnWidth && `grid-cols-[repeat(auto-fill,minmax(${minColumnWidth}px,1fr))]`,
    !autoFit && !autoFill && `grid-cols-${columns}`,
    // Gap
    `gap-${gap}`,
    // Padding
    padding && `p-${padding}`,
    // Margin
    margin && `m-${margin}`,
    // Alignment
    alignment?.horizontal === 'start' && 'justify-items-start',
    alignment?.horizontal === 'center' && 'justify-items-center',
    alignment?.horizontal === 'end' && 'justify-items-end',
    alignment?.horizontal === 'stretch' && 'justify-items-stretch',
    alignment?.vertical === 'start' && 'items-start',
    alignment?.vertical === 'center' && 'items-center',
    alignment?.vertical === 'end' && 'items-end',
    alignment?.vertical === 'stretch' && 'items-stretch',
    // Responsive breakpoints
    responsive && breakpoints?.sm && `sm:grid-cols-${breakpoints.sm}`,
    responsive && breakpoints?.md && `md:grid-cols-${breakpoints.md}`,
    responsive && breakpoints?.lg && `lg:grid-cols-${breakpoints.lg}`,
    responsive && breakpoints?.xl && `xl:grid-cols-${breakpoints.xl}`,
    className
  );

  const gridStyle = {
    ...(minColumnWidth && !autoFit && !autoFill && {
      gridTemplateColumns: `repeat(${columns}, minmax(${minColumnWidth}px, 1fr))`,
    }),
    ...(maxColumnWidth && {
      gridTemplateColumns: `repeat(${columns}, minmax(0, ${maxColumnWidth}px))`,
    }),
  };

  return (
    <div
      className={gridClasses}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
};

GridBuilder.displayName = 'GridBuilder';
