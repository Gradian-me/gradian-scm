// Search Input Component

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { SearchInputProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';
import { Search } from 'lucide-react';

export const SearchInput = forwardRef<FormElementRef, SearchInputProps>(
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
      maxLength,
      minLength,
      pattern,
      className,
      touched,
      onClear,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      validate: () => {
        if (!config.validation) return true;
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

    const handleClear = () => {
      onChange?.('');
      onClear?.();
      inputRef.current?.focus();
    };

    const inputClasses = cn(
      'w-full direction-auto py-2 border rounded-lg border-gray-300 bg-white text-sm text-gray-900 ring-offset-background placeholder:text-gray-400 transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-500',
      error
        ? 'border-red-500 focus-visible:ring-red-300 focus-visible:border-red-500'
        : '',
      value && onClear ? 'pl-10 pr-10' : 'pl-10',
      className
    );

    const fieldName = (config as any).name || 'search';
    const fieldLabel = (config as any).label;
    const fieldPlaceholder = (config as any).placeholder || placeholder || 'Search...';
    
    if (!config) {
      console.error('SearchInput: config is required');
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          <input
            ref={inputRef}
            id={fieldName}
            name={fieldName}
            type="search"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={fieldPlaceholder}
            maxLength={maxLength || (config as any).validation?.maxLength}
            minLength={minLength || (config as any).validation?.minLength}
            pattern={pattern}
            required={required || (config as any).validation?.required}
            disabled={disabled}
            autoComplete="off"
            className={inputClasses}
            {...props}
          />
          {value && onClear && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {config.validation?.maxLength && (
          <p className="mt-1 text-xs text-gray-500">
            {value.length}/{config.validation.maxLength}
          </p>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

