// Shared Utilities for Gradian UI Components

import { ComponentConfig, ValidationRule, ChartDataPoint } from '../types';

/**
 * Generates a unique ID for components
 */
export const generateId = (prefix: string = 'gradian'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Merges class names with proper spacing
 */
export const cn = (...classes: (string | undefined | null | false | 0)[]): string => {
  return classes.filter(c => c !== undefined && c !== null && c !== false && c !== 0).join(' ');
};

/**
 * Validates form field value based on validation rules
 */
export const validateField = (value: any, rules: ValidationRule): { isValid: boolean; error?: string } => {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return { isValid: false, error: 'This field is required' };
  }

  if (value && rules.minLength && value.toString().length < rules.minLength) {
    return { isValid: false, error: `Minimum length is ${rules.minLength}` };
  }

  if (value && rules.maxLength && value.toString().length > rules.maxLength) {
    return { isValid: false, error: `Maximum length is ${rules.maxLength}` };
  }

  if (value && rules.min !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < rules.min) {
      return { isValid: false, error: `Minimum value is ${rules.min}` };
    }
  }

  if (value && rules.max !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > rules.max) {
      return { isValid: false, error: `Maximum value is ${rules.max}` };
    }
  }

  if (value && rules.pattern && !rules.pattern.test(value.toString())) {
    return { isValid: false, error: 'Invalid format' };
  }

  if (value && rules.custom) {
    const result = rules.custom(value);
    if (typeof result === 'object' && result !== null) {
      // Handle object result with isValid and error
      return result as { isValid: boolean; error?: string };
    }
    if (typeof result === 'string') {
      return { isValid: false, error: result };
    }
    if (!result) {
      return { isValid: false, error: 'Invalid value' };
    }
  }

  return { isValid: true };
};

/**
 * Formats number with proper locale formatting
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('en-US', options).format(value);
};

/**
 * Formats currency with proper locale formatting
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Formats date with proper locale formatting
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Debounces function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttles function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clones an object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Calculates chart data statistics
 */
export const calculateChartStats = (data: ChartDataPoint[]) => {
  const values = data.map(d => d.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  
  return {
    sum,
    avg: Number(avg.toFixed(2)),
    max,
    min,
    count: values.length,
  };
};

/**
 * Generates color palette for charts
 */
export const generateColorPalette = (count: number, baseColor?: string): string[] => {
  const defaultColors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
  ];

  if (count <= defaultColors.length) {
    return defaultColors.slice(0, count);
  }

  // Generate additional colors if needed
  const colors = [...defaultColors];
  for (let i = defaultColors.length; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle approximation
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
};

/**
 * Checks if component config is valid
 */
export const validateComponentConfig = (config: ComponentConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.id) {
    errors.push('Component config must have an id');
  }

  if (!config.name) {
    errors.push('Component config must have a name');
  }

  if (!config.type) {
    errors.push('Component config must have a type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Recursively finds component by id in config tree
 */
export const findComponentById = (config: ComponentConfig, id: string): ComponentConfig | null => {
  if (config.id === id) {
    return config;
  }

  if (config.children) {
    for (const child of config.children) {
      const found = findComponentById(child, id);
      if (found) return found;
    }
  }

  return null;
};

/**
 * Converts component config to React element props
 */
export const configToProps = (config: ComponentConfig): Record<string, any> => {
  const { id, name, type, children, metadata, ...props } = config;
  return {
    ...props,
    'data-component-id': id,
    'data-component-name': name,
    'data-component-type': type,
  };
};
