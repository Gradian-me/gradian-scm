'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/gradian-ui/shared/utils/api';
import { getCacheConfigByPath } from '@/gradian-ui/shared/configs/cache-config';
import {
  persistCompaniesToCache,
  readCompaniesFromCache,
  subscribeToCompaniesCache,
} from '@/gradian-ui/indexdb-manager';
import type { CompanyRecord } from '@/gradian-ui/indexdb-manager/types';

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
  const cacheConfig = getCacheConfigByPath('/api/data/companies');
  const [cachedCompanies, setCachedCompanies] = useState<Company[] | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const hydrateFromCache = async () => {
      try {
        const result = await readCompaniesFromCache();
        if (!isMounted || !result.companies?.length) {
          return;
        }

        const allCompaniesOption: Company = { id: -1, name: 'All Companies' };
        setCachedCompanies([allCompaniesOption, ...result.companies]);
      } catch (error) {
        console.warn('[useCompanies] Failed to read companies cache', error);
      }
    };

    hydrateFromCache();
    const unsubscribe = subscribeToCompaniesCache(() => {
      hydrateFromCache();
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await apiRequest<CompanyRecord[]>('/api/data/companies');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch companies');
      }

      try {
        await persistCompaniesToCache(response.data);
      } catch (cacheError) {
        console.warn('[useCompanies] Failed to persist companies cache', cacheError);
      }
      
      const allCompaniesOption: Company = {
        id: -1,
        name: 'All Companies'
      };
      
      return [allCompaniesOption, ...response.data];
    },
    initialData: cachedCompanies,
    staleTime: cacheConfig.staleTime ?? 15 * 60 * 1000,
    gcTime: cacheConfig.gcTime ?? 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    companies: data || [],
    isLoading,
    error,
    refetch,
  };
}

