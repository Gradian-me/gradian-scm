// Modern blue, violet, cyan, indigo color theme for ECharts
export const CHART_COLORS = {
  primary: '#3B82F6',      // Blue
  secondary: '#8B5CF6',    // Violet
  accent: '#06B6D4',       // Cyan
  info: '#6366F1',         // Indigo
  success: '#10B981',      // Emerald
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  neutral: '#6B7280',      // Gray
};

export const CHART_GRADIENT_COLORS = {
  blue: ['#3B82F6', '#1D4ED8'],
  violet: ['#8B5CF6', '#7C3AED'],
  cyan: ['#06B6D4', '#0891B2'],
  indigo: ['#6366F1', '#4F46E5'],
  emerald: ['#10B981', '#059669'],
  amber: ['#F59E0B', '#D97706'],
  red: ['#EF4444', '#DC2626'],
  gray: ['#6B7280', '#4B5563'],
};

export const CHART_COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#6B7280', // Gray
];

export const CHART_ANIMATION_CONFIG = {
  duration: 1000,
  easing: 'cubicOut',
  delay: (idx: number) => idx * 100,
};

export const createChartTheme = (isDark = false) => {
  const textPrimary = isDark ? '#E5E7EB' : '#374151';
  const textSecondary = isDark ? '#CBD5F5' : '#6B7280';
  const titleColor = isDark ? '#F9FAFB' : '#111827';
  const axisColor = isDark ? '#475569' : '#E5E7EB';
  const gridColor = isDark ? '#1E293B' : '#F3F4F6';
  const tooltipBackground = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? '#1E293B' : '#E5E7EB';

  return {
    color: CHART_COLOR_PALETTE,
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 12,
      color: textPrimary,
    },
    title: {
      textStyle: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 16,
        fontWeight: '600',
        color: titleColor,
      },
    },
    legend: {
      textStyle: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 12,
        color: textSecondary,
      },
    },
    tooltip: {
      backgroundColor: tooltipBackground,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 12,
        color: textPrimary,
      },
      extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.2); border-radius: 8px;',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: axisColor,
        },
      },
      axisTick: {
        lineStyle: {
          color: axisColor,
        },
      },
      axisLabel: {
        color: textSecondary,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: gridColor,
          type: 'dashed',
        },
      },
    },
    yAxis: {
      axisLine: {
        lineStyle: {
          color: axisColor,
        },
      },
      axisTick: {
        lineStyle: {
          color: axisColor,
        },
      },
      axisLabel: {
        color: textSecondary,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: gridColor,
          type: 'dashed',
        },
      },
    },
  };
};

export const CHART_THEME = createChartTheme(false);
