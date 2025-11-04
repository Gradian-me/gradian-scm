// Form Element Factory Component

import React from 'react';
import { FormElementConfig, FormElementProps } from '../types';
import { FormField } from '@/gradian-ui/schema-manager/types/form-schema';
import { TextInput } from './TextInput';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { RadioGroup } from './RadioGroup';
import { Select } from './Select';
import { ImageText } from './ImageText';
import { Button } from './Button';
import { Input } from './Input';
import { Avatar } from './Avatar';
import { ColorPicker } from './ColorPicker';
import { Rating } from './Rating';
import { Badge } from './Badge';
import { Countdown } from './Countdown';
import { EmailInput } from './EmailInput';
import { PhoneInput } from './PhoneInput';
import { PasswordInput } from './PasswordInput';
import { NumberInput } from './NumberInput';
import { DateInput } from './DateInput';
import { DateTimeInput } from './DateTimeInput';
import { FileInput } from './FileInput';
import { UnknownControl } from './UnknownControl';

// Support both config-based and field-based interfaces
export interface FormElementFactoryProps extends Omit<FormElementProps, 'config' | 'touched'> {
  config?: any;
  field?: FormField;
  touched?: boolean | boolean[];
}

export const FormElementFactory: React.FC<FormElementFactoryProps> = (props) => {
  // Support both config and field interfaces
  const isFieldInterface = !!props.field;
  
  let config: any;
  let restProps: any;
  
  if (isFieldInterface) {
    // Convert field to config format
    const { field, value, error, touched, onChange, onBlur, onFocus, disabled, ...otherProps } = props;
    config = field;
    restProps = {
      value,
      error,
      touched,
      onChange,
      onBlur,
      onFocus,
      disabled,
      ...otherProps,
    };
  } else {
    // Use config directly
    const { config: configProp, ...otherProps } = props;
    config = configProp;
    restProps = otherProps;
  }

  if (!config) {
    console.error('FormElementFactory: config or field is required', props);
    return null;
  }

  // Use component if available, otherwise fall back to type
  const elementType = (config as any).component || config.type;

  switch (elementType) {
    case 'text':
      return <TextInput config={config} {...restProps} />;
    
    case 'email':
      return <EmailInput config={config} {...restProps} />;
    
    case 'phone':
    case 'tel':
      return <PhoneInput config={config} {...restProps} />;
    
    case 'password':
      return <PasswordInput config={config} {...restProps} />;
    
    case 'number':
      return <NumberInput config={config} {...restProps} />;
    
    case 'select':
      // Convert options to SelectOption[] format if they have icon/color
      const selectOptions = config.options?.map((opt: any) => ({
        value: opt.value,
        label: opt.label,
        disabled: opt.disabled,
        icon: opt.icon,
        color: opt.color,
      }));
      
      return (
        <Select
          config={config}
          value={restProps.value}
          onValueChange={restProps.onChange}
          disabled={restProps.disabled}
          options={selectOptions}
          className={restProps.className}
          error={restProps.error}
          required={config.validation?.required || config.required}
          placeholder={config.placeholder}
        />
      );
    
    case 'textarea':
      return <Textarea config={config} {...restProps} />;
    
    case 'checkbox':
      return <Checkbox config={config} {...restProps} />;
    
    case 'radio':
      return <RadioGroup config={config} options={config.options || []} {...restProps} />;
    
    case 'date':
      return <DateInput config={config} {...restProps} />;
    
    case 'datetime-local':
    case 'datetime':
      return <DateTimeInput config={config} {...restProps} />;
    
    case 'file':
      return <FileInput config={config} {...restProps} />;
    
    case 'image-text':
      return <ImageText config={config} value={restProps.value} {...restProps} />;
    
    case 'button':
      return (
        <Button
          variant={(config as any).variant || 'default'}
          size={(config as any).size || 'md'}
          disabled={restProps.disabled}
          onClick={(config as any).onClick || restProps.onChange}
          className={restProps.className}
        >
          {(config as any).label || restProps.value || 'Button'}
        </Button>
      );
    
    case 'input':
      return (
        <Input
          variant={(config as any).variant || 'default'}
          size={(config as any).size || 'md'}
          value={restProps.value || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => restProps.onChange?.(e.target.value)}
          disabled={restProps.disabled}
          placeholder={(config as any).placeholder}
          className={restProps.className}
          {...(restProps.onBlur ? { onBlur: restProps.onBlur } as any : {})}
          {...(restProps.onFocus ? { onFocus: restProps.onFocus } as any : {})}
        />
      );
    
    case 'avatar':
      return (
        <Avatar
          src={restProps.value?.src || restProps.value || (config as any).src}
          alt={(config as any).alt}
          fallback={(config as any).fallback || restProps.value?.fallback || '?'}
          size={(config as any).size || 'md'}
          variant={(config as any).variant || 'default'}
          className={restProps.className}
        />
      );
    
    case 'color-picker':
      return (
        <ColorPicker
          value={restProps.value || (config as any).defaultValue || '#4E79A7'}
          onChange={(e) => restProps.onChange?.(e.target.value)}
          disabled={restProps.disabled}
          id={(config as any).name || (config as any).id}
          className={restProps.className}
        />
      );
    
    case 'rating':
      return (
        <Rating
          value={Number(restProps.value) || 0}
          maxValue={(config as any).maxValue || 5}
          size={(config as any).size || 'md'}
          showValue={(config as any).showValue || false}
          className={restProps.className}
        />
      );
    
    case 'badge':
      return (
        <Badge
          variant={(config as any).variant || 'default'}
          size={(config as any).size || 'md'}
          className={restProps.className}
        >
          {restProps.value || (config as any).label || 'Badge'}
        </Badge>
      );
    
    case 'countdown':
      return (
        <Countdown
          expireDate={restProps.value?.expireDate || restProps.value || (config as any).expireDate}
          startDate={restProps.value?.startDate || (config as any).startDate}
          includeTime={(config as any).includeTime !== false}
          showIcon={(config as any).showIcon !== false}
          size={(config as any).size || 'md'}
          className={restProps.className}
        />
      );
    
    default:
      console.warn(`Unknown form element type: ${elementType}`, config);
      return <UnknownControl config={config} componentType={elementType} {...restProps} />;
  }
};

FormElementFactory.displayName = 'FormElementFactory';
