// Schema Loader Utility - SERVER SIDE ONLY
// Loads schemas from API endpoint and converts them to FormSchema objects
// This file is server-only and can only be imported in server components

import 'server-only';

import { FormSchema, FormField } from '../types/form-schema';
import { config } from '@/lib/config';
import { loggingCustom } from '@/gradian-ui/shared/utils/logging-custom';
import { LogType } from '@/gradian-ui/shared/constants/application-variables';
import { loadData, loadDataById, clearCache as clearDataCache } from '@/gradian-ui/shared/utils/data-loader';
import fs from 'fs';
import path from 'path';

const SCHEMAS_ROUTE_KEY = 'schemas';

/**
 * Safely read schemas from the local filesystem.
 * Returns null when the file is missing or invalid so callers can fall back to other strategies.
 */
function readSchemasFromFile(): FormSchema[] | null {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'all-schemas.json');

    if (!fs.existsSync(dataPath)) {
      loggingCustom(LogType.SCHEMA_LOADER, 'warn', `Schemas file not found at path: ${dataPath}`);
      return null;
    }

    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const schemas = JSON.parse(fileContents);

    if (!Array.isArray(schemas)) {
      loggingCustom(LogType.SCHEMA_LOADER, 'error', 'Schemas file does not contain an array');
      return null;
    }

    return schemas.map(processSchema);
  } catch (error) {
    loggingCustom(
      LogType.SCHEMA_LOADER,
      'error',
      `Error reading schemas from filesystem: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return null;
  }
}

/**
 * Clear the schema cache (useful for testing or manual cache invalidation)
 */
export function clearSchemaCache(): void {
  clearDataCache(SCHEMAS_ROUTE_KEY);
}


/**
 * Convert a pattern string to RegExp
 * @param pattern - The pattern string
 * @returns RegExp object or undefined
 */
function stringToRegExp(pattern: string | undefined): RegExp | undefined {
  if (!pattern) return undefined;

  try {
    return new RegExp(pattern);
  } catch {
    loggingCustom(LogType.SCHEMA_LOADER, 'warn', `Invalid pattern: ${pattern}`);
    return undefined;
  }
}

/**
 * Process a field to convert string patterns to RegExp
 * @param field - The field to process
 * @returns Processed field
 */
function processField(field: any): FormField {
  const processedField = { ...field };

  // Convert pattern string to RegExp
  if (processedField.validation?.pattern && typeof processedField.validation.pattern === 'string') {
    processedField.validation.pattern = stringToRegExp(processedField.validation.pattern);
  }

  if (Array.isArray(processedField.options)) {
    processedField.options = processedField.options.map((option: any) => {
      if (!option || typeof option !== 'object') {
        return option;
      }

      if (option.id === undefined || option.id === null) {
        return option;
      }

      return {
        ...option,
        id: String(option.id),
      };
    });
  }

  return processedField;
}

/**
 * Process a schema to convert string patterns to RegExp objects
 * and transform old structure (fields in sections) to new structure (fields at schema level)
 * @param schema - The schema to process
 * @returns Processed schema
 */
function processSchema(schema: any): FormSchema {
  const processedSchema = { ...schema };

  // Ensure fields array exists
  if (!processedSchema.fields) {
    processedSchema.fields = [];
  }

  // If schema has old structure (fields in sections), transform to new structure
  if (processedSchema.sections && processedSchema.fields.length === 0) {
    const allFields: FormField[] = [];

    processedSchema.sections.forEach((section: any) => {
      if (section.fields && Array.isArray(section.fields)) {
        section.fields.forEach((field: any) => {
          allFields.push(processField({
            ...field,
            sectionId: section.id
          }));
        });
      }
      // Remove fields from section
      delete section.fields;
    });

    processedSchema.fields = allFields;
  } else if (processedSchema.fields && processedSchema.fields.length > 0) {
    // Process fields that are already at schema level
    processedSchema.fields = processedSchema.fields.map(processField);
  }

  // Ensure sections array exists
  if (!processedSchema.sections) {
    processedSchema.sections = [];
  }

  return processedSchema as FormSchema;
}

/**
 * Load all schemas from the API endpoint (with caching)
 * During build time, reads directly from file system
 * @returns Array of FormSchema objects
 */
export async function loadAllSchemas(): Promise<FormSchema[]> {
  // Check if we're in a build context - during build, read directly from file
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  
  if (isBuildTime) {
    const schemasFromFile = readSchemasFromFile();
    if (schemasFromFile) {
      return schemasFromFile;
    }

    loggingCustom(LogType.SCHEMA_LOADER, 'error', 'Schemas file not found during build');
    return [];
  }
  
  // Normal runtime: use API endpoint
  const apiPath = config.schemaApi.basePath;
  
  try {
    return await loadData<FormSchema[]>(
      SCHEMAS_ROUTE_KEY,
      apiPath,
      {
        processor: (data: any) => {
          if (!Array.isArray(data)) {
            loggingCustom(LogType.SCHEMA_LOADER, 'error', 'API response does not contain an array');
            return [];
          }
          // Process each schema to convert patterns
          return data.map(processSchema);
        },
        logType: LogType.SCHEMA_LOADER,
      }
    );
  } catch (error) {
    loggingCustom(
      LogType.SCHEMA_LOADER,
      'warn',
      `Failed to load schemas from API (${error instanceof Error ? error.message : 'Unknown error'}). Falling back to filesystem.`
    );

    const schemasFromFile = readSchemasFromFile();
    if (schemasFromFile) {
      return schemasFromFile;
    }

    loggingCustom(LogType.SCHEMA_LOADER, 'error', 'Schemas file not found while attempting filesystem fallback.');
    return [];
  }
}

/**
 * Load schemas and convert to a Map indexed by schema ID
 * @returns Map of schema ID to FormSchema
 */
export async function loadSchemasAsMap(): Promise<Map<string, FormSchema>> {
  const schemas = await loadAllSchemas();
  const schemaMap = new Map<string, FormSchema>();

  schemas.forEach(schema => {
    schemaMap.set(schema.id, schema);
  });

  return schemaMap;
}

/**
 * Load schemas and convert to a Record indexed by schema ID
 * @returns Record of schema ID to FormSchema
 */
export async function loadSchemasAsRecord(): Promise<Record<string, FormSchema>> {
  const schemas = await loadAllSchemas();
  const schemaRecord: Record<string, FormSchema> = {};

  schemas.forEach(schema => {
    schemaRecord[schema.id] = schema;
  });

  return schemaRecord;
}

/**
 * Get a single schema by ID (uses cache if available)
 * During build time, reads directly from file system
 * @param schemaId - The ID of the schema to get
 * @returns The schema or null if not found
 */
export async function loadSchemaById(schemaId: string): Promise<FormSchema | null> {
  // During build time, loadAllSchemas already reads from file, so this will work
  const schemas = await loadAllSchemas();
  const schema = schemas.find(s => s.id === schemaId);

  if (schema) {
    return schema;
  }
  
  // Fallback: if not found, try direct API call (only during runtime, not build)
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuildTime) {
    return null; // During build, if not found in file, return null
  }
  
  const apiBasePath = config.schemaApi.basePath;
  try {
    return await loadDataById<FormSchema>(
      SCHEMAS_ROUTE_KEY,
      apiBasePath,
      schemaId,
      {
        processor: (data: any) => processSchema(data),
        findInCache: (cache: any, id: string) => {
          if (Array.isArray(cache)) {
            return cache.find((s: FormSchema) => s.id === id) || null;
          }
          return null;
        },
        logType: LogType.SCHEMA_LOADER,
      }
    );
  } catch (error) {
    loggingCustom(
      LogType.SCHEMA_LOADER,
      'warn',
      `Failed to load schema "${schemaId}" from API (${error instanceof Error ? error.message : 'Unknown error'}). Falling back to filesystem.`
    );

    const schemasFromFile = readSchemasFromFile();
    if (schemasFromFile) {
      return schemasFromFile.find(s => s.id === schemaId) ?? null;
    }

    return null;
  }
}

