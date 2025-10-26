// Textarea Component

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TextareaProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';

export const Textarea = forwardRef<FormElementRef, TextareaProps>(
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
      rows = 3,
      cols,
      resize = 'vertical',
      maxLength,
      className,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      validate: () => {
        if (!config.validation) return true;
        const result = validateField(value, config.validation);
        return result.isValid;
      },
      reset: () => onChange?.(''),
      getValue: () => value,
      setValue: (newValue) => onChange?.(newValue),
    }));

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue);
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleFocus = () => {
      onFocus?.();
    };

    const textareaClasses = cn(
      'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300',
      resize === 'none' && 'resize-none',
      resize === 'horizontal' && 'resize-x',
      resize === 'vertical' && 'resize-y',
      resize === 'both' && 'resize',
      className
    );

    return (
      <div className="w-full">
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
        <textarea
          ref={textareaRef}
          id={config.name}
          name={config.name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={config.placeholder}
          rows={rows}
          cols={cols}
          maxLength={maxLength || config.validation?.maxLength}
          minLength={config.validation?.minLength}
          required={required || config.validation?.required}
          disabled={disabled}
          className={textareaClasses}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
