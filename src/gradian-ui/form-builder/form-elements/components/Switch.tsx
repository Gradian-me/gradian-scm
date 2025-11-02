// Switch Component

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { SwitchProps, FormElementRef } from '../types';
import { cn, validateField } from '../../../shared/utils';
import { Switch as RadixSwitch } from '../../../../components/ui/switch';
import { Label } from '../../../../components/ui/label';

export const Switch = forwardRef<FormElementRef, SwitchProps>(
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
      className,
      ...props
    },
    ref
  ) => {
    const switchRef = useRef<React.ElementRef<typeof RadixSwitch>>(null);

    useImperativeHandle(ref, () => ({
      focus: () => switchRef.current?.focus(),
      blur: () => switchRef.current?.blur(),
      validate: () => {
        if (!config.validation) return true;
        const result = validateField(value, config.validation);
        return result.isValid;
      },
      reset: () => onChange?.(false),
      getValue: () => value,
      setValue: (newValue) => onChange?.(newValue),
    }));

    const handleCheckedChange = (checked: boolean) => {
      onChange?.(checked);
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleFocus = () => {
      onFocus?.();
    };

    const isChecked = checked !== undefined ? checked : value;

    return (
      <div className="w-full">
        <div className="flex items-center gap-3">
          <RadixSwitch
            ref={switchRef}
            id={config.name}
            name={config.name}
            checked={isChecked}
            onCheckedChange={handleCheckedChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            required={required || config.validation?.required}
            disabled={disabled}
            className={cn(
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            {...props}
          />
          {config.label && (
            <Label
              htmlFor={config.name}
              className={cn(
                'text-sm font-medium cursor-pointer',
                error ? 'text-red-700' : 'text-gray-700',
                required && 'after:content-["*"] after:ml-1 after:text-red-500',
                disabled && 'text-gray-400 cursor-not-allowed'
              )}
            >
              {config.label}
            </Label>
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

Switch.displayName = 'Switch';

