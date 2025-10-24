import { NextRequest, NextResponse } from 'next/server';
import { tenderDataAccess, vendorDataAccess } from '@/lib/data-access';
import { createQuotationSchema } from '@/lib/validations';

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

    // Get quotations for this tender
    const quotations = mockQuotations.filter(q => q.tenderId === id);

    return NextResponse.json({
      success: true,
      data: quotations,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = createQuotationSchema.parse(body);

    // Check if tender exists
    const tender = mockTenders.find(t => t.id === id);
    if (!tender) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Check if vendor exists
    const vendor = mockVendors.find(v => v.id === validatedData.vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Generate new quotation ID
    const newQuotation = {
      id: (mockQuotations.length + 1).toString(),
      ...validatedData,
      tenderId: id,
      vendor,
      submittedDate: new Date(),
      status: 'submitted' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Calculate total price for items
    newQuotation.items = newQuotation.items.map(item => ({
      ...item,
      id: (newQuotation.items.indexOf(item) + 1).toString(),
      totalPrice: item.unitPrice * (tender.items.find(ti => ti.id === item.tenderItemId)?.quantity || 1),
    }));

    // In a real app, you would save to database here
    mockQuotations.push(newQuotation);

    return NextResponse.json({
      success: true,
      data: newQuotation,
      message: 'Quotation submitted successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to submit quotation' },
      { status: 500 }
    );
  }
}
