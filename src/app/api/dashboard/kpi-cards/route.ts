import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock KPI cards data
    const kpiCards = [
      {
        id: '1',
        title: 'Active Vendors',
        value: 18,
        change: 12,
        changeType: 'increase',
        icon: 'Users',
        color: 'text-blue-600',
        trend: 'up'
      },
      {
        id: '2',
        title: 'Open Tenders',
        value: 8,
        change: 8,
        changeType: 'increase',
        icon: 'FileText',
        color: 'text-green-600',
        trend: 'up'
      },
      {
        id: '3',
        title: 'Purchase Orders',
        value: 45,
        change: -3,
        changeType: 'decrease',
        icon: 'ShoppingCart',
        color: 'text-purple-600',
        trend: 'down'
      },
      {
        id: '4',
        title: 'Total Spend',
        value: '$1.25M',
        change: 15,
        changeType: 'increase',
        icon: 'DollarSign',
        color: 'text-orange-600',
        trend: 'up'
      },
      {
        id: '5',
        title: 'Pending Invoices',
        value: 12,
        change: 5,
        changeType: 'increase',
        icon: 'Receipt',
        color: 'text-red-600',
        trend: 'up'
      },
      {
        id: '6',
        title: 'Average Processing Time',
        value: '5.2 days',
        change: -0.8,
        changeType: 'decrease',
        icon: 'Clock',
        color: 'text-indigo-600',
        trend: 'down'
      }
    ];

    return NextResponse.json({
      success: true,
      data: kpiCards
    });
  } catch (error) {
    console.error('Error fetching KPI cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI cards' },
      { status: 500 }
    );
  }
}
