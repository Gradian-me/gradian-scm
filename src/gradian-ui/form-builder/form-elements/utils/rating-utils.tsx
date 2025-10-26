import React from 'react';
import * as LucideIcons from 'lucide-react';

interface RenderRatingStarsProps {
  rating: number;
  maxRating?: number;
}

/**
 * Render rating stars
 */
export const renderRatingStars = ({ rating, maxRating = 5 }: RenderRatingStarsProps): React.ReactNode => {
  return Array.from({ length: maxRating }, (_, i) => (
    <LucideIcons.Star
      key={i}
      className={`h-4 w-4 ${
        i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
      }`}
    />
  ));
};

