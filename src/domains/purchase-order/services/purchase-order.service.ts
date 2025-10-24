import { PurchaseOrder, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest, PurchaseOrderFilters, PurchaseOrderListResponse, PurchaseOrderStats } from '../types';
import { IPurchaseOrderRepository, purchaseOrderRepository } from '../repositories/purchase-order.repository';
import { 
  PurchaseOrderNotFoundError, 
  PurchaseOrderNumberAlreadyExistsError,
  InvalidPurchaseOrderStatusError,
  PurchaseOrderAlreadyApprovedError,
  PurchaseOrderAlreadyCompletedError,
  InsufficientPermissionsError,
  VendorNotFoundError,
  TenderNotFoundError,
  QuotationNotFoundError
} from '../errors';
import { createPurchaseOrderSchema, updatePurchaseOrderSchema, purchaseOrderFiltersSchema } from '../schemas';
import { validateFormData } from '../../../shared/utils/validation';

export interface IPurchaseOrderService {
  getAllPurchaseOrders(filters: PurchaseOrderFilters): Promise<PurchaseOrderListResponse>;
  getPurchaseOrderById(id: string): Promise<PurchaseOrder>;
  createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder>;
  deletePurchaseOrder(id: string): Promise<void>;
  getPurchaseOrderStats(): Promise<PurchaseOrderStats>;
  approvePurchaseOrder(id: string, approvedBy: string): Promise<PurchaseOrder>;
  acknowledgePurchaseOrder(id: string): Promise<PurchaseOrder>;
  completePurchaseOrder(id: string): Promise<PurchaseOrder>;
  cancelPurchaseOrder(id: string, reason: string): Promise<PurchaseOrder>;
  validatePurchaseOrderData(data: CreatePurchaseOrderRequest): { success: true; data: CreatePurchaseOrderRequest } | { success: false; errors: Record<string, string> };
  validatePurchaseOrderUpdateData(data: UpdatePurchaseOrderRequest): { success: true; data: UpdatePurchaseOrderRequest } | { success: false; errors: Record<string, string> };
}

export class PurchaseOrderService implements IPurchaseOrderService {
  constructor(private purchaseOrderRepository: IPurchaseOrderRepository) {}

  async getAllPurchaseOrders(filters: PurchaseOrderFilters): Promise<PurchaseOrderListResponse> {
    // Validate filters
    const validation = validateFormData(purchaseOrderFiltersSchema, filters);
    if (!validation.success) {
      throw new Error('Invalid filter parameters');
    }

    try {
      return await this.purchaseOrderRepository.findAll(validation.data);
    } catch (error) {
      throw error;
    }
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    if (!id) {
      throw new PurchaseOrderNotFoundError('');
    }

    try {
      return await this.purchaseOrderRepository.findById(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new PurchaseOrderNotFoundError(id);
      }
      throw error;
    }
  }

  async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    // Validate input data
    const validation = this.validatePurchaseOrderData(data);
    if (!validation.success) {
      throw new Error('Validation failed');
    }

    // Calculate totals
    const itemsWithTotals = validation.data.items.map(item => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.09; // 9% tax
    const totalAmount = subtotal + tax;

    const purchaseOrderData = {
      ...validation.data,
      items: itemsWithTotals,
      subtotal,
      tax,
      totalAmount,
    };

    try {
      return await this.purchaseOrderRepository.create(purchaseOrderData);
    } catch (error) {
      throw error;
    }
  }

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    if (!id) {
      throw new PurchaseOrderNotFoundError('');
    }

    // Check if purchase order exists and validate status
    const existingPO = await this.getPurchaseOrderById(id);
    
    if (existingPO.status === 'approved' || existingPO.status === 'acknowledged' || existingPO.status === 'in_progress') {
      throw new PurchaseOrderAlreadyApprovedError();
    }
    
    if (existingPO.status === 'completed') {
      throw new PurchaseOrderAlreadyCompletedError();
    }

    // Validate input data
    const validation = this.validatePurchaseOrderUpdateData(data);
    if (!validation.success) {
      throw new Error('Validation failed');
    }

    // Recalculate totals if items are being updated
    let updatedData = validation.data;
    if (data.items) {
      const itemsWithTotals = data.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      }));

      const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.09; // 9% tax
      const totalAmount = subtotal + tax;

      updatedData = {
        ...validation.data,
        items: itemsWithTotals,
        subtotal,
        tax,
        totalAmount,
      };
    }

    try {
      return await this.purchaseOrderRepository.update(id, updatedData);
    } catch (error) {
      throw error;
    }
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    if (!id) {
      throw new PurchaseOrderNotFoundError('');
    }

    // Check if purchase order exists and validate status
    const existingPO = await this.getPurchaseOrderById(id);
    
    if (existingPO.status === 'approved' || existingPO.status === 'acknowledged' || existingPO.status === 'in_progress') {
      throw new PurchaseOrderAlreadyApprovedError();
    }

    try {
      await this.purchaseOrderRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async getPurchaseOrderStats(): Promise<PurchaseOrderStats> {
    try {
      return await this.purchaseOrderRepository.getStats();
    } catch (error) {
      throw error;
    }
  }

  async approvePurchaseOrder(id: string, approvedBy: string): Promise<PurchaseOrder> {
    if (!id) {
      throw new PurchaseOrderNotFoundError('');
    }

    if (!approvedBy) {
      throw new Error('Approver ID is required');
    }

    // Check if purchase order exists and validate status
    const existingPO = await this.getPurchaseOrderById(id);
    
    if (existingPO.status !== 'pending_approval') {
      throw new InvalidPurchaseOrderStatusError(existingPO.status);
    }

    try {
      return await this.purchaseOrderRepository.approve(id, approvedBy);
    } catch (error) {
      throw error;
    }
  }

  async acknowledgePurchaseOrder(id: string): Promise<PurchaseOrder> {
    if (!id) {
      throw new PurchaseOrderNotFoundError('');
    }

    // Check if purchase order exists and validate status
    const existingPO = await this.getPurchaseOrderById(id);
    
    if (existingPO.status !== 'approved') {
      throw new InvalidPurchaseOrderStatusError(existingPO.status);
    }

    try {
      return await this.purchaseOrderRepository.acknowledge(id);
    } catch (error) {
      throw error;
    }
  }

  async completePurchaseOrder(id: string): Promise<PurchaseOrder> {
    if (!id) {
      throw new PurchaseOrderNotFoundError('');
    }

    // Check if purchase order exists and validate status
    const existingPO = await this.getPurchaseOrderById(id);
    
    if (existingPO.status !== 'in_progress') {
      throw new InvalidPurchaseOrderStatusError(existingPO.status);
    }

    try {
      return await this.purchaseOrderRepository.complete(id);
    } catch (error) {
      throw error;
    }
  }

  async cancelPurchaseOrder(id: string, reason: string): Promise<PurchaseOrder> {
    if (!id) {
      throw new PurchaseOrderNotFoundError('');
    }

    if (!reason) {
      throw new Error('Cancellation reason is required');
    }

    // Check if purchase order exists and validate status
    const existingPO = await this.getPurchaseOrderById(id);
    
    if (existingPO.status === 'completed') {
      throw new PurchaseOrderAlreadyCompletedError();
    }

    try {
      return await this.purchaseOrderRepository.cancel(id, reason);
    } catch (error) {
      throw error;
    }
  }

  validatePurchaseOrderData(data: CreatePurchaseOrderRequest): { success: true; data: CreatePurchaseOrderRequest } | { success: false; errors: Record<string, string> } {
    return validateFormData(createPurchaseOrderSchema, data);
  }

  validatePurchaseOrderUpdateData(data: UpdatePurchaseOrderRequest): { success: true; data: UpdatePurchaseOrderRequest } | { success: false; errors: Record<string, string> } {
    return validateFormData(updatePurchaseOrderSchema, data);
  }
}

export const purchaseOrderService = new PurchaseOrderService(purchaseOrderRepository);
