import { PurchaseOrder, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseOrderFilters, PurchaseOrderListResponse, PurchaseOrderStats } from '../types';
import { apiClient } from '../../../shared/utils/api';
import { API_ENDPOINTS } from '../../../shared/constants';

export interface IPurchaseOrderRepository {
  findAll(filters: PurchaseOrderFilters): Promise<PurchaseOrderListResponse>;
  findById(id: string): Promise<PurchaseOrder>;
  create(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder>;
  update(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder>;
  delete(id: string): Promise<void>;
  getStats(): Promise<PurchaseOrderStats>;
  approve(id: string, approvedBy: string): Promise<PurchaseOrder>;
  acknowledge(id: string): Promise<PurchaseOrder>;
  complete(id: string): Promise<PurchaseOrder>;
  cancel(id: string, reason: string): Promise<PurchaseOrder>;
}

export class PurchaseOrderRepository implements IPurchaseOrderRepository {
  private baseEndpoint = API_ENDPOINTS.PURCHASE_ORDERS;

  async findAll(filters: PurchaseOrderFilters): Promise<PurchaseOrderListResponse> {
    const response = await apiClient.get<PurchaseOrderListResponse>(this.baseEndpoint, filters);
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch purchase orders');
    }
    
    return response.data;
  }

  async findById(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.get<PurchaseOrder>(`${this.baseEndpoint}/${id}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch purchase order');
    }
    return response.data;
  }

  async create(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(this.baseEndpoint, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to create purchase order');
    }
    return response.data;
  }

  async update(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    const response = await apiClient.put<PurchaseOrder>(`${this.baseEndpoint}/${id}`, data);
    if (!response.success || !response.data) {
      throw new Error('Failed to update purchase order');
    }
    return response.data;
  }

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete purchase order');
    }
  }

  async getStats(): Promise<PurchaseOrderStats> {
    const response = await apiClient.get<PurchaseOrderStats>(`${this.baseEndpoint}/stats`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch purchase order stats');
    }
    return response.data;
  }

  async approve(id: string, approvedBy: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(`${this.baseEndpoint}/${id}/approve`, { approvedBy });
    if (!response.success || !response.data) {
      throw new Error('Failed to approve purchase order');
    }
    return response.data;
  }

  async acknowledge(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(`${this.baseEndpoint}/${id}/acknowledge`);
    if (!response.success || !response.data) {
      throw new Error('Failed to acknowledge purchase order');
    }
    return response.data;
  }

  async complete(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(`${this.baseEndpoint}/${id}/complete`);
    if (!response.success || !response.data) {
      throw new Error('Failed to complete purchase order');
    }
    return response.data;
  }

  async cancel(id: string, reason: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<PurchaseOrder>(`${this.baseEndpoint}/${id}/cancel`, { reason });
    if (!response.success || !response.data) {
      throw new Error('Failed to cancel purchase order');
    }
    return response.data;
  }
}

export const purchaseOrderRepository = new PurchaseOrderRepository();
