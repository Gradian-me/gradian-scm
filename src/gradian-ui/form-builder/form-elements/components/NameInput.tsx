import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn, validateField } from '../../../shared/utils';
import { FormElementRef, NameInputProps } from '../types';

const allowedPattern = /^[a-z0-9_]+$/;

export const NameInput = forwardRef<FormElementRef, NameInputProps>(
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
      forbiddenSymbolsMessage = 'Only lowercase letters, numbers, and underscores (_) are allowed.',
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const fieldName = config?.name || config?.id || 'name';
    const fieldLabel = config?.label;
    const fieldPlaceholder = placeholder || config?.placeholder;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      validate: () => {
        if (!config?.validation) {
          return required ? allowedPattern.test(String(value)) : true;
        }
        const result = validateField(value, config.validation);
        return result.isValid && (config.validation?.pattern ? true : allowedPattern.test(String(value)));
      },
      reset: () => onChange?.(''),
      getValue: () => value,
      setValue: (newValue) => onChange?.(sanitize(newValue ?? '')),
    }));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const sanitizedValue = sanitize(event.target.value);
      if (sanitizedValue !== event.target.value) {
        event.target.value = sanitizedValue;
      }
      onChange?.(sanitizedValue);
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleFocus = () => {
      onFocus?.();
    };

    const isValidName = useMemo(() => Boolean(value) && allowedPattern.test(String(value)), [value]);

    const inputClasses = cn(
      'w-full direction-auto px-3 py-2 border rounded-lg border-gray-300 bg-white text-sm text-gray-900 ring-offset-background placeholder:text-gray-400 transition-colors pr-10',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-300 focus-visible:ring-offset-1 focus-visible:border-violet-400',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-500',
      error ? 'border-red-500 focus-visible:ring-red-300 focus-visible:border-red-500' : '',
      className
    );

    if (!config) {
      console.error('NameInput: config is required');
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
              (required || config?.validation?.required) && 'after:content-["*"] after:ml-1 after:text-red-500'
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
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={fieldPlaceholder}
            required={required || config?.validation?.required}
            disabled={disabled}
            autoComplete="off"
            className={inputClasses}
            {...props}
          />

          {isValidName && !error && (
            <CheckCircle className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          )}
        </div>

        {error ? (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">{forbiddenSymbolsMessage}</p>
        )}
      </div>
    );
  }
);

NameInput.displayName = 'NameInput';

function sanitize(rawValue: string): string {
  return rawValue
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_]/g, '');
}
