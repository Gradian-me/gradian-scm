import { FormSchema as SharedFormSchema } from '../../shared/types/form-schema';
import { FormSchema as FormBuilderFormSchema } from '../../gradian-ui/form-builder/types/form-schema';

// Extended form schema with additional properties
export type ExtendedFormSchema = SharedFormSchema & {
  // Add any extended properties here if needed
  [key: string]: any;
};

/**
 * Safely cast an ExtendedFormSchema to SharedFormSchema for components that require it
 */
export const asFormSchema = (schema: ExtendedFormSchema): SharedFormSchema => {
  // Ensure name and title are set as aliases for compatibility
  if (!schema.name && schema.singular_name) {
    schema.name = schema.singular_name;
  }
  
  if (!schema.title && schema.plural_name) {
    schema.title = schema.plural_name;
  }
  
  // Add default actions if not present
  if (!schema.actions) {
    schema.actions = ['submit', 'cancel', 'reset'];
  }
  
  // Add default validation settings if not present
  if (!schema.validation) {
    schema.validation = {
      mode: 'onChange',
      showErrors: true,
    };
  }
  
  return schema as SharedFormSchema;
};

/**
 * Convert ExtendedFormSchema to FormBuilderFormSchema for form-builder components
 */
export const asFormBuilderSchema = (schema: ExtendedFormSchema): FormBuilderFormSchema => {
  // Ensure name is set (required by form-builder FormSchema)
  const name = schema.name || schema.singular_name || 'Item';
  
  // Ensure title is set (required by form-builder FormSchema)
  const title = schema.title || schema.plural_name || 'Items';
  
  // Create a new object with required fields
  const formBuilderSchema = {
    ...schema,
    name,
    title,
    description: schema.description,
    fields: schema.fields,
    sections: schema.sections,
    cardMetadata: schema.cardMetadata,
    layout: schema.layout,
    styling: schema.styling,
    validation: schema.validation || {
      mode: 'onChange' as const,
      showErrors: true,
    },
    actions: schema.actions || ['submit', 'cancel', 'reset'],
  } as FormBuilderFormSchema;
  
  return formBuilderSchema;
};

