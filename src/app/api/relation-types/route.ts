// Relation Types API Route
// Serves all relation types from the JSON file

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache for loaded relation types
let cachedRelationTypes: any[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 60000; // 60 seconds cache TTL

/**
 * Load relation types with caching
 */
function loadRelationTypes(): any[] {
  const now = Date.now();
  
  // Return cache if valid
  if (cachedRelationTypes !== null && cacheTimestamp !== null && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedRelationTypes;
  }
  
  // Read and cache relation types
  const dataPath = path.join(process.cwd(), 'data', 'all-relation-types.json');
  
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  cachedRelationTypes = JSON.parse(fileContents);
  cacheTimestamp = now;
  
  return cachedRelationTypes || [];
}

/**
 * GET - Get all relation types or a specific relation type by ID
 * Example: 
 * - GET /api/relation-types - returns all relation types
 * - GET /api/relation-types?id=HAS_INQUIRY_ITEM - returns only HAS_INQUIRY_ITEM relation type
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const relationTypeId = searchParams.get('id');

    // Load relation types (with caching)
    const relationTypes = loadRelationTypes();
    
    if (!relationTypes || relationTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Relation types file not found or empty' },
        { status: 404 }
      );
    }

    // If specific relation type ID requested, return only that relation type
    if (relationTypeId) {
      const relationType = relationTypes.find((rt: any) => rt.id === relationTypeId);
      
      if (!relationType) {
        return NextResponse.json(
          { success: false, error: `Relation type with ID "${relationTypeId}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: relationType
      });
    }

    // Return all relation types
    return NextResponse.json({
      success: true,
      data: relationTypes
    });
  } catch (error) {
    console.error('Error loading relation types:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load relation types' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new relation type
 * Example: POST /api/relation-types - creates a new relation type
 */
export async function POST(request: NextRequest) {
  try {
    const newRelationType = await request.json();

    // Load relation types (with caching)
    const relationTypes = loadRelationTypes();
    
    if (!relationTypes || relationTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Relation types file not found or empty' },
        { status: 404 }
      );
    }

    // Check if relation type with same ID already exists
    const existingRelationType = relationTypes.find((rt: any) => rt.id === newRelationType.id);
    
    if (existingRelationType) {
      return NextResponse.json(
        { success: false, error: `Relation type with ID "${newRelationType.id}" already exists` },
        { status: 409 }
      );
    }

    // Add the new relation type
    relationTypes.push(newRelationType);

    // Write back to file
    const relationTypeFilePath = path.join(process.cwd(), 'data', 'all-relation-types.json');
    fs.writeFileSync(relationTypeFilePath, JSON.stringify(relationTypes, null, 2), 'utf8');
    
    // Clear cache to force reload on next request
    cachedRelationTypes = null;
    cacheTimestamp = null;

    return NextResponse.json({
      success: true,
      data: newRelationType,
      message: `Relation type "${newRelationType.id}" created successfully`
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating relation type:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create relation type' 
      },
      { status: 500 }
    );
  }
}

