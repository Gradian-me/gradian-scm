import { z } from 'zod';
import { createValidationSchema } from '../../../shared/utils/validation';

export const tenderEvaluationCriteriaSchema = z.object({
  price: z.number().min(0).max(100),
  quality: z.number().min(0).max(100),
  delivery: z.number().min(0).max(100),
  experience: z.number().min(0).max(100),
}).refine(
  (data) => data.price + data.quality + data.delivery + data.experience === 100,
  {
    message: "Evaluation criteria must total 100%",
    path: ["evaluationCriteria"],
  }
);

export const tenderItemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  specifications: z.string().min(1, 'Specifications are required'),
  estimatedUnitPrice: z.number().min(0, 'Unit price must be positive').optional(),
});

export const createTenderSchema = createValidationSchema(
  z.object({
    title: z.string().min(1, 'Tender title is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    estimatedValue: z.number().min(0, 'Estimated value must be positive'),
    currency: z.string().min(1, 'Currency is required'),
    closingDate: z.string().min(1, 'Closing date is required'),
    evaluationCriteria: tenderEvaluationCriteriaSchema,
    items: z.array(tenderItemSchema).min(1, 'At least one item is required'),
  })
);

export const updateTenderSchema = createValidationSchema(
  createTenderSchema.partial().extend({
    status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).optional(),
    publishedDate: z.string().optional(),
    awardDate: z.string().optional(),
    awardedTo: z.string().optional(),
  })
);

export const tenderFiltersSchema = createValidationSchema(
  z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).optional(),
    category: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
);

export const quotationSchema = createValidationSchema(
  z.object({
    vendorId: z.string().min(1, 'Vendor is required'),
    items: z.array(z.object({
      productName: z.string().min(1, 'Product name is required'),
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unit: z.string().min(1, 'Unit is required'),
      unitPrice: z.number().min(0, 'Unit price must be positive'),
      specifications: z.string().min(1, 'Specifications are required'),
      deliveryTime: z.number().min(1, 'Delivery time must be at least 1 day'),
    })).min(1, 'At least one item is required'),
    validUntil: z.string().min(1, 'Valid until date is required'),
    notes: z.string().optional(),
  })
);

export type CreateTenderInput = z.infer<typeof createTenderSchema>;
export type UpdateTenderInput = z.infer<typeof updateTenderSchema>;
export type TenderFiltersInput = z.infer<typeof tenderFiltersSchema>;
export type QuotationInput = z.infer<typeof quotationSchema>;
