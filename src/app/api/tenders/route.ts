import { NextRequest, NextResponse } from 'next/server';
import { tenderDataAccess } from '@/lib/data-access';
import { createTenderSchema, paginationSchema, tenderFilterSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled' | null;
    const category = searchParams.get('category') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const filters = {
      search,
      status,
      category,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    const tenders = await tenderDataAccess.getAll(filters);

    // Pagination
    const total = tenders.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTenders = tenders.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedTenders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Tenders API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tenders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTenderSchema.parse(body);

    const newTender = await tenderDataAccess.create(validatedData);

    return NextResponse.json({
      success: true,
      data: newTender,
      message: 'Tender created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    console.error('Create tender error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tender' },
      { status: 500 }
    );
  }
}
