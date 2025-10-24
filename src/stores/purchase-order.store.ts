import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PurchaseOrder, PurchaseOrderFilters, PurchaseOrderListResponse, PurchaseOrderStats } from '../domains/purchase-order/types';
import { purchaseOrderService } from '../domains/purchase-order/services/purchase-order.service';
import { LoadingState } from '../shared/types/common';

interface PurchaseOrderState extends LoadingState {
  purchaseOrders: PurchaseOrder[];
  currentPurchaseOrder: PurchaseOrder | null;
  stats: PurchaseOrderStats | null;
  filters: PurchaseOrderFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PurchaseOrderActions {
  // Data fetching
  fetchPurchaseOrders: (filters?: Partial<PurchaseOrderFilters>) => Promise<void>;
  fetchPurchaseOrderById: (id: string) => Promise<void>;
  fetchPurchaseOrderStats: () => Promise<void>;
  
  // CRUD operations
  createPurchaseOrder: (data: any) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (id: string, data: any) => Promise<PurchaseOrder>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  
  // Purchase order actions
  approvePurchaseOrder: (id: string, approvedBy: string) => Promise<PurchaseOrder>;
  acknowledgePurchaseOrder: (id: string) => Promise<PurchaseOrder>;
  completePurchaseOrder: (id: string) => Promise<PurchaseOrder>;
  cancelPurchaseOrder: (id: string, reason: string) => Promise<PurchaseOrder>;
  
  // State management
  setFilters: (filters: Partial<PurchaseOrderFilters>) => void;
  setCurrentPurchaseOrder: (purchaseOrder: PurchaseOrder | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: PurchaseOrderState = {
  purchaseOrders: [],
  currentPurchaseOrder: null,
  stats: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    vendorId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

export const usePurchaseOrderStore = create<PurchaseOrderState & PurchaseOrderActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchPurchaseOrders: async (filters?: Partial<PurchaseOrderFilters>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentFilters = { ...get().filters, ...filters };
          const response = await purchaseOrderService.getAllPurchaseOrders(currentFilters);
          
          set({
            purchaseOrders: response.data,
            pagination: response.pagination,
            filters: currentFilters,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch purchase orders',
            isLoading: false,
          });
        }
      },

      fetchPurchaseOrderById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(id);
          set({
            currentPurchaseOrder: purchaseOrder,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch purchase order',
            isLoading: false,
          });
        }
      },

      fetchPurchaseOrderStats: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const stats = await purchaseOrderService.getPurchaseOrderStats();
          set({
            stats,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch purchase order stats',
            isLoading: false,
          });
        }
      },

      createPurchaseOrder: async (data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const purchaseOrder = await purchaseOrderService.createPurchaseOrder(data);
          
          // Add to current purchase orders list
          set((state) => ({
            purchaseOrders: [purchaseOrder, ...state.purchaseOrders],
            isLoading: false,
          }));
          
          return purchaseOrder;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create purchase order',
            isLoading: false,
          });
          throw error;
        }
      },

      updatePurchaseOrder: async (id: string, data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(id, data);
          
          // Update in current purchase orders list
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map(po => po.id === id ? purchaseOrder : po),
            currentPurchaseOrder: state.currentPurchaseOrder?.id === id ? purchaseOrder : state.currentPurchaseOrder,
            isLoading: false,
          }));
          
          return purchaseOrder;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update purchase order',
            isLoading: false,
          });
          throw error;
        }
      },

      deletePurchaseOrder: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await purchaseOrderService.deletePurchaseOrder(id);
          
          // Remove from current purchase orders list
          set((state) => ({
            purchaseOrders: state.purchaseOrders.filter(po => po.id !== id),
            currentPurchaseOrder: state.currentPurchaseOrder?.id === id ? null : state.currentPurchaseOrder,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete purchase order',
            isLoading: false,
          });
          throw error;
        }
      },

      approvePurchaseOrder: async (id: string, approvedBy: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const purchaseOrder = await purchaseOrderService.approvePurchaseOrder(id, approvedBy);
          
          // Update in current purchase orders list
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map(po => po.id === id ? purchaseOrder : po),
            currentPurchaseOrder: state.currentPurchaseOrder?.id === id ? purchaseOrder : state.currentPurchaseOrder,
            isLoading: false,
          }));
          
          return purchaseOrder;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to approve purchase order',
            isLoading: false,
          });
          throw error;
        }
      },

      acknowledgePurchaseOrder: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const purchaseOrder = await purchaseOrderService.acknowledgePurchaseOrder(id);
          
          // Update in current purchase orders list
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map(po => po.id === id ? purchaseOrder : po),
            currentPurchaseOrder: state.currentPurchaseOrder?.id === id ? purchaseOrder : state.currentPurchaseOrder,
            isLoading: false,
          }));
          
          return purchaseOrder;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to acknowledge purchase order',
            isLoading: false,
          });
          throw error;
        }
      },

      completePurchaseOrder: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const purchaseOrder = await purchaseOrderService.completePurchaseOrder(id);
          
          // Update in current purchase orders list
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map(po => po.id === id ? purchaseOrder : po),
            currentPurchaseOrder: state.currentPurchaseOrder?.id === id ? purchaseOrder : state.currentPurchaseOrder,
            isLoading: false,
          }));
          
          return purchaseOrder;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to complete purchase order',
            isLoading: false,
          });
          throw error;
        }
      },

      cancelPurchaseOrder: async (id: string, reason: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const purchaseOrder = await purchaseOrderService.cancelPurchaseOrder(id, reason);
          
          // Update in current purchase orders list
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map(po => po.id === id ? purchaseOrder : po),
            currentPurchaseOrder: state.currentPurchaseOrder?.id === id ? purchaseOrder : state.currentPurchaseOrder,
            isLoading: false,
          }));
          
          return purchaseOrder;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to cancel purchase order',
            isLoading: false,
          });
          throw error;
        }
      },

      setFilters: (filters: Partial<PurchaseOrderFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      setCurrentPurchaseOrder: (purchaseOrder: PurchaseOrder | null) => {
        set({ currentPurchaseOrder: purchaseOrder });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'purchase-order-store',
    }
  )
);
