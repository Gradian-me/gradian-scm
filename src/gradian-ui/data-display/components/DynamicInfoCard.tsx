// Dynamic Info Card Component
// Renders key-value information cards for detail pages

import { motion } from 'framer-motion';
import React from 'react';
import { IconRenderer } from '../../../shared/utils/icon-renderer';
import { resolveFieldById } from '../../form-builder/form-elements/utils/field-resolver';
import { CardContent, CardHeader, CardTitle, CardWrapper } from '../card/components/CardWrapper';
import { DetailPageSection, FormSchema } from '../../../shared/types/form-schema';
import { cn } from '../../shared/utils';
import { formatNumber, formatCurrency, formatDate } from '../../shared/utils';
import { DynamicBadgeRenderer } from './DynamicBadgeRenderer';

export interface DynamicInfoCardProps {
  section: DetailPageSection;
  schema: FormSchema;
  data: any;
  index?: number;
  disableAnimation?: boolean;
  className?: string;
}

/**
 * Format field value based on field type and UI configuration
 */
const formatFieldValue = (field: any, value: any): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">N/A</span>;
  }

  // Use UI config if available
  const uiConfig = field?.ui || {};
  const displayType = uiConfig.type || field?.type || 'text';
  const format = uiConfig.format;

  switch (displayType) {
    case 'currency':
      return <span>{formatCurrency(typeof value === 'number' ? value : parseFloat(value) || 0)}</span>;
    case 'percentage':
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return <span>{numValue.toFixed(uiConfig.precision || 0)}%</span>;
    case 'number':
      return <span>{formatNumber(typeof value === 'number' ? value : parseFloat(value) || 0)}</span>;
    case 'date':
    case 'datetime-local':
      try {
        const dateValue = typeof value === 'string' ? new Date(value) : value;
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
          return <span>{formatDate(dateValue, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>;
        }
        return <span>{String(value)}</span>;
      } catch {
        return <span>{String(value)}</span>;
      }
    case 'array':
      if (Array.isArray(value)) {
        if (uiConfig.displayType === 'badges') {
          const maxDisplay = uiConfig.maxDisplay || 5;
          return (
            <DynamicBadgeRenderer
              items={value}
              maxBadges={maxDisplay}
              badgeVariant="outline"
              animate={true}
            />
          );
        }
        return <span>{value.join(', ')}</span>;
      }
      return <span>{String(value)}</span>;
    default:
      return <span>{String(value)}</span>;
  }
};

/**
 * Get field value from data, handling nested paths
 */
const getFieldValue = (field: any, data: any): any => {
  if (!field || !data) return null;

  // Handle source path if specified
  if (field.ui?.source) {
    const path = field.ui.source.split('.');
    let value = data;
    for (const key of path) {
      value = value?.[key];
      if (value === undefined) return null;
    }
    return value;
  }

  // Handle compute function if specified
  if (field.ui?.compute && typeof field.ui.compute === 'function') {
    return field.ui.compute(data);
  }

  // Default: use field name
  return data[field.name];
};

export const DynamicInfoCard: React.FC<DynamicInfoCardProps> = ({
  section,
  schema,
  data,
  index = 0,
  disableAnimation = false,
  className
}) => {
  const colSpan = section.colSpan || 1;
  const gridColumns = section.layout?.columns || 2;
  const gap = section.layout?.gap || 4;

  // Define cardClasses early so it can be used in early returns
  const cardClasses = cn(
    colSpan === 2 && "lg:col-span-2",
    className
  );

  // Resolve fields by IDs
  let fields = (section.fieldIds || []).map(fieldId => {
    const field = resolveFieldById(schema, fieldId);
    if (!field) return null;
    
    const value = getFieldValue(field, data);
    return {
      ...field,
      value,
      label: field.label || field.name,
      icon: field.icon || field.ui?.icon
    };
  }).filter(Boolean);

  // Handle special cases for sections without field IDs (like categories)
  if (fields.length === 0 && section.id === 'categories-section') {
    // Special handling for categories
    if (data.categories && Array.isArray(data.categories)) {
      return (
        <motion.div
          initial={disableAnimation ? false : { opacity: 0, y: 20 }}
          animate={disableAnimation ? false : { opacity: 1, y: 0 }}
          transition={disableAnimation ? {} : {
            duration: 0.3,
            delay: index * 0.1
          }}
          className={cardClasses}
        >
          <CardWrapper
            config={{
              id: section.id,
              name: section.title,
              styling: {
                variant: section.styling?.variant || 'default',
                size: 'md'
              }
            }}
            className={section.styling?.className}
          >
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.description && (
                <p className="text-sm text-gray-500 mt-1">{section.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <DynamicBadgeRenderer
                items={data.categories}
                maxBadges={0}
                badgeVariant="outline"
                animate={!disableAnimation}
              />
            </CardContent>
          </CardWrapper>
        </motion.div>
      );
    }
    return null;
  }

  if (fields.length === 0) {
    return null;
  }

  const gridClasses = cn(
    "grid gap-4",
    gridColumns === 1 && "grid-cols-1",
    gridColumns === 2 && "grid-cols-1 md:grid-cols-2",
    gridColumns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    gap === 2 && "gap-2",
    gap === 3 && "gap-3",
    gap === 4 && "gap-4",
    gap === 6 && "gap-6"
  );

  return (
    <motion.div
      initial={disableAnimation ? false : { opacity: 0, y: 20 }}
      animate={disableAnimation ? false : { opacity: 1, y: 0 }}
      transition={disableAnimation ? {} : {
        duration: 0.3,
        delay: index * 0.1
      }}
      className={cardClasses}
    >
      <CardWrapper
        config={{
          id: section.id,
          name: section.title,
          styling: {
            variant: section.styling?.variant || 'default',
            size: 'md'
          }
        }}
        className={cn(section.styling?.className, "h-auto")}
      >
        <CardHeader>
          <CardTitle>{section.title}</CardTitle>
          {section.description && (
            <p className="text-sm text-gray-500 mt-1">{section.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className={gridClasses}>
            {fields.map((field: any) => (
              <div key={field.id} className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  {field.icon && (
                    <IconRenderer iconName={field.icon} className="h-4 w-4" />
                  )}
                  {field.label}
                </label>
                <div className="text-sm text-gray-900">
                  {formatFieldValue(field, field.value)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </CardWrapper>
    </motion.div>
  );
};

DynamicInfoCard.displayName = 'DynamicInfoCard';

