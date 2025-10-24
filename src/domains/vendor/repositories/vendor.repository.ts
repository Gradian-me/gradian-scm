import { Vendor, CreateVendorRequest, UpdateVendorRequest, VendorFilters, VendorListResponse, VendorStats } from '../types';
import { apiClient } from '../../../shared/utils/api';
import { API_ENDPOINTS } from '../../../shared/constants';

export interface IVendorRepository {
  findAll(filters: VendorFilters): Promise<VendorListResponse>;
  findById(id: string): Promise<Vendor>;
  create(data: CreateVendorRequest): Promise<Vendor>;
  update(id: string, data: UpdateVendorRequest): Promise<Vendor>;
  delete(id: string): Promise<void>;
  getStats(): Promise<VendorStats>;
}

export class VendorRepository implements IVendorRepository {
  private baseEndpoint = API_ENDPOINTS.VENDORS;

  async findAll(filters: VendorFilters): Promise<VendorListResponse> {
    const response = await apiClient.get<any>(this.baseEndpoint, filters);
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch vendors');
    }
    
    // The API returns { success: true, data: [...], pagination: {...} }
    // We need to return the full response structure
    const result: VendorListResponse = {
      data: response.data,
      pagination: response.pagination
    };
    
    return result;
  }

  async findById(id: string): Promise<Vendor> {
    const response = await apiClient.get<Vendor>(`${this.baseEndpoint}/${id}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch vendor');
    }
    return response.data;
  }

  async create(data: CreateVendorRequest): Promise<Vendor> {
    const response = await apiClient.post<Vendor>(this.baseEndpoint, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to create vendor');
    }
    return response.data;
  }

  async update(id: string, data: UpdateVendorRequest): Promise<Vendor> {
    const response = await apiClient.put<Vendor>(`${this.baseEndpoint}/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to update vendor');
    }
    return response.data;
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete vendor');
    }
  }

  async getStats(): Promise<VendorStats> {
    const response = await apiClient.get<VendorStats>(`${this.baseEndpoint}/stats`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch vendor stats');
    }
    return response.data;
  }
}

export const vendorRepository = new VendorRepository();
