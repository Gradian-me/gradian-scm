# Cache Clearing Explanation

## The Problem
When you cleared the cache, the data caches were cleared, but **Next.js ISR (Incremental Static Regeneration) page cache** was NOT being cleared. This is why pages at `/page/[schema-id]` were still showing old schemas.

## Cache Layers in Your Application

Your application has **multiple cache layers** that need to be cleared:

### 1. **In-Memory Data Caches** (Server-side JavaScript)
These are cleared by the functions you're asking about:

#### `clearAllDataLoaderCaches()`
- **What it does**: Clears the global `cacheRegistry` Map in `data-loader.ts`
- **What it stores**: In-memory cache of API responses (schemas, companies, etc.)
- **Cache structure**: `Map<routeKey, { cache: CacheEntry, fetchPromise: Promise }>`
- **Why needed**: This is the base cache used by `schema-loader` and other loaders

#### `clearSchemaLoaderCache()`
- **What it does**: Calls `clearDataCache('schemas')` which clears the 'schemas' entry from `data-loader` cache
- **What it stores**: Processed schema data (with RegExp patterns converted)
- **Why needed**: Legacy schema loader that uses `data-loader` internally

#### `clearSchemaRegistryCache()`
- **What it does**: Sets `schemasCache = null` in `schema-registry.server.ts`
- **What it stores**: A separate cache of schemas as a `Record<string, FormSchema>`
- **TTL**: 5 seconds in dev, no expiry in production
- **Why needed**: This is a different cache layer used by `getAvailableSchemaIds()` and other server functions

#### `clearApiRouteCaches()`
- **What it does**: Clears in-memory caches in API route handlers
  - `/api/schemas/route.ts` - `cachedSchemas = null`
  - `/api/schemas/[schema-id]/route.ts` - `cachedSchemas = null`
- **What it stores**: Raw schema JSON data from file reads
- **TTL**: 60 seconds
- **Why needed**: API routes have their own caching to avoid reading files on every request

#### `clearCompaniesLoaderCache()`
- **What it does**: Clears company-related caches
- **Why needed**: Companies have their own cache system

### 2. **Next.js ISR Page Cache** (What was missing!)
- **What it stores**: Pre-rendered HTML pages at `/page/[schema-id]`
- **Revalidation**: 60 seconds (from `export const revalidate = 60`)
- **Why it wasn't cleared**: The original clear cache functions only cleared in-memory data caches, not Next.js's page cache

## The Solution

Added `revalidateSchemaPages()` which:
- Uses Next.js `revalidatePath()` API to invalidate the ISR page cache
- Revalidates all `/page/[schema-id]` pages
- Forces Next.js to regenerate pages with fresh data on next request

## Cache Flow

```
User clicks "Clear Cache"
    ↓
1. clearAllDataLoaderCaches()      → Clears data-loader Map cache
2. clearSchemaLoaderCache()         → Clears 'schemas' entry from data-loader
3. clearSchemaRegistryCache()       → Clears schema-registry.server cache
4. clearApiRouteCaches()           → Clears API route in-memory caches
5. clearCompaniesLoaderCache()     → Clears company caches
    ↓
6. revalidateSchemaPages()         → NEW: Clears Next.js ISR page cache
    ↓
Next request to /page/[schema-id] will:
  - Load fresh schema data (caches are cleared)
  - Regenerate page with new data (ISR cache invalidated)
```

## Why All These Caches Exist

1. **Performance**: Avoid reading files/API on every request
2. **Different use cases**: Different parts of the app use different cache layers
3. **Legacy code**: Some are from older implementations that haven't been consolidated

## Summary

**Yes, these functions ARE clearing caches** - they're clearing the in-memory data caches. But they weren't clearing the **Next.js page cache**, which is why you still saw old schemas. The fix adds `revalidatePath()` to also clear the Next.js ISR cache.

