// Checkbox Component

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { CheckboxProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';

export const Checkbox = forwardRef<FormElementRef, CheckboxProps>(
  (
    {
      config,
      value = false,
      onChange,
      onBlur,
      onFocus,
      error,
      disabled = false,
      required = false,
      checked,
      indeterminate = false,
      className,
      ...props
    },
    ref
  ) => {
    const checkboxRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => checkboxRef.current?.focus(),
      blur: () => checkboxRef.current?.blur(),
      validate: () => {
        if (!config.validation) return true;
        const result = validateField(value, config.validation);
        return result.isValid;
      },
      reset: () => onChange?.(false),
      getValue: () => value,
      setValue: (newValue) => onChange?.(newValue),
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;
      onChange?.(newValue);
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleFocus = () => {
      onFocus?.();
    };

    const isChecked = checked !== undefined ? checked : value;

    const checkboxClasses = cn(
      'h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      error && 'border-red-500 focus:ring-red-500',
      className
    );

    return (
      <div className="w-full">
        <div className="flex items-center">
          <input
            ref={checkboxRef}
            id={config.name}
            name={config.name}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            required={required || config.validation?.required}
            disabled={disabled}
            className={checkboxClasses}
            {...props}
          />
          {config.label && (
            <label
              htmlFor={config.name}
              className={cn(
                'ml-2 text-sm font-medium',
                error ? 'text-red-700' : 'text-gray-700',
                required && 'after:content-["*"] after:ml-1 after:text-red-500',
                disabled && 'text-gray-400'
              )}
            >
              {config.label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
