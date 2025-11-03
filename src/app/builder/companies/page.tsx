'use client';

import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DynamicPageRenderer } from '@/gradian-ui/data-display/components/DynamicPageRenderer';
import { fetchSchemaById } from '@/gradian-ui/schema-manager/utils/schema-registry';
import { useEffect, useState } from 'react';
import { FormSchema } from '@/gradian-ui/schema-manager/types/form-schema';

export default function CompaniesBuilderPage() {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchema() {
      try {
        const loadedSchema = await fetchSchemaById('companies');
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
        console.error('Error loading companies schema:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSchema();
  }, []);

  if (loading) {
    return (
      <MainLayout
        title="Companies"
        subtitle="Manage company information"
        icon="Building2"
      >
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  if (!schema) {
    return (
      <MainLayout
        title="Companies"
        subtitle="Manage company information"
        icon="Building2"
      >
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold mb-4">Schema not found</h3>
          <p className="text-gray-600">Please configure the companies schema first.</p>
          <Button
            variant="outline"
            onClick={() => router.push('/builder')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Builder
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Companies"
      subtitle="Manage company information including registration, address, and contact details"
      icon="Building2"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/builder')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Builder
        </Button>

        {/* Companies CRUD Interface */}
        <DynamicPageRenderer 
          schema={schema} 
          entityName={schema.singular_name || 'Company'}
        />
      </div>
    </MainLayout>
  );
}

