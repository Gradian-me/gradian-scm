// Form Element Factory Component

import React from 'react';
import { FormElementConfig, FormElementProps } from '../types';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { RadioGroup } from './RadioGroup';

export const FormElementFactory: React.FC<FormElementProps> = (props) => {
  const { config, ...restProps } = props;

  switch (config.component) {
    case 'text':
    case 'email':
    case 'password':
      return <TextInput config={config} {...restProps} />;
    
    case 'number':
      return <TextInput config={config} {...restProps} />;
    
    case 'select':
      return <SelectInput config={config} {...restProps} />;
    
    case 'textarea':
      return <Textarea config={config} {...restProps} />;
    
    case 'checkbox':
      return <Checkbox config={config} {...restProps} />;
    
    case 'radio':
      return <RadioGroup config={config} {...restProps} />;
    
    case 'date':
      return <TextInput config={config} {...restProps} />;
    
    case 'file':
      return <TextInput config={config} {...restProps} />;
    
    default:
      console.warn(`Unknown form element type: ${config.component}`);
      return <TextInput config={config} {...restProps} />;
  }
};

FormElementFactory.displayName = 'FormElementFactory';
