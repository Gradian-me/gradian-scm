// File Input Component
// File input with type="file" embedded

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FileInputProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';

export const FileInput = forwardRef<FormElementRef, FileInputProps>(
  (
    {
      config,
      value,
      onChange,
      onBlur,
      onFocus,
      error,
      disabled = false,
      required = false,
      accept,
      multiple,
      maxFileSize,
      onFileSelect,
      className,
      touched,
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
      reset: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        onChange?.('');
      },
      getValue: () => value,
      setValue: (newValue) => onChange?.(newValue),
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        if (onFileSelect) {
          onFileSelect(files);
        }
        if (multiple) {
          onChange?.(Array.from(files));
        } else {
          onChange?.(files[0]);
        }
      }
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleFocus = () => {
      onFocus?.();
    };

    const inputClasses = cn(
      'w-full direction-auto px-3 py-2 border rounded-lg border-gray-300 bg-white text-sm ring-offset-background placeholder:text-gray-500 transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
      'file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0',
      'file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700',
      'hover:file:bg-violet-100',
      error
        ? 'border-red-500 focus-visible:ring-red-300 focus-visible:border-red-500'
        : '',
      className
    );

    const fieldName = config?.name || 'unknown';
    const fieldLabel = config?.label;
    const acceptTypes = accept || (config as any).accept || '*/*';

    if (!config) {
      console.error('FileInput: config is required');
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
            type="file"
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            accept={acceptTypes}
            multiple={multiple || (config as any).multiple}
            required={required || config.validation?.required}
            disabled={disabled}
            className={inputClasses}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {maxFileSize && (
          <p className="mt-1 text-xs text-gray-500">
            Max file size: {(maxFileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
