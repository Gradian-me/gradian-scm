'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Card } from '../card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { CardMetadata, FormSchema } from '../../form-builder/types/form-schema';
import { cn } from '../../shared/utils';
import { getValueByRole, resolveFieldById, getInitials, getStatusColor, getStatusIcon, getBadgeConfig } from '../utils';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import type { BadgeOption } from '../utils/badge-utils';

interface DynamicCardProps {
  data: any;
  metadata: CardMetadata;
  formSchema?: FormSchema;
  onClick?: (data: any) => void;
  onHover?: (isHovering: boolean) => void;
  className?: string;
  index?: number;
  animationDelay?: number;
}

export const DynamicCard: React.FC<DynamicCardProps> = ({
  data,
  metadata,
  formSchema,
  onClick,
  onHover,
  className,
  index = 0,
  animationDelay = 0.1
}) => {
  // Get Lucide icon component by name
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  // Get field value from data using dot notation
  const getFieldValue = (fieldPath: string, data: any) => {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], data);
  };

  // Resolve field by ID from form schema (wrapper to include data)
  const resolveFieldByIdLocal = (fieldId: string, data: any): any => {
    if (!formSchema) {
      return { name: fieldId, value: data[fieldId], label: fieldId };
    }
    
    const field = resolveFieldById(formSchema, fieldId);
    return {
      ...field,
      value: data[field.name]
    };
  };

  // Find status field options from schema
  const findStatusFieldOptions = (): BadgeOption[] | undefined => {
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
  
  const statusOptions = findStatusFieldOptions();
  
  // Get status color with metadata colorMap support
  const getStatusColorLocal = (status: string): "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info" => {
    const color = metadata.status?.colorMap?.[status] || getStatusColor(status, statusOptions);
    return color as "default" | "secondary" | "outline" | "destructive" | "gradient" | "success" | "warning" | "info";
  };

  // Render rating stars
  const renderRatingStars = (rating: number, maxRating: number = 5) => {
    return Array.from({ length: maxRating }, (_, i) => (
      <LucideIcons.Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Render field value based on type
  const renderFieldValue = (field: any, value: any) => {
    if (!value && value !== 0) return 'N/A';

    switch (field.type) {
      case 'text':
        return field.truncate ? (
          <span className="truncate">{value}</span>
        ) : (
          <span>{value}</span>
        );
      
      case 'number':
        return <span>{value.toLocaleString()}</span>;
      
      case 'currency':
        return <span>${value.toLocaleString()}</span>;
      
      case 'percentage':
        return <span>{value}%</span>;
      
      case 'array':
        if (field.displayType === 'badges') {
          const items = Array.isArray(value) ? value : [];
          const displayItems = items.slice(0, field.maxDisplay || 3);
          const remainingCount = items.length - displayItems.length;
          
          return (
            <div className="flex flex-wrap gap-1">
              {displayItems.map((item: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
              {remainingCount > 0 && field.showMore && (
                <Badge variant="outline" className="text-xs">
                  +{remainingCount}
                </Badge>
              )}
            </div>
          );
        }
        return <span>{Array.isArray(value) ? value.join(', ') : value}</span>;
      
      case 'computed':
        return field.compute ? field.compute(data) : value;
      
      default:
        return <span>{value}</span>;
    }
  };

  // Render section content
  const renderSection = (section: any) => {
    const sectionWidth = section.width || '100%';
    
    // Resolve fieldIds to actual field data
    const resolvedFields = (section.fieldIds || []).map((fieldId: string) => {
      const field = resolveFieldByIdLocal(fieldId, data);
      const displayOptions = field?.display || {};
      
      return {
        id: fieldId,
        name: field.name,
        label: field.label || field.name,
        value: field.value,
        type: displayOptions?.type || 'text',
        icon: displayOptions?.icon,
        source: displayOptions?.source,
        compute: displayOptions?.compute,
        displayType: displayOptions?.displayType,
        maxDisplay: displayOptions?.maxDisplay,
        showMore: displayOptions?.showMore,
        truncate: displayOptions?.truncate,
        format: displayOptions?.format
      };
    });
    
    const fields = resolvedFields.map((field: any) => {
      let value = field.value;
      
      if (field.source) {
        value = getFieldValue(field.source, data);
      } else if (field.compute) {
        value = field.compute(data);
      }

      return (
        <div key={field.id} className="flex items-center space-x-2 text-sm text-gray-600">
          {field.icon && getIcon(field.icon)}
          <span className="truncate">{renderFieldValue(field, value)}</span>
        </div>
      );
    });

    if (section.layout === 'grid' && section.columns) {
      return (
        <div className="space-y-2 w-full">
          <p className="text-sm font-medium text-gray-700">{section.title}</p>
          <div className={`grid grid-cols-${section.columns} gap-2 text-xs`}>
            {resolvedFields.map((field: any) => {
              let value = field.value;
              
              if (field.source) {
                value = getFieldValue(field.source, data);
              } else if (field.compute) {
                value = field.compute(data);
              }

              return (
                <div key={field.id} className="flex items-center justify-between">
                  <span className="text-gray-600">{field.label}</span>
                  <span className="font-medium">
                    {renderFieldValue(field, value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2 w-full max-w-full">
        <p className="text-sm font-medium text-gray-700">{section.title}</p>
        <div className="space-y-2 w-full">
          {fields}
        </div>
      </div>
    );
  };

  // Get avatar content using role-based resolution
  const getAvatarContent = () => {
    if (!metadata.avatar || !formSchema) return null;

    // Find field with role='avatar' or 'title' for fallback
    let avatarField: any;
    let fallbackField: any;
    
    for (const section of formSchema.sections) {
      for (const field of section.fields || []) {
        if (field.role === 'avatar' && data[field.name]) {
          avatarField = data[field.name];
        }
        if (field.role === 'title' && data[field.name]) {
          fallbackField = data[field.name];
        }
      }
    }

    const initials = getInitials(avatarField || fallbackField || 'A');
    
    return (
      <Avatar className="h-12 w-12">
        {metadata.avatar.imagePath && avatarField ? (
          <img
            src={`${metadata.avatar.imagePath}/${avatarField.toLowerCase().replace(/\s+/g, '-')}.jpg`}
            alt={avatarField || 'Avatar'}
            className="h-12 w-12 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <AvatarFallback className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

  const cardConfig = {
    id: metadata.id,
    name: metadata.name,
    title: formSchema ? getValueByRole(formSchema, data, 'title') : data.name || 'Unknown',
    subtitle: formSchema ? getValueByRole(formSchema, data, 'subtitle') : '',
    description: formSchema ? getValueByRole(formSchema, data, 'description') : '',
    styling: metadata.styling || { variant: 'default', size: 'md' },
    behavior: metadata.behavior || { clickable: true, hoverable: true },
    layout: { direction: 'vertical' as const }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  const handleHover = (isHovering: boolean) => {
    if (onHover) {
      onHover(isHovering);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: metadata.animations?.duration || 0.3, delay: index * (metadata.animations?.delay || 0.1) }}
    >
      <Card
        config={cardConfig}
        onClick={handleClick}
        onHover={handleHover}
        className={cn("h-full", className)}
      >
        <div className="w-full">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getAvatarContent()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {cardConfig.title}
              </h3>
              {cardConfig.subtitle && (
                <p className="text-sm text-gray-500">
                  {cardConfig.subtitle}
                </p>
              )}
              {metadata.rating && (
                <div className="flex items-center space-x-1 mt-1">
                  {renderRatingStars(Number(getValueByRole(formSchema || {} as any, data, 'rating') || '0') || 0, metadata.rating?.maxRating || 5)}
                  {metadata.rating?.showValue && (
                    <span className="text-sm text-gray-500 ml-1">
                      {(Number(getValueByRole(formSchema || {} as any, data, 'rating') || '0') || 0).toFixed(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {metadata.status && (() => {
            const statusValue = getValueByRole(formSchema || {} as any, data, 'status') || 'PENDING';
            const badgeConfig = getBadgeConfig(statusValue, statusOptions);
            return (
              <Badge variant={badgeConfig.color} className="flex items-center gap-1">
                {badgeConfig.icon && <IconRenderer iconName={badgeConfig.icon} className="h-3 w-3" />}
                {badgeConfig.label}
              </Badge>
            );
          })()}
        </div>

        {/* Content Sections */}
        <div className="space-y-4 w-full">
          {metadata.sections.map((section) => (
            <div key={section.id} className="w-full">
              {renderSection(section)}
            </div>
          ))}
        </div>
        </div>
      </Card>
    </motion.div>
  );
};

DynamicCard.displayName = 'DynamicCard';
