// Schema Registry Utilities
// Utilities for finding and working with schemas dynamically

import { FormSchema } from '../types/form-schema';
import { ALL_SCHEMAS, schemaExists } from '../schemas/all-schemas';

/**
 * Find a schema by its ID
 * @param schemaId - The ID of the schema to find
 * @returns The schema if found, or null if not found
 */
export const findSchemaById = (schemaId: string): FormSchema | null => {
  if (!schemaExists(schemaId)) {
    console.warn(`Schema with ID "${schemaId}" not found`);
    return null;
  }
  
  return ALL_SCHEMAS[schemaId];
};

/**
 * Get a schema by ID, throws error if not found
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
 * Get all available schema IDs
 * @returns Array of schema IDs
 */
export const getAvailableSchemaIds = (): string[] => {
  return Object.keys(ALL_SCHEMAS);
};

/**
 * Get schema metadata
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
 * Validate if a schema ID is valid
 * @param schemaId - The ID to validate
 * @returns True if valid, false otherwise
 */
export const isValidSchemaId = (schemaId: string): boolean => {
  return schemaExists(schemaId);
};

