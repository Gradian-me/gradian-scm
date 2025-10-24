import { DashboardMetrics, SpendAnalysis, MonthlyTrend } from '@/types';

// Generic calculation functions that work with any data source
export const calculateDashboardMetrics = (data: {
  purchaseOrders: any[];
  vendors: any[];
  tenders: any[];
  shipments: any[];
  invoices: any[];
}): DashboardMetrics => {
  const { purchaseOrders, vendors, tenders, shipments, invoices } = data;
  
  const totalSpend = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length;
  const openTenders = tenders.filter(t => ['PUBLISHED', 'CLOSED'].includes(t.status)).length;
  const purchaseOrdersCount = purchaseOrders.length;
  const pendingInvoices = invoices.filter(i => i.status === 'PENDING_APPROVAL').length;
  
  // Calculate average vendor rating
  const averageVendorRating = vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length;
  
  // Calculate on-time delivery from shipments
  const deliveredShipments = shipments.filter(s => s.status === 'DELIVERED');
  const onTimeDeliveries = deliveredShipments.filter(s => 
    s.actualDeliveryDate && s.actualDeliveryDate <= s.estimatedDeliveryDate
  ).length;
  const onTimeDelivery = deliveredShipments.length > 0 ? (onTimeDeliveries / deliveredShipments.length) * 100 : 0;
  
  // Calculate cost savings (simplified - could be more sophisticated)
  const costSavings = totalSpend * 0.05; // 5% savings assumption

  return {
    totalSpend,
    costSavings,
    averageVendorRating,
    onTimeDelivery,
    activeVendors,
    openTenders,
    purchaseOrders: purchaseOrdersCount,
    pendingInvoices,
  };
};

export const calculateSpendAnalysis = (data: {
  purchaseOrders: any[];
}): SpendAnalysis[] => {
  const { purchaseOrders } = data;
  
  const spendByCategory = purchaseOrders.reduce((acc: Record<string, number>, po) => {
    const category = po.tender?.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += po.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpend = (Object.values(spendByCategory) as number[]).reduce((sum: number, amount: number) => sum + amount, 0);

  return Object.entries(spendByCategory).map(([category, amount]) => ({
    category,
    amount: amount as number,
    percentage: ((amount as number) / totalSpend) * 100,
    trend: 'stable' as const,
  }));
};

export const calculateMonthlyTrends = (data: {
  purchaseOrders: any[];
}): MonthlyTrend[] => {
  const { purchaseOrders } = data;
  
  const monthlyData = purchaseOrders.reduce((acc: Record<string, { spend: number; orders: number }>, po) => {
    const month = po.createdAt.toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { spend: 0, orders: 0 };
    }
    acc[month].spend += po.totalAmount;
    acc[month].orders += 1;
    return acc;
  }, {} as Record<string, { spend: number; orders: number }>);

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    spend: (data as { spend: number; orders: number }).spend,
    orders: (data as { spend: number; orders: number }).orders,
  }));
};
