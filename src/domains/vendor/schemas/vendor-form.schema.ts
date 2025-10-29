// Vendor Form Schema - Re-exports from centralized schema registry
// This file maintains backward compatibility while using the JSON-based schema
// NOTE: This entire domain folder will be removed in favor of dynamic pages

import { FormSchema } from '../../../shared/types/form-schema';

// Temporary: inline a minimal schema to avoid server-only imports in client components
// TODO: Remove this entire domain folder and use /page/vendors dynamic route instead
export const vendorFormSchema: FormSchema = {
  id: 'vendors',
  name: 'vendors',
  title: 'Create New Vendor',
  description: 'Add a new vendor to your supply chain management system',
  singular_name: 'Vendor',
  plural_name: 'Vendors',
  sections: []  // Minimal schema - full schema loaded from JSON in dynamic pages
};