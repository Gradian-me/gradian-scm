import { BaseEntity, PaginationParams, PaginatedResponse } from '../../../shared/types/common';

export interface Tender extends BaseEntity {
  title: string;
  description: string;
  category: string;
  estimatedValue: number;
  currency: string;
  status: 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled';
  publishedDate?: Date;
  closingDate: Date;
  awardDate?: Date;
  awardedTo?: string;
  evaluationCriteria: TenderEvaluationCriteria;
  items: TenderItem[];
  quotations: Quotation[];
}

export interface TenderEvaluationCriteria {
  price: number;
  quality: number;
  delivery: number;
  experience: number;
}

export interface TenderItem {
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  specifications: string;
  estimatedUnitPrice: number;
}

export interface Quotation {
  id: string;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  items: QuotationItem[];
  totalAmount: number;
  currency: string;
  validUntil: Date;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: Date;
  notes?: string;
}

export interface QuotationItem {
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications: string;
  deliveryTime: number; // in days
}

export interface CreateTenderRequest {
  title: string;
  description: string;
  category: string;
  estimatedValue: number;
  currency: string;
  closingDate: string;
  evaluationCriteria: TenderEvaluationCriteria;
  items: Omit<TenderItem, 'estimatedUnitPrice'>[];
}

export interface UpdateTenderRequest extends Partial<CreateTenderRequest> {
  status?: Tender['status'];
  publishedDate?: string;
  awardDate?: string;
  awardedTo?: string;
}

export interface TenderFilters extends PaginationParams {
  status?: Tender['status'];
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TenderListResponse extends PaginatedResponse<Tender> {}

export interface TenderStats {
  totalTenders: number;
  activeTenders: number;
  closedTenders: number;
  awardedTenders: number;
  totalValue: number;
  averageResponseTime: number;
  topCategories: Array<{ category: string; count: number }>;
}
