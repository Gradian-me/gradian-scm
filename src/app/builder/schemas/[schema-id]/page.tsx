'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SchemaBuilderEditor } from '@/gradian-ui/schema-manager';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { config } from '@/lib/config';

export default function SchemaEditorPage({ params }: { params: Promise<{ 'schema-id': string }> }) {
  const router = useRouter();
  const [schemaId, setSchemaId] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSchemaId(resolvedParams['schema-id']);
    });
  }, [params]);

  const fetchSchema = async (id: string): Promise<FormSchema> => {
    const response = await fetch(`${config.schemaApi.basePath}/${id}`);
    const result = await response.json();

    if (result.success) {
      setLoadError(null);
      return result.data;
    }

    console.error('Failed to fetch schema:', result.error);
    setLoadError(result.error || 'Failed to load schema');
    router.replace(`/builder/schemas/${id}/not-found`);
    throw new Error('Failed to fetch schema');
  };

  const saveSchema = async (id: string, schema: FormSchema): Promise<void> => {
    const { id: _schemaId, ...payload } = schema;
    const response = await fetch(`${config.schemaApi.basePath}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error('Failed to save schema');
    }
  };

  return (
    <SchemaBuilderEditor
      schemaId={schemaId}
      fetchSchema={fetchSchema}
      saveSchema={saveSchema}
      onBack={() => router.push('/builder/schemas')}
    />
  );
}
