import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';

export interface DynamicBadgeRendererProps {
  /**
   * Array of badge items to display
   */
  items: string[];
  
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
  renderBadge?: (item: string, index: number) => React.ReactNode;
}

/**
 * DynamicBadgeRenderer - A component for rendering a collection of badges with a "show more" indicator
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

  // Determine how many badges to show
  const visibleBadges = items.slice(0, maxBadges);
  const hasMoreBadges = items.length > maxBadges;
  const extraBadgesCount = items.length - maxBadges;

  // Container classes
  const containerClasses = `flex justify-start items-center space-x-2 ${className}`;

  // Render a badge with optional animation
  const renderBadgeItem = (item: string, idx: number) => {
    const badgeContent = renderBadge ? renderBadge(item, idx) : item;
    
    if (animate) {
      return (
        <motion.div
          key={`${item}-${idx}`}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Badge variant={badgeVariant} className="text-[0.625rem] px-2 py-0">
            {badgeContent}
          </Badge>
        </motion.div>
      );
    }
    
    return (
      <Badge key={`${item}-${idx}`} variant={badgeVariant} className="text-[0.625rem] px-2 py-0">
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
