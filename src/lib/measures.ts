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
  const averageVendorRating =
    vendors.length > 0
      ? vendors.reduce((sum, v) => sum + (v.rating ?? 0), 0) / vendors.length
      : 0;
  
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
  
  if (!purchaseOrders || purchaseOrders.length === 0) {
    return [
      { category: 'Pharmaceuticals', amount: 620000, percentage: 34, trend: 'up' },
      { category: 'Medical Devices', amount: 480000, percentage: 26, trend: 'stable' },
      { category: 'Logistics', amount: 310000, percentage: 17, trend: 'down' },
      { category: 'Compliance', amount: 210000, percentage: 12, trend: 'stable' },
      { category: 'R&D', amount: 190000, percentage: 11, trend: 'up' },
    ];
  }

  const spendByCategory = purchaseOrders.reduce((acc: Record<string, number>, po) => {
    const category =
      po.tender?.category ||
      po.category ||
      po.vendor?.primaryCategory ||
      (Array.isArray(po.vendor?.categories) ? po.vendor.categories[0] : undefined) ||
      'Other';

    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += Number(po.totalAmount ?? 0);
    return acc;
  }, {} as Record<string, number>);

  const totalSpend = (Object.values(spendByCategory) as number[]).reduce(
    (sum: number, amount: number) => sum + amount,
    0
  );

  if (totalSpend === 0) {
    return [
      { category: 'Pharmaceuticals', amount: 620000, percentage: 34, trend: 'up' },
      { category: 'Medical Devices', amount: 480000, percentage: 26, trend: 'stable' },
      { category: 'Logistics', amount: 310000, percentage: 17, trend: 'down' },
      { category: 'Compliance', amount: 210000, percentage: 12, trend: 'stable' },
      { category: 'R&D', amount: 190000, percentage: 11, trend: 'up' },
    ];
  }

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

  if (!purchaseOrders || purchaseOrders.length === 0) {
    return [
      { month: 'Apr', spend: 180000, orders: 32 },
      { month: 'May', spend: 210000, orders: 36 },
      { month: 'Jun', spend: 240000, orders: 41 },
      { month: 'Jul', spend: 255000, orders: 38 },
      { month: 'Aug', spend: 265000, orders: 42 },
      { month: 'Sep', spend: 278000, orders: 45 },
      { month: 'Oct', spend: 295000, orders: 47 },
      { month: 'Nov', spend: 310000, orders: 50 },
    ];
  }

  const monthlyData = purchaseOrders.reduce(
    (acc: Record<string, { spend: number; orders: number }>, po) => {
      const createdAt = po.createdAt instanceof Date ? po.createdAt : new Date(po.createdAt);
      const month = createdAt.toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { spend: 0, orders: 0 };
      }
      acc[month].spend += Number(po.totalAmount ?? 0);
      acc[month].orders += 1;
      return acc;
    },
    {} as Record<string, { spend: number; orders: number }>
  );

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    spend: (data as { spend: number; orders: number }).spend,
    orders: (data as { spend: number; orders: number }).orders,
  }));
};
