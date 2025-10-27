// General Schema Manager Hook
// Works with any schema that includes UI configuration

import { useMemo } from 'react';
import { FormSchema } from '../../form-builder/types/form-schema';
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
  // Check if schema has UI config
  if (!schema.ui) {
    throw new Error(`Schema "${schema.id}" missing ui configuration. Add ui property to schema.`);
  }

  const config: SchemaManagerConfig = {
    entityName: schema.ui.entityName,
    schema,
    customFilters: schema.ui.filters,
    onDelete: schema.ui.onDelete,
    onView: schema.ui.onView,
  };

  // Generate schemas (Zod validation)
  const schemas = useMemo(() => generateSchemasFromForm(schema), [schema]);

  // Generate UI hook using the config
  const useGeneratedHook = useMemo(
    () => createEntityUIHook<T>(
      schema.ui!.entityName,
      schema,
      {
        createTitle: schema.ui!.createTitle,
        editTitle: schema.ui!.editTitle,
        basePath: schema.ui!.basePath,
        customFilters: schema.ui!.filters,
        onDelete: schema.ui!.onDelete,
        onView: schema.ui!.onView,
      }
    ),
    [schema]
  );

  // Use the generated hook
  const hook = useGeneratedHook();

  // Get entity name for prefixing
  const entityName = schema.ui!.entityName.toLowerCase();

  // Get actions configuration from schema
  const actions = schema.ui?.actions || { view: true, edit: true, delete: true };

  return {
    ...hook,
    
    // Additional manager methods
    getSchema: () => schema,
    getConfig: () => config,
    getSchemas: () => schemas,
    
    // Auto-generate entity-prefixed aliases (e.g., vendorFormState, selectedVendor for Vendor)
    [`${entityName}FormState`]: hook.formState,
    [`selected${schema.ui!.entityName}`]: hook.selectedEntity,
    
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

