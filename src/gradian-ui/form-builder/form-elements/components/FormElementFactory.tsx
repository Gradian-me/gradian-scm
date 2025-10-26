// Form Element Factory Component

import React from 'react';
import { FormElementConfig, FormElementProps } from '../types';
import { TextInput } from './TextInput';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { RadioGroup } from './RadioGroup';
import { Select } from './Select';

export interface FormElementFactoryProps extends FormElementProps {}

export const FormElementFactory: React.FC<FormElementFactoryProps> = (props) => {
  const { config, ...restProps } = props;

  if (!config) {
    console.error('FormElementFactory: config is required', props);
    return null;
  }

  // Use component if available, otherwise fall back to type
  const elementType = (config as any).component || config.type;

  switch (elementType) {
    case 'text':
    case 'email':
    case 'password':
      return <TextInput config={config} {...restProps} />;
    
    case 'number':
      return <TextInput config={config} {...restProps} />;
    
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
          value={restProps.value}
          onValueChange={restProps.onChange}
          disabled={restProps.disabled}
          options={selectOptions}
          className={restProps.className}
        />
      );
    
    case 'textarea':
      return <Textarea config={config} {...restProps} />;
    
    case 'checkbox':
      return <Checkbox config={config} {...restProps} />;
    
    case 'radio':
      return <RadioGroup config={config} options={config.options || []} {...restProps} />;
    
    case 'date':
      return <TextInput config={config} {...restProps} />;
    
    case 'file':
      return <TextInput config={config} {...restProps} />;
    
    default:
      console.warn(`Unknown form element type: ${config.type}`);
      return <TextInput config={config} {...restProps} />;
  }
};

FormElementFactory.displayName = 'FormElementFactory';
