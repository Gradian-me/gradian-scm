import { NextRequest, NextResponse } from 'next/server';
import { tenderDataAccess } from '@/lib/data-access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tender = mockTenders.find(t => t.id === id);
    
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
    const body = await request.json();
    const tenderIndex = mockTenders.findIndex(t => t.id === id);
    
    if (tenderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Update tender
    mockTenders[tenderIndex] = {
      ...mockTenders[tenderIndex],
      ...body,
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: mockTenders[tenderIndex],
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
    const tenderIndex = mockTenders.findIndex(t => t.id === id);
    
    if (tenderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Soft delete - mark as cancelled
    mockTenders[tenderIndex].status = 'cancelled';
    mockTenders[tenderIndex].updatedAt = new Date();

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
