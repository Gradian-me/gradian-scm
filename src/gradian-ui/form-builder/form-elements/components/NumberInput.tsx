// Number Input Component
// Number input with type="number" embedded

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { NumberInputProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';
import { CopyContent } from './CopyContent';

export const NumberInput = forwardRef<FormElementRef, NumberInputProps>(
  (
    {
      config,
      value = '',
      onChange,
      onBlur,
      onFocus,
      error,
      disabled = false,
      required = false,
      placeholder,
      min,
      max,
      step,
      className,
      touched,
      canCopy = false,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      validate: () => {
        if (!config?.validation) return true;
        const result = validateField(value, config.validation);
        return result.isValid;
      },
      reset: () => onChange?.(''),
      getValue: () => value,
      setValue: (newValue) => onChange?.(newValue),
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // Convert to number if not empty, otherwise keep empty string
      const numValue = newValue === '' ? '' : Number(newValue);
      onChange?.(numValue);
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleFocus = () => {
      onFocus?.();
    };

    const inputClasses = cn(
      'w-full direction-auto px-3 py-2 border rounded-lg border-gray-300 bg-white text-sm text-gray-900 ring-offset-background placeholder:text-gray-400 transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-500',
      error
        ? 'border-red-500 focus-visible:ring-red-300 focus-visible:border-red-500'
        : '',
      canCopy && 'pr-10',
      className
    );

    const fieldName = config?.name || 'unknown';
    const fieldLabel = config?.label;
    const fieldPlaceholder = placeholder || config?.placeholder || 'Enter number';

    if (!config) {
      console.error('NumberInput: config is required');
      return null;
    }

    return (
      <div className="w-full">
        {fieldLabel && (
          <label
            htmlFor={fieldName}
            className={cn(
              'block text-sm font-medium mb-1',
              error ? 'text-red-700' : 'text-gray-700',
              required && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}
          >
            {fieldLabel}
          </label>
        )}
        <div className="relative">
        <input
          ref={inputRef}
          id={fieldName}
          name={fieldName}
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={fieldPlaceholder}
          min={min ?? config.validation?.min}
          max={max ?? config.validation?.max}
          step={step || (config as any).step || '1'}
          required={required ?? config.required ?? config.validation?.required ?? false}
          disabled={disabled}
          autoComplete="off"
          className={inputClasses}
          {...props}
        />
          {canCopy && value !== '' && value !== null && value !== undefined && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <CopyContent content={value} disabled={disabled} />
            </div>
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

NumberInput.displayName = 'NumberInput';
