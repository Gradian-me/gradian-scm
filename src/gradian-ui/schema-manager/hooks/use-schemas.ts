'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/gradian-ui/shared/utils/api';
import { FormSchema } from '../types/form-schema';
import { getCacheConfigByPath } from '@/gradian-ui/shared/configs/cache-config';

/**
 * Hook to fetch schemas with client-side caching using React Query
 * This deduplicates requests and shares cache across all components
 * Uses the QueryClient from QueryClientProvider context automatically
 */
interface UseSchemasOptions {
  enabled?: boolean;
  initialData?: FormSchema[];
}

export function useSchemas(options?: UseSchemasOptions) {
  // Get cache configuration for /api/schemas route
  const cacheConfig = getCacheConfigByPath('/api/schemas');
  const { enabled, initialData } = options || {};
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['schemas'],
    queryFn: async () => {
      console.log('[REACT_QUERY] 🔄 Fetching schemas from API...');
      // Use /api/schemas directly (apiRequest will handle it correctly via resolveApiUrl)
      const response = await apiRequest<FormSchema[]>('/api/schemas');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch schemas');
      }
      const normalizeSchemas = (raw: any): FormSchema[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw.data)) return raw.data;
        if (typeof raw === 'object') {
          return Object.values(raw) as FormSchema[];
        }
        return [];
      };

      const list = normalizeSchemas(response.data);
      console.log(`[REACT_QUERY] ✅ Fetched ${list.length} schemas - Caching for ${Math.round((cacheConfig.staleTime ?? 10 * 60 * 1000) / 1000)}s`);
      return list;
    },
    enabled: enabled !== false,
    initialData,
    staleTime: cacheConfig.staleTime ?? 10 * 60 * 1000,
    gcTime: cacheConfig.gcTime ?? 30 * 60 * 1000,
    refetchOnMount: false, // Don't refetch on mount if data exists in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
    placeholderData: (previousData) => previousData, // Use previous data as placeholder
  });

  return {
    schemas: data || [],
    isLoading,
    error,
    refetch,
  };
}

