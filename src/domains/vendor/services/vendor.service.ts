import { Vendor, CreateVendorRequest, UpdateVendorRequest, VendorFilters, VendorListResponse, VendorStats } from '../types';
import { IVendorRepository, vendorRepository } from '../repositories/vendor.repository';
import { 
  VendorNotFoundError, 
  VendorEmailAlreadyExistsError, 
  VendorRegistrationNumberAlreadyExistsError,
  InvalidVendorStatusError,
  VendorCategoryValidationError,
  VendorRatingValidationError
} from '../errors';
import { createVendorSchema, updateVendorSchema, vendorFiltersSchema } from '../schemas';
import { validateFormData } from '../../../shared/utils/validation';

export interface IVendorService {
  getAllVendors(filters: VendorFilters): Promise<VendorListResponse>;
  getVendorById(id: string): Promise<Vendor>;
  createVendor(data: CreateVendorRequest): Promise<Vendor>;
  updateVendor(id: string, data: UpdateVendorRequest): Promise<Vendor>;
  deleteVendor(id: string): Promise<void>;
  getVendorStats(): Promise<VendorStats>;
  validateVendorData(data: CreateVendorRequest): { success: true; data: CreateVendorRequest } | { success: false; errors: Record<string, string> };
  validateVendorUpdateData(data: UpdateVendorRequest): { success: true; data: UpdateVendorRequest } | { success: false; errors: Record<string, string> };
}

export class VendorService implements IVendorService {
  constructor(private vendorRepository: IVendorRepository) {}

  async getAllVendors(filters: VendorFilters): Promise<VendorListResponse> {
    // Validate filters
    const validation = validateFormData(vendorFiltersSchema, filters);
    if (!validation.success) {
      throw new Error('Invalid filter parameters');
    }

    try {
      const result = await this.vendorRepository.findAll(validation.data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getVendorById(id: string): Promise<Vendor> {
    if (!id) {
      throw new VendorNotFoundError('');
    }

    try {
      return await this.vendorRepository.findById(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new VendorNotFoundError(id);
      }
      throw error;
    }
  }

  async createVendor(data: CreateVendorRequest): Promise<Vendor> {
    // Validate input data
    const validation = this.validateVendorData(data);
    if (!validation.success) {
      throw new Error('Validation failed');
    }

    // Check for duplicate email
    try {
      const existingVendors = await this.vendorRepository.findAll({ page: 1, limit: 1, search: data.email });
      if (existingVendors.data.length > 0) {
        throw new VendorEmailAlreadyExistsError(data.email);
      }
    } catch (error) {
      if (error instanceof VendorEmailAlreadyExistsError) {
        throw error;
      }
      // Continue if search fails (might be network issue)
    }

    // Check for duplicate registration number
    try {
      const existingVendors = await this.vendorRepository.findAll({ page: 1, limit: 1, search: data.registrationNumber });
      if (existingVendors.data.length > 0) {
        throw new VendorRegistrationNumberAlreadyExistsError(data.registrationNumber);
      }
    } catch (error) {
      if (error instanceof VendorRegistrationNumberAlreadyExistsError) {
        throw error;
      }
      // Continue if search fails (might be network issue)
    }

    try {
      return await this.vendorRepository.create(validation.data);
    } catch (error) {
      throw error;
    }
  }

  async updateVendor(id: string, data: UpdateVendorRequest): Promise<Vendor> {
    if (!id) {
      throw new VendorNotFoundError('');
    }

    // Validate input data
    const validation = this.validateVendorUpdateData(data);
    if (!validation.success) {
      throw new Error('Validation failed');
    }

    // Check if vendor exists
    try {
      await this.vendorRepository.findById(id);
    } catch (error) {
      throw new VendorNotFoundError(id);
    }

    // Check for duplicate email if email is being updated
    if (data.email) {
      try {
        const existingVendors = await this.vendorRepository.findAll({ page: 1, limit: 1, search: data.email });
        const vendorWithEmail = existingVendors.data.find(v => v.email === data.email && v.id !== id);
        if (vendorWithEmail) {
          throw new VendorEmailAlreadyExistsError(data.email);
        }
      } catch (error) {
        if (error instanceof VendorEmailAlreadyExistsError) {
          throw error;
        }
        // Continue if search fails
      }
    }

    try {
      return await this.vendorRepository.update(id, validation.data);
    } catch (error) {
      throw error;
    }
  }

  async deleteVendor(id: string): Promise<void> {
    if (!id) {
      throw new VendorNotFoundError('');
    }

    // Check if vendor exists
    try {
      await this.vendorRepository.findById(id);
    } catch (error) {
      throw new VendorNotFoundError(id);
    }

    try {
      await this.vendorRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async getVendorStats(): Promise<VendorStats> {
    try {
      return await this.vendorRepository.getStats();
    } catch (error) {
      throw error;
    }
  }

  validateVendorData(data: CreateVendorRequest): { success: true; data: CreateVendorRequest } | { success: false; errors: Record<string, string> } {
    return validateFormData(createVendorSchema, data);
  }

  validateVendorUpdateData(data: UpdateVendorRequest): { success: true; data: UpdateVendorRequest } | { success: false; errors: Record<string, string> } {
    return validateFormData(updateVendorSchema, data);
  }
}

export const vendorService = new VendorService(vendorRepository);
