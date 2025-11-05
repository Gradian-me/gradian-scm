'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SpendAnalysisChart } from '@/components/dashboard/charts/spend-analysis-chart';
import { MonthlyTrendChart } from '@/components/dashboard/charts/monthly-trend-chart';
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Users,
  Download,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardMetrics, SpendAnalysis, MonthlyTrend } from '@/types';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [spendAnalysis, setSpendAnalysis] = useState<SpendAnalysis[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        if (data.success) {
          setMetrics(data.data.metrics);
          setSpendAnalysis(data.data.spendAnalysis);
          setMonthlyTrends(data.data.monthlyTrends);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <MainLayout title="Analytics & Reporting">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Analytics & Reporting">
      <div className="space-y-6">
        {/* Header with Export Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
            <p className="text-gray-600">Comprehensive insights into your supply chain performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>Last 3 months</option>
              <option>This year</option>
            </select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${metrics?.totalSpend.toLocaleString()}
                </div>
                <p className="text-xs text-green-600">+12.5% from last period</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${metrics?.costSavings.toLocaleString()}
                </div>
                <p className="text-xs text-blue-600">5.8% of total spend</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Vendor Rating</CardTitle>
                <Shield className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics?.averageVendorRating}
                </div>
                <p className="text-xs text-yellow-600">Excellent performance</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                <Users className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-600">
                  {metrics?.onTimeDelivery}%
                </div>
                <p className="text-xs text-violet-600">Above target (90%)</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit"
        >
          <Button variant="default" size="sm">Spend Analysis</Button>
          <Button variant="ghost" size="sm">Vendor Performance</Button>
          <Button variant="ghost" size="sm">Tender Funnel</Button>
          <Button variant="ghost" size="sm">Tender Analysis</Button>
          <Button variant="ghost" size="sm">Risk Assessment</Button>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendAnalysisChart data={spendAnalysis} />
          <MonthlyTrendChart data={monthlyTrends} />
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Top Performing Vendors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transfarma</span>
                  <Badge variant="success">4.8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ottana Pharmed</span>
                  <Badge variant="success">4.5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Exapilog</span>
                  <Badge variant="warning">4.2</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Recent Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Spend Growth</span>
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Volume</span>
                  <span className="text-sm font-medium text-blue-600">+8.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cost Savings</span>
                  <span className="text-sm font-medium text-green-600">+5.8%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Compliance Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
                  <p className="text-sm text-gray-600">Above industry average</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
