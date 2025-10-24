import { NextRequest, NextResponse } from 'next/server';
import { vendorDataAccess } from '@/lib/data-access';
import { createVendorSchema } from '@/domains/vendor/schemas';
import { paginationSchema, vendorFilterSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const statusParam = searchParams.get('status');
    const status = statusParam && statusParam !== 'undefined' ? statusParam as 'ACTIVE' | 'INACTIVE' | 'PENDING' : null;
    const categories = searchParams.get('categories')?.split(',') || [];

    const filters = {
      search,
      status,
      categories: categories.filter(Boolean),
    };

    const vendors = await vendorDataAccess.getAll(filters);

    // Pagination
    const total = vendors.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVendors = vendors.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedVendors,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Vendors API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createVendorSchema.parse(body);

    const newVendor = await vendorDataAccess.create(validatedData);

    return NextResponse.json({
      success: true,
      data: newVendor,
      message: 'Vendor created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    console.error('Create vendor error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
