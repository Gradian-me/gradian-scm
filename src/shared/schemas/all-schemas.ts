// Centralized Schema Registry
// All entity schemas are defined here for dynamic page generation

import { FormSchema } from '../types/form-schema';

// Vendor Schema Definition
export const vendorSchema: FormSchema = {
  id: 'vendors',
  name: 'vendors',
  title: 'Create New Vendor',
  description: 'Add a new vendor to your supply chain management system',
  singular_name: 'Vendor',
  plural_name: 'Vendors',
  cardMetadata: [
    {
      id: 'contact-info',
      title: 'Contact Information',
      colSpan: 1,
      fieldIds: ['email-address', 'phone-number', 'tax-id']
    },
    {
      id: 'location',
      title: 'Location',
      colSpan: 1,
      fieldIds: ['country', 'state', 'city']
    }
  ],
  sections: [
    {
      id: 'basic-information',
      title: 'Vendor Information',
      description: 'Basic vendor details and contact information',
      initialState: 'expanded',
      columns: 2,
      gap: 4,
      fields: [
        {
          id: 'company-name',
          name: 'name',
          label: 'Company Name',
          type: 'text',
          component: 'text',
          placeholder: 'Enter company name',
          required: true,
          role: 'title',
          validation: {
            required: true,
            minLength: 2,
          },
          ui: {
            colSpan: 1,
            order: 1,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'email-address',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          component: 'email',
          placeholder: 'Enter email address',
          icon: 'Home',
          required: true,
          role: 'subtitle',
          validation: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          },
          ui: {
            colSpan: 1,
            order: 2,
            variant: 'outlined',
            size: 'md',
          },
          display: {
            type: 'text',
            truncate: true,
          }
        },
        {
          id: 'phone-number',
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          component: 'text',
          placeholder: 'Enter phone number',
          icon: 'Phone',
          required: true,
          role: 'tel',
          validation: {
            required: true
          },
          ui: {
            colSpan: 1,
            order: 3,
            variant: 'outlined',
            size: 'md',
          },
          display: {
            type: 'text',
          }
        },
        {
          id: 'registration-number',
          name: 'registrationNumber',
          label: 'Registration Number',
          type: 'text',
          component: 'text',
          placeholder: 'Enter registration number',
          required: true,
          validation: {
            required: true,
          },
          ui: {
            colSpan: 1,
            order: 4,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'tax-id',
          name: 'taxId',
          label: 'Tax ID',
          type: 'text',
          component: 'text',
          placeholder: 'Enter tax ID',
          required: true,
          validation: {
            required: true,
          },
          ui: {
            colSpan: 1,
            order: 5,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'country',
          name: 'country',
          label: 'Country',
          type: 'select',
          component: 'select',
          placeholder: 'Select country',
          required: true,
          role: 'location',
          options: [
            { label: 'United States', value: 'USA' },
            { label: 'Canada', value: 'CAN' },
            { label: 'United Kingdom', value: 'UK' },
            { label: 'Germany', value: 'DE' },
            { label: 'France', value: 'FR' },
            { label: 'Japan', value: 'JP' },
            { label: 'China', value: 'CN' },
            { label: 'India', value: 'IN' },
          ],
          validation: {
            required: true,
          },
          ui: {
            colSpan: 1,
            order: 6,
            variant: 'outlined',
            size: 'md',
          },
        },
      ],
    },
    {
      id: 'address-information',
      title: 'Address Information',
      description: 'Complete address details for the vendor',
      columns: 3,
      gap: 4,
      styling: {
        variant: 'card',
      },
      fields: [
        {
          id: 'address',
          name: 'address',
          label: 'Address',
          type: 'textarea',
          component: 'textarea',
          placeholder: 'Enter full address',
          required: true,
          validation: {
            required: true,
          },
          ui: {
            colSpan: 3,
            order: 1,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'city',
          name: 'city',
          label: 'City',
          type: 'text',
          component: 'text',
          placeholder: 'Enter city',
          required: true,
          validation: {
            required: true,
          },
          ui: {
            colSpan: 1,
            order: 2,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'state',
          name: 'state',
          label: 'State',
          type: 'text',
          component: 'text',
          placeholder: 'Enter state',
          required: true,
          validation: {
            required: true,
          },
          ui: {
            colSpan: 1,
            order: 3,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'zip-code',
          name: 'zipCode',
          label: 'ZIP Code',
          type: 'text',
          component: 'text',
          placeholder: 'Enter ZIP code',
          required: true,
          validation: {
            required: true,
          },
          ui: {
            colSpan: 1,
            order: 4,
            variant: 'outlined',
            size: 'md',
          },
        },
      ],
    },
    {
      id: 'contacts',
      title: 'Contact Persons',
      description: 'Add contact persons for this vendor',
      isRepeatingSection: true,
      initialState: 'collapsed',
      columns: 2,
      gap: 4,
      repeatingConfig: {
        minItems: 1,
        maxItems: 5,
        addButtonText: 'Add Contact Person',
        removeButtonText: 'Remove Contact',
        emptyMessage: 'No contact persons added yet',
        itemTitle: (index: number) => `Contact Person ${index}`,
      },
      fields: [
        {
          id: 'contact-name',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          component: 'text',
          placeholder: 'Enter full name',
          required: true,
          validation: {
            required: true,
            minLength: 2,
          },
          ui: {
            colSpan: 1,
            order: 1,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'contact-email',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          component: 'email',
          placeholder: 'Enter email address',
          required: true,
          validation: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          },
          ui: {
            colSpan: 1,
            order: 2,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'contact-phone',
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          component: 'text',
          placeholder: 'Enter phone number',
          required: true,
          validation: {
            required: true
          },
          ui: {
            colSpan: 1,
            order: 3,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'contact-position',
          name: 'position',
          label: 'Position',
          type: 'text',
          component: 'text',
          placeholder: 'Enter position/title',
          required: true,
          validation: {
            required: true,
          },
          ui: {
            colSpan: 1,
            order: 4,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'contact-department',
          name: 'department',
          label: 'Department',
          type: 'text',
          component: 'text',
          placeholder: 'Enter department',
          required: false,
          ui: {
            colSpan: 1,
            order: 5,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'contact-is-primary',
          name: 'isPrimary',
          label: 'Primary Contact',
          type: 'checkbox',
          component: 'checkbox',
          placeholder: 'Mark as primary contact',
          required: false,
          ui: {
            colSpan: 1,
            order: 6,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'contact-notes',
          name: 'notes',
          label: 'Notes',
          type: 'textarea',
          component: 'textarea',
          placeholder: 'Additional notes about this contact',
          required: false,
          ui: {
            colSpan: 2,
            order: 7,
            variant: 'outlined',
            size: 'md',
          },
        },
      ],
    },
    {
      id: 'business-details',
      title: 'Business Details',
      description: 'Additional business information and categories',
      initialState: 'expanded',
      columns: 3,
      gap: 4,
      fields: [
        {
          id: 'categories',
          name: 'categories',
          label: 'Business Categories',
          type: 'checkbox',
          component: 'checkbox',
          placeholder: 'Select categories',
          required: true,
          role: 'badge',
          options: [
            { label: 'Technology', value: 'technology' },
            { label: 'Manufacturing', value: 'manufacturing' },
            { label: 'Services', value: 'services' },
            { label: 'Logistics', value: 'logistics' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Finance', value: 'finance' },
            { label: 'Education', value: 'education' },
            { label: 'Retail', value: 'retail' },
          ],
          validation: {
            required: true,
          },
          ui: {
            colSpan: 3,
            order: 1,
            variant: 'outlined',
            size: 'md',
          },
          display: {
            type: 'array',
            displayType: 'badges',
            maxDisplay: 3,
            showMore: true
          }
        },
        {
          id: 'website',
          name: 'website',
          label: 'Website',
          type: 'url',
          component: 'text',
          placeholder: 'Enter website URL',
          required: false,
          validation: {
            pattern: /^https?:\/\/.+/,
          },
          ui: {
            colSpan: 1,
            order: 2,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'established-year',
          name: 'establishedYear',
          label: 'Established Year',
          type: 'number',
          component: 'number',
          placeholder: 'Enter year',
          required: false,
          validation: {
            min: 1800,
            max: new Date().getFullYear(),
          },
          ui: {
            colSpan: 1,
            order: 3,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'employee-count',
          name: 'employeeCount',
          label: 'Number of Employees',
          type: 'number',
          component: 'number',
          placeholder: 'Enter employee count',
          required: false,
          validation: {
            min: 1,
          },
          ui: {
            colSpan: 1,
            order: 4,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'description',
          name: 'description',
          label: 'Company Description',
          type: 'textarea',
          component: 'textarea',
          placeholder: 'Enter company description',
          required: false,
          role: 'description',
          ui: {
            colSpan: 3,
            order: 5,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'status',
          name: 'status',
          label: 'Status',
          type: 'select',
          component: 'select',
          placeholder: 'Select status',
          required: true,
          role: 'status',
          options: [
            { label: 'Active', value: 'ACTIVE', icon: 'CheckCircle', color: 'success' },
            { label: 'Pending', value: 'PENDING', icon: 'Clock', color: 'warning' },
            { label: 'Inactive', value: 'INACTIVE', icon: 'XCircle', color: 'destructive' },
          ],
          validation: {
            required: true,
          },
          ui: {
            colSpan: 1,
            order: 6,
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'rating',
          name: 'rating',
          label: 'Rating',
          type: 'number',
          component: 'number',
          placeholder: 'Enter rating (1-5)',
          required: false,
          role: 'rating',
          validation: {
            min: 1,
            max: 5,
          },
          ui: {
            colSpan: 1,
            order: 7,
            variant: 'outlined',
            size: 'md',
          },
        }
      ],
    },
  ]
};

// Schema Registry - Add all schemas here
export const ALL_SCHEMAS: Record<string, FormSchema> = {
  vendors: vendorSchema,
  // Add more schemas here as they are created
  // Example:
  // tenders: tenderSchema,
  // purchaseOrders: purchaseOrderSchema,
};

// Helper to get all schema IDs
export const getAllSchemaIds = (): string[] => {
  return Object.keys(ALL_SCHEMAS);
};

// Helper to check if a schema exists
export const schemaExists = (schemaId: string): boolean => {
  return schemaId in ALL_SCHEMAS;
};

