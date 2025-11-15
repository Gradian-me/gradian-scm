import type { ApiResponse } from '@/gradian-ui/shared/types/common';
import type { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { getIndexedDbCacheKeys } from '@/gradian-ui/shared/configs/cache-config';

import {
  readSchemasFromCache,
  persistSchemasToCache,
} from './schema-cache';
import {
  readCompaniesFromCache,
  persistCompaniesToCache,
} from './companies-cache';
import type {
  SchemaCacheRequest,
  CompanyRecord,
} from './types';
import { SCHEMA_CACHE_KEY, SCHEMA_SUMMARY_CACHE_KEY } from './types';

export interface CacheStrategyContext {
  endpoint: string;
  originalEndpoint: string;
  params?: Record<string, any>;
}

export interface CacheStrategyPreResult<T = unknown> {
  hit: boolean;
  data?: T;
  overrideEndpoint?: string;
  overrideParams?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface IndexedDbCacheStrategy<T = unknown> {
  preRequest(
    context: CacheStrategyContext
  ): Promise<CacheStrategyPreResult<T> | null>;
  postRequest(
    context: CacheStrategyContext,
    response: ApiResponse<T>,
    preResult?: CacheStrategyPreResult<T> | null
  ): Promise<ApiResponse<T>>;
}

function parseSchemaRequestFromEndpoint(endpoint: string): SchemaCacheRequest | null {
  if (!endpoint.startsWith('/api/schemas')) {
    return null;
  }

  if (endpoint.startsWith('/api/schemas/clear-cache')) {
    return null;
  }

  const [pathPart, queryString = ''] = endpoint.split('?');
  const segments = pathPart.split('/').filter(Boolean);

  if (segments.length === 2) {
    const params = new URLSearchParams(queryString);
    const schemaIds: string[] = [];

    params.getAll('schemaIds').forEach((param) => {
      param
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .forEach((id) => {
          if (!schemaIds.includes(id)) {
            schemaIds.push(id);
          }
        });
    });

    if (schemaIds.length > 0) {
      return { kind: 'batch', schemaIds };
    }

    return { kind: 'all' };
  }

  if (segments.length >= 3) {
    const schemaId = segments.slice(2).join('/');
    if (schemaId && schemaId !== 'clear-cache') {
      return { kind: 'single', schemaId };
    }
  }

  return null;
}

function buildEndpointForMissingSchemas(endpoint: string, missingIds: string[]): string {
  const [basePath, queryString = ''] = endpoint.split('?');
  const params = new URLSearchParams(queryString);
  params.delete('schemaIds');
  missingIds.forEach((id) => params.append('schemaIds', id));
  const nextQuery = params.toString();
  return nextQuery ? `${basePath}?${nextQuery}` : basePath;
}

function buildSchemasFromCache(request: SchemaCacheRequest, cachedMap: Record<string, FormSchema>) {
  if (request.kind === 'single') {
    return cachedMap[request.schemaId] ?? null;
  }

  if (request.kind === 'batch') {
    return request.schemaIds
      .map((id) => cachedMap[id])
      .filter((schema): schema is FormSchema => Boolean(schema));
  }

  return Object.values(cachedMap);
}

interface SchemaCacheMetadata {
  schemaContext: {
    request: SchemaCacheRequest;
    cachedMap: Record<string, FormSchema>;
    missingIds: string[];
    requestedOrder?: string[];
  };
}

function createSchemaCacheStrategy(cacheKey: string): IndexedDbCacheStrategy<FormSchema | FormSchema[]> {
  return {
    async preRequest(context) {
      const schemaRequest = parseSchemaRequestFromEndpoint(context.endpoint);
      if (!schemaRequest) {
        return null;
      }

      const cacheLookup = await readSchemasFromCache(schemaRequest, cacheKey);

      if (cacheLookup.hit) {
        const cachedData = buildSchemasFromCache(schemaRequest, cacheLookup.cachedMap);
        if (cachedData) {
          return {
            hit: true,
            data: cachedData,
            metadata: {
              schemaContext: {
                request: schemaRequest,
                cachedMap: cacheLookup.cachedMap,
                missingIds: [],
                requestedOrder:
                  schemaRequest.kind === 'batch'
                    ? schemaRequest.schemaIds
                    : schemaRequest.kind === 'single'
                      ? [schemaRequest.schemaId]
                      : undefined,
              },
            } satisfies SchemaCacheMetadata,
          };
        }
      }

      let overrideEndpoint: string | undefined;
      let overrideParams: Record<string, any> | undefined;

      if (
        schemaRequest.kind === 'batch' &&
        cacheLookup.missingIds.length > 0 &&
        cacheLookup.missingIds.length < schemaRequest.schemaIds.length
      ) {
        overrideEndpoint = buildEndpointForMissingSchemas(context.endpoint, cacheLookup.missingIds);
        overrideParams = undefined;
      }

      return {
        hit: false,
        overrideEndpoint,
        overrideParams,
        metadata: {
          schemaContext: {
            request: schemaRequest,
            cachedMap: cacheLookup.cachedMap,
            missingIds: cacheLookup.missingIds,
            requestedOrder:
              schemaRequest.kind === 'batch'
                ? schemaRequest.schemaIds
                : schemaRequest.kind === 'single'
                  ? [schemaRequest.schemaId]
                  : undefined,
          },
        } satisfies SchemaCacheMetadata,
      };
    },

    async postRequest(_context, response, preResult) {
      if (!preResult?.metadata?.schemaContext) {
        return response;
      }

      const schemaMetadata = preResult.metadata.schemaContext;

      if (!response.success || !response.data) {
        return response;
      }

      if (schemaMetadata.request.kind === 'single') {
        const schema = response.data as unknown as FormSchema;
        if (schema?.id) {
          await persistSchemasToCache([schema], { cacheKey });
        }
        return response;
      }

      const dataArray = response.data as unknown as FormSchema[];
      if (!Array.isArray(dataArray)) {
        return response;
      }

      await persistSchemasToCache(dataArray, {
        hydrateAll: schemaMetadata.request.kind === 'all',
        cacheKey,
      });

      if (schemaMetadata.request.kind === 'batch' && schemaMetadata.requestedOrder) {
        const combinedMap: Record<string, FormSchema> = { ...schemaMetadata.cachedMap };
        dataArray.forEach((schema: FormSchema) => {
          combinedMap[schema.id] = schema;
        });

        const merged = schemaMetadata.requestedOrder
          .map((id: string) => combinedMap[id])
          .filter((schema: FormSchema | undefined): schema is FormSchema => Boolean(schema));

        return {
          ...response,
          data: merged as any,
        };
      }

      return response;
    },
  };
}

const schemaCacheStrategy = createSchemaCacheStrategy(SCHEMA_CACHE_KEY);
const schemaSummaryCacheStrategy = createSchemaCacheStrategy(SCHEMA_SUMMARY_CACHE_KEY);

const companiesCacheStrategy: IndexedDbCacheStrategy<CompanyRecord[]> = {
  async preRequest() {
    const cacheResult = await readCompaniesFromCache();
    if (cacheResult.hit) {
      return {
        hit: true,
        data: cacheResult.companies,
      };
    }

    return {
      hit: false,
    };
  },

  async postRequest(_context, response) {
    if (!response.success || !response.data) {
      return response;
    }

    const companies = response.data as unknown as CompanyRecord[];
    if (Array.isArray(companies)) {
      await persistCompaniesToCache(companies);
    }

    return response;
  },
};

const strategyImplementations: Record<string, IndexedDbCacheStrategy<any>> = {
  schemas: schemaCacheStrategy,
  'schemas-summary': schemaSummaryCacheStrategy,
  companies: companiesCacheStrategy,
};

const indexedDbStrategies = getIndexedDbCacheKeys().reduce<Record<string, IndexedDbCacheStrategy<any>>>(
  (acc, key) => {
    const strategy = strategyImplementations[key];
    if (strategy) {
      acc[key] = strategy;
    }
    return acc;
  },
  {}
);

export function getIndexedDbCacheStrategy(key?: string | null): IndexedDbCacheStrategy<any> | null {
  if (!key) {
    return null;
  }
  return indexedDbStrategies[key] || null;
}


