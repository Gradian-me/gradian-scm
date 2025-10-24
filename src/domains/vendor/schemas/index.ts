import { z } from 'zod';
import { createValidationSchema } from '../../../shared/utils/validation';

export const vendorContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  position: z.string().min(1, 'Position is required'),
  isPrimary: z.boolean().default(true),
});

export const vendorPerformanceMetricsSchema = z.object({
  onTimeDelivery: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  totalOrders: z.number().min(0),
  totalValue: z.number().min(0),
  averageResponseTime: z.number().min(0),
});

export const createVendorSchema = createValidationSchema(
  z.object({
    name: z.string().min(1, 'Company name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    taxId: z.string().min(1, 'Tax ID is required'),
    categories: z.array(z.string()).min(1, 'At least one category is required'),
    contacts: z.array(vendorContactSchema).min(1, 'At least one contact is required'),
  })
);

export const updateVendorSchema = createValidationSchema(
  createVendorSchema.partial().extend({
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
  })
);

export const vendorFiltersSchema = createValidationSchema(
  z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
    category: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
);

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type VendorFiltersInput = z.infer<typeof vendorFiltersSchema>;
