// Dynamic Page Route
// Renders any entity page based on schema ID
import { notFound } from 'next/navigation';
import { DynamicPageRenderer } from '../../../components/dynamic/DynamicPageRenderer';
import { getAvailableSchemaIds } from '../../../shared/utils/schema-registry.server';
import { fetchSchemaById } from '../../../shared/utils/schema-registry';
import { FormSchema } from '../../../shared/types/form-schema';

interface PageProps {
  params: Promise<{
    'schema-id': string;
  }>;
}

export async function generateStaticParams() {
  const schemaIds = getAvailableSchemaIds();
  
  return schemaIds.map((schemaId) => ({
    'schema-id': schemaId,
  }));
}

/**
 * Serialize schema to remove RegExp and other non-serializable objects
 * Converts RegExp patterns to a special object format that can be passed to Client Components
 * and reconstructed on the client side
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

export default async function DynamicEntityPage({ params }: PageProps) {
  const { 'schema-id': schemaId } = await params;
  const schema = await fetchSchemaById(schemaId);

  if (!schema) {
    notFound();
  }

  // Serialize schema to make it safe for Client Component
  const serializedSchema = serializeSchema(schema);

  return (
    <DynamicPageRenderer 
      schema={serializedSchema} 
      entityName={schema.singular_name || 'Entity'}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { 'schema-id': schemaId } = await params;
  const schema = await fetchSchemaById(schemaId);

  if (!schema) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: `${schema.plural_name || 'Entities'} Management - Gradian SCM`,
    description: schema.description || `Manage ${schema.plural_name?.toLowerCase() || 'entities'} in your supply chain`,
  };
}

