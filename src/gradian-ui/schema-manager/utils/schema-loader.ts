// Schema Loader Utility - SERVER SIDE ONLY
// Loads schemas from API endpoint and converts them to FormSchema objects
// This file is server-only and can only be imported in server components

import 'server-only';

import { FormSchema, FormField } from '../types/form-schema';
import { config } from '@/lib/config';
import { loggingCustom } from '@/shared/utils/logging-custom';
import { LogType } from '@/shared/constants/application-variables';

// Cache for loaded schemas
let cachedSchemas: FormSchema[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 60000; // 60 seconds cache TTL

// Cache instance ID for debugging (helps verify if same cache instance is used)
const CACHE_INSTANCE_ID = Math.random().toString(36).substring(7);

// Promise cache to prevent concurrent fetches
let fetchPromise: Promise<FormSchema[]> | null = null;

/**
 * Clear the schema cache (useful for testing or manual cache invalidation)
 */
export function clearSchemaCache(): void {
  cachedSchemas = null;
  cacheTimestamp = null;
  fetchPromise = null; // Clear any pending fetch promises
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
  // Note: In development, HMR will reset the cache, but we use a very long TTL
  // to keep it valid as long as the module isn't reloaded
  const now = Date.now();
  const cacheAge = now - cacheTimestamp;
  
  // Use very long cache TTL since schemas don't change frequently
  // Cache persists until server restart or manual cache clear
  // Only expires after 24 hours as a safety measure (should rarely happen)
  const ttl = 24 * 60 * 60 * 1000; // 24 hours (same for dev and production)
  
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
    const cacheAge = Date.now() - (cacheTimestamp || 0);
    loggingCustom(LogType.SCHEMA_LOADER, 'info', `✅ CACHE HIT [${CACHE_INSTANCE_ID}] - Returning ${cachedSchemas.length} schemas from cache (age: ${Math.round(cacheAge / 1000)}s)`);
    return cachedSchemas;
  }

  // If there's already a fetch in progress, wait for it instead of starting a new one
  if (fetchPromise) {
    loggingCustom(LogType.SCHEMA_LOADER, 'info', `⏳ [${CACHE_INSTANCE_ID}] Fetch already in progress, waiting for existing request...`);
    return await fetchPromise;
  }
  
  loggingCustom(LogType.SCHEMA_LOADER, 'info', `🔄 CACHE MISS [${CACHE_INSTANCE_ID}] - Fetching schemas from API...`);

  // Create a promise and store it to prevent concurrent fetches
  fetchPromise = (async () => {
    try {
      // Fetch schemas from API endpoint
      // Next.js handles relative URLs correctly for server-side internal calls
      const fetchUrl = getApiUrl();
      const startTime = Date.now();

      const response = await fetch(fetchUrl, {
        // Use no-store to ensure fresh data when cache is cleared
        // The in-memory cache provides performance, Next.js cache would persist stale data
        cache: 'no-store',
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
        loggingCustom(LogType.SCHEMA_LOADER, 'error', 'API response does not contain an array');
        cachedSchemas = [];
        cacheTimestamp = Date.now();
        return [];
      }

      // Process each schema to convert patterns
      const processedSchemas = result.data.map(processSchema);
      const fetchTime = Date.now() - startTime;

      // Update cache
      cachedSchemas = processedSchemas;
      cacheTimestamp = Date.now();

      // Log loaded schemas for debugging
      const schemaIds = processedSchemas.map((s: FormSchema) => s.id).join(', ');
      loggingCustom(LogType.SCHEMA_LOADER, 'info', `📥 [${CACHE_INSTANCE_ID}] FETCHED from API (${fetchTime}ms) - Cached ${processedSchemas.length} schemas: ${schemaIds}`);

      return processedSchemas;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      loggingCustom(LogType.SCHEMA_LOADER, 'error', `Error loading schemas from API: ${errorMessage}`);

      // If cache exists and API fails, return cached data as fallback
      if (cachedSchemas !== null) {
        loggingCustom(LogType.SCHEMA_LOADER, 'warn', 'API fetch failed, using cached schemas');
        return cachedSchemas;
      }

      // No cache available, return empty array
      cachedSchemas = [];
      cacheTimestamp = Date.now();
      return [];
    } finally {
      // Clear the promise cache after fetch completes (success or failure)
      fetchPromise = null;
    }
  })();

  return await fetchPromise;
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
 * @param schemaId - The ID of the schema to get
 * @returns The schema or null if not found
 */
export async function loadSchemaById(schemaId: string): Promise<FormSchema | null> {
  // First check cache - much faster than API call
  // Check both that cache exists AND is valid
  if (isCacheValid() && cachedSchemas !== null) {
    const cachedSchema = cachedSchemas.find(s => s.id === schemaId);
    if (cachedSchema) {
      loggingCustom(LogType.SCHEMA_LOADER, 'info', `✅ [${CACHE_INSTANCE_ID}] CACHE HIT for schema "${schemaId}"`);
      return cachedSchema;
    }
  }
  
  loggingCustom(LogType.SCHEMA_LOADER, 'info', `🔄 [${CACHE_INSTANCE_ID}] CACHE MISS for schema "${schemaId}" - Loading all schemas...`);

  // If not in cache, try to load all schemas (which will use cache or fetch)
  // This is more efficient than fetching a single schema
  // loadAllSchemas() handles its own caching, so we don't need to check again here
  const schemas = await loadAllSchemas();
  const schema = schemas.find(s => s.id === schemaId);

  if (schema) {
    loggingCustom(LogType.SCHEMA_LOADER, 'info', `✅ [${CACHE_INSTANCE_ID}] Found schema "${schemaId}" after loading all schemas`);
    return schema;
  }
  
  // Fallback: if cache is empty or schema not found, try direct API call
  loggingCustom(LogType.SCHEMA_LOADER, 'warn', `⚠️ [${CACHE_INSTANCE_ID}] Schema "${schemaId}" not found in cache, trying direct API call...`);
  try {
    const fetchUrl = getApiUrl(`/${schemaId}`);
    const startTime = Date.now();

    const response = await fetch(fetchUrl, {
      cache: 'no-store', // Use no-store to ensure fresh data
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
    const processedSchema = processSchema(result.data);
    const fetchTime = Date.now() - startTime;

      // Update cache with this schema if cache is empty
      if (cachedSchemas === null) {
        cachedSchemas = [processedSchema];
        cacheTimestamp = Date.now();
        loggingCustom(LogType.SCHEMA_LOADER, 'info', `📥 [${CACHE_INSTANCE_ID}] FETCHED schema "${schemaId}" from API (${fetchTime}ms) - Added to cache`);
      } else if (!cachedSchemas.find(s => s.id === schemaId)) {
        // Add to cache if not already there
        cachedSchemas.push(processedSchema);
        loggingCustom(LogType.SCHEMA_LOADER, 'info', `📥 [${CACHE_INSTANCE_ID}] FETCHED schema "${schemaId}" from API (${fetchTime}ms) - Added to existing cache`);
      }

    return processedSchema;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    loggingCustom(LogType.SCHEMA_LOADER, 'error', `Error loading schema ${schemaId} from API: ${errorMessage}`);
    return null;
  }
}

