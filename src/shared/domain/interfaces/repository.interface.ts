// Repository Interface
// Defines the contract for all repository implementations

import { BaseEntity, FilterParams, PaginatedResponse } from '../types/base.types';

export interface IRepository<T extends BaseEntity> {
  /**
   * Find all entities with optional filtering and pagination
   */
  findAll(filters?: FilterParams): Promise<T[]>;
  
  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;
  
  /**
   * Create a new entity
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  
  /**
   * Update an existing entity
   */
  update(id: string, data: Partial<T>): Promise<T | null>;
  
  /**
   * Delete an entity
   */
  delete(id: string): Promise<boolean>;
  
  /**
   * Check if entity exists
   */
  exists(id: string): Promise<boolean>;
  
  /**
   * Count entities with optional filters
   */
  count(filters?: FilterParams): Promise<number>;
}

