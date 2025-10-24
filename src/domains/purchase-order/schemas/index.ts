import { z } from 'zod';
import { createValidationSchema } from '../../../shared/utils/validation';

export const purchaseOrderItemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  specifications: z.string().optional(),
  deliveryTime: z.number().min(1, 'Delivery time must be at least 1 day').optional(),
});

export const createPurchaseOrderSchema = createValidationSchema(
  z.object({
    vendorId: z.string().min(1, 'Vendor is required'),
    tenderId: z.string().optional(),
    quotationId: z.string().optional(),
    paymentTerms: z.string().min(1, 'Payment terms are required'),
    deliveryTerms: z.string().min(1, 'Delivery terms are required'),
    expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
    items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
    currency: z.string().min(1, 'Currency is required'),
    notes: z.string().optional(),
  })
);

export const updatePurchaseOrderSchema = createValidationSchema(
  createPurchaseOrderSchema.partial().extend({
    status: z.enum(['draft', 'pending_approval', 'approved', 'acknowledged', 'in_progress', 'completed', 'cancelled']).optional(),
    approvedBy: z.string().optional(),
  })
);

export const purchaseOrderFiltersSchema = createValidationSchema(
  z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['draft', 'pending_approval', 'approved', 'acknowledged', 'in_progress', 'completed', 'cancelled']).optional(),
    vendorId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
);

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type PurchaseOrderFiltersInput = z.infer<typeof purchaseOrderFiltersSchema>;
