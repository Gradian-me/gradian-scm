import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock upcoming deadlines data
    const upcomingDeadlines = [
      {
        id: '1',
        type: 'tender_closing',
        title: 'HPLC Equipment Tender',
        description: 'Submission deadline for HPLC equipment tender',
        dueDate: new Date('2024-12-12T17:00:00'),
        priority: 'high',
        status: 'pending',
        entityId: 'tender3',
        entityType: 'tender'
      },
      {
        id: '2',
        type: 'po_delivery',
        title: 'Purchase Order Delivery',
        description: 'Expected delivery of medical supplies',
        dueDate: new Date('2024-12-15T09:00:00'),
        priority: 'medium',
        status: 'pending',
        entityId: 'po2',
        entityType: 'purchase_order'
      },
      {
        id: '3',
        type: 'approval_due',
        title: 'Vendor Evaluation',
        description: 'Quarterly vendor performance review',
        dueDate: new Date('2024-12-17T14:00:00'),
        priority: 'medium',
        status: 'pending',
        entityId: 'eval1',
        entityType: 'approval'
      },
      {
        id: '4',
        type: 'approval_due',
        title: 'Contract Renewal',
        description: 'Annual contract renewal with key supplier',
        dueDate: new Date('2024-12-24T16:00:00'),
        priority: 'low',
        status: 'pending',
        entityId: 'contract1',
        entityType: 'approval'
      },
      {
        id: '5',
        type: 'tender_closing',
        title: 'Medical Devices Tender',
        description: 'Submission deadline for medical devices tender',
        dueDate: new Date('2024-12-20T12:00:00'),
        priority: 'high',
        status: 'pending',
        entityId: 'tender4',
        entityType: 'tender'
      },
      {
        id: '6',
        type: 'po_delivery',
        title: 'Laboratory Equipment Delivery',
        description: 'Expected delivery of laboratory equipment',
        dueDate: new Date('2024-12-18T10:00:00'),
        priority: 'medium',
        status: 'pending',
        entityId: 'po3',
        entityType: 'purchase_order'
      }
    ];

    return NextResponse.json({
      success: true,
      data: upcomingDeadlines
    });
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upcoming deadlines' },
      { status: 500 }
    );
  }
}
