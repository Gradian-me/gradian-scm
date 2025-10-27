// Vendor Page Configuration

import { HeaderConfig, FormConfig, CardConfig } from '../../../gradian-ui';

export const vendorPageConfig = {
  header: {
    id: 'vendor-header',
    name: 'Vendor Management Header',
    title: 'Vendor Management',
    navigation: {
      items: [
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        { id: 'vendors', label: 'Vendors', href: '/vendors' },
        { id: 'tenders', label: 'Tenders', href: '/tenders' },
        { id: 'purchase-orders', label: 'Purchase Orders', href: '/purchase-orders' },
      ],
      position: 'left' as const,
    },
    actions: {
      search: {
        enabled: true,
        placeholder: 'Search vendors...',
      },
      notifications: {
        enabled: true,
        count: 0,
      },
      user: {
        enabled: true,
        showAvatar: true,
        showName: true,
        showRole: true,
      },
    },
    styling: {
      variant: 'default' as const,
      size: 'md' as const,
      sticky: true,
    },
    responsive: {
      mobileMenu: true,
      breakpoint: 'md' as const,
    },
  } as HeaderConfig,

  // Form configuration is now handled by vendorFormSchema

  vendorCard: {
    id: 'vendor-card',
    name: 'Vendor Card',
    styling: {
      variant: 'elevated' as const,
      size: 'md' as const,
      rounded: true,
      shadow: 'md' as const,
    },
    behavior: {
      clickable: true,
      hoverable: true,
    },
    layout: {
      direction: 'vertical' as const,
      alignment: 'stretch' as const,
      spacing: 'normal' as const,
    },
  },

  vendorList: {
    id: 'vendor-list',
    name: 'Vendor List',
    layout: {
      columns: 3,
      gap: 6,
      direction: 'row' as const,
    },
    styling: {
      variant: 'default' as const,
    },
  },

  searchAndFilter: {
    id: 'vendor-search-filter',
    name: 'Vendor Search and Filter',
    search: {
      placeholder: 'Search vendors...',
      enabled: true,
    },
    filters: {
      status: {
        label: 'Status',
        options: [
          { label: 'All Status', value: 'all' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
          { label: 'Pending', value: 'PENDING' },
        ],
      },
      category: {
        label: 'Category',
        options: [
          { label: 'All Categories', value: 'all' },
          { label: 'Technology', value: 'technology' },
          { label: 'Manufacturing', value: 'manufacturing' },
          { label: 'Services', value: 'services' },
          { label: 'Logistics', value: 'logistics' },
        ],
      },
    },
  },
};

export const vendorDetailConfig = {
  header: {
    id: 'vendor-detail-header',
    name: 'Vendor Detail Header',
    title: 'Vendor Details',
    actions: {
      search: { enabled: false },
      notifications: { enabled: true },
      user: { enabled: true },
    },
  } as HeaderConfig,

  kpiCards: [
    {
      id: 'on-time-delivery-kpi',
      name: 'On-Time Delivery KPI',
      title: 'On-Time Delivery',
      format: 'percentage' as const,
      precision: 1,
      color: '#10B981',
      trend: {
        enabled: true,
        period: 'month' as const,
        showPercentage: true,
        showArrow: true,
      },
      styling: {
        variant: 'card' as const,
        size: 'md' as const,
      },
    },
    {
      id: 'quality-score-kpi',
      name: 'Quality Score KPI',
      title: 'Quality Score',
      format: 'percentage' as const,
      precision: 1,
      color: '#3B82F6',
      trend: {
        enabled: true,
        period: 'month' as const,
        showPercentage: true,
        showArrow: true,
      },
      styling: {
        variant: 'card' as const,
        size: 'md' as const,
      },
    },
    {
      id: 'total-orders-kpi',
      name: 'Total Orders KPI',
      title: 'Total Orders',
      format: 'number' as const,
      precision: 0,
      color: '#F59E0B',
      trend: {
        enabled: true,
        period: 'month' as const,
        showPercentage: true,
        showArrow: true,
      },
      styling: {
        variant: 'card' as const,
        size: 'md' as const,
      },
    },
    {
      id: 'total-value-kpi',
      name: 'Total Value KPI',
      title: 'Total Value',
      format: 'currency' as const,
      precision: 0,
      color: '#8B5CF6',
      trend: {
        enabled: true,
        period: 'month' as const,
        showPercentage: true,
        showArrow: true,
      },
      styling: {
        variant: 'card' as const,
        size: 'md' as const,
      },
    },
  ],
};
