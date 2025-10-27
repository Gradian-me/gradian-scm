'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../../../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Building2, 
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Eye
} from 'lucide-react';
import { usePurchaseOrder } from '../hooks/usePurchaseOrder';
import { PurchaseOrder } from '../types';
import { motion } from 'framer-motion';

interface PurchaseOrderDetailPageProps {
  purchaseOrderId: string;
}

export function PurchaseOrderDetailPage({ purchaseOrderId }: PurchaseOrderDetailPageProps) {
  const router = useRouter();
  const { fetchPurchaseOrderById, currentPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, approvePurchaseOrder } = usePurchaseOrder();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        setIsLoading(true);
        await fetchPurchaseOrderById(purchaseOrderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch purchase order');
      } finally {
        setIsLoading(false);
      }
    };

    if (purchaseOrderId) {
      fetchPurchaseOrder();
    }
  }, [purchaseOrderId, fetchPurchaseOrderById]);

  const purchaseOrder = currentPurchaseOrder;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      acknowledged: { label: 'Acknowledged', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'approved':
      case 'acknowledged':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'pending_approval':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleApprove = async () => {
    if (purchaseOrder && window.confirm(`Are you sure you want to approve "${purchaseOrder.poNumber}"?`)) {
      try {
        await approvePurchaseOrder(purchaseOrder.id, 'current-user');
        // Refresh the purchase order data
        await fetchPurchaseOrderById(purchaseOrderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to approve purchase order');
      }
    }
  };

  const handleDelete = async () => {
    if (purchaseOrder && window.confirm(`Are you sure you want to delete "${purchaseOrder.poNumber}"?`)) {
      try {
        await deletePurchaseOrder(purchaseOrder.id);
        router.push('/purchase-orders');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete purchase order');
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Purchase Order Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <MainLayout title="Purchase Order Details">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error || 'Purchase order not found'}</p>
          <Button onClick={() => router.push('/purchase-orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Purchase Order Details">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/purchase-orders')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{purchaseOrder.poNumber}</h1>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusIcon(purchaseOrder.status)}
                {getStatusBadge(purchaseOrder.status)}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/purchase-orders/${purchaseOrder.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {purchaseOrder.status === 'pending_approval' && (
              <Button onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>

        {/* Purchase Order Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(purchaseOrder.items || []).map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity} {item.unit}
                            </p>
                            {item.specifications && (
                              <p className="text-sm text-gray-500">
                                Specifications: {item.specifications}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${item.unitPrice.toFixed(2)} per {item.unit}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: ${item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                      <p className="text-sm">{purchaseOrder.paymentTerms}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Delivery Terms</label>
                      <p className="text-sm">{purchaseOrder.deliveryTerms}</p>
                    </div>
                    {purchaseOrder.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Notes</label>
                        <p className="text-sm p-3 bg-gray-50 rounded-lg">{purchaseOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">PO Number</label>
                      <p className="text-sm font-mono">{purchaseOrder.poNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Amount</label>
                      <p className="text-lg font-semibold">${purchaseOrder.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expected Delivery</label>
                      <p className="text-sm">{formatDate(purchaseOrder.expectedDeliveryDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created Date</label>
                      <p className="text-sm">{formatDate(purchaseOrder.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-sm">{formatDate(purchaseOrder.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vendor Name</label>
                      <p className="text-sm">{purchaseOrder.vendor.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Email</label>
                      <p className="text-sm">{purchaseOrder.vendor.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm">{purchaseOrder.vendor.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-sm">
                        {purchaseOrder.vendor.address}, {purchaseOrder.vendor.city}, {purchaseOrder.vendor.state}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Items</span>
                      <span className="text-sm font-medium">{(purchaseOrder.items || []).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Subtotal</span>
                      <span className="text-sm font-medium">${purchaseOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Tax</span>
                      <span className="text-sm font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm font-bold">${purchaseOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
