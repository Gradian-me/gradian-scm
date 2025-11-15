'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SchemaBuilderEditor } from '@/gradian-ui/schema-manager';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { Message } from '@/gradian-ui/layout/message-box';
import { config } from '@/lib/config';
import { apiRequest } from '@/gradian-ui/shared/utils/api';
import { useQueryClient } from '@tanstack/react-query';
import { cacheSchemaClientSide } from '@/gradian-ui/schema-manager/utils/schema-client-cache';

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

export default function SchemaEditorPage({ params }: { params: Promise<{ 'schema-id': string }> }) {
  const router = useRouter();
  const [schemaId, setSchemaId] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    params.then((resolvedParams) => {
      setSchemaId(resolvedParams['schema-id']);
    });
  }, [params]);

  const fetchSchema = async (id: string): Promise<FormSchema> => {
    const response = await apiRequest<FormSchema>(`/api/schemas/${id}`);

    if (response.success && response.data) {
      await cacheSchemaClientSide(response.data, { queryClient });
      setLoadError(null);
      setApiResponse(null); // Clear any previous errors
      return response.data;
    }

    const errorMessage = response.error || 'Failed to load schema';
    console.error('Failed to fetch schema:', errorMessage);
    setLoadError(errorMessage);

    if (response as any && (response as any).messages) {
      const transformedMessages = transformMessages((response as any).messages);
      setApiResponse({
        ...(response as any),
        messages: transformedMessages,
      });
    } else {
      setApiResponse(response);
    }

    router.replace(`/builder/schemas/${id}/not-found`);
    throw new Error('Failed to fetch schema');
  };

  const saveSchema = async (id: string, schema: FormSchema): Promise<void> => {
    const { id: _schemaId, ...payload } = schema;
    
    // Clear previous messages when starting a new save
    setApiResponse(null);
    
    const response = await fetch(`${config.schemaApi.basePath}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    // Transform messages if they exist
    if (result.messages) {
      const transformedMessages = transformMessages(result.messages);
      setApiResponse({
        ...result,
        messages: transformedMessages,
      });
    } else if (result.message || !result.success) {
      // Set response even if no messages array, to show error or success message
      setApiResponse(result);
    }
    
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
      apiResponse={apiResponse}
      onClearResponse={() => setApiResponse(null)}
    />
  );
}
