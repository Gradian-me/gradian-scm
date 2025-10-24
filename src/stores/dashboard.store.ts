import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DashboardStats, SpendAnalysisData, KpiCard, ActivityItem, DeadlineItem } from '../domains/dashboard/types';
import { dashboardService } from '../domains/dashboard/services/dashboard.service';
import { LoadingState } from '../shared/types/common';

interface DashboardState extends LoadingState {
  stats: DashboardStats | null;
  spendAnalysisData: SpendAnalysisData | null;
  kpiCards: KpiCard[];
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
  performanceMetrics: any;
  filters: any;
}

interface DashboardActions {
  // Data fetching
  fetchDashboardStats: (filters?: any) => Promise<void>;
  fetchSpendAnalysisData: (filters?: any) => Promise<void>;
  fetchKpiCards: () => Promise<void>;
  fetchRecentActivity: (limit?: number) => Promise<void>;
  fetchUpcomingDeadlines: (limit?: number) => Promise<void>;
  fetchPerformanceMetrics: () => Promise<void>;
  
  // State management
  setFilters: (filters: any) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: DashboardState = {
  stats: null,
  spendAnalysisData: null,
  kpiCards: [],
  recentActivity: [],
  upcomingDeadlines: [],
  performanceMetrics: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchDashboardStats: async (filters?: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const stats = await dashboardService.getDashboardStats(filters);
          set({
            stats,
            filters: filters || {},
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
            isLoading: false,
          });
        }
      },

      fetchSpendAnalysisData: async (filters?: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const spendAnalysisData = await dashboardService.getSpendAnalysisData(filters);
          set({
            spendAnalysisData,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch spend analysis data',
            isLoading: false,
          });
        }
      },

      fetchKpiCards: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const kpiCards = await dashboardService.getKpiCards();
          set({
            kpiCards,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch KPI cards',
            isLoading: false,
          });
        }
      },

      fetchRecentActivity: async (limit: number = 10) => {
        set({ isLoading: true, error: null });
        
        try {
          const recentActivity = await dashboardService.getRecentActivity(limit);
          set({
            recentActivity,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch recent activity',
            isLoading: false,
          });
        }
      },

      fetchUpcomingDeadlines: async (limit: number = 10) => {
        set({ isLoading: true, error: null });
        
        try {
          const upcomingDeadlines = await dashboardService.getUpcomingDeadlines(limit);
          set({
            upcomingDeadlines,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch upcoming deadlines',
            isLoading: false,
          });
        }
      },

      fetchPerformanceMetrics: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const performanceMetrics = await dashboardService.getPerformanceMetrics();
          set({
            performanceMetrics,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch performance metrics',
            isLoading: false,
          });
        }
      },

      setFilters: (filters: any) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'dashboard-store',
    }
  )
);
