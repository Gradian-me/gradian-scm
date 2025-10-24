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
  Receipt, 
  Building, 
  Calendar, 
  DollarSign,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Invoice } from '@/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // Mock data for now
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            invoiceNumber: 'INV-2024-001',
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
            status: 'pending_approval',
            totalAmount: 23162.5,
            currency: 'USD',
            subtotal: 21250,
            tax: 1912.5,
            taxRate: 9,
            dueDate: new Date('2024-02-20'),
            reference: 'PO-2024-001',
            items: [
              {
                id: '1',
                description: 'HPLC Column C18 4.6x250mm',
                quantity: 50,
                unitPrice: 425,
                totalPrice: 21250,
                taxRate: 9,
                taxAmount: 1912.5,
              },
            ],
            createdBy: '2',
            createdAt: new Date('2024-01-25'),
            updatedAt: new Date('2024-01-25'),
          },
          {
            id: '2',
            invoiceNumber: 'INV-2024-002',
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
            status: 'paid',
            totalAmount: 1771.25,
            currency: 'USD',
            subtotal: 1625,
            tax: 146.25,
            taxRate: 9,
            dueDate: new Date('2024-02-15'),
            paidDate: new Date('2024-01-30'),
            paymentMethod: 'Wire Transfer',
            reference: 'PO-2024-002',
            items: [
              {
                id: '2',
                description: 'Cell Culture Flask T75',
                quantity: 10,
                unitPrice: 162.5,
                totalPrice: 1625,
                taxRate: 9,
                taxAmount: 146.25,
              },
            ],
            createdBy: '2',
            approvedBy: '3',
            approvedAt: new Date('2024-01-30'),
            createdAt: new Date('2024-01-28'),
            updatedAt: new Date('2024-01-30'),
          },
        ];
        
        setInvoices(mockInvoices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending_approval': return 'warning';
      case 'approved': return 'info';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'destructive';
      case 'draft': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
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
      <MainLayout title="Invoice Management" showCreateButton createButtonText="New Invoice">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Invoice Management" showCreateButton createButtonText="New Invoice">
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
              placeholder="Search invoice number or vendor..."
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
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </motion.div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                        <Badge variant={getStatusColor(invoice.status)} className="flex items-center space-x-1">
                          {getStatusIcon(invoice.status)}
                          <span>{invoice.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        {/* Invoice Details */}
                        <div>
                          <span className="text-gray-500">Invoice Details:</span>
                          <div className="mt-1">
                            <div className="font-medium">{invoice.invoiceNumber}</div>
                            <div className="text-xs text-gray-600">Reference: {invoice.reference}</div>
                            <div className="text-xs text-gray-600">Created: {formatDate(invoice.createdAt)}</div>
                          </div>
                        </div>

                        {/* Vendor */}
                        <div>
                          <span className="text-gray-500">Vendor:</span>
                          <div className="mt-1">
                            <div className="font-medium">{invoice.vendor.name}</div>
                            <div className="text-xs text-gray-600">{invoice.vendor.email}</div>
                          </div>
                        </div>

                        {/* Amount & Due Date */}
                        <div>
                          <span className="text-gray-500">Amount & Due:</span>
                          <div className="mt-1">
                            <div className="font-medium text-lg">${invoice.totalAmount.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">
                              Due: {formatDate(invoice.dueDate)}
                            </div>
                            {invoice.paidDate && (
                              <div className="text-xs text-green-600">
                                Paid: {formatDate(invoice.paidDate)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div>
                          <span className="text-gray-500">Payment:</span>
                          <div className="mt-1">
                            <div className="text-xs">Subtotal: ${invoice.subtotal.toLocaleString()}</div>
                            <div className="text-xs">Tax: ${invoice.tax.toLocaleString()}</div>
                            {invoice.paymentMethod && (
                              <div className="text-xs text-gray-600">
                                Method: {invoice.paymentMethod}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first invoice.'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
