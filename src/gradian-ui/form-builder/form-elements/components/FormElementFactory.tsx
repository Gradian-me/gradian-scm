// Form Element Factory Component

import React from 'react';
import { FormElementConfig, FormElementProps } from '../types';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { RadioGroup } from './RadioGroup';

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
      return <SelectInput config={config} options={config.options || []} {...restProps} />;
    
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
