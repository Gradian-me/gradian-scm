'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '../../../components/layout/main-layout';
import { Modal } from '../../../components/ui/modal';
import { VendorForm } from './VendorForm';
import { VendorList } from './VendorList';
import { useVendor } from '../hooks/useVendor';
import { Vendor } from '../types';
import { Plus } from 'lucide-react';

export function VendorPage() {
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchVendors();
  }, []); // Only run once on mount

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setFilters({ search, page: 1 });
    fetchVendors({ search, page: 1 });
  };

  const handleFilter = (filters: any) => {
    const newStatus = filters.status || 'all';
    setFilterStatus(newStatus);
    setFilters({ 
      status: newStatus === 'all' ? undefined : newStatus,
      page: 1 
    });
    fetchVendors({ 
      status: newStatus === 'all' ? undefined : newStatus,
      page: 1 
    });
  };

  const handleCreateVendor = async (data: any) => {
    setIsCreating(true);
    try {
      const result = await createVendor(data);
      if (result.success) {
        setIsCreateModalOpen(false);
        // No need to refresh - vendor is already added to the store
      } else {
        console.error('Failed to create vendor:', result.error);
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewVendor = (vendor: Vendor) => {
    window.location.href = `/vendors/${vendor.id}`;
  };

  const handleEditVendor = (vendor: Vendor) => {
    // TODO: Implement edit vendor functionality
    console.log('Edit vendor:', vendor);
  };

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      try {
        const result = await deleteVendor(vendor.id);
        if (result.success) {
          // Refresh the list
          fetchVendors();
        } else {
          console.error('Failed to delete vendor:', result.error);
        }
      } catch (error) {
        console.error('Error deleting vendor:', error);
      }
    }
  };

  const handleCreateButtonClick = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <MainLayout 
        title="Vendor Management" 
        showCreateButton 
        createButtonText="Add Vendor"
        onCreateClick={handleCreateButtonClick}
      >
        <VendorList
          vendors={vendors || []}
          isLoading={isLoading}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onView={handleViewVendor}
          onEdit={handleEditVendor}
          onDelete={handleDeleteVendor}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
        />
      </MainLayout>

      {/* Create Vendor Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Vendor"
        size="xl"
      >
        <VendorForm
          onSubmit={handleCreateVendor}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>
    </>
  );
}
