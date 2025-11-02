/**
 * Utility functions for generating action configurations dynamically
 */

export interface ActionConfig {
  type: 'submit' | 'cancel' | 'reset';
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'gradient';
  loading?: string;
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
      loading: isEditMode ? `Updating ${singularName}...` : `Creating ${singularName}...`
    },
    cancel: {
      type: 'cancel',
      label: 'Cancel',
      variant: 'outline',
      loading: undefined
    },
    reset: {
      type: 'reset',
      label: 'Reset Form',
      variant: 'outline',
      loading: undefined
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

