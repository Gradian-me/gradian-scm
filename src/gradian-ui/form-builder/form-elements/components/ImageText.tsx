// Image Text Component
// Displays an image with text label, typically used for displaying company logos with names

import React from 'react';
import { FormElementProps } from '../types';
import { cn } from '../../../shared/utils';

export interface ImageTextProps extends Omit<FormElementProps, 'config'> {
  config?: any;
  imageUrl?: string;
  text?: string;
  imageSize?: 'sm' | 'md' | 'lg';
  imageAlt?: string;
  className?: string;
}

export const ImageText: React.FC<ImageTextProps> = ({
  config,
  value,
  imageUrl,
  text,
  imageSize = 'md',
  imageAlt,
  className,
  ...props
}) => {
  // Extract image and text from config if available
  const configImageUrl = config?.imageUrl || imageUrl || value?.imageUrl || value?.logo || value?.image;
  const configText = config?.text || text || value?.text || value?.name || value?.title;
  const configAlt = config?.imageAlt || imageAlt || configText || 'Image';

  // Size classes for image
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const imageClasses = cn(
    'object-contain rounded',
    sizeClasses[imageSize],
    className
  );

  const containerClasses = cn(
    'flex items-center gap-1.5',
    className
  );

  return (
    <div className={containerClasses}>
      {configImageUrl && (
        <img
          src={configImageUrl}
          alt={configAlt}
          className={imageClasses}
          onError={(e) => {
            // Hide image on error
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      )}
      {configText && (
        <span className="text-sm font-medium text-gray-900">
          {configText}
        </span>
      )}
    </div>
  );
};

ImageText.displayName = 'ImageText';
