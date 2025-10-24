import { Tender, CreateTenderRequest, UpdateTenderRequest, TenderFilters, TenderListResponse, TenderStats } from '../types';
import { apiClient } from '../../../shared/utils/api';
import { API_ENDPOINTS } from '../../../shared/constants';

export interface ITenderRepository {
  findAll(filters: TenderFilters): Promise<TenderListResponse>;
  findById(id: string): Promise<Tender>;
  create(data: CreateTenderRequest): Promise<Tender>;
  update(id: string, data: UpdateTenderRequest): Promise<Tender>;
  delete(id: string): Promise<void>;
  getStats(): Promise<TenderStats>;
  publish(id: string): Promise<Tender>;
  close(id: string): Promise<Tender>;
  award(id: string, vendorId: string): Promise<Tender>;
}

export class TenderRepository implements ITenderRepository {
  private baseEndpoint = API_ENDPOINTS.TENDERS;

  async findAll(filters: TenderFilters): Promise<TenderListResponse> {
    const response = await apiClient.get<TenderListResponse>(this.baseEndpoint, filters);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch tenders');
    }
    return response.data;
  }

  async findById(id: string): Promise<Tender> {
    const response = await apiClient.get<Tender>(`${this.baseEndpoint}/${id}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch tender');
    }
    return response.data;
  }

  async create(data: CreateTenderRequest): Promise<Tender> {
    const response = await apiClient.post<Tender>(this.baseEndpoint, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to create tender');
    }
    return response.data;
  }

  async update(id: string, data: UpdateTenderRequest): Promise<Tender> {
    const response = await apiClient.put<Tender>(`${this.baseEndpoint}/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to update tender');
    }
    return response.data;
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete tender');
    }
  }

  async getStats(): Promise<TenderStats> {
    const response = await apiClient.get<TenderStats>(`${this.baseEndpoint}/stats`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch tender stats');
    }
    return response.data;
  }

  async publish(id: string): Promise<Tender> {
    const response = await apiClient.post<Tender>(`${this.baseEndpoint}/${id}/publish`);
    if (!response.success || !response.data) {
      throw new Error('Failed to publish tender');
    }
    return response.data;
  }

  async close(id: string): Promise<Tender> {
    const response = await apiClient.post<Tender>(`${this.baseEndpoint}/${id}/close`);
    if (!response.success || !response.data) {
      throw new Error('Failed to close tender');
    }
    return response.data;
  }

  async award(id: string, vendorId: string): Promise<Tender> {
    const response = await apiClient.post<Tender>(`${this.baseEndpoint}/${id}/award`, { vendorId });
    if (!response.success || !response.data) {
      throw new Error('Failed to award tender');
    }
    return response.data;
  }
}

export const tenderRepository = new TenderRepository();
