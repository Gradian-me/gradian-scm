// Schemas API Route
// Serves all schemas from the JSON file

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    fs.writeFileSync(dataPath, JSON.stringify(schemas, null, 2), 'utf8');

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

