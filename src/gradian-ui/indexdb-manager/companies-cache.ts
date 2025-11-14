import { getIndexedDb } from './db';
import {
  COMPANY_CACHE_KEY,
  COMPANY_CACHE_VERSION,
  type CompaniesCacheEventDetail,
  type CompaniesCacheLookupResult,
  type CompaniesCachePayload,
  type CompanyRecord,
} from './types';
import { decryptPayload, encryptPayload } from './utils/crypto';

const COMPANIES_CACHE_EVENT = 'gradian-companies-cache-updated';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function emitCompaniesEvent(detail: CompaniesCacheEventDetail) {
  if (!isClient()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CompaniesCacheEventDetail>(COMPANIES_CACHE_EVENT, {
      detail,
    })
  );
}

function buildEmptyCompaniesPayload(): CompaniesCachePayload {
  return {
    version: COMPANY_CACHE_VERSION,
    hydrated: false,
    updatedAt: 0,
    companies: [],
  };
}

async function readEncryptedCompaniesPayload(): Promise<CompaniesCachePayload | null> {
  const db = getIndexedDb();
  if (!db) {
    return null;
  }

  const entry = await db.kvStore.get(COMPANY_CACHE_KEY);
  if (!entry || entry.version !== COMPANY_CACHE_VERSION) {
    return null;
  }

  const payload = await decryptPayload<CompaniesCachePayload>({
    ciphertext: entry.ciphertext,
    iv: entry.iv,
  });

  return payload;
}

async function writeCompaniesPayload(payload: CompaniesCachePayload) {
  const db = getIndexedDb();
  if (!db) {
    return;
  }

  const encrypted = await encryptPayload(payload);
  if (!encrypted) {
    return;
  }

  await db.kvStore.put({
    key: COMPANY_CACHE_KEY,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    updatedAt: Date.now(),
    version: COMPANY_CACHE_VERSION,
  });
}

export async function readCompaniesFromCache(): Promise<CompaniesCacheLookupResult> {
  const payload = (await readEncryptedCompaniesPayload()) ?? buildEmptyCompaniesPayload();

  return {
    hit: payload.hydrated && payload.companies.length > 0,
    hydrated: payload.hydrated,
    companies: payload.companies,
  };
}

export async function persistCompaniesToCache(companies: CompanyRecord[]) {
  if (!Array.isArray(companies) || companies.length === 0) {
    return;
  }

  const payload: CompaniesCachePayload = {
    version: COMPANY_CACHE_VERSION,
    hydrated: true,
    updatedAt: Date.now(),
    companies,
  };

  await writeCompaniesPayload(payload);
  emitCompaniesEvent({ reason: 'update' });
}

export async function clearCompaniesCache() {
  const db = getIndexedDb();
  if (!db) {
    return;
  }

  await db.kvStore.delete(COMPANY_CACHE_KEY);
  emitCompaniesEvent({ reason: 'clear' });
}

export function subscribeToCompaniesCache(listener: (detail: CompaniesCacheEventDetail) => void): () => void {
  if (!isClient()) {
    return () => {};
  }

  const handler = (event: Event) => {
    listener((event as CustomEvent<CompaniesCacheEventDetail>).detail);
  };

  window.addEventListener(COMPANIES_CACHE_EVENT, handler);

  return () => {
    window.removeEventListener(COMPANIES_CACHE_EVENT, handler);
  };
}


