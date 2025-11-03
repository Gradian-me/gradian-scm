// ColorPicker Component

import React from 'react';
import { Input } from '../../../../components/ui/input';
import { cn } from '../../../shared/utils';

export interface ColorPickerProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  className?: string;
  colorPickerClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#4E79A7',
  onChange,
  id,
  className,
  colorPickerClassName,
  inputClassName,
  disabled = false,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        id={id ? `${id}-color-picker` : undefined}
        type="color"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'h-10 w-20 rounded border border-gray-300 cursor-pointer transition-all',
          'hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200',
          'disabled:cursor-not-allowed disabled:opacity-50',
          colorPickerClassName
        )}
      />
      <Input
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="#4E79A7"
        className={cn('flex-1', inputClassName)}
      />
    </div>
  );
};

ColorPicker.displayName = 'ColorPicker';

