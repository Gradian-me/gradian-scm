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
  const { 
    title, 
    description, 
    fields, 
    columns = 2, // Default to 2 columns if not specified
    gap = 4, // Default gap
    styling, 
    isRepeatingSection 
  } = section;
  
  const [isExpanded, setIsExpanded] = useState(initialState === 'expanded');
  
  // Get section-level error
  const sectionError = errors?.[section.id];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const sectionClasses = cn(
    'space-y-3',
    styling?.className
  );

  const gridClasses = cn(
    'grid gap-3',
    columns === 1 && 'grid-cols-1',
    columns === 2 && 'grid-cols-1 md:grid-cols-2',
    columns === 3 && 'grid-cols-1 md:grid-cols-3',
    columns === 4 && 'grid-cols-1 md:grid-cols-4',
    columns === 6 && 'grid-cols-1 md:grid-cols-6',
    columns === 12 && 'grid-cols-1 md:grid-cols-12',
    gap !== undefined && gap !== null && gap !== 0 && `gap-${gap}`
  );

  // Helper function to determine column span based on width
  const getColSpan = (field: any): number => {
    // First check for explicit colSpan
    if (field.ui?.colSpan || field.layout?.colSpan) {
      return field.ui?.colSpan || field.layout?.colSpan;
    }

    // Then check for width percentages and convert to colSpan
    const width = field.ui?.width || field.layout?.width;
    
    if (width === '100%') {
      return columns; // Full width spans all columns
    } else if (width === '50%') {
      return Math.ceil(columns / 2); // Half width
    } else if (width === '33.33%' || width === '33.3%') {
      return Math.ceil(columns / 3); // One third width
    } else if (width === '25%') {
      return Math.ceil(columns / 4); // One fourth width
    } else if (width === '66.66%' || width === '66.6%') {
      return Math.ceil((columns / 3) * 2); // Two thirds width
    } else if (width === '75%') {
      return Math.ceil((columns / 4) * 3); // Three fourths width
    }
    
    // Default to 1 column if no width specified
    return 1;
  };

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
      let fieldTouched: boolean;
      if (itemIndex !== undefined) {
        const touchedValue = touched[field.name];
        if (Array.isArray(touchedValue)) {
          fieldTouched = touchedValue[itemIndex] || false;
        } else {
          fieldTouched = Boolean(touched[`${field.name}[${itemIndex}]`]);
        }
      } else {
        const touchedValue = touched[field.name];
        fieldTouched = typeof touchedValue === 'boolean' ? touchedValue : false;
      }

      // Calculate column span for this field
      const colSpan = getColSpan(field);
      
      // Generate the appropriate column span class
      let colSpanClass = '';
      if (colSpan === columns) {
        colSpanClass = 'col-span-full';
      } else {
        // For responsive layouts
        if (columns === 3) {
          if (colSpan === 1) {
            colSpanClass = 'col-span-1';
          } else if (colSpan === 2) {
            colSpanClass = 'col-span-2';
          }
        } else if (columns === 2) {
          if (colSpan === 1) {
            colSpanClass = 'col-span-1';
          } else if (colSpan === 2) {
            colSpanClass = 'col-span-2';
          }
        } else if (columns === 4) {
          if (colSpan === 1) {
            colSpanClass = 'col-span-1';
          } else if (colSpan === 2) {
            colSpanClass = 'col-span-2';
          } else if (colSpan === 3) {
            colSpanClass = 'col-span-3';
          }
        } else if (columns === 6) {
          colSpanClass = `col-span-${colSpan}`;
        } else if (columns === 12) {
          colSpanClass = `col-span-${colSpan}`;
        } else {
          // Default for other column counts
          colSpanClass = `col-span-${colSpan}`;
        }
      }

      return (
        <div
          key={field.id}
          className={cn(
            'space-y-2',
            colSpanClass,
            (field.ui?.rowSpan || field.layout?.rowSpan) && `row-span-${field.ui?.rowSpan || field.layout?.rowSpan}`
          )}
          style={{ order: field.ui?.order || field.layout?.order }}
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
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-medium text-gray-900">{title}</CardTitle>
                  {sectionError && (
                    <span className="text-sm text-red-600 mt-0.5" role="alert">
                      • {sectionError}
                    </span>
                  )}
                </div>
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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium text-gray-900">{title}</CardTitle>
              {sectionError && (
                <span className="text-sm text-red-600 mt-0.5" role="alert">
                  • {sectionError}
                </span>
              )}
            </div>
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