// Schemas API Route
// Serves all schemas from the JSON file

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { isDemoModeEnabled, proxySchemaRequest } from './utils';
import { getCacheConfigByPath } from '@/gradian-ui/shared/configs/cache-config';
import { loadData, clearCache } from '@/gradian-ui/shared/utils/data-loader';
import { LogType } from '@/gradian-ui/shared/constants/application-variables';

// Get cache configuration
const CACHE_CONFIG = getCacheConfigByPath('/api/schemas');

/**
 * Clear schema cache (useful for development)
 */
export function clearSchemaCache() {
  clearCache('schemas');
}

/**
 * Load schemas with shared cache
 */
async function loadSchemas(): Promise<any[]> {
  return await loadData<any[]>('schemas', '/api/schemas', {
    ttl: CACHE_CONFIG.ttl,
    logType: LogType.SCHEMA_LOADER,
    fetcher: async () => {
      const dataPath = path.join(process.cwd(), 'data', 'all-schemas.json');
      
      if (!fs.existsSync(dataPath)) {
        return [];
      }
      
      const fileContents = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(fileContents);
    },
  });
}

/**
 * GET - Get all schemas or a specific schema by ID
 * Example: 
 * - GET /api/schemas - returns all schemas
 * - GET /api/schemas?id=vendors - returns only vendors schema
 */
export async function GET(request: NextRequest) {
  if (!isDemoModeEnabled()) {
    return proxySchemaRequest(request, `/api/schemas${request.nextUrl.search}`);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const schemaId = searchParams.get('id');

    // Load schemas (with caching)
    const schemas = await loadSchemas();
    
    if (!schemas || schemas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schemas file not found or empty' },
        { status: 404 }
      );
    }

    // If specific schema ID requested, return only that schema
    if (schemaId) {
      const schema = schemas.find((s: any) => s.id === schemaId);
      
      if (!schema) {
        return NextResponse.json(
          { success: false, error: `Schema with ID "${schemaId}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: schema
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Return all schemas with cache-busting headers
    return NextResponse.json({
      success: true,
      data: schemas
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error loading schemas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load schemas' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new schema
 * Example: POST /api/schemas - creates a new schema
 */
export async function POST(request: NextRequest) {
  const newSchema = await request.json();

  if (!isDemoModeEnabled()) {
    return proxySchemaRequest(request, '/api/schemas', { body: newSchema });
  }

  try {
    // Load schemas (with caching)
    const schemas = await loadSchemas();
    
    if (!schemas || schemas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schemas file not found or empty' },
        { status: 404 }
      );
    }

    // Check if schema with same ID already exists
    const existingSchema = schemas.find((s: any) => s.id === newSchema.id);
    
    if (existingSchema) {
      return NextResponse.json(
        { success: false, error: `Schema with ID "${newSchema.id}" already exists` },
        { status: 409 }
      );
    }

    // Add the new schema
    schemas.push(newSchema);

    // Write back to file
    const schemaFilePath = path.join(process.cwd(), 'data', 'all-schemas.json');
    fs.writeFileSync(schemaFilePath, JSON.stringify(schemas, null, 2), 'utf8');
    
    // Clear cache to force reload on next request
    clearCache('schemas');

    return NextResponse.json({
      success: true,
      data: newSchema,
      message: `Schema "${newSchema.id}" created successfully`
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating schema:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create schema' 
      },
      { status: 500 }
    );
  }
}

