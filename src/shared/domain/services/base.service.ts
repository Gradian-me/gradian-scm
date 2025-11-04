// Base Service
// Generic service implementation with business logic

import { IService } from '../interfaces/service.interface';
import { IRepository } from '../interfaces/repository.interface';
import { BaseEntity, FilterParams, ApiResponse } from '../types/base.types';
import { EntityNotFoundError, ValidationError, handleDomainError } from '../errors/domain.errors';

export class BaseService<T extends BaseEntity> implements IService<T> {
  constructor(
    protected repository: IRepository<T>,
    protected entityName: string = 'Entity'
  ) {}

  async getAll(filters?: FilterParams): Promise<ApiResponse<T[]>> {
    try {
      const entities = await this.repository.findAll(filters);
      return {
        success: true,
        data: entities,
        message: `Retrieved ${entities.length} ${this.entityName.toLowerCase()}(s)`,
      };
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return {
        success: false,
        error: errorResponse.error,
      };
    }
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    try {
      const entity = await this.repository.findById(id);
      
      if (!entity) {
        throw new EntityNotFoundError(this.entityName, id);
      }

      return {
        success: true,
        data: entity,
        message: `${this.entityName} retrieved successfully`,
      };
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return {
        success: false,
        error: errorResponse.error,
      };
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<T>> {
    try {
      // Validate data before creation
      await this.validateCreate(data);

      // CompanyId enrichment is handled at the controller level via cookies
      const entity = await this.repository.create(data);
      
      return {
        success: true,
        data: entity,
        message: `${this.entityName} created successfully`,
      };
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return {
        success: false,
        error: errorResponse.error,
      };
    }
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      // Check if entity exists
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new EntityNotFoundError(this.entityName, id);
      }

      // Validate data before update
      await this.validateUpdate(id, data);

      // CompanyId enrichment is handled at the controller level via cookies
      const enrichedData = data;

      const entity = await this.repository.update(id, enrichedData);
      
      if (!entity) {
        throw new EntityNotFoundError(this.entityName, id);
      }

      return {
        success: true,
        data: entity,
        message: `${this.entityName} updated successfully`,
      };
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return {
        success: false,
        error: errorResponse.error,
      };
    }
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const deleted = await this.repository.delete(id);
      
      if (!deleted) {
        throw new EntityNotFoundError(this.entityName, id);
      }

      return {
        success: true,
        data: true,
        message: `${this.entityName} deleted successfully`,
      };
    } catch (error) {
      const errorResponse = handleDomainError(error);
      return {
        success: false,
        error: errorResponse.error,
      };
    }
  }

  /**
   * Override this method to add custom validation for create operations
   */
  protected async validateCreate(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    // Base implementation - can be overridden in derived classes
    return Promise.resolve();
  }

  /**
   * Override this method to add custom validation for update operations
   */
  protected async validateUpdate(id: string, data: Partial<T>): Promise<void> {
    // Base implementation - can be overridden in derived classes
    return Promise.resolve();
  }
}

