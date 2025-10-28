import { useSchemaManager } from '../../../gradian-ui/schema-manager';
import { FormSchema } from '../../../gradian-ui/form-builder/types/form-schema';
import { ExtendedFormSchema } from '../types/extended-form-schema';

/**
 * Custom useEntity hook that ensures the schema has all required properties
 * @param entityType The entity type name
 * @param schema The form schema
 * @returns The schema manager hook
 */
export function useEntity<T>(entityType: string, schema: FormSchema | ExtendedFormSchema) {
  // Ensure schema has UI property with required fields
  const safeSchema = {
    ...schema,
    ui: {
      ...(schema.ui || {}),
      entityName: (schema as ExtendedFormSchema).singular_name || entityType || 'Entity',
      createTitle: `Create New ${(schema as ExtendedFormSchema).singular_name || entityType || 'Entity'}`,
      editTitle: `Edit ${(schema as ExtendedFormSchema).singular_name || entityType || 'Entity'}`,
      basePath: schema.name ? schema.name.toLowerCase() : ((schema as ExtendedFormSchema).plural_name || entityType + 's').toLowerCase()
    }
  };

  // Use the schema manager with the safe schema
  return useSchemaManager<T>(safeSchema);
}
