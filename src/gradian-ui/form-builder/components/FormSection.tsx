// Form Section Component

import React from 'react';
import { FormSectionProps } from '../types/form-schema';
import { FormElementFactory } from './FormElementFactory';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../shared/utils';

export const FormSection: React.FC<FormSectionProps> = ({
  section,
  values,
  errors,
  touched,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  repeatingItems,
  onAddRepeatingItem,
  onRemoveRepeatingItem,
}) => {
  const { title, description, fields, layout, styling, isRepeatingSection } = section;

  const sectionClasses = cn(
    'space-y-3',
    styling?.className
  );

  const gridClasses = cn(
    'grid gap-3',
    layout?.columns === 1 && 'grid-cols-1',
    layout?.columns === 2 && 'grid-cols-1 md:grid-cols-2',
    layout?.columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    layout?.columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    layout?.gap && `gap-${layout.gap}`,
    layout?.direction === 'column' && 'flex flex-col'
  );

  const renderFields = (fieldsToRender: typeof fields, itemIndex?: number) => {
    return fieldsToRender.map((field) => {
      const fieldName = itemIndex !== undefined ? `${field.name}[${itemIndex}]` : field.name;
      const fieldValue = itemIndex !== undefined 
        ? values[field.name]?.[itemIndex] 
        : values[field.name];
      const fieldError = itemIndex !== undefined 
        ? errors[`${field.name}[${itemIndex}]`] || errors[field.name]?.[itemIndex]
        : errors[field.name];
      const fieldTouched = itemIndex !== undefined 
        ? touched[`${field.name}[${itemIndex}]`] || touched[field.name]?.[itemIndex]
        : touched[field.name];

      return (
        <div
          key={field.id}
          className={cn(
            'space-y-2',
            field.layout?.width === '50%' && 'md:col-span-1',
            field.layout?.width === '33.33%' && 'md:col-span-1',
            field.layout?.width === '100%' && 'col-span-full',
            field.layout?.colSpan && `col-span-${field.layout.colSpan}`,
            field.layout?.rowSpan && `row-span-${field.layout.rowSpan}`
          )}
          style={{ order: field.layout?.order }}
        >
          <FormElementFactory
            field={field}
            value={fieldValue}
            error={fieldError}
            touched={fieldTouched}
            onChange={(value) => onChange(fieldName, value)}
            onBlur={() => onBlur(fieldName)}
            onFocus={() => onFocus(fieldName)}
            disabled={disabled || field.disabled}
          />
        </div>
      );
    });
  };

  if (isRepeatingSection && repeatingItems) {
    return (
      <div className={sectionClasses}>
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-xs text-gray-600 mt-1">{description}</p>
            )}
          </div>

          {repeatingItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{section.repeatingConfig?.emptyMessage || 'No items added yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {repeatingItems.map((item, index) => (
                <Card key={index} className="border border-gray-200 rounded-lg">
                  <CardHeader className="pb-4 px-6 pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-900">
                        {section.repeatingConfig?.itemTitle 
                          ? section.repeatingConfig.itemTitle(index + 1)
                          : `${title} ${index + 1}`
                        }
                      </CardTitle>
                      {onRemoveRepeatingItem && (
                        <button
                          type="button"
                          onClick={() => onRemoveRepeatingItem(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                          disabled={disabled}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className={gridClasses}>
                      {renderFields(fields, index)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {onAddRepeatingItem && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onAddRepeatingItem}
                disabled={disabled}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {section.repeatingConfig?.addButtonText || `Add ${title}`}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      'border border-gray-200 rounded-lg',
      styling?.variant === 'minimal' && 'border-0 shadow-none',
      styling?.variant === 'card' && 'shadow-sm'
    )}>
      <CardHeader className="pb-4 px-6 pt-6">
        <CardTitle className="text-base font-medium text-gray-900">{title}</CardTitle>
        {description && (
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className={sectionClasses}>
          <div className={gridClasses}>
            {renderFields(fields)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

FormSection.displayName = 'FormSection';
