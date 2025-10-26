// Vendor Data Display Configuration

import { DataDisplayConfig } from '../../../gradian-ui';

export const vendorDataDisplayConfig: DataDisplayConfig = {
  id: 'vendor-data-display',
  name: 'Vendor Data Display',
  title: 'Vendor Management',
  description: 'Manage your supply chain vendors with advanced filtering and viewing options',
  
  views: [
    {
      id: 'card',
      name: 'Card View',
      label: 'Cards',
      component: 'card',
      config: {
        columns: 3,
        gap: 6,
        responsive: true,
        actions: [
          {
            id: 'view',
            label: 'View',
            variant: 'primary',
            onClick: () => {},
          },
          {
            id: 'edit',
            label: 'Edit',
            variant: 'secondary',
            onClick: () => {},
          },
          {
            id: 'delete',
            label: 'Delete',
            variant: 'danger',
            onClick: () => {},
          },
        ],
      },
    },
    {
      id: 'list',
      name: 'List View',
      label: 'List',
      component: 'list',
      config: {
        actions: [
          {
            id: 'view',
            label: 'View',
            variant: 'primary',
            onClick: () => {},
          },
          {
            id: 'edit',
            label: 'Edit',
            variant: 'secondary',
            onClick: () => {},
          },
          {
            id: 'delete',
            label: 'Delete',
            variant: 'danger',
            onClick: () => {},
          },
        ],
      },
    },
    {
      id: 'table',
      name: 'Table View',
      label: 'Table',
      component: 'table',
      config: {
        columns: ['name', 'email', 'phone', 'status', 'rating'],
        actions: [
          {
            id: 'view',
            label: 'View',
            variant: 'primary',
            onClick: () => {},
          },
          {
            id: 'edit',
            label: 'Edit',
            variant: 'secondary',
            onClick: () => {},
          },
          {
            id: 'delete',
            label: 'Delete',
            variant: 'danger',
            onClick: () => {},
          },
        ],
      },
    },
  ],

  filters: [
    {
      id: 'status',
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Status', value: '' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Pending', value: 'PENDING' },
      ],
      placeholder: 'Select status',
      styling: {
        width: '200px',
        size: 'md',
      },
    },
    {
      id: 'category',
      name: 'categories',
      label: 'Category',
      type: 'multiselect',
      options: [
        { label: 'Technology', value: 'technology' },
        { label: 'Manufacturing', value: 'manufacturing' },
        { label: 'Services', value: 'services' },
        { label: 'Logistics', value: 'logistics' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Finance', value: 'finance' },
      ],
      styling: {
        width: '250px',
        size: 'md',
      },
    },
    {
      id: 'rating',
      name: 'rating',
      label: 'Minimum Rating',
      type: 'number',
      placeholder: 'Enter minimum rating',
      validation: {
        min: 0,
        max: 5,
      },
      styling: {
        width: '150px',
        size: 'md',
      },
    },
    {
      id: 'joinedDate',
      name: 'joinedDate',
      label: 'Joined Date Range',
      type: 'daterange',
      styling: {
        width: '300px',
        size: 'md',
      },
    },
  ],

  search: {
    enabled: true,
    placeholder: 'Search vendors by name, email, or phone...',
    debounceMs: 300,
    minLength: 2,
    fields: ['name', 'email', 'phone', 'city', 'state'],
    styling: {
      width: '100%',
      size: 'md',
    },
  },

  actions: [
    {
      id: 'add-vendor',
      name: 'Add Vendor',
      label: 'Add Vendor',
      variant: 'primary',
      size: 'md',
      onClick: () => {},
      position: 'right',
    },
    {
      id: 'export-vendors',
      name: 'Export Vendors',
      label: 'Export',
      variant: 'secondary',
      size: 'md',
      onClick: () => {},
      position: 'right',
    },
    {
      id: 'import-vendors',
      name: 'Import Vendors',
      label: 'Import',
      variant: 'ghost',
      size: 'md',
      onClick: () => {},
      position: 'right',
    },
  ],

  pagination: {
    enabled: true,
    pageSize: 12,
    pageSizeOptions: [6, 12, 24, 48],
    showPageSizeSelector: true,
    showPageInfo: true,
    showFirstLast: true,
    showPrevNext: true,
    position: 'bottom',
  },

  layout: {
    container: {
      padding: 6,
      margin: 0,
      maxWidth: '100%',
      centered: false,
    },
    header: {
      show: true,
      title: 'Vendor Management',
      description: 'Manage your supply chain vendors',
      actions: ['add-vendor', 'export-vendors', 'import-vendors'],
    },
    filterPane: {
      show: true,
      position: 'top',
      collapsible: true,
      defaultCollapsed: false,
      width: '100%',
    },
    viewSwitch: {
      show: true,
      position: 'top',
      alignment: 'end',
    },
    content: {
      padding: 0,
      gap: 6,
      responsive: true,
    },
  },

  styling: {
    theme: 'light',
    variant: 'default',
    size: 'md',
    rounded: true,
    shadow: 'sm',
    border: true,
  },

  behavior: {
    autoRefresh: {
      enabled: false,
      interval: 30000,
    },
    infiniteScroll: {
      enabled: false,
      threshold: 100,
    },
    selection: {
      enabled: true,
      multiple: true,
    },
    sorting: {
      enabled: true,
      defaultSort: {
        field: 'name',
        direction: 'asc',
      },
    },
    grouping: {
      enabled: false,
    },
  },
};
