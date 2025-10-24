import { useCallback } from 'react';
import { useTenderStore } from '../../../stores/tender.store';
import { CreateTenderRequest, UpdateTenderRequest, TenderFilters } from '../types';

export const useTender = () => {
  const {
    tenders,
    currentTender,
    stats,
    filters,
    pagination,
    isLoading,
    error,
    fetchTenders,
    fetchTenderById,
    fetchTenderStats,
    createTender,
    updateTender,
    deleteTender,
    publishTender,
    closeTender,
    awardTender,
    setFilters,
    setCurrentTender,
    clearError,
    reset,
  } = useTenderStore();

  const handleFetchTenders = useCallback(
    (newFilters?: Partial<TenderFilters>) => {
      return fetchTenders(newFilters);
    },
    [fetchTenders]
  );

  const handleCreateTender = useCallback(
    async (data: CreateTenderRequest) => {
      try {
        const tender = await createTender(data);
        return { success: true, data: tender };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create tender' 
        };
      }
    },
    [createTender]
  );

  const handleUpdateTender = useCallback(
    async (id: string, data: UpdateTenderRequest) => {
      try {
        const tender = await updateTender(id, data);
        return { success: true, data: tender };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update tender' 
        };
      }
    },
    [updateTender]
  );

  const handleDeleteTender = useCallback(
    async (id: string) => {
      try {
        await deleteTender(id);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete tender' 
        };
      }
    },
    [deleteTender]
  );

  const handlePublishTender = useCallback(
    async (id: string) => {
      try {
        const tender = await publishTender(id);
        return { success: true, data: tender };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to publish tender' 
        };
      }
    },
    [publishTender]
  );

  const handleCloseTender = useCallback(
    async (id: string) => {
      try {
        const tender = await closeTender(id);
        return { success: true, data: tender };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to close tender' 
        };
      }
    },
    [closeTender]
  );

  const handleAwardTender = useCallback(
    async (id: string, vendorId: string) => {
      try {
        const tender = await awardTender(id, vendorId);
        return { success: true, data: tender };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to award tender' 
        };
      }
    },
    [awardTender]
  );

  const handleSetFilters = useCallback(
    (newFilters: Partial<TenderFilters>) => {
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

  const handleGetTenderById = useCallback(
    async (id: string) => {
      try {
        return await fetchTenderById(id);
      } catch (error) {
        throw error;
      }
    },
    [fetchTenderById]
  );

  return {
    // State
    tenders,
    currentTender,
    stats,
    filters,
    pagination,
    isLoading,
    error,
    
    // Actions
    fetchTenders: handleFetchTenders,
    fetchTenderById,
    getTenderById: handleGetTenderById,
    fetchTenderStats,
    createTender: handleCreateTender,
    updateTender: handleUpdateTender,
    deleteTender: handleDeleteTender,
    publishTender: handlePublishTender,
    closeTender: handleCloseTender,
    awardTender: handleAwardTender,
    setFilters: handleSetFilters,
    setCurrentTender,
    clearError: handleClearError,
    reset: handleReset,
  };
};
