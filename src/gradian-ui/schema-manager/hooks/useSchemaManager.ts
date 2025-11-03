// General Schema Manager Hook
// Works with any schema that includes UI configuration

import { useMemo } from 'react';
import { FormSchema } from '../types/form-schema';
import { generateSchemasFromForm } from '../utils/schema-to-zod';
import { createEntityUIHook } from '../utils/schema-to-store';
import type { GeneratedSchemas, SchemaManager, SchemaManagerConfig } from '../types';

// Export types
export type { GeneratedSchemas, SchemaManager, SchemaManagerConfig };

/**
 * Main hook that generates everything from a schema with UI config
 * Works generically for any entity
 */
export const useSchemaManager = <T extends Record<string, any> = any>(schema: FormSchema): SchemaManager<T> => {
  const schemaWithUI = schema as any;
  
  // Check if schema has UI config
  if (!schemaWithUI.ui) {
    throw new Error(`Schema "${schema.id}" missing ui configuration. Add ui property to schema.`);
  }

  const config: SchemaManagerConfig = {
    entityName: schemaWithUI.ui.entityName,
    schema,
    customFilters: schemaWithUI.ui.filters,
    onDelete: schemaWithUI.ui.onDelete,
    onView: schemaWithUI.ui.onView,
  };

  // Generate schemas (Zod validation)
  const schemas = useMemo(() => generateSchemasFromForm(schema), [schema]);

  // Generate UI hook using the config
  const useGeneratedHook = useMemo(
    () => createEntityUIHook<T>(
      schemaWithUI.ui.entityName,
      schema,
      {
        createTitle: schemaWithUI.ui.createTitle,
        editTitle: schemaWithUI.ui.editTitle,
        basePath: schemaWithUI.ui.basePath,
        customFilters: schemaWithUI.ui.filters,
        onDelete: schemaWithUI.ui.onDelete,
        onView: schemaWithUI.ui.onView,
      }
    ),
    [schema]
  );

  // Use the generated hook
  const hook = useGeneratedHook();

  // Get entity name for prefixing
  const entityName = schemaWithUI.ui.entityName.toLowerCase();

  // Get actions configuration from schema
  const actions = schemaWithUI.ui?.actions || { view: true, edit: true, delete: true };

  return {
    ...hook,
    
    // Additional manager methods
    getSchema: () => schema,
    getConfig: () => config,
    getSchemas: () => schemas,
    
    // Auto-generate entity-prefixed aliases (e.g., vendorFormState, selectedVendor for Vendor)
    [`${entityName}FormState`]: hook.formState,
    [`selected${schemaWithUI.ui.entityName}`]: hook.selectedEntity,
    
    // Expose actions configuration
    entityActions: actions,
  };
};

/**
 * Helper to create a domain-specific hook that uses schema manager
 */
export const createDomainHook = <T extends Record<string, any> = any>(schema: FormSchema) => {
  return () => useSchemaManager<T>(schema);
};

