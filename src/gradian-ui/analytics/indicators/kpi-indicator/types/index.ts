// KPI Indicator Types

import { BaseComponentProps } from '../../../../shared/types';

export interface KPIIndicatorProps extends BaseComponentProps {
  config: KPIConfig;
  value: number;
  previousValue?: number;
  target?: number;
  onValueChange?: (value: number) => void;
}

export interface KPIConfig {
  id: string;
  name: string;
  title: string;
  description?: string;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'decimal';
  precision?: number;
  color?: string;
  icon?: React.ReactNode;
  trend?: {
    enabled: boolean;
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    showPercentage?: boolean;
    showArrow?: boolean;
  };
  target?: {
    enabled: boolean;
    value: number;
    showProgress?: boolean;
    showPercentage?: boolean;
  };
  styling?: {
    variant?: 'default' | 'minimal' | 'card' | 'compact';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    theme?: 'light' | 'dark';
    rounded?: boolean;
  };
  animation?: {
    enabled: boolean;
    duration?: number;
    delay?: number;
  };
}

export interface KPITrendProps extends BaseComponentProps {
  current: number;
  previous: number;
  period?: string;
  showPercentage?: boolean;
  showArrow?: boolean;
}

export interface KPIProgressProps extends BaseComponentProps {
  current: number;
  target: number;
  showPercentage?: boolean;
  color?: string;
}

export interface KPICardProps extends BaseComponentProps {
  config: KPIConfig;
  value: number;
  previousValue?: number;
  target?: number;
  onValueChange?: (value: number) => void;
}
