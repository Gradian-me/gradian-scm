// Vendor UI Hooks

import { useState, useCallback, useMemo } from 'react';
import { useFormState } from '../../../gradian-ui';
import { Vendor, VendorFilters } from '../types';
// import { vendorPageConfig } from '../configs/vendor-page.config'; // No longer needed with schema-based forms

export const useVendorUI = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state for vendor creation/editing
  const vendorFormState = useFormState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    registrationNumber: '',
    taxId: '',
    categories: [],
    contacts: [],
  }, {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true, pattern: /^[\+]?[1-9][\d]{0,15}$/ },
    address: { required: true },
    city: { required: true },
    state: { required: true },
    zipCode: { required: true },
    country: { required: true },
    registrationNumber: { required: true },
    taxId: { required: true },
  });

  // Search and filter handlers
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);

  const handleFilterChange = useCallback((filters: Partial<VendorFilters>) => {
    if (filters.status !== undefined) {
      setFilterStatus(filters.status === 'all' ? 'all' : filters.status);
    }
    if (filters.category !== undefined) {
      setFilterCategory(filters.category === 'all' ? 'all' : filters.category);
    }
  }, []);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
    vendorFormState.reset();
  }, [vendorFormState]);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    vendorFormState.reset();
  }, [vendorFormState]);

  const openEditModal = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditModalOpen(true);
    // Populate form with vendor data
    vendorFormState.setValue('name', vendor.name);
    vendorFormState.setValue('email', vendor.email);
    vendorFormState.setValue('phone', vendor.phone);
    vendorFormState.setValue('address', vendor.address);
    vendorFormState.setValue('city', vendor.city);
    vendorFormState.setValue('state', vendor.state);
    vendorFormState.setValue('zipCode', vendor.zipCode);
    vendorFormState.setValue('country', vendor.country);
    vendorFormState.setValue('registrationNumber', vendor.registrationNumber);
    vendorFormState.setValue('taxId', vendor.taxId);
    vendorFormState.setValue('categories', vendor.categories);
    vendorFormState.setValue('contacts', vendor.contacts || []);
  }, [vendorFormState]);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedVendor(null);
    vendorFormState.reset();
  }, [vendorFormState]);

  // Vendor action handlers
  const handleViewVendor = useCallback((vendor: Vendor) => {
    window.location.href = `/vendors/${vendor.id}`;
  }, []);

  const handleEditVendor = useCallback((vendor: Vendor) => {
    openEditModal(vendor);
  }, [openEditModal]);

  const handleDeleteVendor = useCallback((vendor: Vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      // This would typically call a delete service
      console.log('Delete vendor:', vendor.id);
    }
  }, []);

  // Computed values
  const currentFilters = useMemo(() => ({
    search: searchTerm,
    status: filterStatus === 'all' ? undefined : filterStatus,
    category: filterCategory === 'all' ? undefined : filterCategory,
  }), [searchTerm, filterStatus, filterCategory]);

  const isModalOpen = isCreateModalOpen || isEditModalOpen;
  const modalTitle = isCreateModalOpen ? 'Create New Vendor' : 'Edit Vendor';

  return {
    // State
    searchTerm,
    filterStatus,
    filterCategory,
    selectedVendor,
    isCreateModalOpen,
    isEditModalOpen,
    isModalOpen,
    modalTitle,
    currentFilters,

    // Form state
    vendorFormState,

    // Handlers
    handleSearch,
    handleFilterChange,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    handleViewVendor,
    handleEditVendor,
    handleDeleteVendor,

    // Configs - now using schema-based forms
  };
};
