import { useCallback } from 'react';
import { useDashboardStore } from '../../../stores/dashboard.store';

export const useDashboard = () => {
  const {
    stats,
    spendAnalysisData,
    kpiCards,
    recentActivity,
    upcomingDeadlines,
    performanceMetrics,
    filters,
    isLoading,
    error,
    fetchDashboardStats,
    fetchSpendAnalysisData,
    fetchKpiCards,
    fetchRecentActivity,
    fetchUpcomingDeadlines,
    fetchPerformanceMetrics,
    setFilters,
    clearError,
    reset,
  } = useDashboardStore();

  const handleFetchDashboardStats = useCallback(
    (newFilters?: any) => {
      return fetchDashboardStats(newFilters);
    },
    [fetchDashboardStats]
  );

  const handleFetchSpendAnalysisData = useCallback(
    (newFilters?: any) => {
      return fetchSpendAnalysisData(newFilters);
    },
    [fetchSpendAnalysisData]
  );

  const handleFetchRecentActivity = useCallback(
    (limit?: number) => {
      return fetchRecentActivity(limit);
    },
    [fetchRecentActivity]
  );

  const handleFetchUpcomingDeadlines = useCallback(
    (limit?: number) => {
      return fetchUpcomingDeadlines(limit);
    },
    [fetchUpcomingDeadlines]
  );

  const handleSetFilters = useCallback(
    (newFilters: any) => {
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

  return {
    // State
    stats,
    spendAnalysisData,
    kpiCards,
    recentActivity,
    upcomingDeadlines,
    performanceMetrics,
    filters,
    isLoading,
    error,
    
    // Actions
    fetchDashboardStats: handleFetchDashboardStats,
    fetchSpendAnalysisData: handleFetchSpendAnalysisData,
    fetchKpiCards,
    fetchRecentActivity: handleFetchRecentActivity,
    fetchUpcomingDeadlines: handleFetchUpcomingDeadlines,
    fetchPerformanceMetrics,
    setFilters: handleSetFilters,
    clearError: handleClearError,
    reset: handleReset,
  };
};
