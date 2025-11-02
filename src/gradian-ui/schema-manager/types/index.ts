// Schema Manager Types

import { FormSchema } from '../../../shared/types/form-schema';

export * from './builder';

export interface SchemaManagerConfig {
  entityName: string;
  schema: FormSchema;
  customFilters?: Record<string, {
    type: 'all' | string;
    options?: string[];
  }>;
  onDelete?: (entity: any) => void;
  onView?: (entity: any) => void;
}

export interface GeneratedSchemas<T = any> {
  createSchema: any;
  updateSchema: any;
  validationRules: Record<string, any>;
  initialValues: Record<string, any>;
}

export interface EntityUIHookReturn<T = any> {
  // Modal state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isModalOpen: boolean;
  modalTitle: string;
  
  // Form state
  formState: any;
  
  // Search & filters
  searchTerm: string;
  filterStates: Record<string, any>;
  currentFilters: Record<string, any>;
  selectedEntity: T | null;
  
  // Handlers
  handleSearch: (query: string) => void;
  handleFilterChange: (key: string, value: any) => void;
  resetFilters: () => void;
  openCreateModal: () => void;
  closeModal: () => void;
  closeCreateModal: () => void;
  closeEditModal: () => void;
  openEditModal: (entity: T) => void;
  handleViewEntity: (entity: T) => void;
  handleDeleteEntity: (entity: T) => void;
  populateForm: (entity: T) => void;
  
  // Auto-generated entity-specific handlers (dynamic)
  [key: string]: any;
}

export interface SchemaManager<T = any> extends EntityUIHookReturn<T> {
  // Additional manager-specific methods
  getSchema: () => FormSchema;
  getConfig: () => SchemaManagerConfig;
  getSchemas: () => GeneratedSchemas<T>;
  entityActions?: any;
  [key: string]: any;
}

