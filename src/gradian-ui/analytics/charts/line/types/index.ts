// Line Chart Types

import { BaseComponentProps, ChartDataPoint, ChartConfig } from '../../../../shared/types';

export interface LineChartProps extends BaseComponentProps {
  config: LineChartConfig;
  data: LineDataPoint[];
  onPointClick?: (point: LineDataPoint) => void;
  onLineClick?: (line: LineData) => void;
}

export interface LineChartConfig extends ChartConfig {
  id: string;
  name: string;
  lines: LineData[];
  xAxis?: {
    label?: string;
    type?: 'category' | 'number' | 'date';
    format?: string;
  };
  yAxis?: {
    label?: string;
    min?: number;
    max?: number;
    format?: string;
  };
  grid?: {
    show?: boolean;
    xAxis?: boolean;
    yAxis?: boolean;
  };
  curve?: 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
  area?: boolean;
  areaOpacity?: number;
  strokeWidth?: number;
  dotSize?: number;
  showDots?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animation?: boolean;
  animationDuration?: number;
}

export interface LineDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface LineData {
  id: string;
  name: string;
  data: LineDataPoint[];
  color?: string;
  strokeWidth?: number;
  curve?: 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
  area?: boolean;
  areaOpacity?: number;
  showDots?: boolean;
  dotSize?: number;
  metadata?: Record<string, any>;
}

export interface LineChartTooltipProps extends BaseComponentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  config: LineChartConfig;
}

export interface LineChartLegendProps extends BaseComponentProps {
  data: LineData[];
  onItemClick?: (line: LineData) => void;
  config: LineChartConfig;
}
