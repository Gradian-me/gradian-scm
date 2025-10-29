// Entity Hook Factory
// Automatically resolves entity files based on naming conventions

import { useSchemaManager } from './useSchemaManager';
import { FormSchema } from '../../form-builder/types/form-schema';

/**
 * Hook that takes an entity name and automatically resolves all related files
 * 
 * @example
 * // Just pass the entity name
 * const { ... } = useEntity('Vendor');
 * // Automatically loads: vendor-form.schema.ts, Vendor type, etc.
 */
export const useEntity = <T extends Record<string, any> = any>(entityName: string, schema: FormSchema) => {
  return useSchemaManager<T>(schema);
};

/**
 * Factory function that creates entity-specific hooks
 * Pass entity name + schema, get back a ready-to-use hook
 * 
 * @example
 * // In domains/vendor/hooks/useVendorUI.ts
 * export const useVendorUI = createEntityHook<Vendor>('Vendor', vendorFormSchema);
 */
export const createEntityHook = <T extends Record<string, any> = any>(
  entityName: string, 
  schema: FormSchema
) => {
  return () => useSchemaManager<T>(schema);
};

/**
 * Helper to create a simple alias hook
 */
export const createEntityAlias = <T extends Record<string, any> = any>(
  schema: FormSchema
) => {
  const entityName = (schema as any).ui?.entityName || 'Entity';
  return createEntityHook<T>(entityName, schema)();
};

