'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  Plus,
  Star
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Spinner } from '@/components/ui/spinner';
import { Button as UIButton } from '@/components/ui/button';
import { Button, DynamicCardRenderer, DynamicCardDialog, EmptyState, LoadingState, GoToTop } from '../../index';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { DynamicFilterPane } from '@/shared/components/DynamicFilterPane';
import { asFormSchema } from '@/gradian-ui/schema-manager/utils/schema-utils';
import { useDynamicEntity } from '@/shared/hooks';
import { FormModal, ConfirmationMessage } from '../../form-builder';
import { getValueByRole } from '../../form-builder/form-elements/utils/field-resolver';
import { Skeleton } from '@/components/ui/skeleton';
import { IconRenderer } from '@/shared/utils/icon-renderer';
import { useCompanyStore } from '@/stores/company.store';

interface DynamicPageRendererProps {
  schema: FormSchema;
  entityName: string;
}

/**
 * Reconstruct RegExp objects from serialized schema
 */
function reconstructRegExp(obj: any): any {
  if (obj && typeof obj === 'object') {
    // Check if this is a serialized RegExp
    if (obj.__regexp === true && obj.source) {
      return new RegExp(obj.source, obj.flags || '');
    }
    
    // Recursively process arrays
    if (Array.isArray(obj)) {
      return obj.map(item => reconstructRegExp(item));
    }
    
    // Recursively process objects
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = reconstructRegExp(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

export function DynamicPageRenderer({ schema: rawSchema, entityName }: DynamicPageRendererProps) {
  const router = useRouter();
  // Reconstruct RegExp objects in the schema
  const schema = reconstructRegExp(rawSchema) as FormSchema;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEntityForDetail, setSelectedEntityForDetail] = useState<any | null>(null);
  const [searchTermLocal, setSearchTermLocal] = useState('');
  const [editEntityId, setEditEntityId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    entity: any | null;
  }>({ open: false, entity: null });

  // Use the dynamic entity hook for entity management
  const {
    entities,
    currentEntity,
    isLoading,
    error,
    selectedEntity,
    currentFilters,
    formState,
    fetchEntities,
    fetchEntityById,
    createEntity,
    deleteEntity,
    setFilters,
    setCurrentEntity,
    clearError,
    handleSearch,
    handleFilterChange,
    handleDeleteEntity,
  } = useDynamicEntity(schema);


  // Handle opening create modal
  const handleOpenCreateModal = useCallback(() => {
    if (schema?.id) {
      setCreateModalOpen(true);
    }
  }, [schema?.id]);

  // Custom handleViewEntity that opens the detail dialog (card click)
  const handleViewEntity = useCallback((entity: any) => {
    setSelectedEntityForDetail(entity);
    setIsDetailDialogOpen(true);
  }, []);

  // Navigate to detail page (view button click)
  const handleViewDetailPage = useCallback((entity: any) => {
    if (entity?.id && schema?.id) {
      router.push(`/page/${schema.id}/${entity.id}`);
    }
  }, [router, schema?.id]);

  // Handle delete with confirmation dialog
  const handleDeleteWithConfirmation = useCallback((entity: any) => {
    setDeleteConfirmDialog({ open: true, entity });
  }, []);

  // Confirm and execute delete
  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmDialog.entity) return;

    try {
      await handleDeleteEntity(deleteConfirmDialog.entity);
      setDeleteConfirmDialog({ open: false, entity: null });
      // Refresh entities after deletion
      fetchEntities();
    } catch (error) {
      console.error('Error deleting entity:', error);
      setDeleteConfirmDialog({ open: false, entity: null });
    }
  }, [deleteConfirmDialog.entity, handleDeleteEntity, fetchEntities]);

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    // Only fetch if we have actual filter changes from the UI
    const hasActiveFilters = currentFilters.search || currentFilters.status || currentFilters.category;
    
    if (hasActiveFilters && Object.keys(currentFilters).length > 0) {
      const filters = {
        search: currentFilters.search,
        status: currentFilters.status,
        category: currentFilters.category,
      };
      
      setFilters(filters);
      
      // Only fetch if we have search/filter criteria from user input
      if (filters.search || filters.status || filters.category) {
        fetchEntities(filters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters.search, currentFilters.status, currentFilters.category]);


  // Handle edit entity - set entity ID to trigger FormModal
  const handleEditEntity = useCallback(async (entity: any) => {
    if (!entity?.id || !schema?.id) {
      console.error('Missing entity ID or schema ID for edit');
      return;
    }
    
    try {
      setIsEditLoading(prev => ({ ...prev, [entity.id]: true }));
      
      // Set entity ID to trigger FormModal component
      setEditEntityId(entity.id);
    } catch (error) {
      console.error('Failed to open edit modal:', error);
    } finally {
      setIsEditLoading(prev => ({ ...prev, [entity.id]: false }));
    }
  }, [schema?.id]);

  const filteredEntities = useMemo(() => {
    if (!entities) return [];
    
    // If no search term, return all entities
    if (!searchTermLocal || searchTermLocal.trim() === '') {
      return entities;
    }
    
    const searchLower = searchTermLocal.toLowerCase();
    
    return entities.filter((entity: any) => {
      // Search across common text fields dynamically
      const searchableFields = [
        'name', 'title', 'email', 'phone', 'description',
        'productName', 'requestId', 'batchNumber', 'productSku',
        'companyName', 'tenderTitle', 'projectName'
      ];
      
      return searchableFields.some(field => {
        const value = entity[field];
        if (value && typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }, [entities, searchTermLocal]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'INACTIVE': return <AlertCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  }, []);

  const getRatingStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  }, []);

  const pluralName = schema.plural_name || 'Entities';
  const singularName = schema.singular_name || 'Entity';

  // Check if user is admin (mock implementation - replace with actual auth context)
  const isAdmin = true; // TODO: Replace with actual user profile check
  
  // Check if "All Companies" is selected (id === -1), which means we can't create new records
  const { selectedCompany } = useCompanyStore();
  const canCreateRecords = selectedCompany && selectedCompany.id !== -1;


  return (
    <MainLayout 
      title={pluralName}
      icon={schema.icon}
      editSchemaPath={schema.id ? `/builder/schemas/${schema.id}` : undefined}
      isAdmin={isAdmin}
    >
      {/* Individual entity loading indicator */}
      <div 
        id="entity-loading-indicator" 
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md z-50"
        style={{ display: 'none' }}
      >
        Loading {entityName.toLowerCase()} data...
      </div>
      <div className="space-y-6">
        {/* Custom Buttons */}
        {schema?.customButtons && Array.isArray(schema.customButtons) && schema.customButtons.length > 0 && (
          <div className="flex flex-row gap-2 flex-wrap">
            {schema.customButtons.map((action) => {
              const handleCustomAction = () => {
                if (action.action === 'goToUrl' && action.targetUrl) {
                  router.push(action.targetUrl);
                } else if (action.action === 'openUrl' && action.targetUrl) {
                  window.open(action.targetUrl, '_blank', 'noopener,noreferrer');
                } else if (action.action === 'openFormDialog' && action.targetSchema) {
                  // Handle form dialog opening - could be implemented later
                  console.log('Open form dialog for schema:', action.targetSchema);
                }
              };

              // Map QuickAction variants to UI Button variants (matches builder page style)
              // UI Button supports: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
              const buttonVariant = (() => {
                const variant = action.variant;
                
                // Direct mapping - UI Button already supports these variants
                if (variant === 'outline' || variant === 'default' || variant === 'destructive' || 
                    variant === 'secondary' || variant === 'ghost' || variant === 'link') {
                  return variant as 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
                }
                // Map 'gradient' to 'default' (UI Button doesn't support gradient)
                if (variant === 'gradient') {
                  return 'default' as const;
                }
                // Default to 'outline' if variant is undefined or unknown
                return 'outline' as const;
              })();

              return (
                <UIButton
                  key={action.id}
                  variant={buttonVariant}
                  size="sm"
                  onClick={handleCustomAction}
                  className="whitespace-nowrap"
                >
                  {action.icon && (
                    <IconRenderer iconName={action.icon} className="h-4 w-4 mr-2" />
                  )}
                  {action.label}
                </UIButton>
              );
            })}
          </div>
        )}

        {/* Search and Filters */}
        <DynamicFilterPane
          searchTerm={searchTermLocal}
          onSearchChange={setSearchTermLocal}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddNew={canCreateRecords ? handleOpenCreateModal : undefined}
          onRefresh={fetchEntities}
          isRefreshing={isLoading}
          searchPlaceholder={`Search ${pluralName.toLowerCase()}...`}
          addButtonText={`Add ${singularName}`}
        />

        {/* Entities List */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4" : "space-y-4"}>
          {isLoading ? (
            // Skeleton cards while loading
            Array.from({ length: 8 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="rounded-xl bg-white border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6">
                  {/* Header with avatar and title */}
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  
                  {/* Metrics */}
                  <div className="space-y-1.5 mb-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-50">
                    <Skeleton className="h-7 w-14" />
                    <Skeleton className="h-7 w-14" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredEntities.map((entity: any, index: number) => (
              <div key={entity.id} className="relative">
                {isEditLoading[entity.id] && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex flex-col items-center space-y-2">
                      <Spinner size="lg" variant="primary" />
                      <span className="text-sm font-medium text-violet-600">Loading...</span>
                    </div>
                  </div>
                )}
                <DynamicCardRenderer
                  key={entity.id}
                  schema={asFormSchema(schema)}
                  data={entity}
                  index={index}
                  viewMode={viewMode}
                  maxBadges={3}
                  maxMetrics={5}
                  onView={handleViewEntity}
                  onViewDetail={handleViewDetailPage}
                  onEdit={(e) => {
                    if (!isEditLoading[e.id]) {
                      handleEditEntity(e);
                    }
                  }}
                  onDelete={handleDeleteWithConfirmation}
                  className={isEditLoading[entity.id] ? "opacity-70" : ""}
                />
              </div>
            ))
          )}
        </div>

        {!isLoading && filteredEntities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              icon={<Building className="h-12 w-12 text-gray-400" />}
              title={`No ${pluralName.toLowerCase()} found`}
              description={
                searchTermLocal
                  ? 'Try adjusting your search criteria.'
                  : `Get started by adding your first ${singularName.toLowerCase()}.`
              }
              action={
                canCreateRecords ? (
                <UIButton onClick={handleOpenCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {singularName}
                </UIButton>
                ) : null
              }
            />
          </motion.div>
        )}
      </div>

      {/* Detail Dialog */}
      <DynamicCardDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        schema={asFormSchema(schema)}
        data={selectedEntityForDetail}
        title={selectedEntityForDetail?.name || `${singularName} Details`}
        onView={handleViewEntity}
        onViewDetail={handleViewDetailPage}
        onEdit={handleEditEntity}
        onDelete={handleDeleteWithConfirmation}
      />

      {/* Create Modal - using unified FormModal */}
      {createModalOpen && schema?.id && (
        <FormModal
          schemaId={schema.id}
          mode="create"
          enrichData={(formData) => {
            // Email validation function
            const isValidEmail = (email: string) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(email);
            };

            // Validate primary email if exists
            if (formData.email && !isValidEmail(formData.email)) {
              throw new Error(`Invalid email format: ${formData.email}`);
            }

            // Validate emails in contacts if exists
            if (formData.contacts && Array.isArray(formData.contacts)) {
              for (const contact of formData.contacts) {
                if (contact.email && !isValidEmail(contact.email)) {
                  throw new Error(`Invalid email format: ${contact.email}`);
                }
              }
            }

            // Transform form data to match the expected schema
            return {
              ...formData,
              categories: formData.categories || ['general'],
              contacts: formData.contacts ? formData.contacts.map((contact: any) => ({
                ...contact,
                isPrimary: contact.isPrimary === true || contact.isPrimary === "true" ? true : false,
                email: contact.email ? contact.email.trim() : contact.email,
                department: contact.department || "",
                notes: contact.notes || ""
              })) : formData.email ? [{
                name: formData.primaryContactName || formData.name,
                email: formData.primaryContactEmail || formData.email,
                phone: formData.primaryContactPhone || formData.phone,
                position: formData.primaryContactPosition || 'Primary Contact',
                isPrimary: true,
              }] : [],
              status: formData.status || 'ACTIVE',
              rating: formData.rating ? Number(formData.rating) : 5,
            };
          }}
          onSuccess={async () => {
            // Refresh entities list after successful creation
            await fetchEntities();
            setCreateModalOpen(false);
          }}
          onClose={() => {
            setCreateModalOpen(false);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationMessage
        isOpen={deleteConfirmDialog.open}
        onOpenChange={(open) => setDeleteConfirmDialog({ open, entity: deleteConfirmDialog.entity })}
        title={`Delete ${singularName}`}
        message={
          deleteConfirmDialog.entity ? (
            <>
              Are you sure you want to delete "{getValueByRole(schema, deleteConfirmDialog.entity, 'title') || deleteConfirmDialog.entity.name || deleteConfirmDialog.entity.title || deleteConfirmDialog.entity.id}"?
              <br />
              <span className="font-medium mt-2 block">This action cannot be undone.</span>
            </>
          ) : (
            ''
          )
        }
        variant="destructive"
        buttons={[
          {
            label: 'Cancel',
            variant: 'outline',
            action: () => setDeleteConfirmDialog({ open: false, entity: null }),
          },
          {
            label: 'Delete',
            variant: 'destructive',
            icon: 'Trash2',
            action: confirmDelete,
          },
        ]}
      />

      {/* Edit Modal - using unified FormModal */}
      {editEntityId && schema?.id && (
        <FormModal
          key={`edit-${editEntityId}-${schema.id}`}
          schemaId={schema.id}
          entityId={editEntityId}
          mode="edit"
          enrichData={(formData) => {
            // Email validation function
            const isValidEmail = (email: string) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(email);
            };

            // Validate primary email if exists
            if (formData.email && !isValidEmail(formData.email)) {
              throw new Error(`Invalid email format: ${formData.email}`);
            }

            // Validate emails in contacts if exists
            if (formData.contacts && Array.isArray(formData.contacts)) {
              for (const contact of formData.contacts) {
                if (contact.email && !isValidEmail(contact.email)) {
                  throw new Error(`Invalid email format: ${contact.email}`);
                }
              }
            }

            // Transform form data to match the expected schema
            return {
              ...formData,
              categories: formData.categories || ['general'],
              contacts: formData.contacts ? formData.contacts.map((contact: any) => ({
                ...contact,
                isPrimary: contact.isPrimary === true || contact.isPrimary === "true" ? true : false,
                email: contact.email ? contact.email.trim() : contact.email,
                department: contact.department || "",
                notes: contact.notes || ""
              })) : formData.email ? [{
                name: formData.primaryContactName || formData.name,
                email: formData.primaryContactEmail || formData.email,
                phone: formData.primaryContactPhone || formData.phone,
                position: formData.primaryContactPosition || 'Primary Contact',
                isPrimary: true,
              }] : [],
              status: formData.status || 'ACTIVE',
              rating: formData.rating ? Number(formData.rating) : 5,
            };
          }}
          onSuccess={async () => {
            // Refresh entities list after successful update
            await fetchEntities();
            setEditEntityId(null);
          }}
          onClose={() => {
            setEditEntityId(null);
          }}
        />
      )}
      
      {/* Go to Top Button */}
      <GoToTop threshold={100} />
    </MainLayout>
  );
}

