// Schemas API Route - Dynamic Route for individual schemas
// Serves a specific schema by ID from the JSON file

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
 * GET - Get a specific schema by ID
 * Example: 
 * - GET /api/schemas/vendors - returns only vendors schema
 * - GET /api/schemas/tenders - returns only tenders schema
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 'schema-id': string }> }
) {
  try {
    const { 'schema-id': schemaId } = await params;

    if (!schemaId) {
      return NextResponse.json(
        { success: false, error: 'Schema ID is required' },
        { status: 400 }
      );
    }

    // Load schemas (with caching)
    const schemas = loadSchemas();
    
    if (!schemas || schemas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schemas file not found or empty' },
        { status: 404 }
      );
    }

    // Find the specific schema
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
  } catch (error) {
    console.error('Error loading schema:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load schema' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a specific schema by ID
 * Example: PUT /api/schemas/vendors - updates the vendors schema
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ 'schema-id': string }> }
) {
  try {
    const { 'schema-id': schemaId } = await params;

    if (!schemaId) {
      return NextResponse.json(
        { success: false, error: 'Schema ID is required' },
        { status: 400 }
      );
    }

    const updatedSchema = await request.json();

    // Load schemas (with caching)
    const schemas = loadSchemas();
    
    if (!schemas || schemas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schemas file not found or empty' },
        { status: 404 }
      );
    }

    // Find the schema index
    const schemaIndex = schemas.findIndex((s: any) => s.id === schemaId);
    
    if (schemaIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Schema with ID "${schemaId}" not found` },
        { status: 404 }
      );
    }

    // Update the schema
    schemas[schemaIndex] = { ...schemas[schemaIndex], ...updatedSchema };

    // Write back to file
    const dataPath = path.join(process.cwd(), 'data', 'all-schemas.json');
    fs.writeFileSync(dataPath, JSON.stringify(schemas, null, 2), 'utf8');
    
    // Clear cache to force reload on next request
    cachedSchemas = null;
    cacheTimestamp = null;

    return NextResponse.json({
      success: true,
      data: schemas[schemaIndex]
    });
  } catch (error) {
    console.error('Error updating schema:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update schema' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a specific schema by ID
 * Example: DELETE /api/schemas/vendors - deletes the vendors schema
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ 'schema-id': string }> }
) {
  try {
    const { 'schema-id': schemaId } = await params;

    if (!schemaId) {
      return NextResponse.json(
        { success: false, error: 'Schema ID is required' },
        { status: 400 }
      );
    }

    // Load schemas (with caching)
    const schemas = loadSchemas();
    
    if (!schemas || schemas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schemas file not found or empty' },
        { status: 404 }
      );
    }

    // Find the schema index
    const schemaIndex = schemas.findIndex((s: any) => s.id === schemaId);
    
    if (schemaIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Schema with ID "${schemaId}" not found` },
        { status: 404 }
      );
    }

    // Remove the schema
    const deletedSchema = schemas.splice(schemaIndex, 1)[0];

    // Write back to file
    const dataPath = path.join(process.cwd(), 'data', 'all-schemas.json');
    fs.writeFileSync(dataPath, JSON.stringify(schemas, null, 2), 'utf8');
    
    // Clear cache to force reload on next request
    cachedSchemas = null;
    cacheTimestamp = null;

    return NextResponse.json({
      success: true,
      data: deletedSchema,
      message: `Schema "${schemaId}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting schema:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete schema' 
      },
      { status: 500 }
    );
  }
}

