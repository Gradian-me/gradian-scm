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
 * POST - Clear all schema caches
 * Example: POST /api/schemas/clear-cache
 */
export async function POST(request: NextRequest) {
  try {
    // Clear all schema caches
    await Promise.all([
      clearSchemaLoaderCache(),
      clearSchemaRegistryCache(),
      clearApiRouteCaches(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Schema cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing schema cache:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear schema cache',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Clear all schema caches (for convenience)
 * Example: GET /api/schemas/clear-cache
 */
export async function GET(request: NextRequest) {
  try {
    // Clear all schema caches
    await Promise.all([
      clearSchemaLoaderCache(),
      clearSchemaRegistryCache(),
      clearApiRouteCaches(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Schema cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing schema cache:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear schema cache',
      },
      { status: 500 }
    );
  }
}

