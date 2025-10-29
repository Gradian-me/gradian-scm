// Dynamic CRUD API Routes
// Handles all CRUD operations for any schema dynamically

import { NextRequest, NextResponse } from 'next/server';
import { BaseRepository } from '@/shared/domain/repositories/base.repository';
import { BaseService } from '@/shared/domain/services/base.service';
import { BaseController } from '@/shared/domain/controllers/base.controller';
import { BaseEntity } from '@/shared/domain/types/base.types';
import { isValidSchemaId, getSchemaById } from '@/shared/utils/schema-registry';

/**
 * Create controller instance for the given schema
 */
function createController(schemaId: string) {
  const schema = getSchemaById(schemaId);
  const repository = new BaseRepository<BaseEntity>(schemaId);
  const service = new BaseService<BaseEntity>(repository, schema.singular_name || 'Entity');
  const controller = new BaseController<BaseEntity>(service, schema.singular_name || 'Entity');
  
  return controller;
}

/**
 * GET - Get all entities for a schema
 * Example: GET /api/data/vendors?search=test&status=ACTIVE
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 'schema-id': string }> }
) {
  try {
    const { 'schema-id': schemaId } = await params;

    // Validate schema ID
    if (!isValidSchemaId(schemaId)) {
      return NextResponse.json(
        { success: false, error: `Invalid schema ID: ${schemaId}` },
        { status: 404 }
      );
    }

    const controller = createController(schemaId);
    return await controller.getAll(request);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new entity
 * Example: POST /api/data/vendors
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ 'schema-id': string }> }
) {
  try {
    const { 'schema-id': schemaId } = await params;

    // Validate schema ID
    if (!isValidSchemaId(schemaId)) {
      return NextResponse.json(
        { success: false, error: `Invalid schema ID: ${schemaId}` },
        { status: 404 }
      );
    }

    const controller = createController(schemaId);
    return await controller.create(request);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

