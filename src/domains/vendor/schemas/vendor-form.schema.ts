// Vendor Form Schema - Tender Style

import { FormSchema } from '../../../gradian-ui/form-builder/types/form-schema';

export const vendorFormSchema: FormSchema = {
  id: 'vendor-form',
  name: 'Vendor Form',
  title: 'Create New Vendor',
  description: 'Add a new vendor to your supply chain management system',
  ui: {
    entityName: 'Vendor',
    createTitle: 'Create New Vendor',
    editTitle: 'Edit Vendor',
    basePath: 'vendors',
    filters: {
      status: {
        type: 'all',
        options: ['all', 'ACTIVE', 'INACTIVE', 'PENDING']
      },
      category: {
        type: 'all',
        options: ['all'] // Dynamic categories
      }
    },
    actions: {
      view: true,
      edit: true,
      delete: true
    }
  },
  cardMetadata: {
    id: 'vendor-card',
    name: 'Vendor Card',
    sections: [
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
    styling: {
      variant: 'default',
      size: 'md',
      rounded: true,
      shadow: 'md'
    },
    behavior: {
      clickable: true,
      hoverable: true
    },
    animations: {
      stagger: true,
      duration: 0.3,
      delay: 0.1
    }
  },
  sections: [
    {
      id: 'basic-information',
      title: 'Vendor Information',
      description: 'Basic vendor details and contact information',
      initialState: 'expanded',
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
          layout: {
            width: '50%',
            order: 1,
          },
          styling: {
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
          displayType: 'text',
          truncate: true,
          required: true,
          role: 'subtitle',
          validation: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          },
          layout: {
            width: '50%',
            order: 2,
          },
          styling: {
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'phone-number',
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          component: 'text',
          placeholder: 'Enter phone number',
          icon: 'Phone',
          displayType: 'text',
          required: true,
          role: 'tel',
          validation: {
            required: true
          },
          layout: {
            width: '50%',
            order: 3,
          },
          styling: {
            variant: 'outlined',
            size: 'md',
          },
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
          layout: {
            width: '50%',
            order: 4,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 5,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 6,
          },
          styling: {
            variant: 'outlined',
            size: 'md',
          },
        },
      ],
      layout: {
        columns: 2,
        gap: 4,
      },
      styling: {
        variant: 'card',
      },
    },
    {
      id: 'address-information',
      title: 'Address Information',
      description: 'Complete address details for the vendor',
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
          layout: {
            width: '100%',
            order: 1,
          },
          styling: {
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
          layout: {
            width: '33.33%',
            order: 2,
          },
          styling: {
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
          layout: {
            width: '33.33%',
            order: 3,
          },
          styling: {
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
          layout: {
            width: '33.33%',
            order: 4,
          },
          styling: {
            variant: 'outlined',
            size: 'md',
          },
        },
      ],
      layout: {
        columns: 3,
        gap: 4,
      },
      styling: {
        variant: 'card',
      },
    },
    {
      id: 'contacts',
      title: 'Contact Persons',
      description: 'Add contact persons for this vendor',
      isRepeatingSection: true,
      initialState: 'collapsed',
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
          layout: {
            width: '50%',
            order: 1,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 2,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 3,
          },
          styling: {
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
          },
          layout: {
            width: '50%',
            order: 4,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 5,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 6,
          },
          styling: {
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
          layout: {
            width: '100%',
            order: 6,
          },
          styling: {
            variant: 'outlined',
            size: 'md',
          },
        },
      ],
      layout: {
        columns: 2,
        gap: 4,
      },
      styling: {
        variant: 'card',
      },
    },
    {
      id: 'business-details',
      title: 'Business Details',
      description: 'Additional business information and categories',
      initialState: 'expanded',
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
          layout: {
            width: '100%',
            order: 1,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 2,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 3,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 4,
          },
          styling: {
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
          layout: {
            width: '100%',
            order: 5,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 6,
          },
          styling: {
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
          layout: {
            width: '50%',
            order: 7,
          },
          styling: {
            variant: 'outlined',
            size: 'md',
          },
        },
        {
          id: 'performanceMetrics',
          name: 'performanceMetrics',
          label: 'Performance Metrics',
          type: 'text',
          component: 'text',
          required: false,
          // Custom role for metrics display
          role: 'badge',
          // This is a hidden field for the card display only
          styling: {
            variant: 'outlined',
            className: 'hidden',
          },
          display: {
            type: 'array',
            maxDisplay: 5,
            showMore: true
          },
          layout: {
            width: '100%',
            order: 8,
          },
        },
      ],
      layout: {
        columns: 2,
        gap: 4,
      },
      styling: {
        variant: 'card',
      },
    },
  ],
  layout: {
    direction: 'column',
    gap: 6,
    spacing: 'lg',
  },
  styling: {
    variant: 'minimal',
    size: 'lg',
  },
  validation: {
    mode: 'onBlur',
    showErrors: true,
    showSuccess: true,
  },
  actions: {
    submit: {
      label: 'Create Vendor',
      variant: 'default',
      loading: 'Creating...',
    },
    reset: {
      label: 'Reset',
      variant: 'outline',
    },
    cancel: {
      label: 'Cancel',
      variant: 'ghost',
    },
  },
};
