import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';
import { ArrowDown, ArrowUp, ArrowRight, Minus } from 'lucide-react';
import { formatNumber } from '../../shared/utils/number-formatter';
import { IconRenderer } from '../../../shared/utils/icon-renderer';

export interface MetricItem {
  id?: string;
  label: string;
  subLabel?: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'same' | 'none';
  icon?: string; // Lucide icon name
}

export interface DynamicMetricRendererProps {
  /**
   * Array of metric items to display
   */
  metrics: MetricItem[];
  
  /**
   * Maximum number of metrics to display before showing +X more
   * @default 3
   */
  maxMetrics?: number;
  
  /**
   * CSS class name for the container
   */
  className?: string;
  
  /**
   * Badge variant for the "more" indicator
   * @default "outline"
   */
  badgeVariant?: "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info";
  
  /**
   * Whether to animate the metrics
   * @default true
   */
  animate?: boolean;
  
  /**
   * Custom renderer for metric content
   */
  renderMetric?: (metric: MetricItem, index: number) => React.ReactNode;
}

/**
 * DynamicMetricRenderer - A component for rendering a collection of metrics with a "show more" indicator
 */
export const DynamicMetricRenderer: React.FC<DynamicMetricRendererProps> = ({
  metrics = [],
  maxMetrics = 3,
  className = '',
  badgeVariant = 'outline',
  animate = true,
  renderMetric
}) => {
  // Early return if no metrics
  if (!metrics || metrics.length === 0) {
    return null;
  }

  // Determine how many metrics to show
  // If maxMetrics is 0, show all metrics
  const showAllMetrics = maxMetrics === 0;
  const visibleMetrics = showAllMetrics ? metrics : metrics.slice(0, maxMetrics);
  const hasMoreMetrics = !showAllMetrics && metrics.length > maxMetrics;
  const extraMetricsCount = metrics.length - maxMetrics;

  // Container classes - more minimal style
  const containerClasses = `flex flex-col space-y-1 ${className}`;

  // Render a metric with optional animation - more minimal style
  const renderMetricItem = (metric: MetricItem, idx: number) => {
    // Convert label to Pascal Case with spaces
    const pascalCaseLabel = metric.label
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const metricContent = renderMetric ? (
      renderMetric(metric, idx)
    ) : (
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center">
            {metric.icon && (
              <span className="mr-1 text-gray-500">
                <IconRenderer iconName={metric.icon} className="h-3 w-3" />
              </span>
            )}
            <span className="text-xs text-gray-500">{pascalCaseLabel}</span>
            {metric.subLabel && (
              <span className="text-[0.6rem] text-gray-400 ml-1">
                ({metric.subLabel})
              </span>
            )}
            <span className="text-xs text-gray-500 ml-0.5">:</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-700">
            {formatNumber(metric.value)}
            {metric.unit && <span className="text-xs ml-0.5">{metric.unit}</span>}
          </span>
          {metric.trend && (
            <span className="ml-1.5">
              {metric.trend === 'up' && <ArrowUp className="h-3 w-3 text-emerald-500" />}
              {metric.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
              {metric.trend === 'same' && <ArrowRight className="h-3 w-3 text-amber-500" />}
              {metric.trend === undefined && ''}
            </span>
          )}
        </div>
      </div>
    );
    
    if (animate) {
      return (
        <motion.div
          key={`${metric.label}-${idx}`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full"
        >
          {metricContent}
        </motion.div>
      );
    }
    
    return (
      <div key={`${metric.label}-${idx}`} className="w-full">
        {metricContent}
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      {/* Render visible metrics */}
      {visibleMetrics.map((metric, idx) => renderMetricItem(metric, idx))}
      
      {/* Render +X more indicator if needed */}
      {hasMoreMetrics && (
        <div className="flex items-center justify-end w-full">
          <span className="text-xs text-gray-500 italic">
            +{extraMetricsCount} more metrics
          </span>
        </div>
      )}
    </div>
  );
};

DynamicMetricRenderer.displayName = 'DynamicMetricRenderer';
