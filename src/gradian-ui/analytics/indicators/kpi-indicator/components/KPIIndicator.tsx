// KPI Indicator Component

import React from 'react';
import { KPIIndicatorProps } from '../types';
import { KPITrend } from './KPITrend';
import { KPIProgress } from './KPIProgress';
import { cn, formatNumber, formatCurrency } from '../../../../shared/utils';

export const KPIIndicator: React.FC<KPIIndicatorProps> = ({
  config,
  value,
  previousValue,
  target,
  onValueChange,
  className,
  ...props
}) => {
  const {
    title,
    description,
    unit = '',
    format = 'number',
    precision = 0,
    color = '#3B82F6',
    icon,
    trend = { enabled: true },
    target: targetConfig = { enabled: false },
    styling = { variant: 'default', size: 'md' },
    animation = { enabled: true },
  } = config;

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return `${val.toFixed(precision)}%`;
      case 'decimal':
        return val.toFixed(precision);
      default:
        return formatNumber(val, { minimumFractionDigits: precision });
    }
  };

  const getSizeClasses = () => {
    switch (styling.size) {
      case 'sm':
        return 'text-2xl';
      case 'lg':
        return 'text-4xl';
      case 'xl':
        return 'text-5xl';
      default:
        return 'text-3xl';
    }
  };

  const getCardClasses = () => {
    switch (styling.variant) {
      case 'minimal':
        return 'bg-transparent border-none shadow-none';
      case 'card':
        return 'bg-white border border-gray-200 shadow-sm';
      case 'compact':
        return 'p-3';
      default:
        return 'bg-white border border-gray-200 shadow-sm';
    }
  };

  const indicatorClasses = cn(
    'kpi-indicator p-6 rounded-lg',
    getCardClasses(),
    styling.rounded && 'rounded-lg',
    className
  );

  const valueClasses = cn(
    'font-bold text-gray-900',
    getSizeClasses()
  );

  return (
    <div
      className={indicatorClasses}
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {icon && <span className="text-gray-500">{icon}</span>}
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className={valueClasses} style={{ color }}>
              {formatValue(value)}
            </span>
            {unit && (
              <span className="text-sm text-gray-500">{unit}</span>
            )}
          </div>
          
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
          
          <div className="mt-3 space-y-2">
            {trend.enabled && previousValue !== undefined && (
              <KPITrend
                current={value}
                previous={previousValue}
                period={trend.period}
                showPercentage={trend.showPercentage}
                showArrow={trend.showArrow}
              />
            )}
            
            {targetConfig.enabled && target !== undefined && (
              <KPIProgress
                current={value}
                target={target}
                showPercentage={targetConfig.showPercentage}
                color={color}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

KPIIndicator.displayName = 'KPIIndicator';
