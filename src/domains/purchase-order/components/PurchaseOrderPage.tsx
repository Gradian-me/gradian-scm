'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { PurchaseOrderForm } from '@/components/forms/purchase-order-form';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  Download
} from 'lucide-react';
import { usePurchaseOrder } from '../hooks/usePurchaseOrder';
import { PurchaseOrder } from '../types';

export function PurchaseOrderPage() {
  const {
    purchaseOrders,
    currentPurchaseOrder,
    stats,
    filters,
    pagination,
    isLoading,
    error,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    approvePurchaseOrder,
    acknowledgePurchaseOrder,
    completePurchaseOrder,
    cancelPurchaseOrder,
    setFilters,
    clearError,
  } = usePurchaseOrder();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const filteredPurchaseOrders = (purchaseOrders || []).filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleCreatePO = async (data: any) => {
    const result = await createPurchaseOrder(data);
    if (result.success) {
      setShowCreateModal(false);
      fetchPurchaseOrders(); // Refresh the list
    }
  };

  const handleViewDetails = (po: PurchaseOrder) => {
    window.location.href = `/purchase-orders/${po.id}`;
  };

  const handleApprove = async (id: string) => {
    const result = await approvePurchaseOrder(id, 'current-user');
    if (result.success) {
      fetchPurchaseOrders(); // Refresh the list
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deletePurchaseOrder(id);
    if (result.success) {
      fetchPurchaseOrders(); // Refresh the list
    }
  };

  const handleCreateButtonClick = () => {
    setShowCreateModal(true);
  };

  if (isLoading || !purchaseOrders) {
    return (
      <MainLayout title="Purchase Orders" showCreateButton={true} createButtonText="New Purchase Order" onCreateClick={handleCreateButtonClick}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Purchase Orders" showCreateButton={true} createButtonText="New Purchase Order" onCreateClick={handleCreateButtonClick}>
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by PO number or vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Orders List */}
        <div className="grid gap-4">
          {filteredPurchaseOrders.map((po) => (
            <motion.div
              key={po.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(po.status)}
                        <h3 className="text-lg font-semibold">{po.poNumber}</h3>
                        {getStatusBadge(po.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{po.vendor.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">${po.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {po.expectedDeliveryDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{(po.items || []).length} items</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p><strong>Payment Terms:</strong> {po.paymentTerms}</p>
                        <p><strong>Delivery Terms:</strong> {po.deliveryTerms}</p>
                        {po.notes && <p><strong>Notes:</strong> {po.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(po)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {po.status === 'pending_approval' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(po.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(po.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPurchaseOrders.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Purchase Orders Found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No purchase orders match your current filters.' 
                  : 'Get started by creating your first purchase order.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleCreateButtonClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Purchase Order
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
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
        )}
      </div>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Purchase Order"
        size="lg"
      >
        <PurchaseOrderForm
          onSubmit={handleCreatePO}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Purchase Order Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Purchase Order Details - ${selectedPO?.poNumber}`}
        size="lg"
      >
        {selectedPO && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">PO Number</Label>
                <p className="text-lg font-semibold">{selectedPO.poNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedPO.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Vendor</Label>
                <p className="text-sm">{selectedPO.vendor.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                <p className="text-lg font-semibold">${selectedPO.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Expected Delivery</Label>
                <p className="text-sm">{selectedPO.expectedDeliveryDate.toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Payment Terms</Label>
                <p className="text-sm">{selectedPO.paymentTerms}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-500">Items</Label>
              <div className="mt-2 space-y-2">
                {(selectedPO.items || []).map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit} × ${item.unitPrice} = ${item.totalPrice.toFixed(2)}
                        </p>
                        {item.specifications && (
                          <p className="text-sm text-gray-500">Specs: {item.specifications}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPO.notes && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Notes</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{selectedPO.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
