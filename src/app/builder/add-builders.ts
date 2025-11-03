import { 
  FileText, 
  Link2,
  Building2,
} from 'lucide-react';

export interface BuilderOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: number;
  }[];
  features: string[];
}

export const builderOptions: BuilderOption[] = [
  {
    id: 'schemas',
    title: 'Schema Builder',
    description: 'Create and manage dynamic form schemas for entities like inquiries, vendors, and purchase orders',
    icon: FileText,
    href: '/builder/schemas',
    color: '#8B5CF6',
    features: [
      'Define fields and sections',
      'Configure validation rules',
      'Set up form layouts',
      'Manage metadata',
    ],
  },
  {
    id: 'relation-types',
    title: 'Relation Types',
    description: 'Define and manage relationships between entities in your supply chain',
    icon: Link2,
    href: '/builder/relation-types',
    color: '#4E79A7',
    features: [
      'Create entity relationships',
      'Set visual indicators',
      'Configure icons and colors',
      'Manage relation metadata',
    ],
  },
  {
    id: 'companies',
    title: 'Companies',
    description: 'Manage company information including registration, address, and contact details',
    icon: Building2,
    href: '/builder/companies',
    color: '#10B981',
    features: [
      'Company registration details',
      'Address and location data',
      'National ID and registration codes',
      'Company logo management',
    ],
  },
];

