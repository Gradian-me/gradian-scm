import { FormSchema } from "../../../gradian-ui/form-builder/types/form-schema";
import { ExtendedFormSchema } from "../types/extended-form-schema";

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
  
  return schema as unknown as FormSchema;
};
