// CheckboxList Component - Multiple checkbox selection

import React, { forwardRef, useImperativeHandle } from 'react';
import { FormElementProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface CheckboxListProps extends FormElementProps {
  options?: Array<{ label: string; value: string; disabled?: boolean; icon?: string; color?: string }>;
}

export const CheckboxList = forwardRef<FormElementRef, CheckboxListProps>(
  (
    {
      config,
      value = [],
      onChange,
      onBlur,
      onFocus,
      error,
      disabled = false,
      required = false,
      options = [],
      className,
      touched,
      ...props
    },
    ref
  ) => {
    // Ensure value is an array
    const currentValue = Array.isArray(value) ? value : [];

    // Get options from config if not provided directly
    const checkboxOptions = options.length > 0 ? options : (config.options || []);

    useImperativeHandle(ref, () => ({
      focus: () => {
        // Focus first checkbox
        const firstCheckbox = document.querySelector(`input[name="${config.name}"]`) as HTMLInputElement;
        firstCheckbox?.focus();
      },
      blur: () => {
        onBlur?.();
      },
      validate: () => {
        if (!config.validation) return true;
        const result = validateField(value, config.validation);
        return result.isValid;
      },
      reset: () => onChange?.([]),
      getValue: () => value,
      setValue: (newValue) => onChange?.(newValue),
    }));

    const handleCheckedChange = (optionValue: string, checked: boolean) => {
      const newValue = checked
        ? [...currentValue, optionValue]
        : currentValue.filter((v: string) => v !== optionValue);
      onChange?.(newValue);
    };

    const fieldName = config.name || 'checkbox-list';
    const fieldLabel = config.label;

    return (
      <div className={cn('w-full space-y-2', className)}>
        {fieldLabel && (
          <label
            className={cn(
              'block text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-700',
              required && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}
          >
            {fieldLabel}
          </label>
        )}
        <div className={cn(
          "grid gap-2",
          "grid-cols-1 md:grid-cols-2"
        )}>
          {checkboxOptions.map((option) => {
            const isChecked = currentValue.includes(option.value);
            const optionId = `${fieldName}-${option.value}`;

            return (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={optionId}
                  name={fieldName}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckedChange(option.value, checked as boolean)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  disabled={disabled || option.disabled}
                  className={cn(
                    error && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                <Label
                  htmlFor={optionId}
                  className={cn(
                    'text-sm font-normal cursor-pointer',
                    error ? 'text-red-700' : 'text-gray-700',
                    (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {config.description && (
          <p className="text-xs text-gray-500">{config.description}</p>
        )}
      </div>
    );
  }
);

CheckboxList.displayName = 'CheckboxList';
