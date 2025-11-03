// Base Repository
// Generic repository implementation for JSON file storage

import { ulid } from 'ulid';
import { IRepository } from '../interfaces/repository.interface';
import { BaseEntity, FilterParams } from '../types/base.types';
import { readSchemaData, writeSchemaData, ensureSchemaCollection } from '../utils/data-storage.util';
import { EntityNotFoundError } from '../errors/domain.errors';

export class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  constructor(protected schemaId: string) {
    ensureSchemaCollection(schemaId);
  }

  /**
   * Apply filters to entities
   */
  protected applyFilters(entities: T[], filters?: FilterParams): T[] {
    if (!filters) return entities;

    let filtered = [...entities];

    // Include IDs filter - only show items with these IDs
    if (filters.includeIds) {
      const includeIds = Array.isArray(filters.includeIds) 
        ? filters.includeIds 
        : typeof filters.includeIds === 'string' 
          ? filters.includeIds.split(',').map(id => id.trim())
          : [];
      filtered = filtered.filter((entity: any) => includeIds.includes(entity.id));
    }

    // Exclude IDs filter - exclude items with these IDs
    if (filters.excludeIds) {
      const excludeIds = Array.isArray(filters.excludeIds)
        ? filters.excludeIds
        : typeof filters.excludeIds === 'string'
          ? filters.excludeIds.split(',').map(id => id.trim())
          : [];
      filtered = filtered.filter((entity: any) => !excludeIds.includes(entity.id));
    }

    // Search filter (searches across common text fields)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((entity: any) => {
        const searchableFields = [
          'name', 'title', 'email', 'phone', 'description',
          'productName', 'requestId', 'batchNumber', 'productSku',
          'companyName', 'tenderTitle', 'projectName', 'serverName'
        ];
        return searchableFields.some(field => {
          const value = entity[field];
          if (value && typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
      });
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((entity: any) => 
        entity.status?.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((entity: any) => {
        if (Array.isArray(entity.categories)) {
          return entity.categories.includes(filters.category);
        }
        return entity.category === filters.category;
      });
    }

    // Apply any other custom filters
    Object.keys(filters).forEach(key => {
      if (!['search', 'status', 'category', 'page', 'limit', 'sortBy', 'sortOrder', 'includeIds', 'excludeIds'].includes(key)) {
        filtered = filtered.filter((entity: any) => entity[key] === filters[key]);
      }
    });

    return filtered;
  }

  async findAll(filters?: FilterParams): Promise<T[]> {
    const entities = readSchemaData<T>(this.schemaId);
    return this.applyFilters(entities, filters);
  }

  async findById(id: string): Promise<T | null> {
    const entities = readSchemaData<T>(this.schemaId);
    return entities.find(entity => entity.id === id) || null;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const entities = readSchemaData<T>(this.schemaId);
    
    const newEntity: T = {
      ...data,
      id: ulid(), // Use ULID instead of UUID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    entities.push(newEntity);
    writeSchemaData(this.schemaId, entities);
    
    return newEntity;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const entities = readSchemaData<T>(this.schemaId);
    const index = entities.findIndex(entity => entity.id === id);

    if (index === -1) {
      return null;
    }

    const updatedEntity: T = {
      ...entities[index],
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    entities[index] = updatedEntity;
    writeSchemaData(this.schemaId, entities);
    
    return updatedEntity;
  }

  async delete(id: string): Promise<boolean> {
    const entities = readSchemaData<T>(this.schemaId);
    const filteredEntities = entities.filter(entity => entity.id !== id);

    if (filteredEntities.length === entities.length) {
      return false; // Entity not found
    }

    writeSchemaData(this.schemaId, filteredEntities);
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(filters?: FilterParams): Promise<number> {
    const entities = await this.findAll(filters);
    return entities.length;
  }
}

