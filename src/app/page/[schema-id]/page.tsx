// Dynamic Page Route
// Renders any entity page based on schema ID
import { notFound } from 'next/navigation';
import { DynamicPageRenderer } from '../../../components/dynamic/DynamicPageRenderer';
import { findSchemaById, getAvailableSchemaIds } from '../../../shared/utils/schema-registry';
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
 * Converts RegExp patterns to strings that can be passed to Client Components
 */
function serializeSchema(schema: FormSchema): FormSchema {
  return JSON.parse(JSON.stringify(schema, (key, value) => {
    // Convert RegExp to string pattern
    if (value instanceof RegExp) {
      return value.source;
    }
    return value;
  }));
}

export default async function DynamicEntityPage({ params }: PageProps) {
  const { 'schema-id': schemaId } = await params;
  const schema = findSchemaById(schemaId);

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
  const schema = findSchemaById(schemaId);

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

