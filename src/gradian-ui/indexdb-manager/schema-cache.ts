import type { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';

import { getIndexedDb } from './db';
import {
  SCHEMA_CACHE_KEY,
  SCHEMA_CACHE_VERSION,
  SCHEMA_SUMMARY_CACHE_KEY,
  type SchemaCacheLookupResult,
  type SchemaCachePayload,
  type SchemaCacheRequest,
  type SchemaCacheEventDetail,
} from './types';
import { decryptPayload, encryptPayload } from './utils/crypto';

const SCHEMA_CACHE_EVENT = 'gradian-schema-cache-updated';
const DEFAULT_SCHEMA_CACHE_KEY = SCHEMA_CACHE_KEY;
const ALL_SCHEMA_CACHE_KEYS = Array.from(
  new Set([SCHEMA_CACHE_KEY, SCHEMA_SUMMARY_CACHE_KEY]),
);

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function resolveSchemaCacheKey(cacheKey?: string) {
  return cacheKey ?? DEFAULT_SCHEMA_CACHE_KEY;
}

function emitSchemaCacheEvent(detail: SchemaCacheEventDetail, cacheKey: string) {
  if (!isClient()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<SchemaCacheEventDetail>(SCHEMA_CACHE_EVENT, {
      detail: {
        ...detail,
        cacheKey,
      },
    })
  );
}

async function readEncryptedPayload(cacheKey?: string): Promise<SchemaCachePayload | null> {
  const db = getIndexedDb();
  if (!db) {
    return null;
  }

  const storeKey = resolveSchemaCacheKey(cacheKey);
  const entry = await db.kvStore.get(storeKey);
  if (!entry || entry.version !== SCHEMA_CACHE_VERSION) {
    return null;
  }

  const decrypted = await decryptPayload<SchemaCachePayload>({
    ciphertext: entry.ciphertext,
    iv: entry.iv,
  });

  return decrypted;
}

async function writeEncryptedPayload(payload: SchemaCachePayload, cacheKey?: string) {
  const db = getIndexedDb();
  if (!db) {
    return;
  }

  const encrypted = await encryptPayload(payload);
  if (!encrypted) {
    return;
  }

  await db.kvStore.put({
    key: resolveSchemaCacheKey(cacheKey),
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    updatedAt: Date.now(),
    version: SCHEMA_CACHE_VERSION,
  });
}

function buildEmptyPayload(): SchemaCachePayload {
  return {
    version: SCHEMA_CACHE_VERSION,
    hydratedAll: false,
    updatedAt: Date.now(),
    schemas: {},
  };
}

export async function getSchemaCacheSnapshot(cacheKey?: string): Promise<SchemaCachePayload | null> {
  return readEncryptedPayload(cacheKey);
}

export async function readSchemasFromCache(
  request: SchemaCacheRequest,
  cacheKey?: string,
): Promise<SchemaCacheLookupResult> {
  const payload = (await readEncryptedPayload(cacheKey)) ?? buildEmptyPayload();

  if (request.kind === 'all') {
    return {
      hit: payload.hydratedAll && Object.keys(payload.schemas).length > 0,
      cachedMap: payload.schemas,
      missingIds: [],
      hydratedAll: payload.hydratedAll,
    };
  }

  const cachedMap: Record<string, FormSchema> = {};
  const missingIds: string[] = [];

  const ids = request.kind === 'single' ? [request.schemaId] : request.schemaIds;

  ids.forEach((id) => {
    const entry = payload.schemas[id];
    if (entry) {
      cachedMap[id] = entry;
    } else {
      missingIds.push(id);
    }
  });

  return {
    hit: missingIds.length === 0 && ids.length > 0,
    cachedMap,
    missingIds,
    hydratedAll: payload.hydratedAll,
  };
}

export async function persistSchemasToCache(
  schemas: FormSchema[],
  options?: { hydrateAll?: boolean; cacheKey?: string },
) {
  if (!schemas.length) {
    return;
  }

  const targetKey = resolveSchemaCacheKey(options?.cacheKey);
  const payload = (await readEncryptedPayload(targetKey)) ?? buildEmptyPayload();

  const updatedMap = { ...payload.schemas };
  schemas.forEach((schema) => {
    updatedMap[schema.id] = schema;
  });

  const nextPayload: SchemaCachePayload = {
    ...payload,
    schemas: updatedMap,
    hydratedAll: options?.hydrateAll ? true : payload.hydratedAll,
    updatedAt: Date.now(),
  };

  await writeEncryptedPayload(nextPayload, targetKey);
  emitSchemaCacheEvent(
    { reason: 'update', affectedIds: schemas.map((schema) => schema.id) },
    targetKey,
  );
}

async function clearSchemaCacheForKey(ids: string[] | undefined, cacheKey: string) {
  const db = getIndexedDb();
  if (!db) {
    return;
  }

  if (!ids || ids.length === 0) {
    await db.kvStore.delete(cacheKey);
    emitSchemaCacheEvent({ reason: 'clear' }, cacheKey);
    return;
  }

  const payload = await readEncryptedPayload(cacheKey);
  if (!payload) {
    return;
  }

  const updatedMap = { ...payload.schemas };
  ids.forEach((id) => {
    delete updatedMap[id];
  });

  const nextPayload: SchemaCachePayload = {
    ...payload,
    schemas: updatedMap,
    hydratedAll: false,
    updatedAt: Date.now(),
  };

  await writeEncryptedPayload(nextPayload, cacheKey);
  emitSchemaCacheEvent({ reason: 'update', affectedIds: ids }, cacheKey);
}

export async function clearSchemaCache(ids?: string[], cacheKey?: string) {
  const keysToClear = cacheKey ? [resolveSchemaCacheKey(cacheKey)] : ALL_SCHEMA_CACHE_KEYS;
  await Promise.all(keysToClear.map((key) => clearSchemaCacheForKey(ids, key)));
}

export function subscribeToSchemaCache(
  listener: (detail: SchemaCacheEventDetail) => void,
  cacheKey?: string,
): () => void {
  if (!isClient()) {
    return () => {};
  }

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<SchemaCacheEventDetail>).detail;
    if (cacheKey && detail.cacheKey && detail.cacheKey !== cacheKey) {
      return;
    }
    listener(detail);
  };

  window.addEventListener(SCHEMA_CACHE_EVENT, handler);

  return () => {
    window.removeEventListener(SCHEMA_CACHE_EVENT, handler);
  };
}


