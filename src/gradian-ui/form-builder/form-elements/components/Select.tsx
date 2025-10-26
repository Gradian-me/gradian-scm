// Select Component

import React from 'react';
import { Select as RadixSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { SelectProps } from '../types';
import { cn } from '../../../shared/utils';
import { IconRenderer } from '../../../../shared/utils/icon-renderer';
import { Badge } from '../../../../components/ui/badge';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
  color?: string; // Can be a badge variant (success, warning, etc.), custom hex color, or Tailwind classes
}

export interface SelectWithBadgesProps extends Omit<SelectProps, 'children'> {
  options?: SelectOption[];
  children?: React.ReactNode;
}

export const Select: React.FC<SelectWithBadgesProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  options,
  value,
  onValueChange,
  ...props
}) => {
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    primary: 'border-blue-300 focus:border-blue-500 focus:ring-blue-500',
    secondary: 'border-gray-300 focus:border-gray-500 focus:ring-gray-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
    danger: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const selectClasses = cn(
    'flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  // Check if color is a valid badge variant, custom color, or Tailwind classes
  const isValidBadgeVariant = (color?: string): boolean => {
    if (!color) return false;
    const validVariants = ['default', 'secondary', 'destructive', 'success', 'warning', 'info', 'outline', 'gradient'];
    return validVariants.includes(color);
  };

  const isHexColor = (color: string): boolean => {
    return color.startsWith('#');
  };

  const isTailwindClasses = (color: string): boolean => {
    // Check if it contains Tailwind class patterns
    return color.includes('bg-') || 
           color.includes('text-') || 
           color.includes('border-') ||
           color.includes('rounded-') ||
           /^[a-z]+-[a-z0-9-]+/.test(color); // Matches Tailwind class patterns like bg-red-400
  };

  // Render badge or custom colored badge
  const renderBadgeContent = (option: SelectOption) => {
    if (!option.color) {
      return (
        <div className="flex items-center gap-2">
          {option.icon && <IconRenderer iconName={option.icon} className="h-4 w-4" />}
          {option.label}
        </div>
      );
    }

    const iconEl = option.icon ? (
      <IconRenderer iconName={option.icon} className="h-3 w-3" />
    ) : null;

    // Check badge variant
    if (isValidBadgeVariant(option.color)) {
      return (
        <Badge variant={option.color as any} className="flex items-center gap-1.5 px-2 py-0.5">
          {iconEl}
          {option.label}
        </Badge>
      );
    }

    // Tailwind classes - render with custom classes
    if (isTailwindClasses(option.color)) {
      // Check if text color is already specified, if not add a default
      const hasTextColor = option.color.includes('text-');
      const defaultTextColor = hasTextColor ? '' : 'text-white';
      
      return (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border ${defaultTextColor} ${option.color}`}>
          {iconEl}
          {option.label}
        </div>
      );
    }

    // Hex color - render with inline styles
    if (isHexColor(option.color)) {
      return (
        <div 
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: option.color, color: '#fff', border: 'none' }}
        >
          {iconEl}
          {option.label}
        </div>
      );
    }

    // Fallback - just render with color as className
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${option.color}`}>
        {iconEl}
        {option.label}
      </div>
    );
  };

  // If options are provided, render them with badges
  if (options && options.length > 0) {
    const selectedOption = options.find(opt => opt.value === value);
    
    return (
      <RadixSelect value={value} onValueChange={onValueChange} {...props}>
        <SelectTrigger className={selectClasses}>
          <SelectValue>
            {selectedOption && renderBadgeContent(selectedOption)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {renderBadgeContent(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </RadixSelect>
    );
  }

  // Default behavior for children
  return (
    <RadixSelect value={value} onValueChange={onValueChange} {...props}>
      <SelectTrigger className={selectClasses}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </RadixSelect>
  );
};

// Export sub-components for convenience
export { SelectContent, SelectItem, SelectTrigger, SelectValue };

Select.displayName = 'Select';
