// Dynamic Detail Page Route
// Renders detail page for any entity based on schema ID and data ID
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';
import { fetchSchemaById } from '@/gradian-ui/schema-manager/utils/schema-registry';
import { DynamicDetailPageClient } from './DynamicDetailPageClient';

interface PageProps {
  params: Promise<{
    'schema-id': string;
    'data-id': string;
  }>;
}

/**
 * Serialize schema to remove RegExp and other non-serializable objects
 */
function serializeSchema(schema: FormSchema): any {
  return JSON.parse(JSON.stringify(schema, (key, value) => {
    // Convert RegExp to a serializable format with marker
    if (value instanceof RegExp) {
      return {
        __regexp: true,
        source: value.source,
        flags: value.flags
      };
    }
    return value;
  }));
}

export default async function DynamicDetailPage({ params }: PageProps) {
  const { 'schema-id': schemaId, 'data-id': dataId } = await params;
  const schema = await fetchSchemaById(schemaId);

  if (!schema) {
    notFound();
  }

  // Serialize schema to make it safe for Client Component
  const serializedSchema = serializeSchema(schema);

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <DynamicDetailPageClient 
        schema={serializedSchema}
        dataId={dataId}
        schemaId={schemaId}
        entityName={schema.singular_name || 'Entity'}
      />
    </Suspense>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { 'schema-id': schemaId, 'data-id': dataId } = await params;
  const schema = await fetchSchemaById(schemaId);

  if (!schema) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: `${schema.singular_name || 'Entity'} Details | Gradian App`,
    description: `View details for ${schema.singular_name?.toLowerCase() || 'entity'}`,
  };
}

