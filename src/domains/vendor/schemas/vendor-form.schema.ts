// Vendor Form Schema - Re-exports from centralized schema registry
// This file maintains backward compatibility while using the centralized schema

import { vendorSchema } from '../../../shared/schemas/all-schemas';

// Export the schema from the centralized location
export const vendorFormSchema = vendorSchema;