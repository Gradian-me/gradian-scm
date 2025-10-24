import { NextRequest, NextResponse } from 'next/server';
import { purchaseOrderDataAccess } from '@/lib/data-access';
import { createPurchaseOrderSchema, paginationSchema, purchaseOrderFilterSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as 'draft' | 'pending_approval' | 'approved' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled' | null;
    const vendorId = searchParams.get('vendorId') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const filters = {
      search,
      status,
      vendorId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    const purchaseOrders = await purchaseOrderDataAccess.getAll(filters);

    // Pagination
    const total = purchaseOrders.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPOs = purchaseOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedPOs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Purchase orders API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPurchaseOrderSchema.parse(body);

    // Generate new PO number
    const poNumber = `PO-2024-${String(mockPurchaseOrders.length + 1).padStart(3, '0')}`;

    // Calculate totals
    const subtotal = validatedData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 9; // Default tax rate
    const tax = subtotal * taxRate / 100;
    const totalAmount = subtotal + tax;

    // Find vendor for the purchase order
    const vendor = mockVendors.find(v => v.id === validatedData.vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const newPO = {
      id: (mockPurchaseOrders.length + 1).toString(),
      poNumber,
      vendorId: validatedData.vendorId,
      vendor,
      tenderId: validatedData.tenderId,
      quotationId: validatedData.quotationId,
      status: 'draft' as const,
      paymentTerms: validatedData.paymentTerms,
      deliveryTerms: validatedData.deliveryTerms,
      expectedDeliveryDate: new Date(validatedData.expectedDeliveryDate),
      totalAmount,
      subtotal,
      tax,
      taxRate,
      currency: 'USD', // Default currency
      createdBy: '2', // In real app, get from auth context
      notes: undefined, // Notes not in schema
      items: validatedData.items.map((item, index) => ({
        ...item,
        id: (index + 1).toString(),
        totalPrice: item.quantity * item.unitPrice,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real app, you would save to database here
    mockPurchaseOrders.push(newPO);

    return NextResponse.json({
      success: true,
      data: newPO,
      message: 'Purchase order created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}
