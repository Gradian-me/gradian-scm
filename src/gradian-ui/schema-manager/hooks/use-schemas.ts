'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/gradian-ui/shared/utils/api';
import { FormSchema } from '../types/form-schema';

/**
 * Hook to fetch schemas with client-side caching using React Query
 * This deduplicates requests and shares cache across all components
 * Uses the QueryClient from QueryClientProvider context automatically
 */
export function useSchemas() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['schemas'],
    queryFn: async () => {
      // Use /api/schemas directly (apiRequest will handle it correctly via resolveApiUrl)
      const response = await apiRequest<FormSchema[]>('/api/schemas');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch schemas');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes (formerly cacheTime)
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  return {
    schemas: data || [],
    isLoading,
    error,
    refetch,
  };
}

