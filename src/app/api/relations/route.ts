// Relations API Routes
// Handles CRUD operations for data relations

import { NextRequest, NextResponse } from 'next/server';
import {
  readAllRelations,
  createRelation,
  getRelationsBySource,
  getRelationsByTarget,
  getRelationsByType,
  getRelationsForSection,
} from '@/shared/domain/utils/relations-storage.util';
import { DataRelation } from '@/gradian-ui/schema-manager/types/form-schema';
import { handleDomainError } from '@/shared/domain/errors/domain.errors';

/**
 * GET - Query relations
 * Query parameters:
 * - sourceSchema, sourceId - Get relations by source entity
 * - targetSchema, targetId - Get relations by target entity
 * - relationTypeId - Get relations by type
 * - sourceSchema, sourceId, relationTypeId - Get relations for a repeating section
 * - targetSchema (optional with above) - Filter by target schema
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const sourceSchema = searchParams.get('sourceSchema');
    const sourceId = searchParams.get('sourceId');
    const targetSchema = searchParams.get('targetSchema');
    const targetId = searchParams.get('targetId');
    const relationTypeId = searchParams.get('relationTypeId');

    let relations: DataRelation[];

    // Get relations for repeating section (most specific query)
    if (sourceSchema && sourceId && relationTypeId) {
      relations = getRelationsForSection(sourceSchema, sourceId, relationTypeId, targetSchema || undefined);
    }
    // Get relations by source entity
    else if (sourceSchema && sourceId) {
      relations = getRelationsBySource(sourceSchema, sourceId);
      // Filter by target schema if provided
      if (targetSchema) {
        relations = relations.filter(r => r.targetSchema === targetSchema);
      }
    }
    // Get relations by target entity
    else if (targetSchema && targetId) {
      relations = getRelationsByTarget(targetSchema, targetId);
    }
    // Get relations by type
    else if (relationTypeId) {
      relations = getRelationsByType(relationTypeId);
    }
    // Get all relations
    else {
      relations = readAllRelations();
    }

    return NextResponse.json({
      success: true,
      data: relations,
      count: relations.length,
    });
  } catch (error) {
    const errorResponse = handleDomainError(error);
    return NextResponse.json(
      {
        success: false,
        error: errorResponse.error,
        code: errorResponse.code,
      },
      { status: errorResponse.statusCode }
    );
  }
}

/**
 * POST - Create new relation
 * Body: { sourceSchema, sourceId, targetSchema, targetId, relationTypeId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sourceSchema, sourceId, targetSchema, targetId, relationTypeId } = body;

    // Validate required fields
    if (!sourceSchema || !sourceId || !targetSchema || !targetId || !relationTypeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: sourceSchema, sourceId, targetSchema, targetId, relationTypeId',
        },
        { status: 400 }
      );
    }

    const relation = createRelation({
      sourceSchema,
      sourceId,
      targetSchema,
      targetId,
      relationTypeId,
    });

    return NextResponse.json({
      success: true,
      data: relation,
    }, { status: 201 });
  } catch (error) {
    const errorResponse = handleDomainError(error);
    return NextResponse.json(
      {
        success: false,
        error: errorResponse.error,
        code: errorResponse.code,
      },
      { status: errorResponse.statusCode }
    );
  }
}

