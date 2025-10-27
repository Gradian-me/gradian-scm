import { NextRequest, NextResponse } from 'next/server';
import { tenderDataAccess } from '@/lib/data-access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tender = await tenderDataAccess.getById(id);
    
    if (!tender) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tender,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tender' },
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
    
    const updatedTender = await tenderDataAccess.update(id, body);
    
    if (!updatedTender) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTender,
      message: 'Tender updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update tender' },
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
    
    const updatedTender = await tenderDataAccess.update(id, {
      status: 'cancelled',
    });
    
    if (!updatedTender) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tender cancelled successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel tender' },
      { status: 500 }
    );
  }
}
