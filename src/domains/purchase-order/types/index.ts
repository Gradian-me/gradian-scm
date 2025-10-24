import { BaseEntity, PaginationParams, PaginatedResponse } from '../../../shared/types/common';
import { Vendor } from '../../vendor/types';

export interface PurchaseOrder extends BaseEntity {
  poNumber: string;
  vendorId: string;
  vendor: Vendor;
  tenderId?: string;
  quotationId?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  paymentTerms: string;
  deliveryTerms: string;
  expectedDeliveryDate: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  currency: string;
  createdBy: string;
  approvedBy?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  deliveryTime?: number; // in days
}

export interface CreatePurchaseOrderRequest {
  vendorId: string;
  tenderId?: string;
  quotationId?: string;
  paymentTerms: string;
  deliveryTerms: string;
  expectedDeliveryDate: string;
  items: Omit<PurchaseOrderItem, 'totalPrice'>[];
  currency: string;
  notes?: string;
}

export interface UpdatePurchaseOrderRequest extends Partial<CreatePurchaseOrderRequest> {
  status?: PurchaseOrder['status'];
  approvedBy?: string;
}

export interface PurchaseOrderFilters extends PaginationParams {
  status?: PurchaseOrder['status'];
  vendorId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PurchaseOrderListResponse extends PaginatedResponse<PurchaseOrder> {}

export interface PurchaseOrderStats {
  totalPOs: number;
  pendingApproval: number;
  approved: number;
  inProgress: number;
  completed: number;
  totalValue: number;
  averageProcessingTime: number;
  topVendors: Array<{ vendor: string; count: number; value: number }>;
}
