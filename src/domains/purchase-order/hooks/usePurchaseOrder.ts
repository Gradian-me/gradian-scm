import { useCallback } from 'react';
import { usePurchaseOrderStore } from '../../../stores/purchase-order.store';
import { CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseOrderFilters } from '../types';

export const usePurchaseOrder = () => {
  const {
    purchaseOrders,
    currentPurchaseOrder,
    stats,
    filters,
    pagination,
    isLoading,
    error,
    fetchPurchaseOrders,
    fetchPurchaseOrderById,
    fetchPurchaseOrderStats,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    approvePurchaseOrder,
    acknowledgePurchaseOrder,
    completePurchaseOrder,
    cancelPurchaseOrder,
    setFilters,
    setCurrentPurchaseOrder,
    clearError,
    reset,
  } = usePurchaseOrderStore();

  const handleFetchPurchaseOrders = useCallback(
    (newFilters?: Partial<PurchaseOrderFilters>) => {
      return fetchPurchaseOrders(newFilters);
    },
    [fetchPurchaseOrders]
  );

  const handleCreatePurchaseOrder = useCallback(
    async (data: CreatePurchaseOrderRequest) => {
      try {
        const purchaseOrder = await createPurchaseOrder(data);
        return { success: true, data: purchaseOrder };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create purchase order' 
        };
      }
    },
    [createPurchaseOrder]
  );

  const handleUpdatePurchaseOrder = useCallback(
    async (id: string, data: UpdatePurchaseOrderRequest) => {
      try {
        const purchaseOrder = await updatePurchaseOrder(id, data);
        return { success: true, data: purchaseOrder };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update purchase order' 
        };
      }
    },
    [updatePurchaseOrder]
  );

  const handleDeletePurchaseOrder = useCallback(
    async (id: string) => {
      try {
        await deletePurchaseOrder(id);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete purchase order' 
        };
      }
    },
    [deletePurchaseOrder]
  );

  const handleApprovePurchaseOrder = useCallback(
    async (id: string, approvedBy: string) => {
      try {
        const purchaseOrder = await approvePurchaseOrder(id, approvedBy);
        return { success: true, data: purchaseOrder };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to approve purchase order' 
        };
      }
    },
    [approvePurchaseOrder]
  );

  const handleAcknowledgePurchaseOrder = useCallback(
    async (id: string) => {
      try {
        const purchaseOrder = await acknowledgePurchaseOrder(id);
        return { success: true, data: purchaseOrder };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to acknowledge purchase order' 
        };
      }
    },
    [acknowledgePurchaseOrder]
  );

  const handleCompletePurchaseOrder = useCallback(
    async (id: string) => {
      try {
        const purchaseOrder = await completePurchaseOrder(id);
        return { success: true, data: purchaseOrder };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to complete purchase order' 
        };
      }
    },
    [completePurchaseOrder]
  );

  const handleCancelPurchaseOrder = useCallback(
    async (id: string, reason: string) => {
      try {
        const purchaseOrder = await cancelPurchaseOrder(id, reason);
        return { success: true, data: purchaseOrder };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to cancel purchase order' 
        };
      }
    },
    [cancelPurchaseOrder]
  );

  const handleSetFilters = useCallback(
    (newFilters: Partial<PurchaseOrderFilters>) => {
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

  const handleGetPurchaseOrderById = useCallback(
    async (id: string) => {
      try {
        return await fetchPurchaseOrderById(id);
      } catch (error) {
        throw error;
      }
    },
    [fetchPurchaseOrderById]
  );

  return {
    // State
    purchaseOrders,
    currentPurchaseOrder,
    stats,
    filters,
    pagination,
    isLoading,
    error,
    
    // Actions
    fetchPurchaseOrders: handleFetchPurchaseOrders,
    fetchPurchaseOrderById,
    getPurchaseOrderById: handleGetPurchaseOrderById,
    fetchPurchaseOrderStats,
    createPurchaseOrder: handleCreatePurchaseOrder,
    updatePurchaseOrder: handleUpdatePurchaseOrder,
    deletePurchaseOrder: handleDeletePurchaseOrder,
    approvePurchaseOrder: handleApprovePurchaseOrder,
    acknowledgePurchaseOrder: handleAcknowledgePurchaseOrder,
    completePurchaseOrder: handleCompletePurchaseOrder,
    cancelPurchaseOrder: handleCancelPurchaseOrder,
    setFilters: handleSetFilters,
    setCurrentPurchaseOrder,
    clearError: handleClearError,
    reset: handleReset,
  };
};
