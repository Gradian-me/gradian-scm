// Icon Input Component
// Icon input with icon preview and validation

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TextInputProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';
import { IconRenderer, isValidLucideIcon } from '@/shared/utils/icon-renderer';
import { CopyContent } from './CopyContent';

export interface IconInputProps extends TextInputProps {}

export const IconInput = forwardRef<FormElementRef, IconInputProps>(
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
      className,
      touched,
      canCopy = false,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const iconValue = typeof value === 'string' ? value : '';
    const isValid = isValidLucideIcon(iconValue);
    const isEmpty = !iconValue || iconValue.trim() === '';

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
      onChange?.(newValue);
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleFocus = () => {
      onFocus?.();
    };

    const inputClasses = cn(
      'w-full direction-auto px-3 py-2 border rounded-lg border-gray-300 bg-white text-sm ring-offset-background transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-500',
      isEmpty ? 'border-gray-300 text-gray-900' : isValid ? 'border-green-300 text-gray-900' : 'border-red-300 text-red-600',
      error ? 'border-red-500 focus-visible:ring-red-300 focus-visible:border-red-500' : '',
      canCopy && 'pr-10',
      !isEmpty && 'pl-10', // Add left padding when icon is shown
      className
    );

    const fieldName = config?.name || 'unknown';
    const fieldLabel = config?.label;
    const fieldPlaceholder = placeholder || config?.placeholder || 'Type icon name (e.g., User, Home, Search)';

    if (!config) {
      console.error('IconInput: config is required');
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
          {/* Icon preview on the left */}
          {!isEmpty && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {isValid ? (
                <IconRenderer iconName={iconValue} className="h-4 w-4 text-gray-600" />
              ) : (
                <span className="text-red-500 text-xs">Invalid</span>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            id={fieldName}
            name={fieldName}
            type="text"
            value={iconValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={fieldPlaceholder}
            required={required || config.validation?.required}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />
          {/* Status indicator on the right */}
          {!isEmpty && !canCopy && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className={cn(
                'text-xs',
                isValid ? 'text-green-600' : 'text-red-600'
              )}>
                {isValid ? '✓' : '✗'}
              </span>
            </div>
          )}
          {/* Copy button */}
          {canCopy && !isEmpty && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <CopyContent content={iconValue} disabled={disabled} />
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

IconInput.displayName = 'IconInput';

