import { z } from 'zod';

export const createValidationSchema = <T extends z.ZodTypeAny>(
  schema: T,
  customErrorMap?: z.ZodErrorMap
) => {
  if (customErrorMap) {
    z.setErrorMap(customErrorMap);
  }
  return schema;
};

export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === 'string') {
        return { message: 'This field is required' };
      }
      break;
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: `Minimum ${issue.minimum} characters required` };
      }
      if (issue.type === 'number') {
        return { message: `Minimum value is ${issue.minimum}` };
      }
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `Maximum ${issue.maximum} characters allowed` };
      }
      if (issue.type === 'number') {
        return { message: `Maximum value is ${issue.maximum}` };
      }
      break;
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'Please enter a valid email address' };
      }
      if (issue.validation === 'url') {
        return { message: 'Please enter a valid URL' };
      }
      break;
    case z.ZodIssueCode.custom:
      return { message: issue.message || 'Invalid value' };
  }
  return { message: ctx.defaultError };
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
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
      }
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
