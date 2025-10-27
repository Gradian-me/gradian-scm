import { z } from 'zod';
import { createValidationSchema } from '../../../shared/utils/validation';
import { generateSchemasFromForm, createArrayFieldZodSchema } from '../../../gradian-ui/schema-manager';
import { vendorFormSchema } from './vendor-form.schema';

// Generate Zod schemas from the form schema
const { createSchema, updateSchema, validationRules, initialValues } = generateSchemasFromForm(vendorFormSchema);

// Contact schema for nested validation
export const vendorContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

// Performance metrics schema
export const vendorPerformanceMetricsSchema = z.object({
  onTimeDelivery: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  totalOrders: z.number().min(0),
  totalValue: z.number().min(0),
  averageResponseTime: z.number().min(0),
});

// Use the generated schemas
export const createVendorSchema = createSchema;
export const updateVendorSchema = updateSchema;

// Export validation rules for use with useFormState hook
export const vendorValidationRules = validationRules;
export const vendorInitialValues = initialValues;

// Filters schema
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

// Type exports
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type VendorFiltersInput = z.infer<typeof vendorFiltersSchema>;
