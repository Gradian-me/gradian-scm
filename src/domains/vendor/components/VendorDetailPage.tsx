'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../../../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Modal } from '../../../components/ui/modal';
import { VendorForm } from './VendorForm';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Building,
  BarChart3,
  ShoppingCart,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  FileText
} from 'lucide-react';
import { useVendor } from '../hooks/useVendor';
import { Vendor } from '../types';
import { VENDOR_STATUS } from '../../../shared/constants';
import { motion } from 'framer-motion';

interface VendorDetailPageProps {
  vendorId: string;
}

export function VendorDetailPage({ vendorId }: VendorDetailPageProps) {
  const router = useRouter();
  const { fetchVendorById, updateVendor, deleteVendor, currentVendor } = useVendor();
  // Use currentVendor from store instead of local state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setIsLoading(true);
        await fetchVendorById(vendorId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendor');
      } finally {
        setIsLoading(false);
      }
    };

    if (vendorId) {
      fetchVendor();
    }
  }, [vendorId, fetchVendorById]);

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

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(dateObj);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const convertVendorToFormData = (vendor: Vendor | null) => {
    if (!vendor) return undefined;
    return {
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zipCode: vendor.zipCode,
      country: vendor.country,
      registrationNumber: vendor.registrationNumber,
      taxId: vendor.taxId,
      categories: vendor.categories,
      contacts: (vendor.contacts || []).map(contact => ({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        position: contact.position,
        isPrimary: contact.isPrimary,
      })),
    };
  };

  const handleUpdateVendor = async (data: any) => {
    if (!currentVendor) return;
    
    setIsUpdating(true);
    try {
      const updatedVendor = await updateVendor(currentVendor.id, data);
      // The store will automatically update currentVendor
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (currentVendor && window.confirm(`Are you sure you want to delete ${currentVendor.name}?`)) {
      try {
        await deleteVendor(currentVendor.id);
        router.push('/vendors');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Vendor Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !currentVendor) {
    return (
      <MainLayout title="Vendor Details">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error || 'Vendor not found'}</p>
          <Button onClick={() => router.push('/vendors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Vendor Details">
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
              onClick={() => router.push('/vendors')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                <AvatarImage src={`/avatars/${currentVendor.name.toLowerCase().replace(/\s+/g, '-')}.jpg`} />
                <AvatarFallback>
                  {currentVendor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{currentVendor.name}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center space-x-1">
                    {getRatingStars(currentVendor.rating)}
                    <span className="text-sm text-gray-500 ml-1">
                      {(currentVendor.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <Badge variant={getStatusColor(currentVendor.status)}>
                    {currentVendor.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>

        {/* Vendor Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{currentVendor.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{currentVendor.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {currentVendor.address}, {currentVendor.city}, {currentVendor.state} {currentVendor.zipCode}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Registration Number</label>
                        <p className="text-sm">{currentVendor.registrationNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tax ID</label>
                        <p className="text-sm">{currentVendor.taxId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Country</label>
                        <p className="text-sm">{currentVendor.country}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentVendor.categories.map((category) => (
                      <Badge key={category} variant="info">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentVendor.performanceMetrics?.onTimeDelivery || 0}%
                      </div>
                      <div className="text-sm text-gray-500">On-time Delivery</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentVendor.performanceMetrics?.qualityScore || 0}%
                      </div>
                      <div className="text-sm text-gray-500">Quality Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentVendor.performanceMetrics?.totalOrders || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${(currentVendor.performanceMetrics?.totalValue || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Total Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Certifications */}
            {currentVendor.certifications && currentVendor.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentVendor.certifications.map((cert) => (
                        <div key={cert.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{cert.name}</h4>
                              <p className="text-sm text-gray-600">Issued by: {cert.issuer}</p>
                              <p className="text-sm text-gray-500">
                                Issued: {formatDate(cert.issueDate || new Date())} - Expires: {formatDate(cert.expiryDate || new Date())}
                              </p>
                            </div>
                            <Badge variant={cert.status === 'active' ? 'success' : 'secondary'}>
                              {cert.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Primary Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const primaryContact = currentVendor.contacts?.find(contact => contact.isPrimary) || currentVendor.contacts?.[0];
                      return (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Name</label>
                            <p className="text-sm">{primaryContact?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-sm">{primaryContact?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="text-sm">{primaryContact?.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Position</label>
                            <p className="text-sm">{primaryContact?.position || 'N/A'}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Joined Date</label>
                      <p className="text-sm">{formatDate(currentVendor.joinedDate || new Date())}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Average Order Value</label>
                      <p className="text-sm">${(currentVendor.performanceMetrics?.averageOrderValue || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Price Competitiveness</label>
                      <p className="text-sm">{currentVendor.performanceMetrics?.priceCompetitiveness || 0}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Responsiveness</label>
                      <p className="text-sm">{currentVendor.performanceMetrics?.responsiveness || 0}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Compliance Score</label>
                      <p className="text-sm">{currentVendor.performanceMetrics?.complianceScore || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Vendor Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Vendor"
        size="xl"
      >
        <VendorForm
          onSubmit={handleUpdateVendor}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isUpdating}
          initialData={currentVendor ? convertVendorToFormData(currentVendor) : undefined}
          isEditMode={true}
        />
      </Modal>
    </MainLayout>
  );
}
