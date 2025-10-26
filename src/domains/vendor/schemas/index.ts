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
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('ACTIVE'),
    rating: z.number().min(1).max(5).default(5),
    website: z.string().optional(),
    establishedYear: z.number().optional(),
    employeeCount: z.number().optional(),
    description: z.string().optional(),
  })
);

export const updateVendorSchema = createValidationSchema(
  z.object({
    name: z.string().min(1, 'Company name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(1, 'Phone number is required').optional(),
    address: z.string().min(1, 'Address is required').optional(),
    city: z.string().min(1, 'City is required').optional(),
    state: z.string().min(1, 'State is required').optional(),
    zipCode: z.string().min(1, 'ZIP code is required').optional(),
    country: z.string().min(1, 'Country is required').optional(),
    registrationNumber: z.string().min(1, 'Registration number is required').optional(),
    taxId: z.string().min(1, 'Tax ID is required').optional(),
    categories: z.array(z.string()).min(1, 'At least one category is required').optional(),
    contacts: z.array(vendorContactSchema).min(1, 'At least one contact is required').optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
    rating: z.number().min(1).max(5).optional(),
    website: z.string().optional(),
    establishedYear: z.number().optional(),
    employeeCount: z.number().optional(),
    description: z.string().optional(),
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
