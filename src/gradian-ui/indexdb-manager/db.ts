import Dexie, { Table } from 'dexie';

import type { EncryptedStoreEntry } from './types';

const DB_NAME = 'gradian-ui-indexdb';
const DB_VERSION = 1;

class GradianIndexedDb extends Dexie {
  public kvStore!: Table<EncryptedStoreEntry, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      kvStore: '&key, updatedAt',
    });
  }
}

let dbInstance: GradianIndexedDb | null = null;

export function getIndexedDb(): GradianIndexedDb | null {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return null;
  }

  if (!dbInstance) {
    dbInstance = new GradianIndexedDb();
  }

  return dbInstance;
}


