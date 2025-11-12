// Schema Cache Clear API Route
// Clears all schema-related caches to force reload

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { isDemoModeEnabled, proxySchemaRequest } from '../utils';

/**
 * Clear cache from schema-loader (server-side cache)
 */
async function clearSchemaLoaderCache() {
  try {
    // Import and call clearSchemaCache from schema-loader
    const { clearSchemaCache } = await import('@/gradian-ui/schema-manager/utils/schema-loader');
    clearSchemaCache();
  } catch (error) {
    console.warn('Could not clear schema-loader cache:', error);
  }
}

/**
 * Clear cache from companies-loader (server-side cache)
 */
async function clearCompaniesLoaderCache() {
  try {
    // Import and call clearCompaniesCache from companies-loader
    const { clearCompaniesCache } = await import('@/gradian-ui/shared/utils/companies-loader');
    clearCompaniesCache();
  } catch (error) {
    console.warn('Could not clear companies-loader cache:', error);
  }
}

/**
 * Clear all caches using the general data-loader
 */
async function clearAllDataLoaderCaches() {
  try {
    // Import and call clearAllCaches from data-loader
    const { clearAllCaches } = await import('@/gradian-ui/shared/utils/data-loader');
    clearAllCaches();
  } catch (error) {
    console.warn('Could not clear data-loader caches:', error);
  }
}

/**
 * Clear cache from schema-registry.server (server-side cache)
 */
async function clearSchemaRegistryCache() {
  try {
    const { clearSchemaCache } = await import('@/gradian-ui/schema-manager/utils/schema-registry.server');
    clearSchemaCache();
  } catch (error) {
    console.warn('Could not clear schema-registry.server cache:', error);
  }
}

/**
 * Clear cache from API route handlers
 */
async function clearApiRouteCaches() {
  try {
    // Clear cache from [schema-id] route
    const { clearSchemaCache: clearSchemaIdCache } = await import('../[schema-id]/route');
    if (clearSchemaIdCache) {
      clearSchemaIdCache();
    }
  } catch (error) {
    console.warn('Could not clear [schema-id] route cache:', error);
  }

  try {
    // Clear cache from main schemas route
    const { clearSchemaCache: clearSchemasCache } = await import('../route');
    if (clearSchemasCache) {
      clearSchemasCache();
    }
  } catch (error) {
    console.warn('Could not clear schemas route cache:', error);
  }
}

/**
 * Revalidate Next.js page cache for all schema pages
 * This ensures that ISR pages are refreshed after clearing data cache
 */
async function revalidateSchemaPages() {
  try {
    // Get all schema IDs to revalidate their pages
    // Note: Cache is cleared first, so this will load fresh data from source
    const { getAvailableSchemaIds } = await import('@/gradian-ui/schema-manager/utils/schema-registry.server');
    const schemaIds = await getAvailableSchemaIds();

    // Revalidate each schema page
    // Revalidating the page path will also invalidate child routes (detail pages)
    for (const schemaId of schemaIds) {
      try {
        // Revalidate the main schema page
        revalidatePath(`/page/${schemaId}`, 'page');
        // Revalidate layout to ensure all routes under this path are refreshed
        revalidatePath(`/page/${schemaId}`, 'layout');
      } catch (error) {
        console.warn(`Could not revalidate page for schema ${schemaId}:`, error);
      }
    }

    // Also revalidate the base page route to catch any edge cases
    try {
      revalidatePath('/page', 'page');
      revalidatePath('/page', 'layout');
    } catch (error) {
      console.warn('Could not revalidate base page route:', error);
    }
  } catch (error) {
    console.warn('Could not revalidate schema pages:', error);
    // Don't throw - cache clearing should still succeed even if revalidation fails
  }
}

async function clearLocalCaches() {
  await Promise.all([
    clearAllDataLoaderCaches(),
    clearSchemaLoaderCache(),
    clearCompaniesLoaderCache(),
    clearSchemaRegistryCache(),
    clearApiRouteCaches(),
  ]);

  await revalidateSchemaPages();
}

/**
 * POST - Clear all caches (schemas, companies, and all data-loader caches)
 * Example: POST /api/schemas/clear-cache
 */
export async function POST(request: NextRequest) {
  // Always clear local caches first
  try {
    await clearLocalCaches();
  } catch (error) {
    console.warn('Local cache clearing failed:', error);
  }

  // If DEMO_MODE is false, also try to proxy to remote API if configured
  // But don't fail if proxy fails - we've already cleared local caches
  if (!isDemoModeEnabled()) {
    try {
      const proxyResponse = await proxySchemaRequest(request, '/api/schemas/clear-cache');
      // If proxy succeeds, return its response
      if (proxyResponse.status < 400) {
        return proxyResponse;
      }
    } catch (error) {
      // Proxy failed, but that's okay - we've already cleared local caches
      console.warn('Proxy to remote API failed, but local caches were cleared:', error);
    }
  }

  // Always return success response (local caches are cleared)
  return NextResponse.json({
    success: true,
    message: 'All caches cleared successfully',
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET - Clear all caches (for convenience)
 * Example: GET /api/schemas/clear-cache
 */
export async function GET(request: NextRequest) {
  // Always clear local caches first
  try {
    await clearLocalCaches();
  } catch (error) {
    console.warn('Local cache clearing failed:', error);
  }

  // If DEMO_MODE is false, also try to proxy to remote API if configured
  // But don't fail if proxy fails - we've already cleared local caches
  if (!isDemoModeEnabled()) {
    try {
      const proxyResponse = await proxySchemaRequest(request, '/api/schemas/clear-cache');
      // If proxy succeeds, return its response
      if (proxyResponse.status < 400) {
        return proxyResponse;
      }
    } catch (error) {
      // Proxy failed, but that's okay - we've already cleared local caches
      console.warn('Proxy to remote API failed, but local caches were cleared:', error);
    }
  }

  // Always return success response (local caches are cleared)
  return NextResponse.json({
    success: true,
    message: 'All caches cleared successfully',
    timestamp: new Date().toISOString(),
  });
}

