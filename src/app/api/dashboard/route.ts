import { NextResponse } from 'next/server';
import { isMockData } from '@/lib/config';
import { readSchemaData } from '@/shared/domain/utils/data-storage.util';
import { prisma } from '@/lib/prisma';
import { calculateDashboardMetrics, calculateSpendAnalysis, calculateMonthlyTrends } from '@/lib/measures';

export async function GET() {
  try {
    let metrics, spendAnalysis, monthlyTrends;

    if (isMockData()) {
      // Use dynamic data storage for mock data
      const purchaseOrders = readSchemaData('purchaseOrders');
      const vendors = readSchemaData('vendors');
      const tenders = readSchemaData('tenders');
      const shipments = readSchemaData('shipments');
      const invoices = readSchemaData('invoices');

      metrics = calculateDashboardMetrics({
        purchaseOrders,
        vendors,
        tenders,
        shipments,
        invoices,
      });

      spendAnalysis = calculateSpendAnalysis({
        purchaseOrders,
      });

      monthlyTrends = calculateMonthlyTrends({
        purchaseOrders,
      });
    } else {
      // Use database for production data
      const [purchaseOrders, vendors, tenders, shipments, invoices] = await Promise.all([
        prisma.purchaseOrder.findMany({
          where: { status: { not: 'CANCELLED' } },
        }),
        prisma.vendor.findMany(),
        prisma.tender.findMany(),
        prisma.shipment.findMany(),
        prisma.invoice.findMany(),
      ]);

      metrics = calculateDashboardMetrics({
        purchaseOrders,
        vendors,
        tenders,
        shipments,
        invoices,
      });

      const purchaseOrdersWithTender = await prisma.purchaseOrder.findMany({
        where: { status: { not: 'CANCELLED' } },
        include: { tender: true },
      });

      spendAnalysis = calculateSpendAnalysis({
        purchaseOrders: purchaseOrdersWithTender,
      });

      const purchaseOrdersForTrends = await prisma.purchaseOrder.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { createdAt: true, totalAmount: true },
      });

      monthlyTrends = calculateMonthlyTrends({
        purchaseOrders: purchaseOrdersForTrends,
      });
    }

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
