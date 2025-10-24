import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Vendor, VendorFilters, VendorListResponse, VendorStats } from '../domains/vendor/types';
import { vendorService } from '../domains/vendor/services/vendor.service';
import { LoadingState } from '../shared/types/common';

interface VendorState extends LoadingState {
  vendors: Vendor[];
  currentVendor: Vendor | null;
  stats: VendorStats | null;
  filters: VendorFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface VendorActions {
  // Data fetching
  fetchVendors: (filters?: Partial<VendorFilters>) => Promise<void>;
  fetchVendorById: (id: string) => Promise<void>;
  fetchVendorStats: () => Promise<void>;
  
  // CRUD operations
  createVendor: (data: any) => Promise<Vendor>;
  updateVendor: (id: string, data: any) => Promise<Vendor>;
  deleteVendor: (id: string) => Promise<void>;
  
  // State management
  setFilters: (filters: Partial<VendorFilters>) => void;
  setCurrentVendor: (vendor: Vendor | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: VendorState = {
  vendors: [],
  currentVendor: null,
  stats: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    category: undefined,
    rating: undefined,
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

export const useVendorStore = create<VendorState & VendorActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchVendors: async (filters?: Partial<VendorFilters>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentFilters = { ...get().filters, ...filters };
          const response = await vendorService.getAllVendors(currentFilters);
          
          set({
            vendors: response.data,
            pagination: response.pagination,
            filters: currentFilters,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch vendors',
            isLoading: false,
          });
        }
      },

      fetchVendorById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const vendor = await vendorService.getVendorById(id);
          set({
            currentVendor: vendor,
            isLoading: false,
          });
          return vendor;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch vendor',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchVendorStats: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const stats = await vendorService.getVendorStats();
          set({
            stats,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch vendor stats',
            isLoading: false,
          });
        }
      },

      createVendor: async (data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const vendor = await vendorService.createVendor(data);
          
          // Add to current vendors list
          set((state) => {
            // Ensure vendors is always an array
            const currentVendors = Array.isArray(state.vendors) ? state.vendors : [];
            
            return {
              vendors: [vendor, ...currentVendors],
              isLoading: false,
            };
          });
          
          return vendor;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create vendor',
            isLoading: false,
          });
          throw error;
        }
      },

      updateVendor: async (id: string, data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const vendor = await vendorService.updateVendor(id, data);
          
          // Update in current vendors list
          set((state) => ({
            vendors: state.vendors.map(v => v.id === id ? vendor : v),
            currentVendor: state.currentVendor?.id === id ? vendor : state.currentVendor,
            isLoading: false,
          }));
          
          return vendor;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update vendor',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteVendor: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await vendorService.deleteVendor(id);
          
          // Remove from current vendors list
          set((state) => ({
            vendors: state.vendors.filter(v => v.id !== id),
            currentVendor: state.currentVendor?.id === id ? null : state.currentVendor,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete vendor',
            isLoading: false,
          });
          throw error;
        }
      },

      setFilters: (filters: Partial<VendorFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      setCurrentVendor: (vendor: Vendor | null) => {
        set({ currentVendor: vendor });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'vendor-store',
    }
  )
);
