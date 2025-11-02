// Utility to provide default form configuration
// NOTE: This utility is for the deprecated FormWrapper component.
// Active forms use action-config.tsx for default action configurations.

import { FormConfig } from '../types';

/**
 * Provides default form configuration values when not specified in the schema
 * @deprecated This is for the deprecated FormWrapper component. Use action-config.tsx instead.
 * @param config The original form configuration
 * @returns The form configuration with defaults applied
 */
export const getDefaultConfig = (config: FormConfig): FormConfig => {
  // Make a copy of the original config
  const enhancedConfig = { ...config };
  
  // Get singular name for dynamic labels
  const singularName = (config as any).singular_name || 'Item';
  
  // Add default actions if not provided
  if (!enhancedConfig.actions) {
    enhancedConfig.actions = {
      submit: {
        label: `Create ${singularName}`,
        variant: 'primary',
      },
      reset: {
        label: 'Reset',
        variant: 'secondary',
      },
      cancel: {
        label: 'Cancel',
        variant: 'secondary', // Note: ghost variant not in FormConfig type
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
        label: 'Reset',
        variant: 'secondary',
      };
    }
    
    if (!enhancedConfig.actions.cancel) {
      enhancedConfig.actions.cancel = {
        label: 'Cancel',
        variant: 'secondary',
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