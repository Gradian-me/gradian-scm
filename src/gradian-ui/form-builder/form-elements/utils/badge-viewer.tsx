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

export type BadgeItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  role?: string;
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
  badgeVariant?: "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info";
  
  /**
   * Whether to animate the badges
   * @default true
   */
  animate?: boolean;
  
  /**
   * Custom renderer for badge content
   */
  renderBadge?: (item: string | BadgeItem, index: number) => React.ReactNode;
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
  renderBadge
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
    const itemColor = isItemObject ? (item as BadgeItem).color : null;
    
    // Use custom renderer if provided
    const badgeContent = renderBadge ? renderBadge(item, idx) : (
      <>
        {itemIcon && <span className="mr-1">{itemIcon}</span>}
        {itemLabel}
      </>
    );
    
    // Apply custom color if provided, otherwise use the variant
    const badgeStyle = itemColor ? { backgroundColor: itemColor, borderColor: itemColor } : {};
    const badgeClasses = cn(
      "text-[0.625rem] px-2 py-0 transition-transform duration-100 whitespace-nowrap",
      itemColor && "border text-white"
    );
    
      return (
        <motion.div
          key={itemId}
          className="flex-shrink-0"
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
        >
          <Badge 
            variant={itemColor ? undefined : badgeVariant} 
            className={badgeClasses}
            style={badgeStyle}
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
          className="flex-shrink-0"
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
}

/**
 * Convert field value (array of option values) to badge items with labels and metadata
 */
const convertValueToBadgeItems = (
  field: FormField,
  value: any
): Array<{ id: string; label: string; icon?: React.ReactNode; color?: string }> => {
  if (!Array.isArray(value)) {
    // If not an array, wrap in array
    return value ? [{ id: String(value), label: String(value) }] : [];
  }

  // If no options, return as simple strings
  if (!field.options || !Array.isArray(field.options)) {
    return value.map((v, idx) => ({ id: `${v}-${idx}`, label: String(v) }));
  }

  // Map option values to badge items with metadata
  return value.map((optionValue: string) => {
    const option = findBadgeOption(optionValue, field.options as BadgeOption[]);
    if (option) {
      const metadata = getBadgeMetadata(optionValue, field.options as BadgeOption[]);
      return {
        id: option.value,
        label: option.label,
        icon: metadata.icon ? <IconRenderer iconName={metadata.icon} className="h-3 w-3" /> : undefined,
        color: metadata.color,
      };
    }
    // Fallback to raw value if option not found
    return {
      id: optionValue,
      label: String(optionValue),
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
    />
  );
};

BadgeViewer.displayName = 'BadgeViewer';
