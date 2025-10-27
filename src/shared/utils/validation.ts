import { z } from 'zod';

export const createValidationSchema = <T extends z.ZodTypeAny>(
  schema: T
) => {
  return schema;
};

export const validateFormData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      const errorIssues = Array.isArray(error.issues) ? error.issues : [];
      errorIssues.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const createAsyncValidation = <T>(
  schema: z.ZodSchema<T>,
  validateFn: (data: T) => Promise<boolean>
) => {
  return async (data: T): Promise<boolean> => {
    try {
      const validatedData = schema.parse(data);
      return await validateFn(validatedData);
    } catch {
      return false;
    }
  };
};
