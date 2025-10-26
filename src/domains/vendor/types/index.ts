import { BaseEntity, PaginationParams, PaginatedResponse } from '../../../shared/types/common';

export interface Vendor extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  registrationNumber: string;
  taxId: string;
  categories: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  rating: number;
  joinedDate: Date;
  primaryContact: VendorContact;
  contacts: VendorContact[];
  certifications: VendorCertification[];
  performanceMetrics: VendorPerformanceMetrics;
}

export interface VendorCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  status: string;
  documentUrl: string;
  vendorId: string;
}

export interface VendorContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  isPrimary: boolean;
  vendorId: string;
}

export interface VendorPerformanceMetrics {
  id: string;
  onTimeDelivery: number;
  qualityScore: number;
  priceCompetitiveness: number;
  responsiveness: number;
  complianceScore: number;
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  vendorId: string;
}

export interface CreateVendorRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  registrationNumber: string;
  taxId: string;
  categories: string[];
  primaryContact: Omit<VendorContact, 'isPrimary'>;
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {
  status?: Vendor['status'];
}

export interface VendorFilters extends PaginationParams {
  status?: 'all' | Vendor['status'];
  category?: string;
  rating?: number;
  search?: string;
}

export interface VendorListResponse extends PaginatedResponse<Vendor> {}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  averageRating: number;
  topCategories: Array<{ category: string; count: number }>;
}
