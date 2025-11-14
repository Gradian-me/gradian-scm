'use client';

import { useCallback, useEffect, useState } from 'react';

import type { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';

import { getSchemaCacheSnapshot, subscribeToSchemaCache } from '../schema-cache';

type HookStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useSchemaCache() {
  const [schemas, setSchemas] = useState<FormSchema[] | null>(null);
  const [status, setStatus] = useState<HookStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    setStatus((prev) => (prev === 'ready' ? prev : 'loading'));
    try {
      const snapshot = await getSchemaCacheSnapshot();
      setSchemas(snapshot ? Object.values(snapshot.schemas) : null);
      setStatus('ready');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown schema cache error');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void hydrate();
    const unsubscribe = subscribeToSchemaCache(() => {
      void hydrate();
    });
    return () => {
      unsubscribe();
    };
  }, [hydrate]);

  return {
    schemas,
    status,
    error,
    refresh: hydrate,
  };
}


