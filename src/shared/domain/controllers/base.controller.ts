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

    // Add any other query params as filters
    searchParams.forEach((value, key) => {
      if (!['search', 'status', 'category'].includes(key)) {
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
      const result = await this.service.create(body);

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
      const result = await this.service.update(id, body);

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

