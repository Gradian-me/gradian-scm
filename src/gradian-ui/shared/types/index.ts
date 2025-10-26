// Shared Types for Gradian UI Components

export interface BaseComponentProps {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ComponentConfig {
  id: string;
  name: string;
  type: string;
  props?: Record<string, any>;
  children?: ComponentConfig[];
  metadata?: {
    description?: string;
    version?: string;
    author?: string;
    lastModified?: string;
  };
}

export interface ComponentHookData {
  data: any;
  loading: boolean;
  error: string | null;
  refetch?: () => void;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  placeholder?: string;
  validation?: ValidationRule;
  options?: Array<{ label: string; value: any }>;
  defaultValue?: any;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  animation?: boolean;
}

export interface LayoutConfig {
  columns?: number;
  gap?: number;
  padding?: number;
  margin?: number;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface NotificationConfig {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  badge?: string | number;
  disabled?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}
