// CTA Button Component

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../shared/utils';

export interface CTAButtonProps {
  /**
   * Button text
   */
  label: string;
  
  /**
   * Click handler
   */
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Button color (hex color or Tailwind color class)
   * @default "#7c3aed" (violet-600)
   */
  color?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Icon to show before the text
   */
  icon?: React.ReactNode;
  
  /**
   * Show arrow icon on the right side
   * @default true
   */
  showArrow?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  label,
  onClick,
  color = '#7c3aed',
  className,
  disabled = false,
  icon,
  showArrow = true,
}) => {
  const isHexColor = color.startsWith('#');
  const baseColor = isHexColor ? color : undefined;
  
  // Extract color for hover state (for hex colors)
  const getHoverColor = () => {
    if (isHexColor) {
      return color;
    }
    // For Tailwind classes, we'll use a default hover behavior
    return undefined;
  };

  const buttonClasses = cn(
    'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm group',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const defaultStyle: React.CSSProperties = {
    backgroundColor: isHexColor ? `${color}10` : undefined,
    color: isHexColor ? color : undefined,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (isHexColor) {
      e.currentTarget.style.backgroundColor = getHoverColor() || color;
      e.currentTarget.style.color = 'white';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (isHexColor) {
      e.currentTarget.style.backgroundColor = `${color}10`;
      e.currentTarget.style.color = color;
    }
  };

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      style={isHexColor ? defaultStyle : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icon && (
        <span className="inline-flex items-center shrink-0">
          {icon}
        </span>
      )}
      <span>{label}</span>
      {showArrow && (
        <span className="inline-flex items-center transition-transform group-hover:translate-x-0.5 shrink-0">
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </button>
  );
};

CTAButton.displayName = 'CTAButton';

