// Schema Registry - SERVER SIDE ONLY
// Server-side functions that use file system access

import 'server-only';

import { FormSchema } from '../types/form-schema';
import { loadAllSchemas, loadSchemasAsRecord } from './schema-loader';

// Cache for loaded schemas
let schemasCache: Record<string, FormSchema> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5000; // 5 seconds cache in development

/**
 * Get all schemas (cached) - synchronous version for server-side only
 * @returns Record of schema ID to FormSchema
 */
export const getAllSchemasSync = (): Record<string, FormSchema> => {
  // In development, use TTL-based cache to support hot reloading
  const now = Date.now();
  if (!schemasCache || (process.env.NODE_ENV === 'development' && now - cacheTimestamp > CACHE_TTL_MS)) {
    schemasCache = loadSchemasAsRecord();
    cacheTimestamp = now;
  }
  return schemasCache;
};

/**
 * Clear the schema cache (useful for testing or hot-reloading)
 */
export const clearSchemaCache = (): void => {
  schemasCache = null;
};

/**
 * Check if a schema exists (Server-side only)
 * @param schemaId - The ID of the schema to check
 * @returns True if schema exists, false otherwise
 */
export const schemaExists = (schemaId: string): boolean => {
  const schemas = getAllSchemasSync();
  return schemaId in schemas;
};

/**
 * Find a schema by its ID (Server-side only)
 * @param schemaId - The ID of the schema to find
 * @returns The schema if found, or null if not found
 */
export const findSchemaById = (schemaId: string): FormSchema | null => {
  if (!schemaExists(schemaId)) {
    console.warn(`Schema with ID "${schemaId}" not found`);
    return null;
  }
  
  const schemas = getAllSchemasSync();
  return schemas[schemaId];
};

/**
 * Get a schema by ID (Server-side only), throws error if not found
 * @param schemaId - The ID of the schema to get
 * @returns The schema
 * @throws Error if schema not found
 */
export const getSchemaById = (schemaId: string): FormSchema => {
  const schema = findSchemaById(schemaId);
  
  if (!schema) {
    throw new Error(`Schema with ID "${schemaId}" not found`);
  }
  
  return schema;
};

/**
 * Get all available schema IDs (Server-side only)
 * @returns Array of schema IDs
 */
export const getAvailableSchemaIds = (): string[] => {
  const schemas = getAllSchemasSync();
  return Object.keys(schemas);
};

/**
 * Get all schemas (Server-side only)
 * @returns Array of all schemas
 */
export const getAllSchemasArray = (): FormSchema[] => {
  return loadAllSchemas();
};

/**
 * Get schema metadata (Server-side only)
 * @param schemaId - The ID of the schema
 * @returns Metadata about the schema
 */
export const getSchemaMetadata = (schemaId: string) => {
  const schema = findSchemaById(schemaId);
  
  if (!schema) {
    return null;
  }
  
  return {
    id: schema.id,
    name: schema.name,
    title: schema.title,
    description: schema.description,
    singularName: schema.singular_name,
    pluralName: schema.plural_name,
  };
};

/**
 * Validate if a schema ID is valid (Server-side only)
 * @param schemaId - The ID to validate
 * @returns True if valid, false otherwise
 */
export const isValidSchemaId = (schemaId: string): boolean => {
  return schemaExists(schemaId);
};

