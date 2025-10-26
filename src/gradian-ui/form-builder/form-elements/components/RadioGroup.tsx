// Radio Group Component

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { RadioProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';

export const RadioGroup = forwardRef<FormElementRef, RadioProps>(
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
      direction = 'vertical',
      className,
      ...props
    },
    ref
  ) => {
    const groupRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const firstRadio = groupRef.current?.querySelector('input[type="radio"]') as HTMLInputElement;
        firstRadio?.focus();
      },
      blur: () => {
        const activeElement = document.activeElement as HTMLInputElement;
        if (activeElement?.type === 'radio') {
          activeElement.blur();
        }
      },
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

    const groupClasses = cn(
      'space-y-2',
      direction === 'horizontal' && 'flex flex-wrap gap-4 space-y-0',
      className
    );

    return (
      <div className="w-full">
        {config.label && (
          <fieldset>
            <legend
              className={cn(
                'text-sm font-medium mb-2',
                error ? 'text-red-700' : 'text-gray-700',
                required && 'after:content-["*"] after:ml-1 after:text-red-500'
              )}
            >
              {config.label}
            </legend>
            <div ref={groupRef} className={groupClasses} {...props}>
              {options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`${config.name}-${index}`}
                    name={config.name}
                    type="radio"
                    value={option.value}
                    checked={value === option.value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    required={required || config.validation?.required}
                    disabled={disabled || option.disabled}
                    className={cn(
                      'h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500',
                      'disabled:bg-gray-100 disabled:cursor-not-allowed',
                      error && 'border-red-500 focus:ring-red-500'
                    )}
                  />
                  <label
                    htmlFor={`${config.name}-${index}`}
                    className={cn(
                      'ml-2 text-sm font-medium',
                      error ? 'text-red-700' : 'text-gray-700',
                      (disabled || option.disabled) && 'text-gray-400'
                    )}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
