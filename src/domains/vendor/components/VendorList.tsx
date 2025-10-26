'use client';

import { motion } from 'framer-motion';
import {
  Building,
  Edit,
  Eye,
  Mail,
  MapPin,
  Phone,
  Star,
  Trash2
} from 'lucide-react';
import { GridBuilder } from '../../../gradian-ui';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { VENDOR_STATUS } from '../../../shared/constants';
import { vendorPageConfig } from '../configs/vendor-page.config';
import { Vendor } from '../types';

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
      {/* Vendors Grid using Gradian UI GridBuilder */}
      <GridBuilder config={{
        id: 'vendor-grid',
        name: 'Vendor Grid',
        columns: vendorPageConfig.vendorList.layout.columns,
        gap: vendorPageConfig.vendorList.layout.gap,
        responsive: true
      }}>
        {vendors?.filter(vendor => vendor && vendor.id).map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className="bg-white hover:shadow-lg transition-all duration-200 h-full flex flex-col justify-between cursor-pointer hover:scale-[1.01]"
              onClick={() => onView(vendor)}
            >
              {/* Top Section - Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <img
                      src={`/avatars/${(vendor.name || 'vendor').toLowerCase().replace(/\s+/g, '-')}.jpg`}
                      alt={vendor.name || 'Vendor'}
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                      {(vendor.name || 'V').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{vendor.name || 'Unknown Vendor'}</h3>
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

              {/* Main Content Section */}
              <div className="flex-1 space-y-4">
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
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Performance</p>
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
              </div>
            </Card>
          </motion.div>
        ))}
      </GridBuilder>

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
