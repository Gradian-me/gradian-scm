import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormSchema } from '../types';
import {
  CreateSchemaPayload,
  DeleteDialogState,
  SchemaCreateResult,
  SchemaTab,
} from '../types/schema-manager-page';
import { MessagesResponse, Message } from '@/gradian-ui/layout/message-box';
import { config } from '@/lib/config';

/**
 * Transform API response messages to MessageBox format
 * API may return: { path: "$.description", en: "description is required" }
 * MessageBox expects: { path: "$.description", message: { en: "description is required" } }
 */
const transformMessages = (apiMessages: any[]): Message[] => {
  if (!Array.isArray(apiMessages)) return [];
  
  return apiMessages.map((msg: any) => {
    // If message already has the correct format, return as is
    if (msg.message !== undefined) {
      return msg;
    }
    
    // Extract path if exists
    const { path, ...languageKeys } = msg;
    
    // If there are language keys (en, fr, etc.), wrap them in message
    if (Object.keys(languageKeys).length > 0) {
      return {
        path,
        message: languageKeys,
      };
    }
    
    // Fallback: treat the whole object as a string message
    return {
      path,
      message: JSON.stringify(msg),
    };
  });
};

export const useSchemaManagerPage = () => {
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SchemaTab>('system');
  const [showInactive, setShowInactive] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ open: false, schema: null });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [messages, setMessages] = useState<MessagesResponse | null>(null);

  const fetchSchemas = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setMessages(null);

      const response = await fetch(config.schemaApi.basePath);
      const result = await response.json();

      if (!response.ok || !result.success) {
        // Extract messages from response if available
        if (result.messages) {
          const transformedMessages = transformMessages(result.messages);
          setMessages({
            success: false,
            messages: transformedMessages,
            message: result.message,
          });
        } else if (result.message) {
          setMessages({
            success: false,
            message: result.message,
          });
        } else {
          // Fallback to simple error message
          const errorMessage = result.error || result.message || `Failed to fetch schemas (${response.status})`;
          setMessages({
            success: false,
            message: errorMessage,
          });
        }
        console.error('Failed to fetch schemas:', result);
      } else {
        setSchemas(result.data as FormSchema[]);
        setMessages(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching schemas';
      setMessages({
        success: false,
        message: errorMessage,
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

  const systemSchemasCount = useMemo(
    () => showInactive 
      ? systemSchemas.length 
      : systemSchemas.filter(schema => !schema.inactive).length,
    [systemSchemas, showInactive],
  );

  const businessSchemasCount = useMemo(
    () => showInactive 
      ? businessSchemas.length 
      : businessSchemas.filter(schema => !schema.inactive).length,
    [businessSchemas, showInactive],
  );

  const filteredSchemas = useMemo(() => {
    const listToFilter = activeTab === 'system' ? systemSchemas : businessSchemas;

    return listToFilter.filter(schema => {
      // Filter by inactive status if showInactive is false
      if (!showInactive && schema.inactive) {
        return false;
      }

      // Filter by search query
      const query = searchQuery.toLowerCase();
      return (
        schema.plural_name.toLowerCase().includes(query) ||
        schema.singular_name.toLowerCase().includes(query) ||
        schema.id.toLowerCase().includes(query)
      );
    });
  }, [activeTab, businessSchemas, searchQuery, showInactive, systemSchemas]);

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
      const updatedSchema = { ...deleteDialog.schema, inactive: true };
      const { id: _schemaId, ...payload } = updatedSchema;
      
      const response = await fetch(`${config.schemaApi.basePath}/${deleteDialog.schema.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSchemas(current => current.map(schema => 
          schema.id === deleteDialog.schema!.id ? updatedSchema : schema
        ));
        // Show success message if available
        if (result.messages) {
          const transformedMessages = transformMessages(result.messages);
          setMessages({
            success: true,
            messages: transformedMessages,
            message: result.message,
          });
        } else if (result.message) {
          setMessages({
            success: true,
            message: result.message,
          });
        }
        closeDeleteDialog();
        return true;
      }

      // Extract error messages from response
      if (result.messages) {
        const transformedMessages = transformMessages(result.messages);
        setMessages({
          success: false,
          messages: transformedMessages,
          message: result.message,
        });
      } else if (result.message) {
        setMessages({
          success: false,
          message: result.message,
        });
      } else {
        setMessages({
          success: false,
          message: result.error || 'Failed to set schema inactive',
        });
      }
      console.error('Failed to set schema inactive:', result);
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error setting schema inactive';
      setMessages({
        success: false,
        message: errorMessage,
      });
      console.error('Error setting schema inactive:', error);
      return false;
    }
  }, [closeDeleteDialog, deleteDialog.schema]);

  const handleCreate = useCallback(async (payload: CreateSchemaPayload): Promise<SchemaCreateResult> => {
    const { schemaId, singularName, pluralName, description, showInNavigation, isSystemSchema, isNotCompanyBased } = payload;

    if (!schemaId || !singularName || !pluralName) {
      return { success: false, error: 'Schema ID, Singular Name, and Plural Name are required' };
    }

    // Clear any existing messages when starting a new create operation
    setMessages(null);

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
        // Don't set messages in hook when dialog is open - let dialog handle it
        // Only set messages after dialog closes if needed
        setCreateDialogOpen(false);
        // Show success message on background page after dialog closes
        if (result.messages) {
          const transformedMessages = transformMessages(result.messages);
          setMessages({
            success: true,
            messages: transformedMessages,
            message: result.message,
          });
        } else if (result.message) {
          setMessages({
            success: true,
            message: result.message,
          });
        }
        return { success: true };
      }

      // Extract error messages from response
      // Don't set messages in hook - return them to dialog instead
      if (result.messages) {
        const transformedMessages = transformMessages(result.messages);
        return { success: false, error: result.error || 'Failed to create schema', messages: transformedMessages };
      } else if (result.message) {
        return { success: false, error: result.error || 'Failed to create schema', message: result.message };
      } else {
        const errorMessage = result.error || 'Failed to create schema';
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating schema';
      // Don't set messages in hook - return to dialog instead
      console.error('Error creating schema:', error);
      return { success: false, error: errorMessage };
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
    showInactive,
    setShowInactive,
    filteredSchemas,
    systemSchemas,
    businessSchemas,
    systemSchemasCount,
    businessSchemasCount,
    handleRefresh,
    deleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleDelete,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    handleCreate,
    messages,
    clearMessages: () => setMessages(null),
  };
};
