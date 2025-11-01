import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';
import { cn } from '@/lib/utils';

export type BadgeItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  role?: string;
};

export interface DynamicBadgeRendererProps {
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
 * DynamicBadgeRenderer - A component for rendering a collection of badges with a "show more" indicator
 * Supports both simple string arrays and object arrays with id, label, icon, color, and role properties
 * For object arrays, only items with role='badge' or no role specified will be displayed
 */
export const DynamicBadgeRenderer: React.FC<DynamicBadgeRendererProps> = ({
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

  // Container classes
  const containerClasses = `flex justify-start items-center space-x-2 ${className}`;

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
      "text-[0.625rem] px-2 py-0",
      itemColor && "border text-white"
    );
    
    if (animate) {
      return (
        <motion.div
          key={itemId}
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: idx * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{ scale: 1.05 }}
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
    }
    
    return (
      <Badge 
        key={itemId} 
        variant={itemColor ? undefined : badgeVariant} 
        className={badgeClasses}
        style={badgeStyle}
      >
        {badgeContent}
      </Badge>
    );
  };

  return (
    <div className={containerClasses}>
      {/* Render visible badges */}
      {visibleBadges.map((item, idx) => renderBadgeItem(item, idx))}
      
      {/* Render +X more indicator if needed */}
      {hasMoreBadges && (
        <Badge variant={badgeVariant} className="text-[0.625rem] px-2 py-0 h-fit">
          +{extraBadgesCount}
        </Badge>
      )}
    </div>
  );
};

DynamicBadgeRenderer.displayName = 'DynamicBadgeRenderer';
