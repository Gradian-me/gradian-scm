// Card Image Component

import React from 'react';
import { CardImageProps } from '../types';
import { cn } from '../../../shared/utils';

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  position = 'top',
  aspectRatio = 'auto',
  objectFit = 'cover',
  className,
  ...props
}) => {
  const imageClasses = cn(
    'card-image w-full',
    position === 'top' && 'rounded-t-md',
    position === 'bottom' && 'rounded-b-md',
    position === 'left' && 'rounded-l-md',
    position === 'right' && 'rounded-r-md',
    aspectRatio === 'square' && 'aspect-square',
    aspectRatio === 'video' && 'aspect-video',
    aspectRatio === 'wide' && 'aspect-[16/9]',
    className
  );

  const getObjectFitClasses = () => {
    switch (objectFit) {
      case 'cover':
        return 'object-cover';
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      case 'scale-down':
        return 'object-scale-down';
      default:
        return 'object-cover';
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={cn(imageClasses, getObjectFitClasses())}
      {...props}
    />
  );
};

CardImage.displayName = 'CardImage';
