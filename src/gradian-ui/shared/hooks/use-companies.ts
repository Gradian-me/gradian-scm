'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/gradian-ui/shared/utils/api';
import { getCacheConfigByPath } from '@/gradian-ui/shared/configs/cache-config';

interface Company {
  id: string | number;
  name: string;
  logo?: string;
  [key: string]: any;
}

/**
 * Hook to fetch companies with client-side caching using React Query
 * This deduplicates requests and shares cache across all components
 * Uses the QueryClient from QueryClientProvider context automatically
 */
export function useCompanies() {
  // Get cache configuration for /api/data/companies route
  const cacheConfig = getCacheConfigByPath('/api/data/companies');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await apiRequest<Company[]>('/api/data/companies');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch companies');
      }
      
      // Add "All Companies" option at the beginning
      const allCompaniesOption: Company = {
        id: -1,
        name: 'All Companies'
      };
      
      return [allCompaniesOption, ...response.data];
    },
    staleTime: cacheConfig.staleTime ?? 15 * 60 * 1000,
    gcTime: cacheConfig.gcTime ?? 30 * 60 * 1000,
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  return {
    companies: data || [],
    isLoading,
    error,
    refetch,
  };
}

