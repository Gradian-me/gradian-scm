'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicDetailPageRenderer } from '../../../../gradian-ui/data-display/components/DynamicDetailPageRenderer';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { useDynamicEntity } from '../../../../shared/hooks/use-dynamic-entity';
import { apiRequest } from '../../../../shared/utils/api';
import { MainLayout } from '../../../../components/layout/main-layout';

interface DynamicDetailPageClientProps {
  schema: FormSchema;
  dataId: string;
  schemaId: string;
  entityName: string;
}

/**
 * Reconstruct RegExp objects from serialized schema
 */
function reconstructRegExp(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => reconstructRegExp(item));
  }
  
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value && typeof value === 'object' && value.__regexp) {
        result[key] = new RegExp(value.source, value.flags);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = reconstructRegExp(value);
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * Ensure schema has default actions for form buttons
 */
function ensureSchemaActions(schema: FormSchema): FormSchema {
  if (!schema.actions || !Array.isArray(schema.actions)) {
    // Set default actions as an array of action types
    schema.actions = ['cancel', 'reset', 'submit'];
  }
  return schema;
}

export function DynamicDetailPageClient({
  schema: rawSchema,
  dataId,
  schemaId,
  entityName
}: DynamicDetailPageClientProps) {
  const router = useRouter();
  // Reconstruct RegExp objects in the schema
  let schema = reconstructRegExp(rawSchema) as FormSchema;
  // Ensure schema has actions
  schema = ensureSchemaActions(schema);
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the dynamic entity hook for CRUD operations
  const {
    deleteEntity,
  } = useDynamicEntity(schema);

  // Fetch entity data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiRequest<any>(`/api/data/${schemaId}/${dataId}`);
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || 'Failed to fetch entity');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch entity');
      } finally {
        setIsLoading(false);
      }
    };

    if (dataId) {
      fetchData();
    }
  }, [dataId, schemaId]);

  const handleBack = useCallback(() => {
    router.push(`/page/${schemaId}`);
  }, [router, schemaId]);

  const handleEdit = useCallback(() => {
    // Edit is now handled by DynamicDetailPageRenderer's FormModal
    // This callback can be used for external handling if needed
  }, []);

  const handleDelete = useCallback(async () => {
    if (data && window.confirm(`Are you sure you want to delete this ${entityName.toLowerCase()}?`)) {
      try {
        await deleteEntity(dataId);
        router.push(`/page/${schemaId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete entity');
      }
    }
  }, [data, dataId, entityName, deleteEntity, router, schemaId]);


  const pageTitle = data 
    ? (data.name || data.title || dataId)
    : `Loading...`;

  return (
    <MainLayout title={pageTitle} subtitle={entityName}>
      <DynamicDetailPageRenderer
        schema={schema}
        data={data}
        isLoading={isLoading}
        error={error}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
        disableAnimation={false}
      />
    </MainLayout>
  );
}

