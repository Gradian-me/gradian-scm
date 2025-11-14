import type { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';

import { getIndexedDb } from './db';
import {
  SCHEMA_CACHE_KEY,
  SCHEMA_CACHE_VERSION,
  type SchemaCacheLookupResult,
  type SchemaCachePayload,
  type SchemaCacheRequest,
  type SchemaCacheEventDetail,
} from './types';
import { decryptPayload, encryptPayload } from './utils/crypto';

const SCHEMA_CACHE_EVENT = 'gradian-schema-cache-updated';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function emitSchemaCacheEvent(detail: SchemaCacheEventDetail) {
  if (!isClient()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<SchemaCacheEventDetail>(SCHEMA_CACHE_EVENT, {
      detail,
    })
  );
}

async function readEncryptedPayload(): Promise<SchemaCachePayload | null> {
  const db = getIndexedDb();
  if (!db) {
    return null;
  }

  const entry = await db.kvStore.get(SCHEMA_CACHE_KEY);
  if (!entry || entry.version !== SCHEMA_CACHE_VERSION) {
    return null;
  }

  const decrypted = await decryptPayload<SchemaCachePayload>({
    ciphertext: entry.ciphertext,
    iv: entry.iv,
  });

  return decrypted;
}

async function writeEncryptedPayload(payload: SchemaCachePayload) {
  const db = getIndexedDb();
  if (!db) {
    return;
  }

  const encrypted = await encryptPayload(payload);
  if (!encrypted) {
    return;
  }

  await db.kvStore.put({
    key: SCHEMA_CACHE_KEY,
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

export async function getSchemaCacheSnapshot(): Promise<SchemaCachePayload | null> {
  return readEncryptedPayload();
}

export async function readSchemasFromCache(request: SchemaCacheRequest): Promise<SchemaCacheLookupResult> {
  const payload = (await readEncryptedPayload()) ?? buildEmptyPayload();

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

export async function persistSchemasToCache(schemas: FormSchema[], options?: { hydrateAll?: boolean }) {
  if (!schemas.length) {
    return;
  }

  const payload = (await readEncryptedPayload()) ?? buildEmptyPayload();

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

  await writeEncryptedPayload(nextPayload);
  emitSchemaCacheEvent({ reason: 'update', affectedIds: schemas.map((schema) => schema.id) });
}

export async function clearSchemaCache(ids?: string[]) {
  const db = getIndexedDb();
  if (!db) {
    return;
  }

  if (!ids || ids.length === 0) {
    await db.kvStore.delete(SCHEMA_CACHE_KEY);
    emitSchemaCacheEvent({ reason: 'clear' });
    return;
  }

  const payload = await readEncryptedPayload();
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

  await writeEncryptedPayload(nextPayload);
  emitSchemaCacheEvent({ reason: 'update', affectedIds: ids });
}

export function subscribeToSchemaCache(listener: (detail: SchemaCacheEventDetail) => void): () => void {
  if (!isClient()) {
    return () => {};
  }

  const handler = (event: Event) => {
    listener((event as CustomEvent<SchemaCacheEventDetail>).detail);
  };

  window.addEventListener(SCHEMA_CACHE_EVENT, handler);

  return () => {
    window.removeEventListener(SCHEMA_CACHE_EVENT, handler);
  };
}


