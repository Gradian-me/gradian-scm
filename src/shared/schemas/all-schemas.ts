/**
 * @deprecated This file is deprecated. All schemas are now stored in data/all-schemas.json
 * Please use the schema-registry utility functions instead:
 * 
 * SERVER-SIDE (import from schema-registry.server):
 * - findSchemaById() - to find a schema by ID
 * - getSchemaById() - to get a schema (throws error if not found)
 * - getAvailableSchemaIds() - to get all schema IDs
 * - getAllSchemasArray() - to get all schemas as an array
 * 
 * CLIENT-SIDE (import from schema-registry):
 * - fetchSchemaById() - async fetch schema by ID
 * - fetchAllSchemas() - async fetch all schemas
 * 
 * To add a new schema:
 * 1. Add it to data/all-schemas.json
 * 2. Use the schema-registry utilities to access it
 * 
 * @see src/shared/utils/schema-registry.server.ts (server-side)
 * @see src/shared/utils/schema-registry.ts (client-side)
 * @see data/all-schemas.json
 */

// Re-export from schema-registry.server for backward compatibility (SERVER-SIDE ONLY)
export { 
  findSchemaById,
  getSchemaById,
  getAvailableSchemaIds as getAllSchemaIds,
  schemaExists,
  getAllSchemasArray,
  getSchemaMetadata,
  clearSchemaCache
} from '../utils/schema-registry.server';

