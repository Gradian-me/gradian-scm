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
import { useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/main-layout';
import { Button, DynamicCardRenderer, EmptyState, LoadingState, Modal, SchemaFormWrapper, SearchBar, ViewSwitcher } from '../../../gradian-ui';
import { VENDOR_STATUS } from '../../../shared/constants';
import { useVendor } from '../hooks/useVendor';
import { useVendorUI } from '../hooks/useVendorUI';
import { vendorFormSchema } from '../schemas/vendor-form.schema';

export function VendorPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const {
    vendors,
    isLoading,
    error,
    fetchVendors,
    createVendor,
    deleteVendor,
    setFilters,
    clearError,
  } = useVendor();

  const {
    searchTerm,
    filterStatus,
    filterCategory,
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
    handleViewVendor,
    handleEditVendor,
    handleDeleteVendor,
    // pageConfig, // No longer needed with schema-based forms
  } = useVendorUI();

  const [searchTermLocal, setSearchTermLocal] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (currentFilters.search || currentFilters.status || currentFilters.category) {
      const vendorFilters = {
        search: currentFilters.search,
        status: currentFilters.status as 'ACTIVE' | 'INACTIVE' | 'PENDING' | undefined,
        category: currentFilters.category,
      };
      setFilters(vendorFilters);
      fetchVendors(vendorFilters);
    }
  }, [currentFilters, setFilters, fetchVendors]);

  const handleCreateVendor = async (data: any) => {
    try {
      // Transform form data to match the expected schema
      const transformedData = {
        ...data,
        categories: data.categories || ['general'], // Default category if not provided
        contacts: data.contacts || [{
          name: data.primaryContactName || data.name,
          email: data.primaryContactEmail || data.email,
          phone: data.primaryContactPhone || data.phone,
          position: data.primaryContactPosition || 'Primary Contact',
          isPrimary: true,
        }],
      };
      
      const result = await createVendor(transformedData);
      if (result.success) {
        closeCreateModal();
        fetchVendors();
      } else {
        console.error('Failed to create vendor:', result.error);
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
    }
  };

  const handleUpdateVendor = async (data: any) => {
    try {
      // TODO: Implement update vendor functionality
      console.log('Update vendor:', data);
      closeEditModal();
      fetchVendors();
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  const filteredVendors = vendors?.filter(vendor => {
    const matchesSearch = vendor.name?.toLowerCase().includes(searchTermLocal.toLowerCase()) ||
                         vendor.email?.toLowerCase().includes(searchTermLocal.toLowerCase()) ||
                         vendor.phone?.toLowerCase().includes(searchTermLocal.toLowerCase());
    return matchesSearch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case VENDOR_STATUS.ACTIVE: return 'success';
      case VENDOR_STATUS.INACTIVE: return 'danger';
      case VENDOR_STATUS.PENDING: return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case VENDOR_STATUS.ACTIVE: return <CheckCircle className="h-4 w-4" />;
      case VENDOR_STATUS.INACTIVE: return <AlertCircle className="h-4 w-4" />;
      case VENDOR_STATUS.PENDING: return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
      <MainLayout 
        title="Vendor Management" 
        showCreateButton 
        createButtonText="Add Vendor"
        onCreateClick={openCreateModal}
      >
        <LoadingState size="lg" text="Loading vendors..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Vendor Management" 
      showCreateButton 
      createButtonText="Add Vendor"
      onCreateClick={openCreateModal}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 h-10">
            <SearchBar
              placeholder="Search vendors by name, email, or phone..."
              value={searchTermLocal}
              onChange={setSearchTermLocal}
              className="h-full"
            />
          </div>
          <div className="flex gap-2 items-center h-10">
            <Button variant="outline" size="sm" className="h-10">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <ViewSwitcher
              currentView={viewMode}
              onViewChange={setViewMode}
              className="h-10"
            />
          </div>
        </motion.div>

        {/* Vendors List */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredVendors.map((vendor, index) => (
            <DynamicCardRenderer
              key={vendor.id}
              schema={vendorFormSchema}
              data={vendor}
              index={index}
              viewMode={viewMode}
              onView={handleViewVendor}
              onEdit={handleEditVendor}
              onDelete={handleDeleteVendor}
            />
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

      {/* Create/Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={isCreateModalOpen ? closeCreateModal : closeEditModal}
        title={modalTitle}
        size="lg"
        showCloseButton={false}
      >
        <SchemaFormWrapper
          schema={vendorFormSchema}
          onSubmit={isCreateModalOpen ? handleCreateVendor : handleUpdateVendor}
          onReset={() => vendorFormState.reset()}
          initialValues={vendorFormState.values}
          onFieldChange={(fieldName, value) => vendorFormState.setValue(fieldName as any, value)}
        />
      </Modal>
    </MainLayout>
  );
}
