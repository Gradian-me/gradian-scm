'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/utils/api';

interface Company {
  id: string | number;
  name: string;
  logo?: string;
  [key: string]: any;
}

/**
 * Hook to fetch companies with client-side caching using React Query
 * This deduplicates requests and shares cache across all components
 */
export function useCompanies() {
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
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes (formerly cacheTime)
  });

  return {
    companies: data || [],
    isLoading,
    error,
    refetch,
  };
}

