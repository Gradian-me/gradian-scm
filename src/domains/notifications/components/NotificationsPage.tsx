'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationGroup } from './NotificationGroup';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationService } from '../services/notification.service';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  X, 
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export function NotificationsPage() {
  const {
    groupedNotifications,
    isLoading,
    error,
    filters,
    unreadCount,
    updateFilters,
    markAsRead,
    markAllAsRead,
    clearFilters
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({ [key]: value === 'all' ? undefined : value });
  };

  const getFilterCounts = () => {
    const counts = {
      all: groupedNotifications.reduce((sum, group) => sum + group.notifications.length, 0),
      unread: groupedNotifications.reduce((sum, group) => sum + group.unreadCount, 0),
      success: 0,
      warning: 0,
      error: 0,
      info: 0
    };

    groupedNotifications.forEach(group => {
      group.notifications.forEach(notification => {
        counts[notification.type as keyof typeof counts]++;
      });
    });

    return counts;
  };

  const filterCounts = getFilterCounts();

  return (
    <MainLayout title="Notifications">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-violet-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{filterCounts.all}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">{filterCounts.unread}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Success</p>
                  <p className="text-2xl font-bold text-gray-900">{filterCounts.success}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-gray-900">{filterCounts.error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search & Filter</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={markAllAsRead}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                    <select
                      value={filters.type || 'all'}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-400"
                    >
                      <option value="all">All Types ({filterCounts.all})</option>
                      <option value="success">Success ({filterCounts.success})</option>
                      <option value="info">Info ({filterCounts.info})</option>
                      <option value="warning">Warning ({filterCounts.warning})</option>
                      <option value="error">Error ({filterCounts.error})</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                    <select
                      value={filters.category || 'all'}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-400"
                    >
                      <option value="all">All Categories</option>
                      <option value="quotation">Quotations</option>
                      <option value="purchase_order">Purchase Orders</option>
                      <option value="shipment">Shipments</option>
                      <option value="vendor">Vendors</option>
                      <option value="tender">Tenders</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                    <select
                      value={filters.isRead === undefined ? 'all' : filters.isRead ? 'read' : 'unread'}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange('isRead', value === 'all' ? undefined : value === 'read');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-400"
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread ({filterCounts.unread})</option>
                      <option value="read">Read</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Active Filters */}
              {(filters.type || filters.category || filters.isRead !== undefined) && (
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {filters.type && (
                    <Badge variant="info" className="text-xs">
                      Type: {NotificationService.getTypeLabel(filters.type)}
                    </Badge>
                  )}
                  {filters.category && (
                    <Badge variant="info" className="text-xs">
                      Category: {NotificationService.getCategoryLabel(filters.category)}
                    </Badge>
                  )}
                  {filters.isRead !== undefined && (
                    <Badge variant="info" className="text-xs">
                      Status: {filters.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading notifications...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notifications</h3>
              <p className="text-gray-600">{error}</p>
            </CardContent>
          </Card>
        ) : groupedNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedNotifications.map((group) => (
              <NotificationGroup
                key={group.category}
                group={group}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
