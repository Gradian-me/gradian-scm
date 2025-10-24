'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Plus, 
  Truck, 
  Building, 
  Calendar, 
  MapPin,
  Eye,
  Package,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Shipment } from '@/types';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        // Mock data for now
        const mockShipments: Shipment[] = [
          {
            id: '1',
            shipmentNumber: 'SH-2024-001',
            purchaseOrderId: '1',
            purchaseOrder: {
              id: '1',
              poNumber: 'PO-2024-001',
              vendorId: '1',
              vendor: {} as any,
              status: 'acknowledged',
              totalAmount: 23162.5,
              currency: 'USD',
              subtotal: 21250,
              tax: 1912.5,
              taxRate: 9,
              paymentTerms: 'Net 30 days',
              deliveryTerms: 'FOB Destination',
              expectedDeliveryDate: new Date('2024-02-05'),
              items: [],
              createdBy: '2',
              createdAt: new Date('2024-01-20'),
              updatedAt: new Date('2024-01-21'),
            },
            vendorId: '1',
            vendor: {
              id: '1',
              name: 'Transfarma',
              email: 'contact@transfarma.com',
              phone: '+1-555-0123',
              address: '123 Pharma Street',
              city: 'Boston',
              state: 'MA',
              zipCode: '02101',
              country: 'USA',
              registrationNumber: 'TF-2019-001',
              taxId: 'US-TAX-001',
              status: 'active',
              categories: ['HPLC Columns'],
              rating: 4.8,
              joinedDate: new Date('2019-03-15'),
              primaryContact: {
                id: '1',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@transfarma.com',
                phone: '+1-555-0124',
                position: 'Sales Manager',
                isPrimary: true,
              },
              performanceMetrics: {
                onTimeDelivery: 96,
                qualityScore: 94,
                priceCompetitiveness: 88,
                responsiveness: 92,
                complianceScore: 95,
                totalOrders: 45,
                totalValue: 125000,
                averageOrderValue: 2777.78,
              },
              certifications: [],
              createdAt: new Date('2019-03-15'),
              updatedAt: new Date('2024-01-01'),
            },
            status: 'in_transit',
            trackingNumber: 'TRK123456789',
            carrier: 'FedEx',
            estimatedDeliveryDate: new Date('2024-02-05'),
            shippingAddress: {
              street: '456 Research Drive',
              city: 'Boston',
              state: 'MA',
              zipCode: '02115',
              country: 'USA',
            },
            items: [
              {
                id: '1',
                purchaseOrderItemId: '1',
                quantity: 50,
                condition: 'good',
              },
            ],
            createdBy: '2',
            createdAt: new Date('2024-01-22'),
            updatedAt: new Date('2024-01-22'),
          },
          {
            id: '2',
            shipmentNumber: 'SH-2024-002',
            purchaseOrderId: '2',
            purchaseOrder: {
              id: '2',
              poNumber: 'PO-2024-002',
              vendorId: '3',
              vendor: {} as any,
              status: 'in_progress',
              totalAmount: 1771.25,
              currency: 'USD',
              subtotal: 1625,
              tax: 146.25,
              taxRate: 9,
              paymentTerms: 'Net 45 days',
              deliveryTerms: 'FOB Origin',
              expectedDeliveryDate: new Date('2024-01-30'),
              items: [],
              createdBy: '2',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
            },
            vendorId: '3',
            vendor: {
              id: '3',
              name: 'Ottana Pharmed',
              email: 'orders@ottanapharmed.com',
              phone: '+1-555-0127',
              address: '789 Biotech Blvd',
              city: 'Seattle',
              state: 'WA',
              zipCode: '98101',
              country: 'USA',
              registrationNumber: 'OP-2021-003',
              taxId: 'US-TAX-003',
              status: 'active',
              categories: ['Biotech Consumables'],
              rating: 4.5,
              joinedDate: new Date('2021-09-15'),
              primaryContact: {
                id: '3',
                name: 'Lisa Rodriguez',
                email: 'lisa.rodriguez@ottanapharmed.com',
                phone: '+1-555-0128',
                position: 'Business Development Manager',
                isPrimary: true,
              },
              performanceMetrics: {
                onTimeDelivery: 93,
                qualityScore: 89,
                priceCompetitiveness: 91,
                responsiveness: 94,
                complianceScore: 88,
                totalOrders: 28,
                totalValue: 67000,
                averageOrderValue: 2392.86,
              },
              certifications: [],
              createdAt: new Date('2021-09-15'),
              updatedAt: new Date('2024-01-01'),
            },
            status: 'delivered',
            trackingNumber: 'TRK987654321',
            carrier: 'UPS',
            estimatedDeliveryDate: new Date('2024-01-30'),
            actualDeliveryDate: new Date('2024-01-29'),
            shippingAddress: {
              street: '456 Research Drive',
              city: 'Boston',
              state: 'MA',
              zipCode: '02115',
              country: 'USA',
            },
            items: [
              {
                id: '2',
                purchaseOrderItemId: '2',
                quantity: 10,
                receivedQuantity: 10,
                condition: 'good',
              },
            ],
            createdBy: '2',
            createdAt: new Date('2024-01-16'),
            updatedAt: new Date('2024-01-29'),
          },
        ];
        
        setShipments(mockShipments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shipments:', error);
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_transit': return 'info';
      case 'pending': return 'warning';
      case 'delayed': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'delayed': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <MainLayout title="Shipment Tracking" showCreateButton createButtonText="New Shipment">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Shipment Tracking" showCreateButton createButtonText="New Shipment">
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
              placeholder="Search shipment number, vendor, or tracking number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </motion.div>

        {/* Shipments List */}
        <div className="space-y-4">
          {filteredShipments.map((shipment, index) => (
            <motion.div
              key={shipment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{shipment.shipmentNumber}</h3>
                        <Badge variant={getStatusColor(shipment.status)} className="flex items-center space-x-1">
                          {getStatusIcon(shipment.status)}
                          <span>{shipment.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        {/* Shipment Details */}
                        <div>
                          <span className="text-gray-500">Shipment Details:</span>
                          <div className="mt-1">
                            <div className="font-medium">{shipment.shipmentNumber}</div>
                            <div className="text-xs text-gray-600">PO: {shipment.purchaseOrder.poNumber}</div>
                            <div className="text-xs text-gray-600">Created: {formatDate(shipment.createdAt)}</div>
                          </div>
                        </div>

                        {/* Vendor & Tracking */}
                        <div>
                          <span className="text-gray-500">Vendor & Tracking:</span>
                          <div className="mt-1">
                            <div className="font-medium">{shipment.vendor.name}</div>
                            <div className="text-xs text-gray-600">Carrier: {shipment.carrier}</div>
                            <div className="text-xs text-gray-600">Tracking: {shipment.trackingNumber}</div>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div>
                          <span className="text-gray-500">Delivery Info:</span>
                          <div className="mt-1">
                            <div className="text-xs">Expected: {formatDate(shipment.estimatedDeliveryDate)}</div>
                            {shipment.actualDeliveryDate && (
                              <div className="text-xs text-green-600">
                                Delivered: {formatDate(shipment.actualDeliveryDate)}
                              </div>
                            )}
                            <div className="text-xs text-gray-600">
                              {shipment.items.length} item(s)
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <span className="text-gray-500">Shipping Address:</span>
                          <div className="mt-1">
                            <div className="text-xs">{shipment.shippingAddress.street}</div>
                            <div className="text-xs">
                              {shipment.shippingAddress.city}, {shipment.shippingAddress.state} {shipment.shippingAddress.zipCode}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Track
                        </Button>
                        <Button variant="outline" size="sm">
                          <Package className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredShipments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first shipment.'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Button>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
