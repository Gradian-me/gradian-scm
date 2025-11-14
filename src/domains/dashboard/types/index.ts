import { BaseEntity } from '@/gradian-ui/shared/types/common';

export interface DashboardStats {
  totalVendors: number;
  activeVendors: number;
  totalTenders: number;
  activeTenders: number;
  totalPurchaseOrders: number;
  pendingPurchaseOrders: number;
  totalSpend: number;
  monthlySpend: number;
  averageProcessingTime: number;
  topCategories: Array<{ category: string; count: number; value: number }>;
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
  performanceMetrics: PerformanceMetrics;
}

export interface ActivityItem {
  id: string;
  type: 'vendor_created' | 'tender_published' | 'po_created' | 'po_approved' | 'tender_awarded';
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
  metadata?: Record<string, any>;
}

export interface DeadlineItem {
  id: string;
  type: 'tender_closing' | 'po_delivery' | 'approval_due';
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'overdue' | 'completed';
  entityId: string;
  entityType: 'tender' | 'purchase_order' | 'approval';
}

export interface PerformanceMetrics {
  vendorPerformance: {
    averageRating: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
  tenderPerformance: {
    averageResponseTime: number;
    quotationRate: number;
    awardRate: number;
  };
  procurementEfficiency: {
    averageProcessingTime: number;
    costSavings: number;
    cycleTime: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface SpendAnalysisData {
  byCategory: ChartData;
  byVendor: ChartData;
  monthlyTrend: ChartData;
  quarterlyComparison: ChartData;
}

export interface KpiCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}
