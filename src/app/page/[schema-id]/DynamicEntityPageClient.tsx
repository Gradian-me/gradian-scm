'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicPageRenderer } from '@/gradian-ui/data-display/components/DynamicPageRenderer';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { useSchemaStore } from '@/stores/schema.store';
import { config } from '@/lib/config';

interface DynamicEntityPageClientProps {
  initialSchema: FormSchema;
  schemaId: string;
}

/**
 * Convert a pattern string to RegExp
 */
function stringToRegExp(pattern: string | undefined): RegExp | undefined {
  if (!pattern) return undefined;
  try {
    return new RegExp(pattern);
  } catch (error) {
    console.warn(`Invalid pattern: ${pattern}`, error);
    return undefined;
  }
}

/**
 * Process a field to convert string patterns to RegExp
 */
function processField(field: any): any {
  const processedField = { ...field };
  if (processedField.validation?.pattern && typeof processedField.validation.pattern === 'string') {
    processedField.validation.pattern = stringToRegExp(processedField.validation.pattern);
  }
  return processedField;
}

/**
 * Process a schema to convert string patterns to RegExp objects
 */
function processSchema(schema: any): FormSchema {
  const processedSchema = { ...schema };
  
  if (processedSchema.fields) {
    processedSchema.fields = processedSchema.fields.map(processField);
  }
  
  return processedSchema as FormSchema;
}

/**
 * Client-only function to fetch schema from API (no server-only imports)
 */
async function fetchSchemaByIdClient(schemaId: string): Promise<FormSchema | null> {
  try {
    const response = await fetch(`${config.schemaApi.basePath}/${schemaId}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    if (!result.success) {
      return null;
    }
    
    // Process the schema to convert string patterns to RegExp
    return processSchema(result.data);
  } catch (error) {
    console.error('Error fetching schema:', error);
    return null;
  }
}

/**
 * Serialize schema to remove RegExp and other non-serializable objects
 */
function serializeSchema(schema: FormSchema): any {
  return JSON.parse(JSON.stringify(schema, (key, value) => {
    if (value instanceof RegExp) {
      return {
        __regexp: true,
        source: value.source,
        flags: value.flags
      };
    }
    return value;
  }));
}

/**
 * Reconstruct RegExp objects from serialized schema
 */
function reconstructRegExp(obj: any): any {
  if (obj && typeof obj === 'object') {
    // Check if this is a serialized RegExp
    if (obj.__regexp === true && obj.source) {
      return new RegExp(obj.source, obj.flags || '');
    }
    
    // Recursively process arrays
    if (Array.isArray(obj)) {
      return obj.map(item => reconstructRegExp(item));
    }
    
    // Recursively process objects
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = reconstructRegExp(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

export function DynamicEntityPageClient({ initialSchema, schemaId }: DynamicEntityPageClientProps) {
  const router = useRouter();
  const { getSchema, setSchema } = useSchemaStore();
  
  // Reconstruct RegExp objects from serialized schema from server
  const reconstructedInitialSchema = useMemo(
    () => reconstructRegExp(initialSchema) as FormSchema,
    [initialSchema]
  );
  
  // Initialize with cached schema if available, otherwise use initial schema from server
  const [schema, setSchemaState] = useState<FormSchema>(() => {
    const cachedSchema = getSchema(schemaId);
    if (cachedSchema) {
      return cachedSchema;
    }
    return reconstructedInitialSchema;
  });

  // Reload schema from API using route-based endpoint /api/schemas/${schemaId}
  // This ensures we only fetch the specific schema, not all schemas
  const reloadSchema = useCallback(async () => {
    try {
      // Use route-based endpoint: /api/schemas/${schemaId}
      // This is more efficient than /api/schemas?id=${schemaId} which loads all schemas first
      const freshSchema = await fetchSchemaByIdClient(schemaId);
      if (freshSchema) {
        // Update state and cache silently without showing loading state
        setSchemaState(freshSchema);
        setSchema(schemaId, freshSchema);
      }
    } catch (error) {
      console.error('Error reloading schema:', error);
      // Silently fail - don't disrupt user experience
    }
  }, [schemaId, setSchema]);

  // Update cache when initial schema changes (from server)
  // Server-side page.tsx already fetches the schema using loadSchemaById (no HTTP call)
  // So we just need to cache the initial schema from the server
  useEffect(() => {
    const cachedSchema = getSchema(schemaId);
    if (!cachedSchema) {
      // Cache the initial schema from server (server already loaded it from file system)
      setSchema(schemaId, reconstructedInitialSchema);
    }
  }, [schemaId, reconstructedInitialSchema, getSchema, setSchema]);

  // Listen for cache clear events - update silently in background
  useEffect(() => {
    // Listen for custom cache clear event (same tab)
    const handleCacheClear = () => {
      // Reload schema silently in background without showing loading state
      reloadSchema();
    };

    // Listen for storage events (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      // Check if schema cache was cleared
      if (e.key === 'schema-cache-cleared') {
        // Reload schema silently in background
        reloadSchema();
      }
    };

    window.addEventListener('schema-cache-cleared', handleCacheClear);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('schema-cache-cleared', handleCacheClear);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [reloadSchema]);

  // Serialize schema for client component
  const serializedSchema = serializeSchema(schema);

  return (
    <DynamicPageRenderer 
      schema={serializedSchema} 
      entityName={schema.singular_name || 'Entity'}
    />
  );
}

