import { NextResponse } from 'next/server';
import { dashboardDataAccess } from '@/lib/data-access';

export async function GET() {
  try {
    const [metrics, spendAnalysis, monthlyTrends] = await Promise.all([
      dashboardDataAccess.getMetrics(),
      dashboardDataAccess.getSpendAnalysis(),
      dashboardDataAccess.getMonthlyTrends(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        spendAnalysis,
        monthlyTrends,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
