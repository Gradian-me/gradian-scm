// Line Chart Component

import React from 'react';
import { LineChartProps } from '../types';
import { cn } from '@/gradian-ui/shared/utils';

export const LineChart: React.FC<LineChartProps> = ({
  config,
  data,
  onPointClick,
  onLineClick,
  className,
  ...props
}) => {
  const {
    width = 400,
    height = 300,
    lines = [],
    xAxis = {},
    yAxis = {},
    grid = { show: true },
    curve = 'monotone',
    area = false,
    areaOpacity = 0.1,
    strokeWidth = 2,
    dotSize = 4,
    showDots = true,
    showLegend = true,
    showTooltip = true,
    animation = true,
    animationDuration = 1000,
  } = config;

  const chartClasses = cn(
    'line-chart',
    className
  );

  // This is a placeholder implementation
  // In a real implementation, you would use a charting library like Recharts, Chart.js, or D3.js
  return (
    <div
      className={chartClasses}
      style={{ width, height }}
      {...props}
    >
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            Line Chart Component
          </p>
          <p className="text-xs text-gray-400">
            {lines.length} lines, {data.length} data points
          </p>
        </div>
      </div>
    </div>
  );
};

LineChart.displayName = 'LineChart';
