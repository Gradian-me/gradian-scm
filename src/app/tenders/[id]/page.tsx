import { TenderDetailPage } from '@/domains/tender/components/TenderDetailPage';

interface TenderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TenderDetailPageRoute({ params }: TenderDetailPageProps) {
  const { id } = await params;
  return <TenderDetailPage tenderId={id} />;
}
