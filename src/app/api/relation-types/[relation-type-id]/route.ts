// Relation Types API Route - Dynamic Route for individual relation types
// Serves a specific relation type by ID from the JSON file

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
 * GET - Get a specific relation type by ID
 * Example: 
 * - GET /api/relation-types/HAS_INQUIRY_ITEM - returns only HAS_INQUIRY_ITEM relation type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 'relation-type-id': string }> }
) {
  try {
    const { 'relation-type-id': relationTypeId } = await params;

    if (!relationTypeId) {
      return NextResponse.json(
        { success: false, error: 'Relation type ID is required' },
        { status: 400 }
      );
    }

    // Load relation types (with caching)
    const relationTypes = loadRelationTypes();
    
    if (!relationTypes || relationTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Relation types file not found or empty' },
        { status: 404 }
      );
    }

    // Find the specific relation type
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
  } catch (error) {
    console.error('Error loading relation type:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load relation type' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a specific relation type by ID
 * Example: PUT /api/relation-types/HAS_INQUIRY_ITEM - updates the HAS_INQUIRY_ITEM relation type
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ 'relation-type-id': string }> }
) {
  try {
    const { 'relation-type-id': relationTypeId } = await params;

    if (!relationTypeId) {
      return NextResponse.json(
        { success: false, error: 'Relation type ID is required' },
        { status: 400 }
      );
    }

    const updatedRelationType = await request.json();

    // Load relation types (with caching)
    const relationTypes = loadRelationTypes();
    
    if (!relationTypes || relationTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Relation types file not found or empty' },
        { status: 404 }
      );
    }

    // Find the relation type index
    const relationTypeIndex = relationTypes.findIndex((rt: any) => rt.id === relationTypeId);
    
    if (relationTypeIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Relation type with ID "${relationTypeId}" not found` },
        { status: 404 }
      );
    }

    // Update the relation type
    relationTypes[relationTypeIndex] = { ...relationTypes[relationTypeIndex], ...updatedRelationType };

    // Write back to file
    const dataPath = path.join(process.cwd(), 'data', 'all-relation-types.json');
    fs.writeFileSync(dataPath, JSON.stringify(relationTypes, null, 2), 'utf8');
    
    // Clear cache to force reload on next request
    cachedRelationTypes = null;
    cacheTimestamp = null;

    return NextResponse.json({
      success: true,
      data: relationTypes[relationTypeIndex]
    });
  } catch (error) {
    console.error('Error updating relation type:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update relation type' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a specific relation type by ID
 * Example: DELETE /api/relation-types/HAS_INQUIRY_ITEM - deletes the HAS_INQUIRY_ITEM relation type
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ 'relation-type-id': string }> }
) {
  try {
    const { 'relation-type-id': relationTypeId } = await params;

    if (!relationTypeId) {
      return NextResponse.json(
        { success: false, error: 'Relation type ID is required' },
        { status: 400 }
      );
    }

    // Load relation types (with caching)
    const relationTypes = loadRelationTypes();
    
    if (!relationTypes || relationTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Relation types file not found or empty' },
        { status: 404 }
      );
    }

    // Find the relation type index
    const relationTypeIndex = relationTypes.findIndex((rt: any) => rt.id === relationTypeId);
    
    if (relationTypeIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Relation type with ID "${relationTypeId}" not found` },
        { status: 404 }
      );
    }

    // Remove the relation type
    const deletedRelationType = relationTypes.splice(relationTypeIndex, 1)[0];

    // Write back to file
    const dataPath = path.join(process.cwd(), 'data', 'all-relation-types.json');
    fs.writeFileSync(dataPath, JSON.stringify(relationTypes, null, 2), 'utf8');
    
    // Clear cache to force reload on next request
    cachedRelationTypes = null;
    cacheTimestamp = null;

    return NextResponse.json({
      success: true,
      data: deletedRelationType,
      message: `Relation type "${relationTypeId}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting relation type:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete relation type' 
      },
      { status: 500 }
    );
  }
}

