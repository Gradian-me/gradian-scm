/**
 * Utility functions for generating action configurations dynamically
 */

import React from 'react';
import { X, RotateCcw, Save } from 'lucide-react';

export interface ActionConfig {
  type: 'submit' | 'cancel' | 'reset';
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'gradient';
  loading?: string;
  icon?: React.ReactNode;
}

/**
 * Get action configuration for a form action
 */
export const getActionConfig = (
  actionType: 'submit' | 'cancel' | 'reset',
  singularName: string,
  isEditMode: boolean = false
): ActionConfig => {
  const configs: Record<string, ActionConfig> = {
    submit: {
      type: 'submit',
      label: isEditMode ? `Update ${singularName}` : `Create ${singularName}`,
      variant: 'default',
      loading: isEditMode ? `Updating ${singularName}...` : `Creating ${singularName}...`,
      icon: <Save className="h-4 w-4" />
    },
    cancel: {
      type: 'cancel',
      label: 'Cancel',
      variant: 'ghost',
      loading: undefined,
      icon: <X className="h-4 w-4" />
    },
    reset: {
      type: 'reset',
      label: 'Reset',
      variant: 'outline',
      loading: undefined,
      icon: <RotateCcw className="h-4 w-4" />
    }
  };

  return configs[actionType];
};

/**
 * Get singular name from schema
 */
export const getSingularName = (schema: { singular_name?: string; name?: string }): string => {
  return schema.singular_name || schema.name || 'Item';
};

/**
 * Check if form is in edit mode based on initial values
 */
export const isEditMode = (initialValues: any): boolean => {
  return !!(initialValues && (initialValues.id || initialValues._id || initialValues.Id));
};


