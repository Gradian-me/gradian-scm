// Schema Loader Utility - SERVER SIDE ONLY
// Loads schemas from API endpoint and converts them to FormSchema objects
// This file is server-only and can only be imported in server components

import 'server-only';

import { FormSchema, FormField } from '../types/form-schema';
import { config } from '../../lib/config';

// Cache for loaded schemas
let cachedSchemas: FormSchema[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 60000; // 60 seconds cache TTL

/**
 * Clear the schema cache (useful for testing or manual cache invalidation)
 */
export function clearSchemaCache(): void {
  cachedSchemas = null;
  cacheTimestamp = null;
}

/**
 * Get the API URL for internal server-side calls
 * Server-side fetch requires absolute URLs, so we construct them here
 */
function getApiUrl(path: string = ''): string {
  // Use schemaApi.basePath from config
  const apiBase = config.schemaApi.basePath;
  
  // If it's already a full URL, use it as-is
  if (apiBase.startsWith('http')) {
    return path ? `${apiBase}${path}` : apiBase;
  }
  
  // For relative URLs, construct absolute URL for server-side fetch
  // Priority: NEXTAUTH_URL > VERCEL_URL > localhost (default for development)
  let baseUrl = process.env.NEXTAUTH_URL;
  
  if (!baseUrl) {
    // Use Vercel URL if available (for Vercel deployments)
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      // Default to localhost for local development
      const port = process.env.PORT || '3000';
      baseUrl = `http://localhost:${port}`;
    }
  }
  
  // Clean and combine paths
  const cleanBase = apiBase.startsWith('/') ? apiBase : `/${apiBase}`;
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  
  // Remove trailing slash from baseUrl if present
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${normalizedBase}${cleanBase}${cleanPath}`;
}

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
  if (cachedSchemas === null || cacheTimestamp === null) {
    return false;
  }
  
  // Check if cache has expired (TTL-based)
  const now = Date.now();
  const cacheAge = now - cacheTimestamp;
  
  // In development, use shorter cache TTL
  // In production, cache longer
  const ttl = process.env.NODE_ENV === 'development' 
    ? CACHE_TTL / 2  // 30 seconds in dev
    : CACHE_TTL * 10; // 10 minutes in production
  
  return cacheAge < ttl;
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
  } catch (error) {
    console.warn(`Invalid pattern: ${pattern}`, error);
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
 * @returns Array of FormSchema objects
 */
export async function loadAllSchemas(): Promise<FormSchema[]> {
  // Return cached schemas if available and valid
  if (isCacheValid() && cachedSchemas !== null) {
    return cachedSchemas;
  }
  
  try {
    // Fetch schemas from API endpoint
    // Next.js handles relative URLs correctly for server-side internal calls
    const fetchUrl = getApiUrl();
    
    const response = await fetch(fetchUrl, {
      // Use cache for internal requests but allow revalidation
      cache: 'no-store', // Always fetch fresh data, then cache it ourselves
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch schemas: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load schemas from API');
    }
    
    if (!Array.isArray(result.data)) {
      console.error('API response does not contain an array');
      cachedSchemas = [];
      cacheTimestamp = Date.now();
      return [];
    }
    
    // Process each schema to convert patterns
    const processedSchemas = result.data.map(processSchema);
    
    // Update cache
    cachedSchemas = processedSchemas;
    cacheTimestamp = Date.now();
    
    // Log loaded schemas for debugging
    console.log(`[Schema Loader] Loaded ${processedSchemas.length} schemas from API:`, processedSchemas.map((s: FormSchema) => s.id));
    
    return processedSchemas;
  } catch (error) {
    console.error('Error loading schemas from API:', error);
    
    // If cache exists and API fails, return cached data as fallback
    if (cachedSchemas !== null) {
      console.warn('[Schema Loader] API fetch failed, using cached schemas');
      return cachedSchemas;
    }
    
    // No cache available, return empty array
    cachedSchemas = [];
    cacheTimestamp = Date.now();
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
 * Get a single schema by ID
 * @param schemaId - The ID of the schema to get
 * @returns The schema or null if not found
 */
export async function loadSchemaById(schemaId: string): Promise<FormSchema | null> {
  try {
    // Fetch single schema from API endpoint
    const fetchUrl = getApiUrl(`/${schemaId}`);
    
    const response = await fetch(fetchUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return null;
    }
    
    // Process the schema to convert string patterns to RegExp
    return processSchema(result.data);
  } catch (error) {
    console.error(`Error loading schema ${schemaId} from API:`, error);
    
    // Fallback: try to find in cached schemas if available
    if (cachedSchemas !== null) {
      const schema = cachedSchemas.find(s => s.id === schemaId);
      if (schema) {
        return schema;
      }
    }
    
    return null;
  }
}

