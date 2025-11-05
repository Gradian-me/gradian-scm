// Dynamic CRUD API Routes
// Handles all CRUD operations for any schema dynamically

import { NextRequest, NextResponse } from 'next/server';
import { BaseRepository } from '@/shared/domain/repositories/base.repository';
import { BaseService } from '@/shared/domain/services/base.service';
import { BaseController } from '@/shared/domain/controllers/base.controller';
import { BaseEntity } from '@/shared/domain/types/base.types';
import { isValidSchemaId, getSchemaById } from '@/gradian-ui/schema-manager/utils/schema-registry.server';
import { loadAllCompanies, clearCompaniesCache } from '@/shared/utils/companies-loader';

/**
 * Create controller instance for the given schema
 */
async function createController(schemaId: string) {
  const schema = await getSchemaById(schemaId);
  const repository = new BaseRepository<BaseEntity>(schemaId);
  const service = new BaseService<BaseEntity>(repository, schema.singular_name || 'Entity', schemaId);
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
    if (!(await isValidSchemaId(schemaId))) {
      return NextResponse.json(
        { success: false, error: `Invalid schema ID: ${schemaId}` },
        { status: 404 }
      );
    }

    // Special handling for companies - use cached loader
    // Note: Companies don't have password fields, so no filtering needed
    if (schemaId === 'companies') {
      try {
        const companies = await loadAllCompanies();
        return NextResponse.json({
          success: true,
          data: companies,
        });
      } catch (error) {
        // If cache fails, fall through to normal controller
        console.warn('Companies cache load failed, using controller:', error);
      }
    }

    const controller = await createController(schemaId);
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
    if (!(await isValidSchemaId(schemaId))) {
      return NextResponse.json(
        { success: false, error: `Invalid schema ID: ${schemaId}` },
        { status: 404 }
      );
    }

    const controller = await createController(schemaId);
    const response = await controller.create(request);
    
    // Clear companies cache if a company was created
    if (schemaId === 'companies') {
      clearCompaniesCache();
    }
    
    return response;
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

