// Dynamic CRUD API Routes for Single Entity
// Handles GET, PUT, DELETE operations for a specific entity

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
 * GET - Get single entity by ID
 * Example: GET /api/data/vendors/123
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 'schema-id': string; id: string }> }
) {
  try {
    const { 'schema-id': schemaId, id } = await params;

    // Validate schema ID
    if (!isValidSchemaId(schemaId)) {
      return NextResponse.json(
        { success: false, error: `Invalid schema ID: ${schemaId}` },
        { status: 404 }
      );
    }

    const controller = createController(schemaId);
    return await controller.getById(id);
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
 * PUT - Update entity
 * Example: PUT /api/data/vendors/123
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ 'schema-id': string; id: string }> }
) {
  try {
    const { 'schema-id': schemaId, id } = await params;

    // Validate schema ID
    if (!isValidSchemaId(schemaId)) {
      return NextResponse.json(
        { success: false, error: `Invalid schema ID: ${schemaId}` },
        { status: 404 }
      );
    }

    const controller = createController(schemaId);
    return await controller.update(id, request);
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
 * DELETE - Delete entity
 * Example: DELETE /api/data/vendors/123
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ 'schema-id': string; id: string }> }
) {
  try {
    const { 'schema-id': schemaId, id } = await params;

    // Validate schema ID
    if (!isValidSchemaId(schemaId)) {
      return NextResponse.json(
        { success: false, error: `Invalid schema ID: ${schemaId}` },
        { status: 404 }
      );
    }

    const controller = createController(schemaId);
    return await controller.delete(id);
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

