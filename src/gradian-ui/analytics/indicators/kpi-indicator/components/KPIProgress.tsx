// KPI Progress Component

import React from 'react';
import { KPIProgressProps } from '../types';
import { cn } from '../../../../shared/utils';

export const KPIProgress: React.FC<KPIProgressProps> = ({
  current,
  target,
  showPercentage = true,
  color = '#3B82F6',
  className,
  ...props
}) => {
  const progress = Math.min((current / target) * 100, 100);
  const isOverTarget = current > target;

  const progressClasses = cn(
    'w-full bg-gray-200 rounded-full h-2',
    className
  );

  const barClasses = cn(
    'h-2 rounded-full transition-all duration-300',
    isOverTarget && 'bg-red-500'
  );

  const textClasses = cn(
    'text-xs text-gray-600 mt-1',
    isOverTarget && 'text-red-600'
  );

  return (
    <div {...props}>
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Progress</span>
        {showPercentage && (
          <span className={isOverTarget ? 'text-red-600' : ''}>
            {progress.toFixed(1)}%
          </span>
        )}
      </div>
      
      <div className={progressClasses}>
        <div
          className={barClasses}
          style={{
            width: `${progress}%`,
            backgroundColor: isOverTarget ? undefined : color,
          }}
        />
      </div>
      
      <div className={textClasses}>
        {current.toFixed(0)} / {target.toFixed(0)} target
        {isOverTarget && ' (Over target!)'}
      </div>
    </div>
  );
};

KPIProgress.displayName = 'KPIProgress';
