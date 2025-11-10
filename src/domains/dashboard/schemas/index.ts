import { z } from 'zod';
import { createValidationSchema } from '@/gradian-ui/shared/utils/validation';

export const dashboardFiltersSchema = createValidationSchema(
  z.object({
    dateRange: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }).optional(),
    category: z.string().optional(),
    vendorId: z.string().optional(),
    status: z.string().optional(),
  })
);

export const kpiCardSchema = createValidationSchema(
  z.object({
    id: z.string(),
    title: z.string(),
    value: z.union([z.string(), z.number()]),
    change: z.number(),
    changeType: z.enum(['increase', 'decrease', 'neutral']),
    icon: z.string(),
    color: z.string(),
    trend: z.enum(['up', 'down', 'stable']),
  })
);

export const activityItemSchema = createValidationSchema(
  z.object({
    id: z.string(),
    type: z.enum(['vendor_created', 'tender_published', 'po_created', 'po_approved', 'tender_awarded']),
    title: z.string(),
    description: z.string(),
    timestamp: z.date(),
    userId: z.string(),
    userName: z.string(),
    metadata: z.record(z.string(), z.any()).optional(),
  })
);

export const deadlineItemSchema = createValidationSchema(
  z.object({
    id: z.string(),
    type: z.enum(['tender_closing', 'po_delivery', 'approval_due']),
    title: z.string(),
    description: z.string(),
    dueDate: z.date(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['pending', 'overdue', 'completed']),
    entityId: z.string(),
    entityType: z.enum(['tender', 'purchase_order', 'approval']),
  })
);

export const performanceMetricsSchema = createValidationSchema(
  z.object({
    vendorPerformance: z.object({
      averageRating: z.number(),
      onTimeDelivery: z.number(),
      qualityScore: z.number(),
    }),
    tenderPerformance: z.object({
      averageResponseTime: z.number(),
      quotationRate: z.number(),
      awardRate: z.number(),
    }),
    procurementEfficiency: z.object({
      averageProcessingTime: z.number(),
      costSavings: z.number(),
      cycleTime: z.number(),
    }),
  })
);

export const chartDataSchema = createValidationSchema(
  z.object({
    labels: z.array(z.string()),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.number()),
      backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
      borderColor: z.union([z.string(), z.array(z.string())]).optional(),
      borderWidth: z.number().optional(),
    })),
  })
);

export const spendAnalysisDataSchema = createValidationSchema(
  z.object({
    byCategory: chartDataSchema,
    byVendor: chartDataSchema,
    monthlyTrend: chartDataSchema,
    quarterlyComparison: chartDataSchema,
  })
);

export type DashboardFiltersInput = z.infer<typeof dashboardFiltersSchema>;
export type KpiCardInput = z.infer<typeof kpiCardSchema>;
export type ActivityItemInput = z.infer<typeof activityItemSchema>;
export type DeadlineItemInput = z.infer<typeof deadlineItemSchema>;
export type PerformanceMetricsInput = z.infer<typeof performanceMetricsSchema>;
export type ChartDataInput = z.infer<typeof chartDataSchema>;
export type SpendAnalysisDataInput = z.infer<typeof spendAnalysisDataSchema>;
