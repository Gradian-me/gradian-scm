'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DynamicDetailPageClient } from '@/app/page/[schema-id]/[data-id]/DynamicDetailPageClient';
import { fetchSchemaById } from '@/gradian-ui/schema-manager/utils/schema-registry';
import { useEffect, useState } from 'react';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';

interface PageProps {
  params: Promise<{
    'relation-type-id': string;
  }>;
}

export default function RelationTypeDetailPage({ params }: { params: PageProps['params'] }) {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [relationTypeId, setRelationTypeId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams['relation-type-id'];
        setRelationTypeId(id);

        const loadedSchema = await fetchSchemaById('relation-types');
        if (loadedSchema) {
          // Serialize schema to remove RegExp and other non-serializable objects
          const serializedSchema = JSON.parse(JSON.stringify(loadedSchema, (key, value) => {
            if (value instanceof RegExp) {
              return {
                __regexp: true,
                source: value.source,
                flags: value.flags
              };
            }
            return value;
          }));
          setSchema(serializedSchema);
        }
      } catch (error) {
        console.error('Error loading relation type:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params]);

  if (loading) {
    return (
      <MainLayout
        title="Relation Type"
        subtitle="Edit relation type details"
        icon="Link2"
      >
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  if (!schema || !relationTypeId) {
    return (
      <MainLayout
        title="Relation Type"
        subtitle="Edit relation type details"
        icon="Link2"
      >
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-4">Relation Type not found</h3>
          <p className="text-gray-600 mb-6">Please check the relation type ID.</p>
          <Button
            variant="outline"
            onClick={() => router.push('/builder/relation-types')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Relation Types
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Relation Type"
      subtitle="Edit relation type details"
      icon="Link2"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/builder/relation-types')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Relation Types
        </Button>

        {/* Relation Type Detail */}
        <DynamicDetailPageClient 
          schema={schema}
          dataId={relationTypeId}
          schemaId="relation-types"
          entityName={schema.singular_name || 'Relation Type'}
        />
      </div>
    </MainLayout>
  );
}

