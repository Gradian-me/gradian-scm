// Schemas API Route
// Serves all schemas from the JSON file

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache for loaded schemas
let cachedSchemas: any[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 60000; // 60 seconds cache TTL

/**
 * Load schemas with caching
 */
function loadSchemas(): any[] {
  const now = Date.now();
  
  // Return cache if valid
  if (cachedSchemas !== null && cacheTimestamp !== null && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedSchemas;
  }
  
  // Read and cache schemas
  const dataPath = path.join(process.cwd(), 'data', 'all-schemas.json');
  
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  cachedSchemas = JSON.parse(fileContents);
  cacheTimestamp = now;
  
  return cachedSchemas || [];
}

/**
 * GET - Get all schemas or a specific schema by ID
 * Example: 
 * - GET /api/schemas - returns all schemas
 * - GET /api/schemas?id=vendors - returns only vendors schema
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schemaId = searchParams.get('id');

    // Load schemas (with caching)
    const schemas = loadSchemas();
    
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
      });
    }

    // Return all schemas
    return NextResponse.json({
      success: true,
      data: schemas
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
  try {
    const newSchema = await request.json();

    // Load schemas (with caching)
    const schemas = loadSchemas();
    
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
    cachedSchemas = null;
    cacheTimestamp = null;

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

