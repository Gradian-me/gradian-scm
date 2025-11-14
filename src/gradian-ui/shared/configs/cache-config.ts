/**
 * Cache Configuration
 * Defines cache settings (TTL) for different routes and data types
 * Used by both server-side loaders and client-side React Query hooks
 */

export interface RouteCacheConfig {
  /** Time To Live in milliseconds - how long data is considered fresh */
  ttl: number;
  /** Client-side React Query staleTime in milliseconds */
  staleTime?: number;
  /** Client-side React Query gcTime (garbage collection time) in milliseconds */
  gcTime?: number;
  /** React Query keys that should be invalidated when this route cache is cleared */
  reactQueryKeys?: string[];
  /** Description for documentation */
  description?: string;
}

/**
 * Cache configuration for different routes and data types
 * TTL values are in milliseconds
 */
export const CACHE_CONFIG: Record<string, RouteCacheConfig> = {
  // Schema routes
  schemas: {
    ttl: 10 * 60 * 1000, // 10 minutes - server-side cache
    staleTime: 10 * 60 * 1000, // 10 minutes - React Query stale time
    gcTime: 30 * 60 * 1000, // 30 minutes - React Query garbage collection
    reactQueryKeys: ['schemas'],
    description: 'All schemas list',
  },
  'schemas/:id': {
    ttl: 10 * 60 * 1000, // 10 minutes - server-side cache
    staleTime: 10 * 60 * 1000, // 10 minutes - React Query stale time
    gcTime: 30 * 60 * 1000, // 30 minutes - React Query garbage collection
    reactQueryKeys: ['schemas'],
    description: 'Single schema by ID',
  },
  
  // Company routes
  companies: {
    ttl: 15 * 60 * 1000, // 15 minutes - server-side cache
    staleTime: 15 * 60 * 1000, // 15 minutes - React Query stale time
    gcTime: 30 * 60 * 1000, // 30 minutes - React Query garbage collection
    reactQueryKeys: ['companies'],
    description: 'Companies list',
  },
  'companies/:id': {
    ttl: 15 * 60 * 1000, // 15 minutes - server-side cache
    staleTime: 15 * 60 * 1000, // 15 minutes - React Query stale time
    gcTime: 30 * 60 * 1000, // 30 minutes - React Query garbage collection
    reactQueryKeys: ['companies'],
    description: 'Single company by ID',
  },
  
  // Data routes (dynamic entity routes)
  'data/:schemaId': {
    ttl: 5 * 60 * 1000, // 5 minutes - server-side cache
    staleTime: 2 * 60 * 1000, // 2 minutes - React Query stale time (shorter for data)
    gcTime: 10 * 60 * 1000, // 10 minutes - React Query garbage collection
    reactQueryKeys: ['entities'],
    description: 'Entity list by schema ID',
  },
  'data/:schemaId/:id': {
    ttl: 5 * 60 * 1000, // 5 minutes - server-side cache
    staleTime: 2 * 60 * 1000, // 2 minutes - React Query stale time
    gcTime: 10 * 60 * 1000, // 10 minutes - React Query garbage collection
    reactQueryKeys: ['entities'],
    description: 'Single entity by schema ID and entity ID',
  },
  
  // Relation types
  'relation-types': {
    ttl: 15 * 60 * 1000, // 15 minutes - server-side cache
    staleTime: 15 * 60 * 1000, // 15 minutes - React Query stale time
    gcTime: 30 * 60 * 1000, // 30 minutes - React Query garbage collection
    reactQueryKeys: ['relation-types'],
    description: 'Relation types list',
  },
  'relation-types/:id': {
    ttl: 15 * 60 * 1000, // 15 minutes - server-side cache
    staleTime: 15 * 60 * 1000, // 15 minutes - React Query stale time
    gcTime: 30 * 60 * 1000, // 30 minutes - React Query garbage collection
    reactQueryKeys: ['relation-types'],
    description: 'Single relation type by ID',
  },
  
  // Relations
  'relations': {
    ttl: 2 * 60 * 1000, // 2 minutes - server-side cache (shorter for relations)
    staleTime: 1 * 60 * 1000, // 1 minute - React Query stale time
    gcTime: 5 * 60 * 1000, // 5 minutes - React Query garbage collection
    reactQueryKeys: ['relations'],
    description: 'Relations data',
  },
};

/**
 * Get cache configuration for a route
 * @param routeKey - Route key (e.g., 'schemas', 'companies', 'data/:schemaId')
 * @returns Cache configuration or default configuration
 */
export function getCacheConfig(routeKey: string): RouteCacheConfig {
  // Try exact match first
  if (CACHE_CONFIG[routeKey]) {
    return CACHE_CONFIG[routeKey];
  }
  
  // Try pattern matching for dynamic routes (e.g., 'data/inquiries' matches 'data/:schemaId')
  for (const [pattern, config] of Object.entries(CACHE_CONFIG)) {
    if (pattern.includes(':')) {
      // Convert pattern to regex (e.g., 'data/:schemaId' -> /^data\/[^/]+$/)
      const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+').replace(/\//g, '\\/');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(routeKey)) {
        return config;
      }
    }
  }
  
  // Default configuration
  return {
    ttl: 10 * 60 * 1000, // 10 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    reactQueryKeys: [],
    description: 'Default cache configuration',
  };
}

/**
 * Get cache configuration for a route by API path
 * @param apiPath - API path (e.g., '/api/schemas', '/api/schemas/inquiries', '/api/data/companies')
 * @returns Cache configuration or default configuration
 */
export function getCacheConfigByPath(apiPath: string): RouteCacheConfig {
  // Remove leading '/api/' and trailing slashes
  const cleanPath = apiPath.replace(/^\/api\//, '').replace(/\/$/, '');
  
  // Extract route key (handle dynamic routes)
  let routeKey = cleanPath;
  
  // Handle dynamic data routes (e.g., '/api/data/inquiries' -> 'data/:schemaId')
  if (cleanPath.startsWith('data/')) {
    const parts = cleanPath.split('/');
    if (parts.length >= 2) {
      routeKey = `data/:schemaId`;
      // If there's an ID part, it's a single entity route
      if (parts.length === 3) {
        routeKey = `data/:schemaId/:id`;
      }
    }
  } else if (cleanPath.startsWith('schemas/') && cleanPath.split('/').length === 2) {
    // Single schema route (e.g., '/api/schemas/inquiries' -> 'schemas/:id')
    routeKey = 'schemas/:id';
  } else if (cleanPath.startsWith('companies/') && cleanPath.split('/').length === 2) {
    // Single company route
    routeKey = 'companies/:id';
  } else if (cleanPath.startsWith('relation-types/') && cleanPath.split('/').length === 2) {
    // Single relation type route
    routeKey = 'relation-types/:id';
  }
  
  return getCacheConfig(routeKey);
}

/**
 * Helper to convert milliseconds to human-readable time
 */
export function formatCacheTime(ms: number): string {
  if (ms < 60 * 1000) {
    return `${Math.round(ms / 1000)}s`;
  } else if (ms < 60 * 60 * 1000) {
    return `${Math.round(ms / (60 * 1000))}m`;
  } else {
    return `${Math.round(ms / (60 * 60 * 1000))}h`;
  }
}

/**
 * Get unique list of React Query keys referenced in cache config
 */
export function getAllReactQueryKeys(): string[] {
  const keys = new Set<string>();
  Object.values(CACHE_CONFIG).forEach(config => {
    config.reactQueryKeys?.forEach(key => keys.add(key));
  });
  return Array.from(keys);
}

