// Extended Form Schema Types
// Temporary file for backward compatibility
// TODO: Remove this entire domain folder

import { FormSchema } from '../../../shared/types/form-schema';

// Extended form schema with additional properties
export type ExtendedFormSchema = FormSchema & {
  // Add any extended properties here if needed
  [key: string]: any;
};

