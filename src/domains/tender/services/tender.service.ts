import { Tender, CreateTenderRequest, UpdateTenderRequest, TenderFilters, TenderListResponse, TenderStats } from '../types';
import { ITenderRepository, tenderRepository } from '../repositories/tender.repository';
import { 
  TenderNotFoundError, 
  TenderTitleAlreadyExistsError,
  InvalidTenderStatusError,
  TenderAlreadyClosedError,
  TenderAlreadyAwardedError,
  InvalidEvaluationCriteriaError,
  TenderCategoryValidationError
} from '../errors';
import { createTenderSchema, updateTenderSchema, tenderFiltersSchema } from '../schemas';
import { validateFormData } from '../../../shared/utils/validation';

export interface ITenderService {
  getAllTenders(filters: TenderFilters): Promise<TenderListResponse>;
  getTenderById(id: string): Promise<Tender>;
  createTender(data: CreateTenderRequest): Promise<Tender>;
  updateTender(id: string, data: UpdateTenderRequest): Promise<Tender>;
  deleteTender(id: string): Promise<void>;
  getTenderStats(): Promise<TenderStats>;
  publishTender(id: string): Promise<Tender>;
  closeTender(id: string): Promise<Tender>;
  awardTender(id: string, vendorId: string): Promise<Tender>;
  validateTenderData(data: CreateTenderRequest): { success: true; data: CreateTenderRequest } | { success: false; errors: Record<string, string> };
  validateTenderUpdateData(data: UpdateTenderRequest): { success: true; data: UpdateTenderRequest } | { success: false; errors: Record<string, string> };
}

export class TenderService implements ITenderService {
  constructor(private tenderRepository: ITenderRepository) {}

  async getAllTenders(filters: TenderFilters): Promise<TenderListResponse> {
    // Validate filters
    const validation = validateFormData(tenderFiltersSchema, filters);
    if (!validation.success) {
      throw new Error('Invalid filter parameters');
    }

    try {
      return await this.tenderRepository.findAll(validation.data);
    } catch (error) {
      throw error;
    }
  }

  async getTenderById(id: string): Promise<Tender> {
    if (!id) {
      throw new TenderNotFoundError('');
    }

    try {
      return await this.tenderRepository.findById(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new TenderNotFoundError(id);
      }
      throw error;
    }
  }

  async createTender(data: CreateTenderRequest): Promise<Tender> {
    // Validate input data
    const validation = this.validateTenderData(data);
    if (!validation.success) {
      throw new Error('Validation failed');
    }

    // Check for duplicate title
    try {
      const existingTenders = await this.tenderRepository.findAll({ page: 1, limit: 1, search: data.title });
      if (existingTenders.data.length > 0) {
        throw new TenderTitleAlreadyExistsError(data.title);
      }
    } catch (error) {
      if (error instanceof TenderTitleAlreadyExistsError) {
        throw error;
      }
      // Continue if search fails
    }

    try {
      return await this.tenderRepository.create(validation.data);
    } catch (error) {
      throw error;
    }
  }

  async updateTender(id: string, data: UpdateTenderRequest): Promise<Tender> {
    if (!id) {
      throw new TenderNotFoundError('');
    }

    // Check if tender exists and validate status
    const existingTender = await this.getTenderById(id);
    
    if (existingTender.status === 'closed') {
      throw new TenderAlreadyClosedError();
    }
    
    if (existingTender.status === 'awarded') {
      throw new TenderAlreadyAwardedError();
    }

    // Validate input data
    const validation = this.validateTenderUpdateData(data);
    if (!validation.success) {
      throw new Error('Validation failed');
    }

    try {
      return await this.tenderRepository.update(id, validation.data);
    } catch (error) {
      throw error;
    }
  }

  async deleteTender(id: string): Promise<void> {
    if (!id) {
      throw new TenderNotFoundError('');
    }

    // Check if tender exists and validate status
    const existingTender = await this.getTenderById(id);
    
    if (existingTender.status === 'awarded') {
      throw new TenderAlreadyAwardedError();
    }

    try {
      await this.tenderRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async getTenderStats(): Promise<TenderStats> {
    try {
      return await this.tenderRepository.getStats();
    } catch (error) {
      throw error;
    }
  }

  async publishTender(id: string): Promise<Tender> {
    if (!id) {
      throw new TenderNotFoundError('');
    }

    // Check if tender exists and validate status
    const existingTender = await this.getTenderById(id);
    
    if (existingTender.status !== 'draft') {
      throw new InvalidTenderStatusError(existingTender.status);
    }

    try {
      return await this.tenderRepository.publish(id);
    } catch (error) {
      throw error;
    }
  }

  async closeTender(id: string): Promise<Tender> {
    if (!id) {
      throw new TenderNotFoundError('');
    }

    // Check if tender exists and validate status
    const existingTender = await this.getTenderById(id);
    
    if (existingTender.status !== 'published') {
      throw new InvalidTenderStatusError(existingTender.status);
    }

    try {
      return await this.tenderRepository.close(id);
    } catch (error) {
      throw error;
    }
  }

  async awardTender(id: string, vendorId: string): Promise<Tender> {
    if (!id) {
      throw new TenderNotFoundError('');
    }

    if (!vendorId) {
      throw new Error('Vendor ID is required');
    }

    // Check if tender exists and validate status
    const existingTender = await this.getTenderById(id);
    
    if (existingTender.status !== 'closed') {
      throw new InvalidTenderStatusError(existingTender.status);
    }

    try {
      return await this.tenderRepository.award(id, vendorId);
    } catch (error) {
      throw error;
    }
  }

  validateTenderData(data: CreateTenderRequest): { success: true; data: CreateTenderRequest } | { success: false; errors: Record<string, string> } {
    return validateFormData(createTenderSchema, data);
  }

  validateTenderUpdateData(data: UpdateTenderRequest): { success: true; data: UpdateTenderRequest } | { success: false; errors: Record<string, string> } {
    return validateFormData(updateTenderSchema, data);
  }
}

export const tenderService = new TenderService(tenderRepository);
