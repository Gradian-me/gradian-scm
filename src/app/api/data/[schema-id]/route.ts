// Dynamic CRUD API Routes
// Handles all CRUD operations for any schema dynamically

import { NextRequest, NextResponse } from 'next/server';
import { BaseRepository } from '@/gradian-ui/shared/domain/repositories/base.repository';
import { BaseService } from '@/gradian-ui/shared/domain/services/base.service';
import { BaseController } from '@/gradian-ui/shared/domain/controllers/base.controller';
import { BaseEntity } from '@/gradian-ui/shared/domain/types/base.types';
import { isValidSchemaId, getSchemaById } from '@/gradian-ui/schema-manager/utils/schema-registry.server';
import { loadAllCompanies, clearCompaniesCache } from '@/gradian-ui/shared/utils/companies-loader';
import { isDemoModeEnabled, proxyDataRequest } from '../utils';

/**
 * Create controller instance for the given schema
 */
async function createController(schemaId: string) {
  const schema = await getSchemaById(schemaId);
  const repository = new BaseRepository<BaseEntity>(schemaId);
  const service = new BaseService<BaseEntity>(repository, schema.singular_name || 'Entity', schemaId);
  const controller = new BaseController<BaseEntity>(
    service, 
    schema.singular_name || 'Entity',
    schema.isNotCompanyBased || false
  );
  
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
  const { 'schema-id': schemaId } = await params;
  const targetPath = `/api/data/${schemaId}${request.nextUrl.search}`;

  if (!isDemoModeEnabled()) {
    return proxyDataRequest(request, targetPath);
  }

  try {
    // Validate schema ID
    if (!(await isValidSchemaId(schemaId))) {
      return NextResponse.json(
        { success: false, error: `Invalid schema ID: ${schemaId}` },
        { status: 404 }
      );
    }

    // Get schema to check if it's company-based
    const schema = await getSchemaById(schemaId);
    
    // Special handling for companies - use cached loader
    // Note: Companies don't have password fields, so no filtering needed
    // Companies schema is always not company-based (it doesn't filter by itself)
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

    // Validate companyIds parameter for company-based schemas
    // If schema is company-based (isNotCompanyBased is not true), companyIds is required
    if (!schema.isNotCompanyBased && schemaId !== 'companies') {
      const searchParams = request.nextUrl.searchParams;
      
      // Check for companyIds comma-separated string (companyIds=id1,id2)
      const companyIdsString = searchParams.get('companyIds');
      // Check for backward compatibility: single companyId parameter
      const companyId = searchParams.get('companyId');
      
      // Parse companyIds from comma-separated string if provided
      const companyIds = companyIdsString 
        ? companyIdsString.split(',').map(id => id.trim()).filter(id => id.length > 0)
        : [];
      
      // Validate that at least one company ID is provided
      if (!companyId && companyIds.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required parameter: companyIds (or companyId for backward compatibility). This schema requires company filtering. Please provide at least one company ID.` 
          },
          { status: 400 }
        );
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
  const { 'schema-id': schemaId } = await params;
  const targetPath = `/api/data/${schemaId}`;

  if (!isDemoModeEnabled()) {
    const body = await request.json();
    return proxyDataRequest(request, targetPath, { body });
  }

  try {
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

