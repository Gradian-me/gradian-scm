import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Tender, TenderFilters, TenderListResponse, TenderStats } from '../domains/tender/types';
import { tenderService } from '../domains/tender/services/tender.service';
import { LoadingState } from '../shared/types/common';

interface TenderState extends LoadingState {
  tenders: Tender[];
  currentTender: Tender | null;
  stats: TenderStats | null;
  filters: TenderFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TenderActions {
  // Data fetching
  fetchTenders: (filters?: Partial<TenderFilters>) => Promise<void>;
  fetchTenderById: (id: string) => Promise<void>;
  fetchTenderStats: () => Promise<void>;
  
  // CRUD operations
  createTender: (data: any) => Promise<Tender>;
  updateTender: (id: string, data: any) => Promise<Tender>;
  deleteTender: (id: string) => Promise<void>;
  
  // Tender actions
  publishTender: (id: string) => Promise<Tender>;
  closeTender: (id: string) => Promise<Tender>;
  awardTender: (id: string, vendorId: string) => Promise<Tender>;
  
  // State management
  setFilters: (filters: Partial<TenderFilters>) => void;
  setCurrentTender: (tender: Tender | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: TenderState = {
  tenders: [],
  currentTender: null,
  stats: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    category: undefined,
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

export const useTenderStore = create<TenderState & TenderActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchTenders: async (filters?: Partial<TenderFilters>) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentFilters = { ...get().filters, ...filters };
          const response = await tenderService.getAllTenders(currentFilters);
          
          set({
            tenders: response.data,
            pagination: response.pagination,
            filters: currentFilters,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch tenders',
            isLoading: false,
          });
        }
      },

      fetchTenderById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const tender = await tenderService.getTenderById(id);
          set({
            currentTender: tender,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch tender',
            isLoading: false,
          });
        }
      },

      fetchTenderStats: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const stats = await tenderService.getTenderStats();
          set({
            stats,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch tender stats',
            isLoading: false,
          });
        }
      },

      createTender: async (data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const tender = await tenderService.createTender(data);
          
          // Add to current tenders list
          set((state) => ({
            tenders: [tender, ...state.tenders],
            isLoading: false,
          }));
          
          return tender;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create tender',
            isLoading: false,
          });
          throw error;
        }
      },

      updateTender: async (id: string, data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const tender = await tenderService.updateTender(id, data);
          
          // Update in current tenders list
          set((state) => ({
            tenders: state.tenders.map(t => t.id === id ? tender : t),
            currentTender: state.currentTender?.id === id ? tender : state.currentTender,
            isLoading: false,
          }));
          
          return tender;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update tender',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteTender: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await tenderService.deleteTender(id);
          
          // Remove from current tenders list
          set((state) => ({
            tenders: state.tenders.filter(t => t.id !== id),
            currentTender: state.currentTender?.id === id ? null : state.currentTender,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete tender',
            isLoading: false,
          });
          throw error;
        }
      },

      publishTender: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const tender = await tenderService.publishTender(id);
          
          // Update in current tenders list
          set((state) => ({
            tenders: state.tenders.map(t => t.id === id ? tender : t),
            currentTender: state.currentTender?.id === id ? tender : state.currentTender,
            isLoading: false,
          }));
          
          return tender;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to publish tender',
            isLoading: false,
          });
          throw error;
        }
      },

      closeTender: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const tender = await tenderService.closeTender(id);
          
          // Update in current tenders list
          set((state) => ({
            tenders: state.tenders.map(t => t.id === id ? tender : t),
            currentTender: state.currentTender?.id === id ? tender : state.currentTender,
            isLoading: false,
          }));
          
          return tender;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to close tender',
            isLoading: false,
          });
          throw error;
        }
      },

      awardTender: async (id: string, vendorId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const tender = await tenderService.awardTender(id, vendorId);
          
          // Update in current tenders list
          set((state) => ({
            tenders: state.tenders.map(t => t.id === id ? tender : t),
            currentTender: state.currentTender?.id === id ? tender : state.currentTender,
            isLoading: false,
          }));
          
          return tender;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to award tender',
            isLoading: false,
          });
          throw error;
        }
      },

      setFilters: (filters: Partial<TenderFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      setCurrentTender: (tender: Tender | null) => {
        set({ currentTender: tender });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'tender-store',
    }
  )
);
