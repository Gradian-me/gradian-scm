/**
 * Badge Viewer Component
 * Unified component for rendering badges - includes both low-level renderer and field-aware wrapper
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../lib/utils';
import { FormField } from '@/gradian-ui/schema-manager/types/form-schema';
import { findBadgeOption, getBadgeMetadata, BadgeOption } from './badge-utils';
import { IconRenderer } from '../../../../shared/utils/icon-renderer';
import { normalizeOptionArray, NormalizedOption } from './option-normalizer';

export type BadgeItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  role?: string;
  original?: any;
  normalized?: NormalizedOption;
};

export interface BadgeRendererProps {
  /**
   * Array of badge items to display
   * Can be either an array of strings or an array of BadgeItem objects
   */
  items: string[] | BadgeItem[];
  
  /**
   * Maximum number of badges to display before showing +X more
   * @default 2
   */
  maxBadges?: number;
  
  /**
   * CSS class name for the container
   */
  className?: string;
  
  /**
   * Badge variant
   * @default "outline"
   */
  badgeVariant?: "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info" | "muted";
  
  /**
   * Whether to animate the badges
   * @default true
   */
  animate?: boolean;
  
  /**
   * Custom renderer for badge content
   */
  renderBadge?: (item: string | BadgeItem, index: number) => React.ReactNode;

  /**
   * When true, ignore item-level color/icon styling and always use badgeVariant
   */
  enforceVariant?: boolean;

  /**
   * Callback when a badge is clicked
   */
  onBadgeClick?: (item: BadgeItem, event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * BadgeRenderer - Low-level component for rendering a collection of badges with a "show more" indicator
 * Supports both simple string arrays and object arrays with id, label, icon, color, and role properties
 */
export const BadgeRenderer: React.FC<BadgeRendererProps> = ({
  items = [],
  maxBadges = 2,
  className = '',
  badgeVariant = 'outline',
  animate = true,
  renderBadge,
  enforceVariant = false,
  onBadgeClick,
}) => {
  // Early return if no items
  if (!items || items.length === 0) {
    return null;
  }

  // Determine if we're working with string array or object array
  const isObjectArray = items.length > 0 && typeof items[0] !== 'string';
  
  // Filter items to only include those with role='badge' if they are objects
  // For string arrays, keep all items
  const filteredItems = isObjectArray
    ? (items as BadgeItem[]).filter(item => !item.role || item.role === 'badge')
    : items;

const VALID_BADGE_VARIANTS = new Set([
  'default',
  'secondary',
  'destructive',
  'success',
  'warning',
  'info',
  'outline',
  'gradient',
  'muted',
]);

const isValidBadgeVariant = (color?: string): boolean => {
  if (!color) return false;
  return VALID_BADGE_VARIANTS.has(color);
};

const isHexColor = (color: string): boolean => color.startsWith('#');

const isTailwindColorClass = (color: string): boolean =>
  /(?:^|\s)(?:bg-|text-|border-)[\w:-]+/.test(color);

const getBadgePresentation = (color?: string) => {
  if (!color) {
    return {
      variant: undefined as string | undefined,
      className: 'border border-gray-200 bg-gray-50 text-gray-700',
      style: undefined as React.CSSProperties | undefined,
    };
  }

  if (isValidBadgeVariant(color)) {
    return {
      variant: color,
      className: '',
      style: undefined as React.CSSProperties | undefined,
    };
  }

  if (isTailwindColorClass(color)) {
    const hasTextColor = /(?:^|\s)text-/.test(color);
    const textClass = hasTextColor ? '' : 'text-white';
    return {
      variant: undefined as string | undefined,
      className: cn('border', textClass, color),
      style: undefined as React.CSSProperties | undefined,
    };
  }

  if (isHexColor(color)) {
    return {
      variant: undefined as string | undefined,
      className: '',
      style: {
        backgroundColor: color,
        color: '#fff',
        border: 'none',
      } as React.CSSProperties,
    };
  }

  return {
    variant: undefined as string | undefined,
    className: color,
    style: undefined as React.CSSProperties | undefined,
  };
};

  // Determine how many badges to show
  // If maxBadges is 0, show all badges
  const showAllBadges = maxBadges === 0;
  const visibleBadges = showAllBadges ? filteredItems : filteredItems.slice(0, maxBadges);
  const hasMoreBadges = !showAllBadges && filteredItems.length > maxBadges;
  const extraBadgesCount = filteredItems.length - maxBadges;

  // Container classes - responsive with wrapping
  const containerClasses = cn(
    "flex flex-wrap justify-start items-center gap-2",
    className
  );

  // Render a badge with optional animation
  const renderBadgeItem = (item: string | BadgeItem, idx: number) => {
    // Handle string or object item
    const isItemObject = typeof item !== 'string';
    const itemId = isItemObject ? (item as BadgeItem).id : `${item}-${idx}`;
    const itemLabel = isItemObject ? (item as BadgeItem).label : item as string;
    const itemIcon = isItemObject ? (item as BadgeItem).icon : null;
    const itemColor = !enforceVariant && isItemObject ? (item as BadgeItem).color : null;
    
    // Use custom renderer if provided
    const badgePresentation = enforceVariant
      ? { variant: undefined, className: '', style: undefined }
      : getBadgePresentation(itemColor ?? undefined);
    const badgeObject: BadgeItem = isItemObject
      ? (item as BadgeItem)
      : {
          id: itemId,
          label: itemLabel,
        };
    const badgeContent = renderBadge ? renderBadge(item, idx) : (
      <span className="inline-flex items-center gap-1.5">
        {itemIcon && <span className="flex items-center">{itemIcon}</span>}
        <span>{itemLabel}</span>
      </span>
    );
    
    const badgeClasses = cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.625rem] transition-transform duration-100 whitespace-nowrap",
      badgePresentation.className
    );
    
    const handleItemClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (onBadgeClick) {
        onBadgeClick(badgeObject, event);
      }
    };

      return (
        <motion.div
          key={itemId}
          className="shrink-0"
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: idx * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.1, ease: "easeOut" }
          }}
          onClick={handleItemClick}
        >
          <Badge 
            variant={enforceVariant ? badgeVariant : (badgePresentation.variant as any) ?? (itemColor ? undefined : badgeVariant)} 
            className={badgeClasses}
            style={enforceVariant ? undefined : badgePresentation.style}
          >
            {badgeContent}
          </Badge>
        </motion.div>
      );
  };

  // Render +X more indicator with optional animation
  const renderMoreIndicator = () => {
    if (!hasMoreBadges) return null;
    
    const moreBadge = (
      <Badge variant={badgeVariant} className="text-[0.625rem] px-2 py-0 h-fit whitespace-nowrap">
        +{extraBadgesCount}
      </Badge>
    );
    
      return (
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.2, 
            delay: visibleBadges.length * 0.05 
          }}
        >
          {moreBadge}
        </motion.div>
      );
  };

  return (
    <div className={containerClasses}>
      {/* Render visible badges */}
      {visibleBadges.map((item, idx) => renderBadgeItem(item, idx))}
      
      {/* Render +X more indicator if needed */}
      {renderMoreIndicator()}
    </div>
  );
};

BadgeRenderer.displayName = 'BadgeRenderer';

export interface BadgeViewerProps {
  /**
   * Field configuration
   */
  field: FormField;
  
  /**
   * Field value (can be array of strings or array of field option values)
   */
  value: any;
  
  /**
   * Maximum number of badges to display before showing +X more
   * @default field.maxDisplay || 5
   */
  maxBadges?: number;
  
  /**
   * Badge variant
   * @default "outline"
   */
  badgeVariant?: "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info";
  
  /**
   * Whether to animate the badges
   * @default true
   */
  animate?: boolean;
  
  /**
   * CSS class name
   */
  className?: string;

  /**
   * When true, ignore option color/icon styling and use badgeVariant instead
   */
  enforceVariant?: boolean;

  /**
   * Callback when a badge is clicked
   */
  onBadgeClick?: (item: BadgeItem) => void;
}

/**
 * Convert field value (array of option values) to badge items with labels and metadata
 */
const convertValueToBadgeItems = (
  field: FormField,
  value: any
): Array<BadgeItem> => {
  const valueArray = Array.isArray(value) ? value : (value === undefined || value === null ? [] : [value]);

  if (valueArray.length === 0) {
    return [];
  }

  const fieldOptions = Array.isArray(field.options) ? field.options : undefined;

  if (!fieldOptions) {
    return valueArray.map((entry, idx) => {
      const normalized = normalizeOptionArray(entry);
      const firstEntry = normalized[0];
      const id = firstEntry?.id ?? String((entry as any)?.id ?? entry ?? idx);
      const label = firstEntry?.label ?? String((entry as any)?.label ?? entry);
      const icon = firstEntry?.icon;
      const color = firstEntry?.color;
      return {
        id,
        label,
        icon: icon ? <IconRenderer iconName={icon} className="h-3 w-3" /> : undefined,
        color,
        original: entry,
        normalized: firstEntry,
      };
    });
  }

  return valueArray.map((optionValue: any, idx: number) => {
    const normalizedValue: NormalizedOption | undefined = normalizeOptionArray(optionValue)[0];
    const option = findBadgeOption(optionValue, field.options as BadgeOption[]);
    const metadata = getBadgeMetadata(optionValue, field.options as BadgeOption[]);

    if (option || normalizedValue) {
      const id = option?.id ?? option?.value ?? normalizedValue?.id ?? normalizedValue?.value ?? `${idx}`;
      const label = option?.label ?? normalizedValue?.label ?? String(optionValue);
      const iconName = normalizedValue?.icon ?? metadata.icon;
      const color = normalizedValue?.color ?? metadata.color;
      return {
        id,
        label,
        icon: iconName ? <IconRenderer iconName={iconName} className="h-3 w-3" /> : undefined,
        color,
        original: optionValue,
        normalized: normalizedValue,
      };
    }

    const fallbackLabel = typeof optionValue === 'string' || typeof optionValue === 'number'
      ? String(optionValue)
      : (() => {
          if (optionValue && typeof optionValue === 'object') {
            if ('label' in optionValue && optionValue.label) {
              return String(optionValue.label);
            }
            if ('id' in optionValue && optionValue.id) {
              return String(optionValue.id);
            }
          }
          return `${idx}`;
        })();

    return {
      id: fallbackLabel,
      label: fallbackLabel,
      original: optionValue,
      normalized: normalizedValue,
    };
  });
};

/**
 * BadgeViewer - Renders badges from field values using BadgeRenderer
 * Handles conversion of field option values to badge items with proper labels, icons, and colors
 */
export const BadgeViewer: React.FC<BadgeViewerProps> = ({
  field,
  value,
  maxBadges,
  badgeVariant = 'outline',
  animate = true,
  className,
  enforceVariant = false,
  onBadgeClick,
}) => {
  // Handle null/undefined/empty values
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  // Convert value to badge items
  const badgeItems = convertValueToBadgeItems(field, value);

  if (badgeItems.length === 0) {
    return null;
  }

  // Use field's maxDisplay or provided maxBadges
  const maxDisplay = maxBadges ?? (field as any).maxDisplay ?? 5;

  return (
    <BadgeRenderer
      items={badgeItems}
      maxBadges={maxDisplay}
      badgeVariant={badgeVariant}
      animate={animate}
      className={className}
      onBadgeClick={(item, event) => {
        onBadgeClick?.(item);
      }}
      enforceVariant={enforceVariant}
    />
  );
};

BadgeViewer.displayName = 'BadgeViewer';
