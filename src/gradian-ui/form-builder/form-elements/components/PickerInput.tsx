'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PopupPicker } from './PopupPicker';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { apiRequest } from '@/shared/utils/api';
import { getValueByRole, getSingleValueByRole } from '../utils/field-resolver';
import { NormalizedOption, normalizeOptionArray } from '../utils/option-normalizer';
import { Search, X } from 'lucide-react';
import { cn } from '@/gradian-ui/shared/utils';

export interface PickerInputProps {
  config: any;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const PickerInput: React.FC<PickerInputProps> = ({
  config,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  touched,
  disabled = false,
  required = false,
  className,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [targetSchema, setTargetSchema] = useState<FormSchema | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  // Get targetSchema from config
  const targetSchemaId = (config as any).targetSchema;

  // Fetch target schema when component mounts or targetSchemaId changes
  useEffect(() => {
    if (targetSchemaId && !targetSchema) {
      setIsLoadingSchema(true);
      const fetchSchema = async () => {
        try {
          const response = await apiRequest<FormSchema>(`/api/schemas/${targetSchemaId}`);
          if (response.success && response.data) {
            setTargetSchema(response.data);
          }
        } catch (err) {
          console.error('Error fetching target schema:', err);
        } finally {
          setIsLoadingSchema(false);
        }
      };
      fetchSchema();
    }
  }, [targetSchemaId, targetSchema]);

  // Fetch selected item when value changes
  useEffect(() => {
    const fetchSelectedItem = async (primaryValue: any) => {
      try {
        if (!primaryValue || !targetSchemaId || !targetSchema) {
          setSelectedItem(null);
          return;
        }

        // If primaryValue already contains label information
        if (typeof primaryValue === 'object' && primaryValue.id) {
          const response = await apiRequest<any>(`/api/data/${targetSchemaId}/${primaryValue.id}`);
          if (response.success && response.data) {
            setSelectedItem(response.data);
          } else if (primaryValue.label) {
            setSelectedItem({ id: primaryValue.id, name: primaryValue.label, title: primaryValue.label });
          } else {
            setSelectedItem(primaryValue);
          }
          return;
        }

        if (typeof primaryValue === 'string') {
          const response = await apiRequest<any>(`/api/data/${targetSchemaId}/${primaryValue}`);
          if (response.success && response.data) {
            setSelectedItem(response.data);
          } else {
            setSelectedItem({ id: primaryValue });
          }
          return;
        }

        setSelectedItem(null);
      } catch (err) {
        console.error('Error fetching selected item:', err);
      }
    };

    if (value === null || value === undefined || value === '') {
      setSelectedItem(null);
      return;
    }

    const normalizedValues = Array.isArray(value) ? value : [value];
    const primaryValue = normalizedValues.length > 0 ? normalizedValues[0] : null;
    fetchSelectedItem(primaryValue);
  }, [value, targetSchemaId, targetSchema]);

  const handleSelect = (selectedOptions: NormalizedOption[], rawItems: any[]) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      return;
    }

    onChange?.(selectedOptions);

    const primaryRawItem = rawItems?.[0];
    if (primaryRawItem) {
      setSelectedItem(primaryRawItem);
    } else {
      const primaryOption = selectedOptions[0];
      setSelectedItem({
        id: primaryOption.id,
        name: primaryOption.label,
        title: primaryOption.label,
      });
    }

    setIsPickerOpen(false);
  };

  const handleClear = () => {
    onChange?.([]);
    setSelectedItem(null);
  };

  const getDisplayValue = () => {
    if (!selectedItem || !targetSchema) {
      return '';
    }

    // Try to get title field from schema
    const title = getValueByRole(targetSchema, selectedItem, 'title') || selectedItem.name || selectedItem.title || '';
    const subtitle = getSingleValueByRole(targetSchema, selectedItem, 'subtitle') || selectedItem.email || '';
    
    return subtitle ? `${title} (${subtitle})` : title;
  };

  const fieldName = (config as any).name || 'unknown';
  const fieldLabel = (config as any).label;
  const fieldPlaceholder = (config as any).placeholder || 'Click to select...';

  return (
    <div className={cn('w-full space-y-2', className)}>
      {fieldLabel && (
        <label
          htmlFor={fieldName}
          className={cn(
            'block text-sm font-medium',
            error ? 'text-red-700' : 'text-gray-700',
            required && 'after:content-["*"] after:ml-1 after:text-red-500'
          )}
        >
          {fieldLabel}
        </label>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={fieldName}
            name={fieldName}
            type="text"
            value={getDisplayValue()}
            placeholder={fieldPlaceholder}
            readOnly
            onClick={() => !disabled && setIsPickerOpen(true)}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            className={cn(
              'cursor-pointer',
              error
                ? 'border-red-500 focus-visible:ring-red-300 focus-visible:border-red-500'
                : ''
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => !disabled && setIsPickerOpen(true)}
            disabled={disabled}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {selectedItem && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-10 w-10 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {targetSchemaId && (
        <PopupPicker
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          schemaId={targetSchemaId}
          schema={targetSchema || undefined}
          onSelect={handleSelect}
          title={`Select ${targetSchema?.plural_name || targetSchema?.singular_name || targetSchemaId}`}
          description={`Choose a ${targetSchema?.singular_name || 'item'}`}
          canViewList={true}
          viewListUrl={`/page/${targetSchemaId}`}
        />
      )}
    </div>
  );
};

PickerInput.displayName = 'PickerInput';
