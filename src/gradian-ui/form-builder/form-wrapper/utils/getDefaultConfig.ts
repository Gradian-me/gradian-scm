// Utility to provide default form configuration

import { FormConfig } from '../types';

/**
 * Provides default form configuration values when not specified in the schema
 * @param config The original form configuration
 * @returns The form configuration with defaults applied
 */
export const getDefaultConfig = (config: FormConfig): FormConfig => {
  // Make a copy of the original config
  const enhancedConfig = { ...config };
  
  // Get singular name for dynamic labels
  const singularName = (config as any).singular_name || 
                      config.name?.endsWith('s') ? 
                        config.name.slice(0, -1) : 
                        config.name || 'Item';
  
  // Add default actions if not provided
  if (!enhancedConfig.actions) {
    enhancedConfig.actions = {
      submit: {
        label: `Create ${singularName}`,
        variant: 'primary',
      },
      reset: {
        label: 'Reset Form',
        variant: 'secondary',
      },
      cancel: {
        label: 'Cancel',
        variant: 'secondary', // Changed from 'ghost' to 'secondary'
      }
    };
  } else {
    // If actions object exists but some buttons are missing, add defaults
    if (!enhancedConfig.actions.submit) {
      enhancedConfig.actions.submit = {
        label: `Create ${singularName}`,
        variant: 'primary',
      };
    } else if (enhancedConfig.actions.submit.label?.includes('{singular_name}')) {
      // Replace {singular_name} placeholder if present
      enhancedConfig.actions.submit.label = 
        enhancedConfig.actions.submit.label.replace('{singular_name}', singularName);
    }
    
    if (!enhancedConfig.actions.reset) {
      enhancedConfig.actions.reset = {
        label: 'Reset Form',
        variant: 'secondary',
      };
    }
    
    if (!enhancedConfig.actions.cancel) {
      enhancedConfig.actions.cancel = {
        label: 'Cancel',
        variant: 'secondary', // Changed from 'ghost' to 'secondary'
      };
    }
  }
  
  // Add default validation settings if not provided
  if (!enhancedConfig.validation) {
    enhancedConfig.validation = {
      mode: 'onChange',
      showErrors: true,
    };
  }
  
  return enhancedConfig;
};