// Select Input Component

import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { SelectInputProps, FormElementRef } from '../types';
import { cn } from '../../../shared/utils';

export const SelectInput = forwardRef<FormElementRef, SelectInputProps>(
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
      options = [],
      multiple = false,
      searchable = false,
      clearable = false,
      className,
      ...props
    },
    ref
  ) => {
    const selectRef = useRef<HTMLSelectElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useImperativeHandle(ref, () => ({
      focus: () => selectRef.current?.focus(),
      blur: () => selectRef.current?.blur(),
      validate: () => {
        if (!config.validation) return true;
        const result = validateField(value, config.validation);
        return result.isValid;
      },
      reset: () => onChange?.(multiple ? [] : ''),
      getValue: () => value,
      setValue: (newValue) => onChange?.(newValue),
    }));

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = multiple
        ? Array.from(e.target.selectedOptions, option => option.value)
        : e.target.value;
      onChange?.(newValue);
    };

    const handleBlur = () => {
      setIsOpen(false);
      onBlur?.();
    };

    const handleFocus = () => {
      onFocus?.();
    };

    const handleClear = () => {
      onChange?.(multiple ? [] : '');
    };

    const filteredOptions = searchable
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const selectClasses = cn(
      'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300',
      className
    );

    return (
      <div className="w-full relative">
        {config.label && (
          <label
            htmlFor={config.name}
            className={cn(
              'block text-sm font-medium mb-1',
              error ? 'text-red-700' : 'text-gray-700',
              required && 'after:content-["*"] after:ml-1 after:text-red-500'
            )}
          >
            {config.label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={selectRef}
            id={config.name}
            name={config.name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            required={required || config.validation?.required}
            disabled={disabled}
            multiple={multiple}
            className={selectClasses}
            {...props}
          >
            {!required && !multiple && (
              <option value="">Select an option...</option>
            )}
            {filteredOptions.map((option, index) => (
              <option
                key={index}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {clearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
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

SelectInput.displayName = 'SelectInput';
