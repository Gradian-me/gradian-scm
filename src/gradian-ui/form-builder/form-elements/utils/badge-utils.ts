/**
 * Badge option interface
 */
export interface BadgeOption {
  label: string;
  value: string;
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
export type BadgeColor = "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info";

/**
 * Find badge option from options array by value
 */
export const findBadgeOption = (value: string, options?: BadgeOption[]): BadgeOption | undefined => {
  if (!options || !Array.isArray(options)) return undefined;
  return options.find(option => option.value === value);
};

/**
 * Get badge color variant from options
 */
export const getBadgeColor = (value: string, options?: BadgeOption[]): BadgeColor => {
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
export const getBadgeIcon = (value: string, options?: BadgeOption[]): string => {
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
export const getBadgeLabel = (value: string, options?: BadgeOption[]): string => {
  const option = findBadgeOption(value, options);
  
  if (option?.label) {
    return option.label;
  }
  
  // Return the value itself if no label found
  return value;
};

/**
 * Get complete badge metadata from options
 */
export const getBadgeMetadata = (value: string, options?: BadgeOption[]): BadgeMetadata => {
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
export const getBadgeConfig = (value: string, options?: BadgeOption[]): BadgeConfig => {
  const label = getBadgeLabel(value, options);
  const icon = getBadgeIcon(value, options);
  const color = getBadgeColor(value, options);
  
  return {
    value,
    label,
    icon,
    color,
  };
};

/**
 * Legacy function names for backward compatibility with status-specific use cases
 * These will be deprecated but kept for now
 */
export const getStatusColor = (status: string, options?: BadgeOption[]): BadgeColor => {
  return getBadgeColor(status, options);
};

export const getStatusIcon = (status: string, options?: BadgeOption[]): string => {
  return getBadgeIcon(status, options);
};

export const getStatusMetadata = (status: string, options?: BadgeOption[]): BadgeMetadata => {
  return getBadgeMetadata(status, options);
};

/**
 * Find status field options from form schema
 */
export const findStatusFieldOptions = (formSchema: any): BadgeOption[] | undefined => {
  if (!formSchema || !formSchema.sections) return undefined;
  
  for (const section of formSchema.sections) {
    for (const field of section.fields) {
      if (field.role === 'status' && field.options) {
        return field.options as BadgeOption[];
      }
    }
  }
  return undefined;
};

