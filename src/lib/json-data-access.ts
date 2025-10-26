import fs from 'fs';
import path from 'path';
import { isMockData } from './config';

const DATA_DIR = path.join(process.cwd(), 'data');

// Generic JSON data access functions
class JsonDataAccess<T> {
  private filename: string;
  private data: T[] = [];

  constructor(filename: string) {
    this.filename = filename;
    this.loadData();
  }

  private loadData() {
    try {
      const filePath = path.join(DATA_DIR, `${this.filename}.json`);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        this.data = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error(`Error loading ${this.filename} data:`, error);
      this.data = [];
    }
  }

  private saveData() {
    try {
      const filePath = path.join(DATA_DIR, `${this.filename}.json`);
      fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error(`Error saving ${this.filename} data:`, error);
    }
  }

  async getAll(): Promise<T[]> {
    // Reload data to ensure we have the latest from file
    this.loadData();
    return [...this.data];
  }

  async getById(id: string): Promise<T | null> {
    // Reload data to ensure we have the latest from file
    this.loadData();
    return this.data.find((item: any) => item.id === id) || null;
  }

  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as T;
    
    this.data.push(newItem);
    this.saveData();
    return newItem;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const index = this.data.findIndex((item: any) => item.id === id);
    if (index === -1) return null;

    this.data[index] = {
      ...this.data[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.saveData();
    return this.data[index];
  }

  async delete(id: string): Promise<T | null> {
    const index = this.data.findIndex((item: any) => item.id === id);
    if (index === -1) return null;

    const deletedItem = this.data[index];
    this.data.splice(index, 1);
    this.saveData();
    return deletedItem;
  }

  async findMany(filter?: (item: T) => boolean): Promise<T[]> {
    if (!filter) return [...this.data];
    return this.data.filter(filter);
  }
}

// Create instances for each data type
export const jsonVendorDataAccess = new JsonDataAccess('vendors');
export const jsonUserDataAccess = new JsonDataAccess('users');
export const jsonTenderDataAccess = new JsonDataAccess('tenders');
export const jsonPurchaseOrderDataAccess = new JsonDataAccess('purchaseOrders');
export const jsonShipmentDataAccess = new JsonDataAccess('shipments');
export const jsonInvoiceDataAccess = new JsonDataAccess('invoices');
export const jsonNotificationDataAccess = new JsonDataAccess('notifications');

// Export a function to check if we should use JSON data
export function shouldUseJsonData(): boolean {
  return isMockData();
}
