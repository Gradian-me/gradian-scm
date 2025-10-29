import { useSchemaManager } from '../../../gradian-ui/schema-manager';
import { FormSchema } from '../../../shared/types/form-schema';

/**
 * Custom useEntity hook that ensures the schema has all required properties
 * @param entityType The entity type name
 * @param schema The form schema
 * @returns The schema manager hook
 */
export function useEntity<T extends Record<string, any> = any>(entityType: string, schema: FormSchema) {
  // Ensure schema has UI property with required fields
  const safeSchema = {
    ...schema,
    ui: {
      ...((schema as any).ui || {}),
      entityName: (schema as any).singular_name || entityType || 'Entity',
      createTitle: `Create New ${(schema as any).singular_name || entityType || 'Entity'}`,
      editTitle: `Edit ${(schema as any).singular_name || entityType || 'Entity'}`,
      basePath: schema.name ? schema.name.toLowerCase() : ((schema as any).plural_name || entityType + 's').toLowerCase()
    }
  };

  // Use the schema manager with the safe schema
  return useSchemaManager<T>(safeSchema);
}
