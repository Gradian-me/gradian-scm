import { FormSchema } from '../../shared/types/form-schema';

// Extended form schema with additional properties
export type ExtendedFormSchema = FormSchema & {
  // Add any extended properties here if needed
  [key: string]: any;
};

/**
 * Safely cast an ExtendedFormSchema to FormSchema for components that require it
 */
export const asFormSchema = (schema: ExtendedFormSchema): FormSchema => {
  // Ensure title is present (required by FormSchema)
  if (!schema.title && schema.singular_name) {
    schema.title = `Create New ${schema.singular_name}`;
  } else if (!schema.title) {
    schema.title = schema.name || 'Form';
  }
  
  // Add default actions if not present
  if (!schema.actions) {
    const singularName = schema.singular_name || 
                        (schema.name?.endsWith('s') ? 
                          schema.name.slice(0, -1) : 
                          schema.name || 'Item');
    
    schema.actions = {
      submit: {
        label: `Create ${singularName}`,
        variant: 'default',
      },
      reset: {
        label: 'Reset Form',
        variant: 'outline',
      },
      cancel: {
        label: 'Cancel',
        variant: 'ghost',
      }
    };
  }
  
  // Add default validation settings if not present
  if (!schema.validation) {
    schema.validation = {
      mode: 'onChange',
      showErrors: true,
    };
  }
  
  return schema as unknown as FormSchema;
};

