import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormSchema } from '../types';
import {
  CreateSchemaPayload,
  DeleteDialogState,
  SchemaCreateResult,
  SchemaTab,
} from '../types/schema-manager-page';
import { config } from '@/lib/config';

export const useSchemaManagerPage = () => {
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SchemaTab>('system');
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ open: false, schema: null });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);

  const fetchSchemas = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(config.schemaApi.basePath);
      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = result.error || result.message || `Failed to fetch schemas (${response.status})`;
        setError({
          message: errorMessage,
          statusCode: response.status,
        });
        console.error('Failed to fetch schemas:', errorMessage);
      } else {
        setSchemas(result.data as FormSchema[]);
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching schemas';
      setError({
        message: errorMessage,
        statusCode: 500,
      });
      console.error('Error fetching schemas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  const systemSchemas = useMemo(
    () => schemas.filter(schema => schema.isSystemSchema === true).sort((a, b) => a.plural_name.localeCompare(b.plural_name)),
    [schemas],
  );

  const businessSchemas = useMemo(
    () => schemas.filter(schema => schema.isSystemSchema !== true).sort((a, b) => a.plural_name.localeCompare(b.plural_name)),
    [schemas],
  );

  const filteredSchemas = useMemo(() => {
    const listToFilter = activeTab === 'system' ? systemSchemas : businessSchemas;

    return listToFilter.filter(schema => {
      const query = searchQuery.toLowerCase();
      return (
        schema.plural_name.toLowerCase().includes(query) ||
        schema.singular_name.toLowerCase().includes(query) ||
        schema.id.toLowerCase().includes(query)
      );
    });
  }, [activeTab, businessSchemas, searchQuery, systemSchemas]);

  const handleRefresh = useCallback(() => {
    fetchSchemas(true);
  }, [fetchSchemas]);

  const openDeleteDialog = useCallback((schema: FormSchema) => {
    setDeleteDialog({ open: true, schema });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, schema: null });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteDialog.schema) {
      return false;
    }

    try {
      const response = await fetch(`${config.schemaApi.basePath}/${deleteDialog.schema.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSchemas(current => current.filter(schema => schema.id !== deleteDialog.schema!.id));
        closeDeleteDialog();
        return true;
      }

      console.error('Failed to delete schema:', result.error);
      alert('Failed to delete schema');
      return false;
    } catch (error) {
      console.error('Error deleting schema:', error);
      alert('Error deleting schema');
      return false;
    }
  }, [closeDeleteDialog, deleteDialog.schema]);

  const handleCreate = useCallback(async (payload: CreateSchemaPayload): Promise<SchemaCreateResult> => {
    const { schemaId, singularName, pluralName, description, showInNavigation, isSystemSchema, isNotCompanyBased } = payload;

    if (!schemaId || !singularName || !pluralName || !description) {
      return { success: false, error: 'All fields are required' };
    }

    try {
      const newSchema: FormSchema = {
        id: schemaId,
        description,
        singular_name: singularName,
        plural_name: pluralName,
        showInNavigation,
        isSystemSchema,
        isNotCompanyBased,
        fields: [],
        sections: [],
      };

      const response = await fetch(config.schemaApi.basePath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchema),
      });

      const result = await response.json();

      if (result.success) {
        setCreateDialogOpen(false);
        return { success: true };
      }

      const errorMessage = result.error || 'Failed to create schema';
      console.error('Failed to create schema:', errorMessage);
      alert(errorMessage);
      return { success: false, error: errorMessage };
    } catch (error) {
      console.error('Error creating schema:', error);
      alert('Error creating schema');
      return { success: false, error: 'Error creating schema' };
    }
  }, []);

  const openCreateDialog = useCallback(() => setCreateDialogOpen(true), []);
  const closeCreateDialog = useCallback(() => setCreateDialogOpen(false), []);

  return {
    schemas,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredSchemas,
    systemSchemas,
    businessSchemas,
    handleRefresh,
    deleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleDelete,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    handleCreate,
    error,
    clearError: () => setError(null),
  };
};
