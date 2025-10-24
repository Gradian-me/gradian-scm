import { useCallback } from 'react';
import { useVendorStore } from '../../../stores/vendor.store';
import { CreateVendorRequest, UpdateVendorRequest, VendorFilters } from '../types';

export const useVendor = () => {
  const {
    vendors,
    currentVendor,
    stats,
    filters,
    pagination,
    isLoading,
    error,
    fetchVendors,
    fetchVendorById,
    fetchVendorStats,
    createVendor,
    updateVendor,
    deleteVendor,
    setFilters,
    setCurrentVendor,
    clearError,
    reset,
  } = useVendorStore();

  const handleFetchVendors = async (newFilters?: Partial<VendorFilters>) => {
    return await fetchVendors(newFilters);
  };

  const handleCreateVendor = useCallback(
    async (data: CreateVendorRequest) => {
      try {
        const vendor = await createVendor(data);
        return { success: true, data: vendor };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create vendor' 
        };
      }
    },
    [createVendor]
  );

  const handleUpdateVendor = useCallback(
    async (id: string, data: UpdateVendorRequest) => {
      try {
        const vendor = await updateVendor(id, data);
        return { success: true, data: vendor };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update vendor' 
        };
      }
    },
    [updateVendor]
  );

  const handleDeleteVendor = useCallback(
    async (id: string) => {
      try {
        await deleteVendor(id);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete vendor' 
        };
      }
    },
    [deleteVendor]
  );

  const handleSetFilters = useCallback(
    (newFilters: Partial<VendorFilters>) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleGetVendorById = useCallback(
    async (id: string) => {
      try {
        return await fetchVendorById(id);
      } catch (error) {
        throw error;
      }
    },
    [fetchVendorById]
  );

  return {
    // State
    vendors,
    currentVendor,
    stats,
    filters,
    pagination,
    isLoading,
    error,
    
    // Actions
    fetchVendors: handleFetchVendors,
    fetchVendorById,
    getVendorById: handleGetVendorById,
    fetchVendorStats,
    createVendor: handleCreateVendor,
    updateVendor: handleUpdateVendor,
    deleteVendor: handleDeleteVendor,
    setFilters: handleSetFilters,
    setCurrentVendor,
    clearError: handleClearError,
    reset: handleReset,
  };
};
