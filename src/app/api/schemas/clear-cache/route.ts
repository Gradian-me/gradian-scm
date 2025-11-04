// Schema Cache Clear API Route
// Clears all schema-related caches to force reload

import { NextRequest, NextResponse } from 'next/server';

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
    const { clearCompaniesCache } = await import('@/shared/utils/companies-loader');
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
    const { clearAllCaches } = await import('@/shared/utils/data-loader');
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
 * POST - Clear all caches (schemas, companies, and all data-loader caches)
 * Example: POST /api/schemas/clear-cache
 */
export async function POST(request: NextRequest) {
  try {
    // Clear all caches - this will clear schemas, companies, and any other cached routes
    await Promise.all([
      clearAllDataLoaderCaches(), // This clears all caches from the general loader
      clearSchemaLoaderCache(), // Legacy schema loader cache
      clearCompaniesLoaderCache(), // Companies loader cache
      clearSchemaRegistryCache(), // Schema registry cache
      clearApiRouteCaches(), // API route caches
    ]);

    return NextResponse.json({
      success: true,
      message: 'All caches cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing caches:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear caches',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Clear all caches (for convenience)
 * Example: GET /api/schemas/clear-cache
 */
export async function GET(request: NextRequest) {
  try {
    // Clear all caches - this will clear schemas, companies, and any other cached routes
    await Promise.all([
      clearAllDataLoaderCaches(), // This clears all caches from the general loader
      clearSchemaLoaderCache(), // Legacy schema loader cache
      clearCompaniesLoaderCache(), // Companies loader cache
      clearSchemaRegistryCache(), // Schema registry cache
      clearApiRouteCaches(), // API route caches
    ]);

    return NextResponse.json({
      success: true,
      message: 'All caches cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing caches:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear caches',
      },
      { status: 500 }
    );
  }
}

