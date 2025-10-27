import { NextRequest, NextResponse } from 'next/server';
import { purchaseOrderDataAccess } from '@/lib/data-access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const po = await purchaseOrderDataAccess.getById(id);
    
    if (!po) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: po,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedPO = await purchaseOrderDataAccess.update(id, body);
    
    if (!updatedPO) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPO,
      message: 'Purchase order updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update purchase order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const updatedPO = await purchaseOrderDataAccess.update(id, {
      status: 'cancelled',
    });
    
    if (!updatedPO) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase order cancelled successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel purchase order' },
      { status: 500 }
    );
  }
}
