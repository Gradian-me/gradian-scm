// Form Elements Types

import { BaseComponentProps, FormFieldConfig, ValidationRule } from '../../../shared/types';

export interface FormElementProps {
  config: any;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface TextInputProps extends FormElementProps {
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface NumberInputProps extends FormElementProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

export interface SelectInputProps extends FormElementProps {
  options: Array<{ label: string; value: any; disabled?: boolean; icon?: string; color?: string }>;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

export interface TextareaProps extends FormElementProps {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  maxLength?: number;
}

export interface CheckboxProps extends FormElementProps {
  checked?: boolean;
  indeterminate?: boolean;
}

export interface RadioProps extends FormElementProps {
  options: Array<{ label: string; value: any; disabled?: boolean }>;
  direction?: 'horizontal' | 'vertical';
}

export interface DateInputProps extends FormElementProps {
  min?: string;
  max?: string;
  format?: string;
}

export interface FileInputProps extends FormElementProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFileSelect?: (files: FileList) => void;
}

export interface FormElementConfig extends FormFieldConfig {
  component: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  layout?: {
    width?: string;
    order?: number;
    hidden?: boolean;
  };
  styling?: {
    variant?: 'default' | 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  };
  behavior?: {
    autoFocus?: boolean;
    autoComplete?: string;
    readOnly?: boolean;
    disabled?: boolean;
  };
}

export interface FormElementValidation {
  rules: ValidationRule;
  message?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FormElementState {
  value: any;
  error: string | null;
  touched: boolean;
  focused: boolean;
  dirty: boolean;
}

export interface FormElementRef {
  focus: () => void;
  blur: () => void;
  validate: () => boolean;
  reset: () => void;
  getValue: () => any;
  setValue: (value: any) => void;
}

// Badge Component Types
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// Button Component Types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// Input Component Types
export interface InputProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
}

// Select Component Types
export interface SelectProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

// Avatar Component Types
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}