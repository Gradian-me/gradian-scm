// Slider Component
// Modern minimal slider for numeric values

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { SliderProps, FormElementRef } from '../types';
import { cn } from '../../../shared/utils';
import { Slider as UISlider } from '@/components/ui/slider';

export const Slider = forwardRef<FormElementRef, SliderProps>(
  (
    {
      config,
      value = 1,
      onChange,
      onBlur,
      onFocus,
      error,
      disabled = false,
      min = 1,
      max = 4,
      step = 1,
      className,
      ...props
    },
    ref
  ) => {
    useImperativeHandle(ref, () => ({
      focus: () => {},
      blur: () => onBlur?.(),
      validate: () => true,
      reset: () => onChange?.(min),
      getValue: () => value,
      setValue: (newValue) => onChange?.(newValue),
    }));

    const handleValueChange = (newValue: number[]) => {
      onChange?.(newValue[0]);
    };

    const fieldName = config?.name || 'unknown';
    const fieldLabel = config?.label;

    const sliderValue = Array.isArray(value) ? value[0] : (typeof value === 'number' ? value : min);
    const clampedValue = Math.max(min, Math.min(max, sliderValue));

    if (!config) {
      console.error('Slider: config is required');
      return null;
    }

    return (
      <div className="w-full">
        {fieldLabel && (
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor={fieldName}
              className={cn(
                'block text-sm font-medium',
                error ? 'text-red-700' : 'text-gray-700'
              )}
            >
              {fieldLabel}
            </label>
            <span className="text-sm font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-md min-w-[2.5rem] text-center">
              {clampedValue}
            </span>
          </div>
        )}
        <UISlider
          id={fieldName}
          name={fieldName}
          value={[clampedValue]}
          onValueChange={handleValueChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            error && 'slider-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

