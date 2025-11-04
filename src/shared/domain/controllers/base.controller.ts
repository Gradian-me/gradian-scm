// Base Controller
// Generic controller for handling HTTP requests

import { NextRequest, NextResponse } from 'next/server';
import { IService } from '../interfaces/service.interface';
import { BaseEntity, FilterParams } from '../types/base.types';
import { handleDomainError } from '../errors/domain.errors';

export class BaseController<T extends BaseEntity> {
  constructor(
    protected service: IService<T>,
    protected entityName: string = 'Entity'
  ) {}

  /**
   * Extract filters from URL search params
   */
  protected extractFilters(searchParams: URLSearchParams): FilterParams {
    const filters: FilterParams = {};

    if (searchParams.has('search')) {
      filters.search = searchParams.get('search') || undefined;
    }

    if (searchParams.has('status')) {
      filters.status = searchParams.get('status') || undefined;
    }

    if (searchParams.has('category')) {
      filters.category = searchParams.get('category') || undefined;
    }

    // Handle includeIds - can be comma-separated string or multiple params
    if (searchParams.has('includeIds')) {
      const includeIdsParam = searchParams.get('includeIds');
      if (includeIdsParam) {
        filters.includeIds = includeIdsParam.split(',').map(id => id.trim());
      }
    } else if (searchParams.getAll('includeIds[]').length > 0) {
      filters.includeIds = searchParams.getAll('includeIds[]');
    }

    // Handle excludeIds - can be comma-separated string or multiple params
    if (searchParams.has('excludeIds')) {
      const excludeIdsParam = searchParams.get('excludeIds');
      if (excludeIdsParam) {
        filters.excludeIds = excludeIdsParam.split(',').map(id => id.trim());
      }
    } else if (searchParams.getAll('excludeIds[]').length > 0) {
      filters.excludeIds = searchParams.getAll('excludeIds[]');
    }

    // Add any other query params as filters
    searchParams.forEach((value, key) => {
      if (!['search', 'status', 'category', 'includeIds', 'excludeIds', 'includeIds[]', 'excludeIds[]'].includes(key)) {
        filters[key] = value;
      }
    });

    return filters;
  }

  /**
   * GET - Get all entities
   */
  async getAll(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const filters = this.extractFilters(searchParams);

      const result = await this.service.getAll(filters);

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  }

  /**
   * GET - Get entity by ID
   */
  async getById(id: string): Promise<NextResponse> {
    try {
      const result = await this.service.getById(id);

      if (!result.success) {
        return NextResponse.json(result, { status: 404 });
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  }

  /**
   * POST - Create new entity
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      
      // Add companyId from cookie if not present (but not if "All Companies" is selected)
      const enrichedBody = { ...body };
      if (!enrichedBody.companyId) {
        const cookieHeader = request.headers.get('cookie');
        const cookies = cookieHeader ? Object.fromEntries(
          cookieHeader.split('; ').map(c => c.split('='))
        ) : {};
        const companyId = cookies.selectedCompanyId;
        // Only add companyId if it exists, is not empty, and is not "All Companies" (-1)
        if (companyId && companyId !== '' && companyId !== '-1') {
          enrichedBody.companyId = companyId;
        } else {
          // If "All Companies" is selected, reject creation
          return NextResponse.json(
            { success: false, error: 'Cannot create records when "All Companies" is selected. Please select a specific company first.' },
            { status: 400 }
          );
        }
      }
      
      const result = await this.service.create(enrichedBody);

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  }

  /**
   * PUT - Update entity
   */
  async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      
      // Get existing entity to check if it has companyId
      const existingResult = await this.service.getById(id);
      const existingEntity = existingResult.success ? existingResult.data : null;
      
      // Add companyId from cookie ONLY if entity doesn't have it AND we're not using "All Companies"
      const enrichedBody = { ...body };
      if (existingEntity && (!(existingEntity as any).companyId || (existingEntity as any).companyId === '')) {
        const cookieHeader = request.headers.get('cookie');
        const cookies = cookieHeader ? Object.fromEntries(
          cookieHeader.split('; ').map(c => c.split('='))
        ) : {};
        const companyId = cookies.selectedCompanyId;
        // Only add companyId if it exists and is not empty (not "All Companies")
        if (companyId && companyId !== '' && companyId !== '-1') {
          enrichedBody.companyId = companyId;
        }
      }
      // If entity already has companyId, preserve it (don't overwrite)
      if (existingEntity && (existingEntity as any).companyId) {
        enrichedBody.companyId = (existingEntity as any).companyId;
      }
      
      const result = await this.service.update(id, enrichedBody);

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  }

  /**
   * DELETE - Delete entity
   */
  async delete(id: string): Promise<NextResponse> {
    try {
      const result = await this.service.delete(id);

      if (!result.success) {
        return NextResponse.json(result, { status: 404 });
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return NextResponse.json(
        { success: false, error: errorResponse.error },
        { status: errorResponse.statusCode }
      );
    }
  }
}

