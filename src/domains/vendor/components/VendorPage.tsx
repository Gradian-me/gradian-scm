'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Star
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../../../components/layout/main-layout';
import { Spinner } from '../../../components/ui/spinner';
import { Button, DynamicCardRenderer, DynamicCardDialog, EmptyState, LoadingState, Modal, SchemaFormWrapper, SearchBar, ViewSwitcher } from '../../../gradian-ui';
import { useEntity } from '../../../gradian-ui/schema-manager';
import { VENDOR_STATUS } from '../../../shared/constants';
import { useVendor } from '../hooks/useVendor';
import { vendorFormSchema } from '../schemas/vendor-form.schema';
import { vendorService } from '../services/vendor.service';
import { Vendor } from '../types';

export function VendorPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedVendorForDetail, setSelectedVendorForDetail] = useState<Vendor | null>(null);
  
  const {
    vendors,
    currentVendor,
    isLoading,
    error,
    fetchVendors,
    fetchVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
    setFilters,
    setCurrentVendor,
    clearError,
  } = useVendor();

  // Use entity hook directly - auto-generates everything from schema
  const entityHook = useEntity<Vendor>('Vendor', vendorFormSchema);
  const {
    searchTerm,
    filterStatus,
    filterCategory,
    selectedVendor,
    isCreateModalOpen,
    isEditModalOpen,
    isModalOpen,
    modalTitle,
    currentFilters,
    vendorFormState,
    handleSearch,
    handleFilterChange,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    handleEditVendor: defaultHandleEditVendor,
    handleDeleteVendor,
  } = entityHook;
  
  // Custom handleViewVendor that opens the detail dialog
  const handleViewVendor = (vendor: Vendor) => {
    console.log('View vendor clicked:', vendor);
    setSelectedVendorForDetail(vendor);
    setIsDetailDialogOpen(true);
    console.log('Dialog state:', { isDetailDialogOpen: true, vendor });
  };

  const [searchTermLocal, setSearchTermLocal] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    // Only fetch if we have actual filter changes from the UI (not from store updates)
    const hasActiveFilters = currentFilters.search || currentFilters.status || currentFilters.category;
    
    // Skip if this is just initial render or filters haven't actually changed
    if (hasActiveFilters && Object.keys(currentFilters).length > 0) {
      const vendorFilters = {
        search: currentFilters.search,
        status: currentFilters.status as 'ACTIVE' | 'INACTIVE' | 'PENDING' | undefined,
        category: currentFilters.category,
      };
      
      // Only update if filters are actually different
      setFilters(vendorFilters);
      
      // Only fetch if we have search/filter criteria from user input
      if (vendorFilters.search || vendorFilters.status || vendorFilters.category) {
        fetchVendors(vendorFilters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters.search, currentFilters.status, currentFilters.category]);

  const handleCreateVendor = async (data: any) => {
    setFormError(null); // Clear any previous error
    setIsSubmitting(true); // Set form submission loading state
    
    try {
      // Email validation function
      const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      // Validate primary email
      if (data.email && !isValidEmail(data.email)) {
        setFormError(`Invalid email format: ${data.email}`);
        return;
      }

      // Validate emails in contacts
      if (data.contacts && Array.isArray(data.contacts)) {
        for (const contact of data.contacts) {
          if (contact.email && !isValidEmail(contact.email)) {
            setFormError(`Invalid email format: ${contact.email}`);
            return;
          }
        }
      }

      // Transform form data to match the expected schema
      const transformedData = {
        ...data,
        categories: data.categories || ['general'], // Default category if not provided
        contacts: data.contacts ? data.contacts.map((contact: any) => ({
          ...contact,
          // Ensure isPrimary is always a boolean
          isPrimary: contact.isPrimary === true || contact.isPrimary === "true" ? true : false,
          // Trim email to remove any trailing characters
          email: contact.email ? contact.email.trim() : contact.email,
          // Ensure required fields are not empty
          department: contact.department || "",
          notes: contact.notes || ""
        })) : [{
          name: data.primaryContactName || data.name,
          email: data.primaryContactEmail || data.email,
          phone: data.primaryContactPhone || data.phone,
          position: data.primaryContactPosition || 'Primary Contact',
          isPrimary: true,
        }],
        status: data.status || 'ACTIVE',
        rating: data.rating ? Number(data.rating) : 5,
      };
      
      const result = await createVendor(transformedData);
      if (result.success) {
        closeCreateModal();
        // Don't reload - the Zustand store already added the vendor to the list
        // fetchVendors();
      } else {
        console.error('Failed to create vendor:', result.error);
        setFormError(result.error || 'Failed to create vendor. Please try again.');
      }
      
      // Clear submission loading state
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error creating vendor:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to create vendor. Please try again.');
      
      // Clear submission loading state
      setIsSubmitting(false);
    }
  };

  // Custom handleEditVendor that fetches fresh data from API directly
  const handleEditVendor = async (vendor: Vendor) => {
    try {
      // Set loading state for this specific vendor
      setIsEditLoading(prev => ({ ...prev, [vendor.id]: true }));
      
      // Fetch the latest data from API directly using the service
      // This bypasses the store's fetchVendorById which sets global loading state
      const freshVendor = await vendorService.getVendorById(vendor.id);
      
      // Update only the current vendor in the store without affecting the list
      setCurrentVendor(freshVendor);
      
      // Clear loading state
      setIsEditLoading(prev => ({ ...prev, [vendor.id]: false }));
      
      // Now open the modal with the fresh data
      openEditModal(freshVendor);
    } catch (error) {
      console.error('Failed to fetch vendor data:', error);
      
      // Clear loading state
      setIsEditLoading(prev => ({ ...prev, [vendor.id]: false }));
      
      // Fallback to using cached data if fetch fails
      setCurrentVendor(vendor);
      openEditModal(vendor);
    }
  };

  const handleUpdateVendor = async (data: any) => {
    setFormError(null); // Clear any previous error
    setIsSubmitting(true); // Set form submission loading state
    
    try {
      if (!selectedVendor?.id) {
        console.error('No vendor selected for update');
        return;
      }

      // Email validation function
      const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      // Validate primary email
      if (data.email && !isValidEmail(data.email)) {
        setFormError(`Invalid email format: ${data.email}`);
        return;
      }

      // Validate emails in contacts
      if (data.contacts && Array.isArray(data.contacts)) {
        for (const contact of data.contacts) {
          if (contact.email && !isValidEmail(contact.email)) {
            setFormError(`Invalid email format: ${contact.email}`);
            return;
          }
        }
      }
      
      // Clean up emails before submission to prevent validation issues
      if (data.email) {
        data.email = data.email.trim();
      }

      // Transform form data to match the expected schema
      const transformedData = {
        ...data,
        categories: data.categories || ['general'], // Default category if not provided
        contacts: data.contacts ? data.contacts.map((contact: any) => ({
          ...contact,
          // Ensure isPrimary is always a boolean
          isPrimary: contact.isPrimary === true || contact.isPrimary === "true" ? true : false,
          // Trim email to remove any trailing characters
          email: contact.email ? contact.email.trim() : contact.email,
          // Ensure required fields are not empty
          department: contact.department || "",
          notes: contact.notes || ""
        })) : [{
          name: data.primaryContactName || data.name,
          email: data.primaryContactEmail || data.email,
          phone: data.primaryContactPhone || data.phone,
          position: data.primaryContactPosition || 'Primary Contact',
          isPrimary: true,
        }],
        status: data.status || 'ACTIVE',
        rating: data.rating ? Number(data.rating) : 5,
      };
      
      const result = await updateVendor(selectedVendor.id, transformedData);
      
      if (result.success) {
        closeEditModal();
        // Don't reload the entire list - the Zustand store already updated the vendor
        // fetchVendors(); // Removed this line
      } else {
        console.error('Failed to update vendor:', result.error);
        setFormError(result.error || 'Failed to update vendor. Please try again.');
      }
      
      // Clear submission loading state
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error updating vendor:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to update vendor. Please try again.');
      
      // Clear submission loading state
      setIsSubmitting(false);
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors?.filter(vendor => {
      const matchesSearch = vendor.name?.toLowerCase().includes(searchTermLocal.toLowerCase()) ||
                           vendor.email?.toLowerCase().includes(searchTermLocal.toLowerCase()) ||
                           vendor.phone?.toLowerCase().includes(searchTermLocal.toLowerCase());
      return matchesSearch;
    }) || [];
  }, [vendors, searchTermLocal]);


  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case VENDOR_STATUS.ACTIVE: return 'success';
      case VENDOR_STATUS.INACTIVE: return 'danger';
      case VENDOR_STATUS.PENDING: return 'warning';
      default: return 'default';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case VENDOR_STATUS.ACTIVE: return <CheckCircle className="h-4 w-4" />;
      case VENDOR_STATUS.INACTIVE: return <AlertCircle className="h-4 w-4" />;
      case VENDOR_STATUS.PENDING: return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  }, []);

  const getRatingStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  }, []);

  if (isLoading) {
    return (
      <MainLayout 
        title="Vendor Management"
      >
        <LoadingState size="lg" text="Loading vendors..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Vendor Management"
    >
      {/* Individual vendor loading indicator (hidden by default) */}
      <div 
        id="vendor-loading-indicator" 
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md z-50"
        style={{ display: 'none' }}
      >
        Loading vendor data...
      </div>
      <div className="space-y-6">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <SearchBar
              placeholder="Search vendors by name, email, or phone..."
              value={searchTermLocal}
              onChange={setSearchTermLocal}
              className="h-10 w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="sm" className="h-10 whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="border border-gray-300 rounded-md h-10 flex items-center">
              <ViewSwitcher
                currentView={viewMode}
                onViewChange={setViewMode}
                className="h-full"
              />
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="h-10 whitespace-nowrap ml-auto sm:ml-0 text-xs"
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </motion.div>

        {/* Vendors List */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4" : "space-y-4"}>
          {filteredVendors.map((vendor, index) => (
            <div key={vendor.id} className="relative">
              {isEditLoading[vendor.id] && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center space-y-2">
                    <Spinner size="lg" variant="primary" />
                    <span className="text-sm font-medium text-blue-600">Loading...</span>
                  </div>
                </div>
              )}
              <DynamicCardRenderer
                key={vendor.id}
                schema={vendorFormSchema}
                data={vendor}
                index={index}
                viewMode={viewMode}
                maxBadges={3}
                maxMetrics={5}
                onView={handleViewVendor}
                onEdit={(v) => {
                  // Only allow edit if not already loading
                  if (!isEditLoading[v.id]) {
                    handleEditVendor(v);
                  }
                }}
                onDelete={handleDeleteVendor}
                className={isEditLoading[vendor.id] ? "opacity-70" : ""}
              />
            </div>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Empty state when no vendors found */}
            <EmptyState
              icon={<Building className="h-12 w-12 text-gray-400" />}
              title="No vendors found"
              description={
                searchTermLocal
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first vendor.'
              }
              action={
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              }
            />
          </motion.div>
        )}
      </div>

      {/* Detail Dialog */}
      <DynamicCardDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        schema={vendorFormSchema}
        data={selectedVendorForDetail}
        title={selectedVendorForDetail?.name || 'Vendor Details'}
        onView={handleViewVendor}
        onEdit={handleEditVendor}
        onDelete={handleDeleteVendor}
      />

      {/* Create/Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={isCreateModalOpen ? closeCreateModal : closeEditModal}
        title={modalTitle}
        description={isCreateModalOpen ? 'Add a new vendor to your system' : 'Edit vendor information'}
        size="lg"
        showCloseButton={false}
      >
        {/* Loading indicator for form submission */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center space-y-3 bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <Spinner size="lg" variant="primary" />
              <span className="text-lg font-medium text-blue-700">
                {isCreateModalOpen ? 'Creating vendor...' : 'Updating vendor...'}
              </span>
            </div>
          </div>
        )}
        <SchemaFormWrapper
          key={isCreateModalOpen ? 'create' : `edit-${currentVendor?.id || 'none'}`}
          schema={vendorFormSchema}
          onSubmit={isCreateModalOpen ? handleCreateVendor : handleUpdateVendor}
          onReset={() => vendorFormState.reset()}
          initialValues={isCreateModalOpen ? vendorFormState.values : (currentVendor ? {
            name: currentVendor.name,
            email: currentVendor.email,
            phone: currentVendor.phone,
            address: currentVendor.address,
            city: currentVendor.city,
            state: currentVendor.state,
            zipCode: currentVendor.zipCode,
            country: currentVendor.country,
            registrationNumber: currentVendor.registrationNumber,
            taxId: currentVendor.taxId,
            categories: currentVendor.categories,
            contacts: currentVendor.contacts || [],
            status: currentVendor.status || 'ACTIVE',
            rating: currentVendor.rating || 5,
          } : vendorFormState.values)}
          onFieldChange={(fieldName, value) => vendorFormState.setValue(fieldName as any, value)}
          error={formError}
          onErrorDismiss={() => setFormError(null)}
          disabled={isSubmitting}
        />
      </Modal>
    </MainLayout>
  );
}
