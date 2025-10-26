// Accordion Form Section Component

import React, { useState } from 'react';
import { FormSectionProps } from '../types/form-schema';
import { FormElementFactory } from './FormElementFactory';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../shared/utils';

export const AccordionFormSection: React.FC<FormSectionProps> = ({
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
  initialState = 'expanded', // New prop for initial state
}) => {
  const { title, description, fields, layout, styling, isRepeatingSection } = section;
  const [isExpanded, setIsExpanded] = useState(initialState === 'expanded');

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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
      if (!field) return null;
      
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
            field={field as any}
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

  if (isRepeatingSection) {
    return (
      <div className={sectionClasses}>
        <Card className="border border-gray-200 rounded-2xl bg-gray-50/50">
          <CardHeader 
            className="pb-4 px-6 pt-6 cursor-pointer hover:bg-gray-100/50 transition-colors"
            onClick={toggleExpanded}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium text-gray-900">{title}</CardTitle>
                {description && (
                  <p className="text-xs text-gray-600 mt-1">{description}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6 hover:bg-gray-200"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          
          {isExpanded && (
            <CardContent className="px-6 pb-6">
              <div className="space-y-3">
                {(repeatingItems || []).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <p>{section.repeatingConfig?.emptyMessage || 'No items added yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(repeatingItems || []).map((item, index) => (
                      <Card key={index} className="border border-gray-200 rounded-2xl shadow-sm bg-white">
                        <CardHeader className="pb-4 px-6 pt-6">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-900">
                              {section.repeatingConfig?.itemTitle 
                                ? section.repeatingConfig.itemTitle(index + 1)
                                : `${title} ${index + 1}`
                              }
                            </CardTitle>
                            {onRemoveRepeatingItem && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveRepeatingItem(index)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 p-2"
                                disabled={disabled}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
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
                    <Button
                      variant="outline"
                      onClick={onAddRepeatingItem}
                      disabled={disabled}
                      className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {section.repeatingConfig?.addButtonText || `Add ${title}`}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <Card className={cn(
      'border border-gray-200 rounded-2xl bg-gray-50/50',
      styling?.variant === 'minimal' && 'border-0 shadow-none bg-transparent',
      styling?.variant === 'card' && 'shadow-sm bg-white'
    )}>
      <CardHeader 
        className="pb-4 px-6 pt-6 cursor-pointer hover:bg-gray-100/50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium text-gray-900">{title}</CardTitle>
            {description && (
              <p className="text-xs text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 hover:bg-gray-200"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="px-6 pb-6">
          <div className={sectionClasses}>
            <div className={gridClasses}>
              {renderFields(fields)}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

AccordionFormSection.displayName = 'AccordionFormSection';
