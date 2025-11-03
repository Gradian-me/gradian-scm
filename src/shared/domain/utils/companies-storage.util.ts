// Companies Storage Utility
// Shared module for companies data operations with caching

import fs from 'fs';
import path from 'path';
import { ulid } from 'ulid';

// Shared cache for companies (shared across all route files)
let cachedCompanies: any[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 60000; // 60 seconds cache TTL

/**
 * Load companies with caching
 */
export function loadCompanies(): any[] {
  const now = Date.now();
  
  // Return cache if valid
  if (cachedCompanies !== null && cacheTimestamp !== null && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedCompanies;
  }
  
  // Read and cache companies
  const dataPath = path.join(process.cwd(), 'data', 'all-companies.json');
  
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(dataPath)) {
    // Create empty array if file doesn't exist
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2), 'utf8');
    cachedCompanies = [];
    cacheTimestamp = now;
    return [];
  }
  
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  cachedCompanies = JSON.parse(fileContents);
  cacheTimestamp = now;
  
  return cachedCompanies || [];
}

/**
 * Save companies to file and clear cache
 */
export function saveCompanies(companies: any[]): void {
  const dataPath = path.join(process.cwd(), 'data', 'all-companies.json');
  fs.writeFileSync(dataPath, JSON.stringify(companies, null, 2), 'utf8');
  
  // Clear cache to force reload on next request
  clearCompaniesCache();
}

/**
 * Clear the companies cache
 */
export function clearCompaniesCache(): void {
  cachedCompanies = null;
  cacheTimestamp = null;
}

/**
 * Get a company by ID
 */
export function getCompanyById(id: string): any | null {
  const companies = loadCompanies();
  return companies.find((c: any) => c.id === id) || null;
}

