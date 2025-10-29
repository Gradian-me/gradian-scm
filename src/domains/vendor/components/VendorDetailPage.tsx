'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, GridBuilder, GridItem, KPIIndicator, Avatar, AvatarImage, AvatarFallback, CardWrapper, CardContent, CardHeader, CardTitle, Badge, Button } from '../../../gradian-ui';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { SchemaFormWrapper } from '../../../gradian-ui/form-builder';
import { MainLayout } from '../../../components/layout/main-layout';
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
import { useEntity } from '../../../gradian-ui/schema-manager';
import { Vendor } from '../types';
import { VENDOR_STATUS } from '../../../shared/constants';
import { vendorDetailConfig } from '../configs/vendor-page.config';
import { vendorFormSchema } from '../schemas/vendor-form.schema';
import { motion } from 'framer-motion';

interface VendorDetailPageProps {
  vendorId: string;
}

export function VendorDetailPage({ vendorId }: VendorDetailPageProps) {
  const router = useRouter();
  const { fetchVendorById, updateVendor, deleteVendor, currentVendor } = useVendor();
  const { vendorFormState, openEditModal, closeEditModal, isEditModalOpen } = useEntity<Vendor>('Vendor', vendorFormSchema);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      case VENDOR_STATUS.INACTIVE: return 'danger';
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
    if (currentVendor) {
      openEditModal(currentVendor);
    }
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
      closeEditModal();
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
      <MainLayout title="Loading Vendor">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !currentVendor) {
    return (
      <MainLayout title="Error">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-500 mb-4">{error || 'Vendor not found'}</p>
            <Button onClick={() => router.push('/vendors')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Vendor Details - ${currentVendor.name}`}>
      <div className="container mx-auto px-4 py-6">
      <div className="space-y-6 pb-6">
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
                <Avatar 
                  className="h-16 w-16"
                  fallback={currentVendor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                >
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
              <CardWrapper config={{
                id: 'contact-info-card',
                name: 'Contact Information Card',
                styling: { variant: 'default', size: 'md' }
              }}>
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
              </CardWrapper>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <CardWrapper config={{
                id: 'categories-card',
                name: 'Categories Card',
                styling: { variant: 'default', size: 'md' }
              }}>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentVendor.categories.map((category) => (
                      <Badge key={category} variant="primary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </CardWrapper>
            </motion.div>

            {/* Performance Metrics using KPI Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <GridBuilder config={{ 
                  id: 'performance-metrics-grid',
                  name: 'Performance Metrics Grid',
                  columns: 4, 
                  gap: 4, 
                  responsive: true 
                }}>
                  <KPIIndicator
                    config={vendorDetailConfig.kpiCards[0]}
                    value={currentVendor.performanceMetrics?.onTimeDelivery || 0}
                    previousValue={85} // This would come from historical data
                  />
                  <KPIIndicator
                    config={vendorDetailConfig.kpiCards[1]}
                    value={currentVendor.performanceMetrics?.qualityScore || 0}
                    previousValue={90} // This would come from historical data
                  />
                  <KPIIndicator
                    config={vendorDetailConfig.kpiCards[2]}
                    value={currentVendor.performanceMetrics?.totalOrders || 0}
                    previousValue={50} // This would come from historical data
                  />
                  <KPIIndicator
                    config={vendorDetailConfig.kpiCards[3]}
                    value={currentVendor.performanceMetrics?.totalValue || 0}
                    previousValue={100000} // This would come from historical data
                  />
                </GridBuilder>
              </div>
            </motion.div>

            {/* Certifications */}
            {currentVendor.certifications && currentVendor.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <CardWrapper config={{
                  id: 'certifications-card',
                  name: 'Certifications Card',
                  styling: { variant: 'default', size: 'md' }
                }}>
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
                </CardWrapper>
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
              <CardWrapper config={{
                id: 'primary-contact-card',
                name: 'Primary Contact Card',
                styling: { variant: 'default', size: 'md' }
              }}>
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
              </CardWrapper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <CardWrapper config={{
                id: 'additional-details-card',
                name: 'Additional Details Card',
                styling: { variant: 'default', size: 'md' }
              }}>
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
              </CardWrapper>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Vendor Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Vendor</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <SchemaFormWrapper
                schema={vendorFormSchema}
                onSubmit={handleUpdateVendor}
                onReset={() => vendorFormState.reset()}
                initialValues={vendorFormState.values}
                onFieldChange={(fieldName: any, value: any) => vendorFormState.setValue(fieldName, value)}
              />
            </ScrollArea>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}
