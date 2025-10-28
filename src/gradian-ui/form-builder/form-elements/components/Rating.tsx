import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../../shared/utils';

export interface RatingProps {
  value: number;
  maxValue?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  maxValue = 5,
  size = 'md',
  showValue = false,
  className
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;

  return (
    <div className={cn("flex items-center gap-0.2", className)}>
      {Array.from({ length: maxValue }, (_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                "fill-yellow-400 text-yellow-400"
              )}
            />
          );
        } else if (i === fullStars && hasHalfStar) {
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                "fill-yellow-400/50 text-yellow-400"
              )}
            />
          );
        } else {
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                "text-gray-300"
              )}
            />
          );
        }
      })}
      {showValue && (
        <span className={cn("ml-1 text-gray-500", textSizeClasses[size])}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

