'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RelationTypeEditor } from '@/gradian-ui/relation-manager';

export default function RelationTypeEditorPage({ params }: { params: Promise<{ 'relation-type-id': string }> }) {
  const router = useRouter();
  const [relationTypeId, setRelationTypeId] = useState<string>('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setRelationTypeId(resolvedParams['relation-type-id']);
    });
  }, [params]);

  return (
    <div className="container mx-auto py-8 px-4">
      <RelationTypeEditor
        relationTypeId={relationTypeId}
        onBack={() => router.push('/builder/relation-types')}
      />
    </div>
  );
}

