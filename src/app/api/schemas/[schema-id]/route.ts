// Schemas API Route - Dynamic Route for individual schemas
// Serves a specific schema by ID from the JSON file

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    // Read the schemas JSON file
    const dataPath = path.join(process.cwd(), 'data', 'all-schemas.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { success: false, error: 'Schemas file not found' },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const schemas = JSON.parse(fileContents);

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

