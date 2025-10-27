import { NextRequest, NextResponse } from 'next/server';
import { tenderDataAccess, vendorDataAccess, quotationDataAccess } from '@/lib/data-access';
import { createQuotationSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get quotations for this tender
    const quotations = await quotationDataAccess.getAll(id);

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
    const tender = await tenderDataAccess.getById(id);
    if (!tender) {
      return NextResponse.json(
        { success: false, error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Check if vendor exists
    const vendor = await vendorDataAccess.getById(validatedData.vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Calculate total price for items
    const items = validatedData.items.map((item, index: number) => ({
      ...item,
      id: (index + 1).toString(),
      totalPrice: item.unitPrice * ((tender as any).items?.find((ti: any) => ti.id === item.tenderItemId)?.quantity || 1),
    }));

    const newQuotation = await quotationDataAccess.create({
      vendorId: validatedData.vendorId,
      tenderId: id,
      totalAmount: validatedData.totalAmount,
      currency: validatedData.currency,
      validityDays: validatedData.validityDays,
      paymentTerms: validatedData.paymentTerms,
      deliveryTerms: validatedData.deliveryTerms,
      deliveryTime: validatedData.deliveryTime,
      notes: validatedData.notes,
      items,
      submittedDate: new Date(),
      status: 'submitted',
      vendor,
    });

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
