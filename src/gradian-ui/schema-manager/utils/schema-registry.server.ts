// Schema Registry - SERVER SIDE ONLY
// Server-side functions that use API endpoint access

import 'server-only';

import { FormSchema } from '../types/form-schema';
import { loadAllSchemas, loadSchemasAsRecord } from './schema-loader';

// Cache for loaded schemas
let schemasCache: Record<string, FormSchema> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = process.env.NODE_ENV === 'production' ? 0 : 5000; // No cache in production to allow dynamic updates

/**
 * Get all schemas (cached) - async version for server-side only
 * @returns Record of schema ID to FormSchema
 */
export const getAllSchemasSync = async (): Promise<Record<string, FormSchema>> => {
  // Always reload if cache is expired or if we're in production (to support dynamic schema updates)
  const now = Date.now();
  if (!schemasCache || CACHE_TTL_MS === 0 || now - cacheTimestamp > CACHE_TTL_MS) {
    schemasCache = await loadSchemasAsRecord();
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
export const schemaExists = async (schemaId: string): Promise<boolean> => {
  const schemas = await getAllSchemasSync();
  return schemaId in schemas;
};

/**
 * Find a schema by its ID (Server-side only)
 * @param schemaId - The ID of the schema to find
 * @returns The schema if found, or null if not found
 */
export const findSchemaById = async (schemaId: string): Promise<FormSchema | null> => {
  const exists = await schemaExists(schemaId);
  if (!exists) {
    console.warn(`Schema with ID "${schemaId}" not found`);
    return null;
  }
  
  const schemas = await getAllSchemasSync();
  return schemas[schemaId];
};

/**
 * Get a schema by ID (Server-side only), throws error if not found
 * @param schemaId - The ID of the schema to get
 * @returns The schema
 * @throws Error if schema not found
 */
export const getSchemaById = async (schemaId: string): Promise<FormSchema> => {
  const schema = await findSchemaById(schemaId);
  
  if (!schema) {
    throw new Error(`Schema with ID "${schemaId}" not found`);
  }
  
  return schema;
};

/**
 * Get all available schema IDs (Server-side only)
 * @returns Array of schema IDs
 */
export const getAvailableSchemaIds = async (): Promise<string[]> => {
  const schemas = await getAllSchemasSync();
  return Object.keys(schemas);
};

/**
 * Get all schemas (Server-side only)
 * @returns Array of all schemas
 */
export const getAllSchemasArray = async (): Promise<FormSchema[]> => {
  return await loadAllSchemas();
};

/**
 * Get schema metadata (Server-side only)
 * @param schemaId - The ID of the schema
 * @returns Metadata about the schema
 */
export const getSchemaMetadata = async (schemaId: string) => {
  const schema = await findSchemaById(schemaId);
  
  if (!schema) {
    return null;
  }
  
  return {
    id: schema.id,
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
export const isValidSchemaId = async (schemaId: string): Promise<boolean> => {
  return await schemaExists(schemaId);
};

