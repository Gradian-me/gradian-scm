'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Building,
  BarChart3,
  ShoppingCart,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Vendor } from '../types';
import { VENDOR_STATUS } from '../../../shared/constants';

interface VendorListProps {
  vendors: Vendor[];
  isLoading: boolean;
  onSearch: (search: string) => void;
  onFilter: (filters: any) => void;
  onView: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  searchTerm: string;
  filterStatus: string;
}

export function VendorList({
  vendors,
  isLoading,
  onSearch,
  onFilter,
  onView,
  onEdit,
  onDelete,
  searchTerm,
  filterStatus,
}: VendorListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case VENDOR_STATUS.ACTIVE: return 'success';
      case VENDOR_STATUS.INACTIVE: return 'destructive';
      case VENDOR_STATUS.PENDING: return 'warning';
      default: return 'default';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => onFilter({ status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value={VENDOR_STATUS.ACTIVE}>Active</option>
            <option value={VENDOR_STATUS.INACTIVE}>Inactive</option>
            <option value={VENDOR_STATUS.PENDING}>Pending</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </motion.div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors?.filter(vendor => vendor && vendor.id).map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/avatars/${(vendor.name || 'vendor').toLowerCase().replace(/\s+/g, '-')}.jpg`} />
                      <AvatarFallback>
                        {(vendor.name || 'V').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{vendor.name || 'Unknown Vendor'}</CardTitle>
                      <div className="flex items-center space-x-1 mt-1">
                        {getRatingStars(vendor.rating || 0)}
                        <span className="text-sm text-gray-500 ml-1">
                          {(vendor.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(vendor.status || 'PENDING')}>
                    {vendor.status || 'PENDING'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{vendor.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{vendor.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {vendor.city || 'N/A'}, {vendor.state || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {(vendor.categories || []).slice(0, 3).map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {(vendor.categories || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(vendor.categories || []).length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Performance</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">On-time Delivery</span>
                      <span className="font-medium">
                        {vendor.performanceMetrics?.onTimeDelivery || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Quality Score</span>
                      <span className="font-medium">
                        {vendor.performanceMetrics?.qualityScore || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-medium">
                        {vendor.performanceMetrics?.totalOrders || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Value</span>
                      <span className="font-medium">
                        ${(vendor.performanceMetrics?.totalValue || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onView(vendor)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onEdit(vendor)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDelete(vendor)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {vendors?.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first vendor.'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}
