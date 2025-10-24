'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { KPICard } from '@/components/dashboard/kpi-card';
import { SpendAnalysisChart } from '@/components/dashboard/charts/spend-analysis-chart';
import { MonthlyTrendChart } from '@/components/dashboard/charts/monthly-trend-chart';
import { VendorPerformanceChart } from '@/components/dashboard/charts/vendor-performance-chart';
import { ProcurementEfficiencyChart } from '@/components/dashboard/charts/procurement-efficiency-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  ShoppingCart, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock,
  Plus,
  Eye,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../hooks/useDashboard';

export function DashboardPage() {
  const {
    stats,
    spendAnalysisData,
    kpiCards,
    recentActivity,
    upcomingDeadlines,
    performanceMetrics,
    isLoading,
    error,
    fetchDashboardStats,
    fetchSpendAnalysisData,
    fetchKpiCards,
    fetchRecentActivity,
    fetchUpcomingDeadlines,
    fetchPerformanceMetrics,
    clearError,
  } = useDashboard();

  useEffect(() => {
    // Fetch all dashboard data
    fetchDashboardStats();
    fetchSpendAnalysisData();
    fetchKpiCards();
    fetchRecentActivity(5);
    fetchUpcomingDeadlines(5);
    fetchPerformanceMetrics();
  }, [fetchDashboardStats, fetchSpendAnalysisData, fetchKpiCards, fetchRecentActivity, fetchUpcomingDeadlines, fetchPerformanceMetrics]);

  if (isLoading) {
    return (
      <MainLayout title="Supply Chain Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Supply Chain Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl p-8 shadow-modern border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome back, Mahyar! 👋
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Here's what's happening with your supply chain today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                🚀 3 New Vendors This Week
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                📈 15% Cost Savings
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                ⚡ 98% On-Time Delivery
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearError}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Active Vendors"
            value={stats?.activeVendors || 0}
            subtitle="+2 this month"
            icon={Users}
            trend={{ value: 12.5, isPositive: true }}
            delay={0.1}
          />
          <KPICard
            title="Open Tenders"
            value={stats?.activeTenders || 0}
            subtitle="3 closing soon"
            icon={FileText}
            delay={0.2}
          />
          <KPICard
            title="Purchase Orders"
            value={stats?.totalPurchaseOrders || 0}
            subtitle="6 pending approval"
            icon={ShoppingCart}
            delay={0.3}
          />
          <KPICard
            title="Total Spend"
            value={`$${((stats?.totalSpend || 0) / 1000).toFixed(0)}K`}
            subtitle={`$${((stats?.monthlySpend || 0) / 1000).toFixed(0)}K this month`}
            icon={DollarSign}
            delay={0.4}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendAnalysisChart data={[
            { category: 'Pharmaceuticals', amount: 45000, percentage: 35, trend: 'up' },
            { category: 'Medical Devices', amount: 32000, percentage: 25, trend: 'stable' },
            { category: 'Laboratory Equipment', amount: 28000, percentage: 22, trend: 'down' },
            { category: 'Consumables', amount: 15000, percentage: 12, trend: 'up' },
            { category: 'Other', amount: 8000, percentage: 6, trend: 'stable' }
          ]} />
          <MonthlyTrendChart data={[
            { month: 'Jan', spend: 120000, orders: 45 },
            { month: 'Feb', spend: 135000, orders: 52 },
            { month: 'Mar', spend: 142000, orders: 48 },
            { month: 'Apr', spend: 128000, orders: 41 },
            { month: 'May', spend: 155000, orders: 58 },
            { month: 'Jun', spend: 148000, orders: 55 },
            { month: 'Jul', spend: 162000, orders: 62 },
            { month: 'Aug', spend: 158000, orders: 59 },
            { month: 'Sep', spend: 145000, orders: 51 },
            { month: 'Oct', spend: 138000, orders: 47 },
            { month: 'Nov', spend: 152000, orders: 56 },
            { month: 'Dec', spend: 168000, orders: 64 }
          ]} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VendorPerformanceChart data={[
            { vendor: 'ABC Pharmaceuticals', rating: 4.5, onTimeDelivery: 92, qualityScore: 4.3, totalOrders: 25 },
            { vendor: 'XYZ Medical', rating: 4.2, onTimeDelivery: 88, qualityScore: 4.1, totalOrders: 18 },
            { vendor: 'LabTech Solutions', rating: 4.7, onTimeDelivery: 95, qualityScore: 4.6, totalOrders: 32 },
            { vendor: 'MedSupply Co', rating: 3.9, onTimeDelivery: 85, qualityScore: 3.8, totalOrders: 15 },
            { vendor: 'BioTech Inc', rating: 4.4, onTimeDelivery: 90, qualityScore: 4.2, totalOrders: 22 }
          ]} />
          <ProcurementEfficiencyChart data={[
            { month: 'Jan', processingTime: 6.2, costSavings: 15000, cycleTime: 14, automationRate: 65 },
            { month: 'Feb', processingTime: 5.8, costSavings: 18000, cycleTime: 13, automationRate: 68 },
            { month: 'Mar', processingTime: 5.5, costSavings: 22000, cycleTime: 12, automationRate: 72 },
            { month: 'Apr', processingTime: 5.2, costSavings: 19000, cycleTime: 11, automationRate: 75 },
            { month: 'May', processingTime: 4.9, costSavings: 25000, cycleTime: 10, automationRate: 78 },
            { month: 'Jun', processingTime: 4.7, costSavings: 21000, cycleTime: 9, automationRate: 80 }
          ]} />
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Latest updates from your supply chain operations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {activity.userName} • {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className="text-xs"
                      >
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[
                      { id: '1', title: 'New Vendor Added', userName: 'Mahyar Abidi', timestamp: new Date('2024-12-10T10:30:00'), type: 'vendor_created' },
                      { id: '2', title: 'Tender Published', userName: 'Dr. Sarah Chen', timestamp: new Date('2024-12-10T08:45:00'), type: 'tender_published' },
                      { id: '3', title: 'Purchase Order Created', userName: 'John Smith', timestamp: new Date('2024-12-10T06:20:00'), type: 'po_created' },
                      { id: '4', title: 'PO Approved', userName: 'Dr. Sarah Chen', timestamp: new Date('2024-12-10T04:15:00'), type: 'po_approved' },
                      { id: '5', title: 'Tender Awarded', userName: 'Mahyar Abidi', timestamp: new Date('2024-12-09T16:30:00'), type: 'tender_awarded' }
                    ].map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {activity.userName} • {activity.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={activity.type === 'vendor_created' ? 'default' : 
                                  activity.type === 'tender_published' ? 'default' : 
                                  activity.type === 'po_created' ? 'secondary' : 
                                  activity.type === 'po_approved' ? 'default' : 
                                  'secondary'}
                          className={`text-xs ${
                            activity.type === 'vendor_created' ? 'bg-blue-100 text-blue-800' :
                            activity.type === 'tender_published' ? 'bg-green-100 text-green-800' :
                            activity.type === 'po_created' ? 'bg-purple-100 text-purple-800' :
                            activity.type === 'po_approved' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Upcoming Deadlines</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Important dates and deadlines to keep track of.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((deadline, index) => (
                    <motion.div
                      key={deadline.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{deadline.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {deadline.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(deadline.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={deadline.priority === 'high' ? 'destructive' : deadline.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {deadline.priority}
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[
                      { id: '1', title: 'HPLC Equipment Tender', description: 'Submission deadline for HPLC equipment tender', dueDate: new Date('2024-12-12T17:00:00'), priority: 'high' },
                      { id: '2', title: 'Purchase Order Delivery', description: 'Expected delivery of medical supplies', dueDate: new Date('2024-12-15T09:00:00'), priority: 'medium' },
                      { id: '3', title: 'Vendor Evaluation', description: 'Quarterly vendor performance review', dueDate: new Date('2024-12-17T14:00:00'), priority: 'medium' },
                      { id: '4', title: 'Contract Renewal', description: 'Annual contract renewal with key supplier', dueDate: new Date('2024-12-24T16:00:00'), priority: 'low' }
                    ].map((deadline, index) => (
                      <motion.div
                        key={deadline.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{deadline.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {deadline.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {deadline.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={deadline.priority === 'high' ? 'destructive' : deadline.priority === 'medium' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            deadline.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                            deadline.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {deadline.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        {performanceMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Key performance indicators for your supply chain operations.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {performanceMetrics.vendorPerformance?.averageRating?.toFixed(1) || 'N/A'}
                    </h4>
                    <p className="text-sm text-gray-600">Average Vendor Rating</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {performanceMetrics.procurementEfficiency?.averageProcessingTime || 'N/A'} days
                    </h4>
                    <p className="text-sm text-gray-600">Average Processing Time</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900">
                      ${performanceMetrics.procurementEfficiency?.costSavings?.toLocaleString() || 'N/A'}
                    </h4>
                    <p className="text-sm text-gray-600">Cost Savings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
