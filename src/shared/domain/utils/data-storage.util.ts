// Data Storage Utility
// Handles reading and writing to all-data.json file
// SERVER-ONLY: This file uses Node.js fs module and can only be used in server-side code (API routes, server components)

import fs from 'fs';
import path from 'path';
import { DataStorageError } from '../errors/domain.errors';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'all-data.json');

/**
 * Ensure data directory and file exist
 */
function ensureDataFile(): void {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(DATA_FILE_PATH)) {
    const initialData = {
      vendors: [],
      tenders: [],
      purchaseOrders: [],
      products: [],
      shipments: [],
      invoices: [],
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

/**
 * Read all data from the JSON file
 */
export function readAllData(): Record<string, any[]> {
  try {
    ensureDataFile();
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    throw new DataStorageError('read', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Write all data to the JSON file
 */
export function writeAllData(data: Record<string, any[]>): void {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw new DataStorageError('write', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Read data for a specific schema
 */
export function readSchemaData<T = any>(schemaId: string): T[] {
  try {
    const allData = readAllData();
    return (allData[schemaId] || []) as T[];
  } catch (error) {
    throw new DataStorageError(`read ${schemaId}`, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Write data for a specific schema
 */
export function writeSchemaData<T = any>(schemaId: string, data: T[]): void {
  try {
    const allData = readAllData();
    allData[schemaId] = data;
    writeAllData(allData);
  } catch (error) {
    throw new DataStorageError(`write ${schemaId}`, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Initialize schema collection if it doesn't exist
 */
export function ensureSchemaCollection(schemaId: string): void {
  try {
    const allData = readAllData();
    if (!allData[schemaId]) {
      allData[schemaId] = [];
      writeAllData(allData);
    }
  } catch (error) {
    throw new DataStorageError(`ensure ${schemaId}`, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Get all available schema IDs from data file
 */
export function getAvailableDataSchemas(): string[] {
  try {
    const allData = readAllData();
    return Object.keys(allData);
  } catch (error) {
    return [];
  }
}

