/**
 * Badge option interface
 */
import { normalizeOptionArray, normalizeOptionId, OptionValueInput } from './option-normalizer';

export interface BadgeOption {
  id?: string;
  label: string;
  value?: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
}

/**
 * Badge metadata interface
 */
export interface BadgeMetadata {
  icon?: string;
  color?: string;
  label?: string;
}

/**
 * Badge color type
 */
export type BadgeColor = "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info" | "muted";

/**
 * Find badge option from options array by value
 */
export const findBadgeOption = (value: OptionValueInput, options?: BadgeOption[]): BadgeOption | undefined => {
  if (!options || !Array.isArray(options)) return undefined;
  const targetId = normalizeOptionId(value);
  if (!targetId) return undefined;
  return options.find(option => normalizeOptionId(option as OptionValueInput) === targetId);
};

/**
 * Get badge color variant from options
 */
export const getBadgeColor = (value: OptionValueInput, options?: BadgeOption[]): BadgeColor => {
  const option = findBadgeOption(value, options);
  
  if (option?.color) {
    return option.color as BadgeColor;
  }
  
  // Default fallback
  return 'outline';
};

/**
 * Get badge icon name from options
 */
export const getBadgeIcon = (value: OptionValueInput, options?: BadgeOption[]): string => {
  const option = findBadgeOption(value, options);
  
  if (option?.icon) {
    return option.icon;
  }
  
  // Default fallback
  return 'Circle';
};

/**
 * Get badge label from options
 */
export const getBadgeLabel = (value: OptionValueInput, options?: BadgeOption[]): string => {
  const option = findBadgeOption(value, options);
  
  if (option?.label) {
    return option.label;
  }
  
  const normalizedOptions = normalizeOptionArray(value);
  if (normalizedOptions.length > 0) {
    return normalizedOptions[0].label ?? normalizedOptions[0].id ?? '';
  }
  
  const normalizedId = normalizeOptionId(value);
  if (normalizedId) {
    return normalizedId;
  }
  
  return String(value ?? '');
};

/**
 * Get complete badge metadata from options
 */
export const getBadgeMetadata = (value: OptionValueInput, options?: BadgeOption[]): BadgeMetadata => {
  const option = findBadgeOption(value, options);
  
  if (option) {
    return {
      icon: option.icon,
      color: option.color,
      label: option.label,
    };
  }
  
  return {};
};

/**
 * Badge configuration interface
 */
export interface BadgeConfig {
  value: string;
  label: string;
  icon?: string;
  color: BadgeColor;
}

/**
 * Get complete badge configuration with all properties
 */
export const getBadgeConfig = (value: OptionValueInput, options?: BadgeOption[]): BadgeConfig => {
  const normalizedValue = normalizeOptionId(value) ?? '';
  const label = getBadgeLabel(value, options);
  const icon = getBadgeIcon(value, options);
  const color = getBadgeColor(value, options);
  
  return {
    value: normalizedValue,
    label,
    icon,
    color,
  };
};

/**
 * Legacy function names for backward compatibility with status-specific use cases
 * These will be deprecated but kept for now
 */
export const getStatusColor = (status: OptionValueInput, options?: BadgeOption[]): BadgeColor => {
  return getBadgeColor(status, options);
};

export const getStatusIcon = (status: OptionValueInput, options?: BadgeOption[]): string => {
  return getBadgeIcon(status, options);
};

export const getStatusMetadata = (status: OptionValueInput, options?: BadgeOption[]): BadgeMetadata => {
  return getBadgeMetadata(status, options);
};

/**
 * Find status field options from form schema
 */
export const findStatusFieldOptions = (formSchema: any): BadgeOption[] | undefined => {
  if (!formSchema || !formSchema.fields) return undefined;
  
  for (const field of formSchema.fields) {
    if (field.role === 'status' && field.options) {
      const normalizedOptions = normalizeOptionArray(field.options).map(option => ({
        ...option,
      }));
      return normalizedOptions as BadgeOption[];
    }
  }
  return undefined;
};

