import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock recent activity data
    const recentActivity = [
      {
        id: '1',
        type: 'vendor_created',
        title: 'New Vendor Added',
        description: 'ABC Pharmaceuticals has been added to the vendor list',
        timestamp: new Date('2024-12-10T10:30:00'),
        userId: 'user1',
        userName: 'Mahyar Abidi',
        metadata: { vendorId: 'vendor1' }
      },
      {
        id: '2',
        type: 'tender_published',
        title: 'Tender Published',
        description: 'HPLC Equipment tender has been published',
        timestamp: new Date('2024-12-10T08:45:00'),
        userId: 'user2',
        userName: 'Dr. Sarah Chen',
        metadata: { tenderId: 'tender1' }
      },
      {
        id: '3',
        type: 'po_created',
        title: 'Purchase Order Created',
        description: 'New purchase order for medical supplies',
        timestamp: new Date('2024-12-10T06:20:00'),
        userId: 'user3',
        userName: 'John Smith',
        metadata: { poId: 'po1' }
      },
      {
        id: '4',
        type: 'po_approved',
        title: 'PO Approved',
        description: 'Purchase order has been approved',
        timestamp: new Date('2024-12-10T04:15:00'),
        userId: 'user2',
        userName: 'Dr. Sarah Chen',
        metadata: { poId: 'po1' }
      },
      {
        id: '5',
        type: 'tender_awarded',
        title: 'Tender Awarded',
        description: 'Laboratory equipment tender has been awarded',
        timestamp: new Date('2024-12-09T16:30:00'),
        userId: 'user1',
        userName: 'Mahyar Abidi',
        metadata: { tenderId: 'tender2', vendorId: 'vendor2' }
      },
      {
        id: '6',
        type: 'vendor_created',
        title: 'Vendor Updated',
        description: 'XYZ Medical contact information updated',
        timestamp: new Date('2024-12-09T14:20:00'),
        userId: 'user3',
        userName: 'John Smith',
        metadata: { vendorId: 'vendor3' }
      },
      {
        id: '7',
        type: 'po_created',
        title: 'Purchase Order Created',
        description: 'New purchase order for laboratory equipment',
        timestamp: new Date('2024-12-09T11:45:00'),
        userId: 'user1',
        userName: 'Mahyar Abidi',
        metadata: { poId: 'po2' }
      },
      {
        id: '8',
        type: 'tender_published',
        title: 'Tender Published',
        description: 'Medical devices tender has been published',
        timestamp: new Date('2024-12-09T09:30:00'),
        userId: 'user2',
        userName: 'Dr. Sarah Chen',
        metadata: { tenderId: 'tender3' }
      }
    ];

    return NextResponse.json({
      success: true,
      data: recentActivity
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
