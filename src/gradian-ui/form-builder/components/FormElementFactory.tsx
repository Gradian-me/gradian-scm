// Form Element Factory Component

import React from 'react';
import { FormField } from '../types/form-schema';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { cn } from '../../shared/utils';

interface FormElementFactoryProps {
  field: FormField;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
  onFocus: () => void;
  disabled?: boolean;
}

export const FormElementFactory: React.FC<FormElementFactoryProps> = ({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
}) => {
  if (!field) {
    console.error('FormElementFactory: field is required', { field, value, error, touched });
    return null;
  }

  const {
    name,
    label,
    type,
    placeholder,
    description,
    required,
    options,
    styling,
  } = field;

  const fieldId = `field-${name}`;
  const hasError = error && touched;
  const isRequired = required;

  const fieldClasses = cn(
    'w-full',
    hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    styling?.className
  );

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={fieldClasses}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={fieldClasses}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        // Handle checkbox group vs single checkbox
        if (options && options.length > 0) {
          // Multi-select checkbox group
          const currentValues = Array.isArray(value) ? value : [];
          return (
            <div className="grid grid-cols-2 gap-3">
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    id={`${fieldId}-${option.value}`}
                    type="checkbox"
                    checked={currentValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      onChange(newValues);
                    }}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    disabled={disabled || option.disabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor={`${fieldId}-${option.value}`} className="text-sm font-medium text-gray-700">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div className="flex items-center space-x-2">
              <input
                id={fieldId}
                type="checkbox"
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={onBlur}
                onFocus={onFocus}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
                {label}
              </Label>
            </div>
          );
        }

      case 'radio':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  id={`${fieldId}-${option.value}`}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  disabled={disabled || option.disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <Label htmlFor={`${fieldId}-${option.value}`} className="text-sm font-medium text-gray-700">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            id={fieldId}
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={fieldClasses}
          />
        );
    }
  };

  if (type === 'checkbox' && (!options || options.length === 0)) {
    // Single checkbox - render without additional wrapper
    return (
      <div className="space-y-3">
        {renderField()}
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
        {hasError && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

FormElementFactory.displayName = 'FormElementFactory';
