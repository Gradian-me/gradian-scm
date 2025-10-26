// KPI Trend Component

import React from 'react';
import { KPITrendProps } from '../types';
import { cn } from '../../../../shared/utils';

export const KPITrend: React.FC<KPITrendProps> = ({
  current,
  previous,
  period = 'month',
  showPercentage = true,
  showArrow = true,
  className,
  ...props
}) => {
  const change = current - previous;
  const changePercentage = previous !== 0 ? (change / previous) * 100 : 0;
  const isPositive = change >= 0;
  const isSignificant = Math.abs(changePercentage) >= 1;

  const trendClasses = cn(
    'flex items-center space-x-1 text-sm',
    isPositive ? 'text-green-600' : 'text-red-600',
    !isSignificant && 'text-gray-500',
    className
  );

  const getTrendIcon = () => {
    if (!showArrow) return null;
    
    if (isPositive) {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getTrendText = () => {
    if (!isSignificant) {
      return 'No change';
    }
    
    const percentageText = showPercentage ? ` ${Math.abs(changePercentage).toFixed(1)}%` : '';
    const periodText = period ? ` vs last ${period}` : '';
    
    return `${isPositive ? '+' : '-'}${Math.abs(change).toFixed(1)}${percentageText}${periodText}`;
  };

  return (
    <div className={trendClasses} {...props}>
      {getTrendIcon()}
      <span>{getTrendText()}</span>
    </div>
  );
};

KPITrend.displayName = 'KPITrend';
