// Service Interface
// Defines the contract for all service implementations

import { BaseEntity, FilterParams, ApiResponse } from '../types/base.types';

export interface IService<T extends BaseEntity> {
  /**
   * Get all entities with optional filtering
   */
  getAll(filters?: FilterParams): Promise<ApiResponse<T[]>>;
  
  /**
   * Get entity by ID
   */
  getById(id: string): Promise<ApiResponse<T>>;
  
  /**
   * Create a new entity
   */
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<T>>;
  
  /**
   * Update an existing entity
   */
  update(id: string, data: Partial<T>): Promise<ApiResponse<T>>;
  
  /**
   * Delete an entity
   */
  delete(id: string): Promise<ApiResponse<boolean>>;
}

