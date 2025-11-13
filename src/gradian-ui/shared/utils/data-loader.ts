// General Data Loader Utility - SERVER SIDE ONLY
// Generic loader for caching data from API endpoints
// This file is server-only and can only be imported in server components

import 'server-only';

import { loggingCustom } from '@/gradian-ui/shared/utils/logging-custom';
import { LogType } from '@/gradian-ui/shared/constants/application-variables';
import { getCacheConfigByPath } from '@/gradian-ui/shared/configs/cache-config';

// Cache storage structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global cache registry
const cacheRegistry = new Map<string, {
  cache: CacheEntry<any> | null;
  fetchPromise: Promise<any> | null;
  instanceId: string;
}>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours default TTL

/**
 * Get the API URL for internal server-side calls
 * Server-side fetch requires absolute URLs, so we construct them here
 */
function getApiUrl(apiPath: string): string {
  // If it's already a full URL, use it as-is
  if (apiPath.startsWith('http')) {
    return apiPath;
  }

  // Check if we're in a build context (Next.js build time)
  // During build, API routes aren't available, so we should avoid fetch calls
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.NEXTAUTH_URL;

  // For relative URLs, construct absolute URL for server-side fetch
  // Priority: NEXTAUTH_URL > VERCEL_URL > localhost (default for development)
  let baseUrl = process.env.NEXTAUTH_URL;

  if (!baseUrl) {
    // Use Vercel URL if available (for Vercel deployments)
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (!isBuildTime) {
      // Default to localhost for local development (but not during build)
      const port = process.env.PORT || '3000';
      baseUrl = `http://localhost:${port}`;
    } else {
      // During build, return a placeholder that will fail gracefully
      // This should not be reached if build-time code paths are correct
      baseUrl = 'http://localhost:3000';
    }
  }

  // Clean and combine paths
  const cleanPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;

  // Remove trailing slash from baseUrl if present
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return `${normalizedBase}${cleanPath}`;
}

/**
 * Check if cache is still valid
 */
function isCacheValid(cacheEntry: CacheEntry<any> | null, ttl: number = CACHE_TTL): boolean {
  if (cacheEntry === null) {
    return false;
  }

  const now = Date.now();
  const cacheAge = now - cacheEntry.timestamp;
  
  return cacheAge < ttl;
}

/**
 * Initialize cache entry for a route if it doesn't exist
 */
function initializeCacheEntry(routeKey: string) {
  if (!cacheRegistry.has(routeKey)) {
    cacheRegistry.set(routeKey, {
      cache: null,
      fetchPromise: null,
      instanceId: Math.random().toString(36).substring(7),
    });
  }
}

/**
 * Clear cache for a specific route
 */
export function clearCache(routeKey: string): void {
  const entry = cacheRegistry.get(routeKey);
  if (entry) {
    entry.cache = null;
    entry.fetchPromise = null;
    loggingCustom(LogType.SCHEMA_LOADER, 'info', `🗑️ [${entry.instanceId}] Cache cleared for route: ${routeKey}`);
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  const clearedRoutes: string[] = [];
  cacheRegistry.forEach((entry, routeKey) => {
    entry.cache = null;
    entry.fetchPromise = null;
    clearedRoutes.push(routeKey);
  });
  loggingCustom(LogType.SCHEMA_LOADER, 'info', `🗑️ Cleared all caches for routes: ${clearedRoutes.join(', ')}`);
}

/**
 * Load data from API endpoint with caching
 * @param routeKey - Unique key for this route (e.g., 'schemas', 'companies')
 * @param apiPath - API endpoint path (e.g., '/api/schemas', '/api/data/companies')
 * @param options - Optional configuration
 * @returns The data from API
 */
export async function loadData<T = any>(
  routeKey: string,
  apiPath: string,
  options?: {
    ttl?: number;
    processor?: (data: any) => T;
    logType?: LogType;
  }
): Promise<T> {
  // Get cache configuration from config file, fallback to options.ttl or default
  const cacheConfig = getCacheConfigByPath(apiPath);
  const { ttl = cacheConfig.ttl, processor, logType = LogType.SCHEMA_LOADER } = options || {};
  
  initializeCacheEntry(routeKey);
  const entry = cacheRegistry.get(routeKey)!;
  const { cache, fetchPromise, instanceId } = entry;

  // Return cached data if available and valid
  if (isCacheValid(cache, ttl) && cache !== null) {
    const cacheAge = Date.now() - cache.timestamp;
    loggingCustom(logType, 'info', `✅ CACHE HIT [${instanceId}] - Returning cached data for route "${routeKey}" (age: ${Math.round(cacheAge / 1000)}s)`);
    return cache.data as T;
  }

  // If there's already a fetch in progress, wait for it instead of starting a new one
  if (fetchPromise) {
    loggingCustom(logType, 'info', `⏳ [${instanceId}] Fetch already in progress for route "${routeKey}", waiting for existing request...`);
    return await fetchPromise;
  }
  
  loggingCustom(logType, 'info', `🔄 CACHE MISS [${instanceId}] - Fetching data from API for route "${routeKey}"...`);

  // Create a promise and store it to prevent concurrent fetches
  const promise = (async () => {
    try {
      const fetchUrl = getApiUrl(apiPath);
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
        throw new Error(`Failed to fetch data from ${apiPath}: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || `Failed to load data from ${apiPath}`);
      }

      // Process data if processor is provided
      const processedData = processor ? processor(result.data) : result.data;
      const fetchTime = Date.now() - startTime;

      // Update cache
      entry.cache = {
        data: processedData,
        timestamp: Date.now(),
      };

      loggingCustom(logType, 'info', `📥 [${instanceId}] FETCHED from API (${fetchTime}ms) - Cached data for route "${routeKey}"`);

      return processedData as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isConnectionError = error instanceof Error && (
        errorMessage.includes('ECONNREFUSED') || 
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('connect')
      );
      
      // During build time, connection errors are expected - return empty array/object
      const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
      
      if (isConnectionError && isBuildTime) {
        loggingCustom(logType, 'warn', `Build-time connection error for route "${routeKey}" (expected during static generation) - returning empty data`);
        // Return empty array or object based on expected type
        const emptyData = (Array.isArray(cache?.data) ? [] : {}) as T;
        return emptyData;
      }
      
      loggingCustom(logType, 'error', `Error loading data from ${apiPath}: ${errorMessage}`);

      // If cache exists and API fails, return cached data as fallback
      if (cache !== null) {
        loggingCustom(logType, 'warn', `API fetch failed for route "${routeKey}", using cached data`);
        return cache.data as T;
      }

      // No cache available, throw error
      throw error;
    } finally {
      // Clear the promise cache after fetch completes (success or failure)
      entry.fetchPromise = null;
    }
  })();

  entry.fetchPromise = promise;
  return await promise;
}

/**
 * Load data by ID from API endpoint with caching
 * @param routeKey - Unique key for this route (e.g., 'schemas', 'companies')
 * @param apiBasePath - Base API endpoint path (e.g., '/api/schemas', '/api/data/companies')
 * @param id - The ID to fetch
 * @param options - Optional configuration
 * @returns The data item or null if not found
 */
export async function loadDataById<T = any>(
  routeKey: string,
  apiBasePath: string,
  id: string,
  options?: {
    ttl?: number;
    processor?: (data: any) => T;
    findInCache?: (cache: any, id: string) => T | null;
    logType?: LogType;
  }
): Promise<T | null> {
  // Get cache configuration from config file, fallback to options.ttl or default
  const cacheConfig = getCacheConfigByPath(`${apiBasePath}/${id}`);
  const { ttl = cacheConfig.ttl, processor, findInCache, logType = LogType.SCHEMA_LOADER } = options || {};
  
  initializeCacheEntry(routeKey);
  const entry = cacheRegistry.get(routeKey)!;
  const { cache, instanceId } = entry;

  // First check cache - much faster than API call
  if (isCacheValid(cache, ttl) && cache !== null) {
    if (findInCache) {
      const cachedItem = findInCache(cache.data, id);
      if (cachedItem) {
        loggingCustom(logType, 'info', `✅ [${instanceId}] CACHE HIT for "${routeKey}" ID "${id}"`);
        return cachedItem;
      }
    } else if (Array.isArray(cache.data)) {
      // Default: find by id property in array
      const cachedItem = cache.data.find((item: any) => item.id === id);
      if (cachedItem) {
        loggingCustom(logType, 'info', `✅ [${instanceId}] CACHE HIT for "${routeKey}" ID "${id}"`);
        return cachedItem as T;
      }
    }
  }
  
  loggingCustom(logType, 'info', `🔄 [${instanceId}] CACHE MISS for "${routeKey}" ID "${id}" - Loading from API...`);

  try {
    const fetchUrl = getApiUrl(`${apiBasePath}/${id}`);
    const startTime = Date.now();

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

    // Process the data if processor is provided
    const processedData = processor ? processor(result.data) : result.data;
    const fetchTime = Date.now() - startTime;

    // Update cache with this item if cache is empty or doesn't contain it
    // Always store items in an array for incremental caching
    if (cache === null) {
      // Initialize cache as an array containing the first item
      entry.cache = {
        data: Array.isArray(processedData) ? processedData : [processedData],
        timestamp: Date.now(),
      };
      loggingCustom(logType, 'info', `📥 [${instanceId}] FETCHED "${routeKey}" ID "${id}" from API (${fetchTime}ms) - Added to cache`);
    } else if (Array.isArray(cache.data)) {
      // Add to cache if not already there
      const existingIndex = cache.data.findIndex((item: any) => item.id === id);
      if (existingIndex === -1) {
        cache.data.push(processedData);
        entry.cache = {
          ...cache,
          timestamp: Date.now(), // Update timestamp
        };
        loggingCustom(logType, 'info', `📥 [${instanceId}] FETCHED "${routeKey}" ID "${id}" from API (${fetchTime}ms) - Added to existing cache`);
      } else {
        // Update existing item if it already exists
        cache.data[existingIndex] = processedData;
        entry.cache = {
          ...cache,
          timestamp: Date.now(), // Update timestamp
        };
        loggingCustom(logType, 'info', `📥 [${instanceId}] FETCHED "${routeKey}" ID "${id}" from API (${fetchTime}ms) - Updated in cache`);
      }
    } else {
      // Cache exists but is not an array - convert it to an array
      // This handles edge cases where cache might have been initialized differently
      const existingData = cache.data;
      entry.cache = {
        data: Array.isArray(existingData) 
          ? [...existingData, processedData]
          : [existingData, processedData],
        timestamp: Date.now(),
      };
      loggingCustom(logType, 'info', `📥 [${instanceId}] FETCHED "${routeKey}" ID "${id}" from API (${fetchTime}ms) - Converted cache to array and added item`);
    }

    return processedData as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    loggingCustom(logType, 'error', `Error loading "${routeKey}" ID "${id}" from API: ${errorMessage}`);
    return null;
  }
}

