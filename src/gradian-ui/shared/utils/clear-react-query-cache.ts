'use client';

import { QueryClient } from '@tanstack/react-query';

/**
 * Clear React Query caches for schemas and companies
 * This should be called from the clear-cache API route or client-side
 */
export async function clearReactQueryCache(queryClient?: QueryClient) {
  // If queryClient is provided, use it directly (client-side)
  if (queryClient) {
    // Invalidate all schema-related queries
    await queryClient.invalidateQueries({ queryKey: ['schemas'] });
    // Invalidate all company-related queries
    await queryClient.invalidateQueries({ queryKey: ['companies'] });
    return;
  }

  // If no queryClient provided, dispatch a custom event for client-side handling
  // This is useful when called from server-side API routes
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('react-query-cache-clear', { detail: { queryKeys: ['schemas', 'companies'] } }));
  }
}

